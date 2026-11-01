#!/bin/bash
# Crée/met à jour le profil "playground" ; ajoute le quota disque si le pool le permet.
set -euo pipefail
cd "$(dirname "$0")"
incus profile show playground >/dev/null 2>&1 || incus profile create playground
incus profile edit playground < profile-playground.yaml
driver=$(incus storage show default | awk '/^driver:/{print $2}')
case "$driver" in
  btrfs|zfs|lvm) incus profile device set playground root size=2GB; echo "quota disque 2GB activé ($driver)";;
  *) echo "pool '$driver' : pas de quota disque (normal en dev)";;
esac
incus profile show playground
