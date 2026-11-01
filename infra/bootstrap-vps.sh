#!/bin/bash
# Préparation initiale du VPS (Ubuntu 24.04). À lancer UNE fois, en root :
#   sudo bash infra/bootstrap-vps.sh
# Le dépôt doit déjà être cloné dans /opt/site-architecture par l'utilisateur sudo (pas root) :
#   sudo install -d -o "$USER" /opt/site-architecture
#   git clone git@github.com:One-Up-Dev/site-architecture.git /opt/site-architecture
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "À lancer avec sudo"; exit 1; }
APP=/opt/site-architecture
cd "$APP"

echo "==> Paquets"
apt-get update -q
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -q
DEBIAN_FRONTEND=noninteractive apt-get install -y -q git curl ufw caddy incus btrfs-progs ca-certificates
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 24 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y -q nodejs
fi

echo "==> Swap 2 Go"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf && sysctl -q --system

echo "==> Pare-feu"
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable

echo "==> Utilisateur de service"
id playground >/dev/null 2>&1 || useradd --system --home /nonexistent --shell /usr/sbin/nologin playground
usermod -aG incus-admin playground

echo "==> incus"
if ! incus storage show default >/dev/null 2>&1; then
  incus admin init --preseed < infra/incus-preseed-vps.yaml
fi
bash infra/apply-profile.sh
bash infra/build-images.sh

echo "==> Configuration de l'API"
if [ ! -f /etc/playground-api.env ]; then
  sed "s/^COOKIE_SECRET=$/COOKIE_SECRET=$(openssl rand -hex 32)/" infra/playground-api.env.example > /etc/playground-api.env
  chown root:playground /etc/playground-api.env && chmod 640 /etc/playground-api.env
fi
cp infra/playground-api.service /etc/systemd/system/
cp infra/Caddyfile /etc/caddy/Caddyfile
systemctl daemon-reload

echo "==> Premier déploiement"
bash infra/deploy.sh
echo "Terminé : http://$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')/"
