# Copyright 2018 The KubeSphere Authors. All rights reserved.
# Use of this source code is governed by a Apache license
# that can be found in the LICENSE file.


# Produce CRDs that work back to Kubernetes 1.11 (no version conversion)
CRD_OPTIONS ?= "crd:trivialVersions=true"

GV="network:v1alpha1 servicemesh:v1alpha2 tenant:v1alpha1 tenant:v1alpha2 devops:v1alpha1 iam:v1alpha2 devops:v1alpha3 cluster:v1alpha1 storage:v1alpha1 auditing:v1alpha1 types:v1beta1 quota:v1alpha2 application:v1alpha1 notification:v2beta1 gateway:v1alpha1"
MANIFESTS="application/* cluster/* iam/* network/v1alpha1 quota/* storage/* tenant/* gateway/*"

# App Version
APP_VERSION = v3.2.0

# Get the currently used golang install path (in GOPATH/bin, unless GOBIN is set)
ifeq (,$(shell go env GOBIN))
GOBIN=$(shell go env GOPATH)/bin
else
GOBIN=$(shell go env GOBIN)
endif

OUTPUT_DIR=bin
ifeq (${GOFLAGS},)
	# go build with vendor by default.
	export GOFLAGS=-mod=vendor
endif
define ALL_HELP_INFO
# Build code.
#
# Args:
#   WHAT: Directory names to build.  If any of these directories has a 'main'
#     package, the build will produce executable files under $(OUT_DIR).
#     If not specified, "everything" will be built.
#   GOFLAGS: Extra flags to pass to 'go' when building.
#   GOLDFLAGS: Extra linking flags passed to 'go' when building.
#   GOGCFLAGS: Additional go compile flags passed to 'go' when building.
#
# Example:
#   make
#   make all
#   make all WHAT=cmd/ks-apiserver
#     Note: Use the -N -l options to disable compiler optimizations an inlining.
#           Using these build options allows you to subsequently use source
#           debugging tools like delve.
endef
.PHONY: all
all:  apiserver controller-manager;$(info $(M)...Begin to test and build all of binary.) @ ## Test and build all of binary.

help:
	@grep -hE '^[ a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-17s\033[0m %s\n", $$1, $$2}'

.PHONY: binary
# Build all of binary
binary: | apiserver controller-manager; $(info $(M)...Build all of binary.) @ ## Build all of binary.

# Build ks-apiserver binary
apiserver: ; $(info $(M)...Begin to build apiserver binary.)  @ ## Build apiserver.
	 hack/gobuild.sh cmd/apiserver;

# Build ks-controller-manager binary
controller-manager: ; $(info $(M)...Begin to build controller-manager binary.)  @ ## Build ks-controller-manager.
	hack/gobuild.sh cmd/controller-manager

# Run all verify scripts hack/verify-*.sh
verify-all: ; $(info $(M)...Begin to run all verify scripts hack/verify-*.sh.)  @ ## Run all verify scripts hack/verify-*.sh.
	hack/verify-all.sh


# Run go fmt against code
fmt: ;$(info $(M)...Begin to run go fmt against code.)  @ ## Run go fmt against code.
	gofmt -w ./pkg ./cmd

# Format all import, `goimports` is required.
goimports: ;$(info $(M)...Begin to Format all import.)  @ ## Format all import, `goimports` is required.
	@hack/update-goimports.sh

# Run go vet against code
vet: ;$(info $(M)...Begin to run go vet against code.)  @ ## Run go vet against code.
	go vet ./pkg/... ./cmd/...


container: ;$(info $(M)...Begin to build the docker image.)  @ ## Build the docker image.
	DRY_RUN=true hack/docker_build.sh

container-push: ;$(info $(M)...Begin to build and push.)  @ ## Build and Push.
	hack/docker_build.sh

container-cross: ; $(info $(M)...Begin to build container images for multiple platforms.)  @ ## Build container images for multiple platforms. Currently, only linux/amd64,linux/arm64 are supported.
	DRY_RUN=true hack/docker_build_multiarch.sh

container-cross-push: ; $(info $(M)...Begin to build and push.)  @ ## Build and Push.
	hack/docker_build_multiarch.sh

#