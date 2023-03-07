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

package app

import (
	"k8s.io/apimachinery/pkg/util/sets"
	"k8s.io/klog"
	"kubesphere.io/openpitrix/pkg/client/fs"
	"kubesphere.io/openpitrix/pkg/client/k8s"
	"kubesphere.io/openpitrix/pkg/client/s3"
	helmapplication2 "kubesphere.io/openpitrix/pkg/controller/openpitrix/helmapplication"
	"kubesphere.io/openpitrix/pkg/controller/openpitrix/helmcategory"
	"kubesphere.io/openpitrix/pkg/controller/openpitrix/helmrelease"
	"kubesphere.io/openpitrix/pkg/controller/openpitrix/helmrepo"
	"kubesphere.io/openpitrix/pkg/informers"
	"kubesphere.io/openpitrix/pkg/models/openpitrix"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/manager"

	"kubesphere.io/openpitrix/cmd/controller-manager/app/options"
)

var allControllers = []string{

	"helmrepo",
	"helmcategory",
	"helmapplication",
	"helmapplicationversion",
	"helmrelease",
	// "helm",

	// "application",
	// "serviceaccount",
	// "resourcequota",
}

// setup all available controllers one by one
func addAllControllers(mgr manager.Manager, client k8s.Client, informerFactory informers.InformerFactory,
	cmOptions *options.KubeSphereControllerManagerOptions,
	stopCh <-chan struct{}) error {
	var err error

	////////////////////////////////////
	// begin init necessary informers
	////////////////////////////////////
	// kubernetesInformer := informerFactory.KubernetesSharedInformerFactory()
	// kubesphereInformer := informerFactory.KubeSphereSharedInformerFactory()
	////////////////////////////////////
	// end informers
	////////////////////////////////////

	////////////////////////////////////////////////////////
	// begin init controller and add to manager one by one
	////////////////////////////////////////////////////////

	// "helmrepo" controller
	if cmOptions.IsControllerEnabled("helmrepo") {
		helmRepoReconciler := &helmrepo.ReconcileHelmRepo{}
		addControllerWithSetup(mgr, "helmrepo", helmRepoReconciler)
	}

	// "helmcategory" controller
	if cmOptions.IsControllerEnabled("helmcategory") {
		helmCategoryReconciler := &helmcategory.ReconcileHelmCategory{}
		addControllerWithSetup(mgr, "helmcategory", helmCategoryReconciler)
	}

	var opFsClient s3.Interface
	if !cmOptions.OpenPitrixOptions.AppStoreConfIsEmpty() {
		opFsClient, err = fs.NewFsClient(cmOptions.OpenPitrixOptions.S3Options)
		if err != nil {
			klog.Fatalf("failed to connect to s3, please check openpitrix s3 service status, error: %v", err)
		}

		// "helmapplication" controller
		if cmOptions.IsControllerEnabled("helmapplication") {
			reconcileHelmApp := (&helmapplication2.ReconcileHelmApplication{})
			addControllerWithSetup(mgr, "helmapplication", reconcileHelmApp)
		}

		// "helmapplicationversion" controller
		if cmOptions.IsControllerEnabled("helmapplicationversion") {
			reconcileHelmAppVersion := (&helmapplication2.ReconcileHelmApplicationVersion{})
			addControllerWithSetup(mgr, "helmapplicationversion", reconcileHelmAppVersion)
		}
	}

	// "helmrelease" controller
	if cmOptions.IsControllerEnabled("helmrelease") {
		var GenKubeConfig string
		GenKubeConfig, err = openpitrix.GenerateKubeConfiguration(cmOptions.KubernetesOptions.KubeConfig)
		if err != nil {
			klog.Errorf("GenerateKubeConfig Failed error: %s", err)
		}
		reconcileHelmRelease := &helmrelease.ReconcileHelmRelease{
			// nil interface is valid value.
			StorageClient:      opFsClient,
			KsFactory:          informerFactory.KubeSphereSharedInformerFactory(),
			MultiClusterEnable: true,
			WaitTime:           cmOptions.OpenPitrixOptions.ReleaseControllerOptions.WaitTime,
			MaxConcurrent:      cmOptions.OpenPitrixOptions.ReleaseControllerOptions.MaxConcurrent,
			StopChan:           stopCh,
			KubeConfig:         GenKubeConfig,
		}

		addControllerWithSetup(mgr, "helmrelease", reconcileHelmRelease)
	}

	// "helm" controller
	// if cmOptions.IsControllerEnabled("helm") {
	// 	if !cmOptions.GatewayOptions.IsEmpty() {
	// 		helmReconciler := &helm.Reconciler{GatewayOptions: cmOptions.GatewayOptions}
	// 		addControllerWithSetup(mgr, "helm", helmReconciler)
	// 	}
	// }

	// log all controllers process result
	for _, name := range allControllers {
		if cmOptions.IsControllerEnabled(name) {
			if addSuccessfullyControllers.Has(name) {
				klog.Infof("%s controller is enabled and added successfully.", name)
			} else {
				klog.Infof("%s controller is enabled but is not going to run due to its dependent component being disabled.", name)
			}
		} else {
			klog.Infof("%s controller is disabled by controller selectors.", name)
		}
	}

	return nil
}

var addSuccessfullyControllers = sets.NewString()

type setupableController interface {
	SetupWithManager(mgr ctrl.Manager) error
}

func addControllerWithSetup(mgr manager.Manager, name string, controller setupableController) {
	if err := controller.SetupWithManager(mgr); err != nil {
		klog.Fatalf("Unable to create %v controller: %v", name, err)
	}
	addSuccessfullyControllers.Insert(name)
}
