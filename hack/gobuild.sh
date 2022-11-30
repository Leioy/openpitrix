#!/usr/bin/env bash

# Copyright 2017 KubeSphere Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# This script builds and link stamps the output

set -o errexit
set -o nounset
set -o pipefail

KUBE_ROOT=$(dirname "${BASH_SOURCE[0]}")/..
source "${KUBE_ROOT}/hack/lib/init.sh"

VERBOSE=${VERBOSE:-"0"}
# V=""
if [[ "${VERBOSE}" == "1" ]];then
    # V="-x"
    set -x
fi

# ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

OUTPUT_DIR=bin
BUILDPATH=./${1:?"path to build"}
OUT=${OUTPUT_DIR}/${1:?"output path"}
echo "${OUT}"
BUILD_GOOS=${GOOS:-$(go env GOOS)}
BUILD_GOARCH=${GOARCH:-$(go env GOARCH)}
GOBINARY=${GOBINARY:-go}
LDFLAGS=$(kube::version::ldflags)

# forgoing -i (incremental build) because it will be deprecated by tool chain.
GOOS=${BUILD_GOOS} CGO_ENABLED=0 GOARCH=${BUILD_GOARCH} ${GOBINARY} build -ldflags="${LDFLAGS}" -o "${OUT}" "${BUILDPATH}"

#GOOS=linux CGO_ENABLED=0 GOARCH=amd64 go build -o "bin/../cmd/" -ldflags="-X 'kubesphere.io/kubesphere/pkg/version.buildDate=2022-10-18T06:58:20Z' -X 'kubesphere.io/kubesphere/pkg/version.gitCommit=b28d21df3fbf1c27f1225dfdf5871348c6d26e28' -X 'kubesphere.io/kubesphere/pkg/version.gitTreeState=dirty'" ./cmd/controller-manager