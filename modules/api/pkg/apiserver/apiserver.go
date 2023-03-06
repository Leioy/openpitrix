/*
Copyright 2019 The KubeSphere Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package apiserver

import (
	"bytes"
	"context"
	"fmt"
	restfulspec "github.com/emicklei/go-restful-openapi"
	filters2 "kubesphere.io/openpitrix/pkg/apiserver/filters"
	"kubesphere.io/openpitrix/pkg/apiserver/request"
	"kubesphere.io/openpitrix/pkg/client/k8s"
	apiserverconfig "kubesphere.io/openpitrix/pkg/config"
	"kubesphere.io/openpitrix/pkg/informers"
	openpitrixv1 "kubesphere.io/openpitrix/pkg/kapis/openpitrix/v1"
	openpitrixv2alpha1 "kubesphere.io/openpitrix/pkg/kapis/openpitrix/v2alpha1"
	"kubesphere.io/openpitrix/pkg/models/openpitrix"
	"kubesphere.io/openpitrix/pkg/utils/clusterclient"
	utilnet "kubesphere.io/openpitrix/pkg/utils/net"
	"net/http"
	rt "runtime"
	"time"

	"github.com/go-openapi/spec"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/emicklei/go-restful"
	"k8s.io/apimachinery/pkg/api/errors"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	urlruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apimachinery/pkg/util/sets"
	"k8s.io/apiserver/pkg/endpoints/handlers/responsewriters"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/util/retry"
	"k8s.io/klog"
	runtimecache "sigs.k8s.io/controller-runtime/pkg/cache"
)

const (
	// ApiRootPath defines the root path of all KubeSphere apis.
	ApiRootPath = "/kapis"

	// MimeMergePatchJson is the mime header used in merge request
	MimeMergePatchJson = "application/merge-patch+json"

	//
	MimeJsonPatchJson = "application/json-patch+json"
)

type APIServer struct {

	// number of kubesphere apiserver
	ServerCount int

	Server *http.Server

	Config *apiserverconfig.Config

	// webservice container, where all webservice defines
	container *restful.Container

	// kubeClient is a collection of all kubernetes(include CRDs) objects clientset
	KubernetesClient k8s.Client

	// informerFactory is a collection of all kubernetes(include CRDs) objects informers,
	// mainly for fast query
	InformerFactory informers.InformerFactory

	// controller-runtime cache
	RuntimeCache runtimecache.Cache

	Client client.Client

	ClusterClient clusterclient.ClusterClients

	OpenpitrixClient openpitrix.Interface
}

func (s *APIServer) PrepareRun(stopCh <-chan struct{}) error {
	s.container = restful.NewContainer()
	s.container.Filter(logRequestAndResponse)
	s.container.Router(restful.CurlyRouter{})
	// reference: https://pkg.go.dev/github.com/emicklei/go-restful#hdr-Performance_options
	s.container.DoNotRecover(false)
	s.container.RecoverHandler(func(panicReason interface{}, httpWriter http.ResponseWriter) {
		logStackOnRecover(panicReason, httpWriter)
	})

	s.installKubeSphereAPIs()

	if s.Config.OpenPitrixOptions.S3Options.Swagger {
		config := restfulspec.Config{WebServices: s.container.RegisteredWebServices(),
			APIPath: "/apidocs.json", PostBuildSwaggerObjectHandler: swaggerConfig}
		s.container.Add(restfulspec.NewOpenAPIService(config))
		s.container.Handle("/swagger/", http.StripPrefix("/swagger/", http.FileServer(http.Dir("/mnt/d/gowork/openpitrix/dist"))))
	}
	for _, ws := range s.container.RegisteredWebServices() {
		klog.V(2).Infof("%s", ws.RootPath())
	}

	s.Server.Handler = s.container

	s.buildHandlerChain(stopCh)

	return nil
}

// Install all KubeSphere api groups
// Installation happens before all informers start to cache objects, so
//
//	any attempt to list objects using listers will get empty results.
func (s *APIServer) installKubeSphereAPIs() {
	urlruntime.Must(openpitrixv1.AddToContainer(s.container, s.InformerFactory, s.KubernetesClient.KubeSphere(), s.Config.OpenPitrixOptions, s.OpenpitrixClient))
	urlruntime.Must(openpitrixv2alpha1.AddToContainer(s.container, s.InformerFactory, s.KubernetesClient.KubeSphere(), s.Config.OpenPitrixOptions))
}

func (s *APIServer) Run(ctx context.Context) (err error) {

	err = s.waitForResourceSync(ctx)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		<-ctx.Done()
		_ = s.Server.Shutdown(ctx)
	}()

	klog.V(0).Infof("Start listening on %s", s.Server.Addr)
	if s.Server.TLSConfig != nil {
		err = s.Server.ListenAndServeTLS("", "")
	} else {
		err = s.Server.ListenAndServe()
	}

	return err
}

func (s *APIServer) buildHandlerChain(stopCh <-chan struct{}) {
	requestInfoResolver := &request.RequestInfoFactory{
		APIPrefixes:          sets.NewString("api", "apis", "kapis", "kapi"),
		GrouplessAPIPrefixes: sets.NewString("api", "kapi"),
	}

	handler := s.Server.Handler
	handler = filters2.WithKubeAPIServer(handler, s.KubernetesClient.Config(), &errorResponder{})

	handler = filters2.WithRequestInfo(handler, requestInfoResolver)

	s.Server.Handler = handler
}

type informerForResourceFunc func(resource schema.GroupVersionResource) (interface{}, error)

func waitForCacheSync(discoveryClient discovery.DiscoveryInterface, sharedInformerFactory informers.GenericInformerFactory, informerForResourceFunc informerForResourceFunc, GVRs map[schema.GroupVersion][]string, stopCh <-chan struct{}) error {
	for groupVersion, resourceNames := range GVRs {
		var apiResourceList *v1.APIResourceList
		var err error
		err = retry.OnError(retry.DefaultRetry, func(err error) bool {
			return !errors.IsNotFound(err)
		}, func() error {
			apiResourceList, err = discoveryClient.ServerResourcesForGroupVersion(groupVersion.String())
			return err
		})
		if err != nil {
			return fmt.Errorf("failed to fetch group version resources %s: %s", groupVersion, err)
		}
		for _, resourceName := range resourceNames {
			groupVersionResource := groupVersion.WithResource(resourceName)
			if !isResourceExists(apiResourceList.APIResources, groupVersionResource) {
				klog.Warningf("resource %s not exists in the cluster", groupVersionResource)
			} else {
				// reflect.ValueOf(sharedInformerFactory).MethodByName("ForResource").Call([]reflect.Value{reflect.ValueOf(groupVersionResource)})
				if _, err = informerForResourceFunc(groupVersionResource); err != nil {
					return fmt.Errorf("failed to create informer for %s: %s", groupVersionResource, err)
				}
			}
		}
	}
	sharedInformerFactory.Start(stopCh)
	sharedInformerFactory.WaitForCacheSync(stopCh)
	return nil
}

func isResourceExists(apiResources []v1.APIResource, resource schema.GroupVersionResource) bool {
	for _, apiResource := range apiResources {
		if apiResource.Name == resource.Resource {
			return true
		}
	}
	return false
}

func (s *APIServer) waitForResourceSync(ctx context.Context) error {
	klog.V(0).Info("Start cache objects")

	stopCh := ctx.Done()

	openPitrixGVRs := map[schema.GroupVersion][]string{
		{Group: "cluster.kubesphere.io", Version: "v1alpha1"}: {
			"clusters",
		},
		{Group: "application.kubesphere.io", Version: "v1alpha1"}: {
			"helmapplicationversions",
			"helmapplications",
			"helmcategories",
			"helmrepos",
			"helmreleases",
		},
	}

	if err := waitForCacheSync(s.KubernetesClient.Kubernetes().Discovery(),
		s.InformerFactory.KubeSphereSharedInformerFactory(),
		func(resource schema.GroupVersionResource) (interface{}, error) {
			return s.InformerFactory.KubeSphereSharedInformerFactory().ForResource(resource)
		},
		openPitrixGVRs, stopCh); err != nil {
		return err
	}

	// controller runtime cache for resources
	go func() {
		_ = s.RuntimeCache.Start(ctx)
	}()
	s.RuntimeCache.WaitForCacheSync(ctx)

	klog.V(0).Info("Finished caching objects")
	return nil
}

func logStackOnRecover(panicReason interface{}, w http.ResponseWriter) {
	var buffer bytes.Buffer
	buffer.WriteString(fmt.Sprintf("recover from panic situation: - %v\r\n", panicReason))
	for i := 2; ; i += 1 {
		_, file, line, ok := rt.Caller(i)
		if !ok {
			break
		}
		buffer.WriteString(fmt.Sprintf("    %s:%d\r\n", file, line))
	}
	klog.Errorln(buffer.String())

	headers := http.Header{}
	if ct := w.Header().Get("Content-Type"); len(ct) > 0 {
		headers.Set("Accept", ct)
	}

	w.WriteHeader(http.StatusInternalServerError)
	// ignore this error explicitly
	_, _ = w.Write([]byte("Internal server error"))
}

func logRequestAndResponse(req *restful.Request, resp *restful.Response, chain *restful.FilterChain) {
	start := time.Now()
	chain.ProcessFilter(req, resp)

	// Always log error response
	logWithVerbose := klog.V(4)
	if resp.StatusCode() > http.StatusBadRequest {
		logWithVerbose = klog.V(0)
	}

	logWithVerbose.Infof("%s - \"%s %s %s\" %d %d %dms",
		utilnet.GetRequestIP(req.Request),
		req.Request.Method,
		req.Request.URL,
		req.Request.Proto,
		resp.StatusCode(),
		resp.ContentLength(),
		time.Since(start)/time.Millisecond,
	)
}

func swaggerConfig(swo *spec.Swagger) {
	swo.Info = &spec.Info{
		InfoProps: spec.InfoProps{
			Title:       "OpenpitrixService",
			Description: "Resource for managing Openpitrix",
			Contact: &spec.ContactInfo{
				ContactInfoProps: spec.ContactInfoProps{
					Name:  "openpitrix",
					Email: "openpitrix@kubesphere.io",
					URL:   "http://openpitrix.io",
				},
			},
			License: &spec.License{
				LicenseProps: spec.LicenseProps{
					Name: "MIT",
					URL:  "http://mit.org",
				},
			},
			Version: "1.0.0",
		},
	}

	//swo.Tags = []spec.Tag{spec.Tag{TagProps: spec.TagProps{
	//	Name:        "users",
	//	Description: "Managing users"}}}
}

type errorResponder struct{}

func (e *errorResponder) Error(w http.ResponseWriter, req *http.Request, err error) {
	klog.Error(err)
	responsewriters.InternalError(w, req, err)
}
