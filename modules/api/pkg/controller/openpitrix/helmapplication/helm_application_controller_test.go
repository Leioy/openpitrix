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

package helmapplication

import (
	"context"
	v1alpha12 "kubesphere.io/openpitrix/pkg/api/application/v1alpha1"
	"kubesphere.io/openpitrix/pkg/constants"
	"kubesphere.io/openpitrix/pkg/utils/idutils"
	"time"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"sigs.k8s.io/controller-runtime/pkg/client"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

var _ = Describe("helmApplication", func() {

	const timeout = time.Second * 240
	const interval = time.Second * 1

	app := createApp()
	appVer := createAppVersion(app.GetHelmApplicationId(), "0.0.1")
	appVer2 := createAppVersion(app.GetHelmApplicationId(), "0.0.2")

	BeforeEach(func() {
		err := k8sClient.Create(context.Background(), app)
		Expect(err).NotTo(HaveOccurred())

		err = k8sClient.Create(context.Background(), appVer)
		Expect(err).NotTo(HaveOccurred())

		err = k8sClient.Create(context.Background(), appVer2)
		Expect(err).NotTo(HaveOccurred())
	})

	Context("Helm Application Controller", func() {
		It("Should success", func() {

			By("Update helm app version status")
			Eventually(func() bool {
				k8sClient.Get(context.Background(), types.NamespacedName{Name: appVer.Name}, appVer)
				appVer.Status = v1alpha12.HelmApplicationVersionStatus{
					State: v1alpha12.StateActive,
				}
				err := k8sClient.Status().Update(context.Background(), appVer)
				return err == nil
			}, timeout, interval).Should(BeTrue())

			By("Wait for app status become active")
			Eventually(func() bool {
				var localApp v1alpha12.HelmApplication
				appKey := types.NamespacedName{
					Name: app.Name,
				}
				k8sClient.Get(context.Background(), appKey, &localApp)
				return localApp.State() == v1alpha12.StateActive
			}, timeout, interval).Should(BeTrue())

			By("Mark workspace is deleted")
			Eventually(func() bool {
				var localApp v1alpha12.HelmApplication
				err := k8sClient.Get(context.Background(), types.NamespacedName{Name: app.Name}, &localApp)
				if err != nil {
					return false
				}
				appCopy := localApp.DeepCopy()
				appCopy.Annotations = map[string]string{}
				appCopy.Annotations[constants.DanglingAppCleanupKey] = constants.CleanupDanglingAppOngoing
				patchData := client.MergeFrom(&localApp)
				err = k8sClient.Patch(context.Background(), appCopy, patchData)
				return err == nil
			}, timeout, interval).Should(BeTrue())

			By("Draft app version are deleted")
			Eventually(func() bool {
				var ver v1alpha12.HelmApplicationVersion
				err := k8sClient.Get(context.Background(), types.NamespacedName{Name: appVer2.Name}, &ver)
				if apierrors.IsNotFound(err) {
					return true
				}
				return false
			}, timeout, interval).Should(BeTrue())

			By("Active app version exists")
			Eventually(func() bool {
				var ver v1alpha12.HelmApplicationVersion
				err := k8sClient.Get(context.Background(), types.NamespacedName{Name: appVer.Name}, &ver)
				return err == nil
			}, timeout, interval).Should(BeTrue())

		})
	})
})

func createApp() *v1alpha12.HelmApplication {
	return &v1alpha12.HelmApplication{
		ObjectMeta: metav1.ObjectMeta{
			Name: idutils.GetUuid36(v1alpha12.HelmApplicationIdPrefix),
		},
		Spec: v1alpha12.HelmApplicationSpec{
			Name: "dummy-chart",
		},
	}
}

func createAppVersion(appId string, version string) *v1alpha12.HelmApplicationVersion {
	return &v1alpha12.HelmApplicationVersion{
		ObjectMeta: metav1.ObjectMeta{
			Name: idutils.GetUuid36(v1alpha12.HelmApplicationVersionIdPrefix),
			Labels: map[string]string{
				constants.ChartApplicationIdLabelKey: appId,
			},
		},
		Spec: v1alpha12.HelmApplicationVersionSpec{
			Metadata: &v1alpha12.Metadata{
				Version: version,
				Name:    "dummy-chart",
			},
		},
	}
}
