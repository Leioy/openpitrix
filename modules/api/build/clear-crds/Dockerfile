FROM alpine:3.16.2

RUN apk update && apk add --no-cache ca-certificates curl

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && mv kubectl /usr/local/bin && chmod 775 /usr/local/bin/kubectl

RUN kubectl version --client -o yaml

WORKDIR /workspace

ADD . /workspace/crds


CMD kubectl delete -f /workspace/crds