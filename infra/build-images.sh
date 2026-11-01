#!/bin/bash
# Fabrique les images pg-ubuntu et pg-alpine (relançable : remplace les images existantes).
# Les paquets sont installés ici, car les playgrounds n'ont pas Internet.
set -euo pipefail

MOTD='Playground — session de 30 minutes, sans accès Internet. Tout est effacé à la fin.'

ONLY=${1:-}   # ex. ./build-images.sh pg-alpine  → ne reconstruit que cette image

build() {
  local alias=$1 source=$2 install=$3
  if [ -n "$ONLY" ] && [ "$ONLY" != "$alias" ]; then return; fi
  local b="build-$alias"
  echo "==> $alias depuis $source"
  incus delete -f "$b" 2>/dev/null || true
  timeout 600 incus init -q "$source" "$b" --network incusbr0
  timeout 120 incus start "$b"
  # attendre le réseau
  for _ in $(seq 1 30); do incus exec "$b" -- sh -c 'getent hosts deb.debian.org dl-cdn.alpinelinux.org archive.ubuntu.com >/dev/null 2>&1' && break; sleep 2; done
  incus exec "$b" -- sh -c "$install"
  incus exec "$b" -- sh -c "printf '%s\n' '$MOTD' > /etc/motd"
  timeout 120 incus stop "$b"
  incus image delete "$alias" 2>/dev/null || true
  timeout 900 incus publish -q "$b" --alias "$alias" description="$alias (playground)"
  incus delete "$b"
}

build pg-ubuntu images:ubuntu/24.04 '
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -q
  apt-get install -y -q --no-install-recommends bash-completion vim nano git curl wget python3 htop tree less man-db iproute2 procps jq unzip ca-certificates
  apt-get clean; rm -rf /var/lib/apt/lists/*'

build pg-alpine images:alpine/3.24 '
  apk add --no-cache bash vim nano git python3 htop tree jq
  sed -i "s#/bin/ash#/bin/bash#" /etc/passwd'

incus image list
