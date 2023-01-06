#!/usr/bin/env bash

set -exv
set -o pipefail

KUBE_ROOT=$(dirname "${BASH_SOURCE[0]}")/..
source "${KUBE_ROOT}/hack/lib/init.sh"

# push to kubesphere with default latest tag
TAG=${TAG:-v0.0.1}
REPO=${REPO:-jw008}

# If set, just building, no pushing
DRY_RUN=${DRY_RUN:-}

# support other container tools. e.g. podman
CONTAINER_CLI=${CONTAINER_CLI:-docker}
CONTAINER_BUILDER=${CONTAINER_BUILDER:-build}

# use host os and arch as default target os and arch
TARGETOS=${TARGETOS:-$(kube::util::host_os)}
TARGETARCH=${TARGETARCH:-$(kube::util::host_arch)}

${CONTAINER_CLI} "${CONTAINER_BUILDER}" \
  --build-arg TARGETARCH="${TARGETARCH}" \
  --build-arg TARGETOS="${TARGETOS}" \
  -f build/apiserver/Dockerfile \
  -t "${REPO}"/openpitrix-apiserver:"${TAG}" .


${CONTAINER_CLI} "${CONTAINER_BUILDER}" \
  --build-arg "TARGETARCH=${TARGETARCH}" \
  --build-arg "TARGETOS=${TARGETOS}" \
  -f build/controller-manager/Dockerfile \
  -t "${REPO}"/openpitrix-controller-manager:"${TAG}" .

${CONTAINER_CLI} "${CONTAINER_BUILDER}" \
  --build-arg "TARGETARCH=${TARGETARCH}" \
  --build-arg "TARGETOS=${TARGETOS}" \
  -f build/clear-crds/Dockerfile \
  -t "${REPO}"/openpitrix-clear-crds:latest config/openpitrix/charts/openpitrix/crds




if [[ -z "${DRY_RUN:-}" ]]; then
  ${CONTAINER_CLI} push "${REPO}"/openpitrix-apiserver:"${TAG}"
  ${CONTAINER_CLI} push "${REPO}"/openpitrix-controller-manager:"${TAG}"
  ${CONTAINER_CLI} push "${REPO}"/openpitrix-clear-crds:latest
fi
