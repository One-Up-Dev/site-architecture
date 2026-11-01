#!/bin/bash
# Mise à jour du site sur le VPS : récupère le code, construit, redémarre.
#   sudo bash infra/deploy.sh
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "À lancer avec sudo"; exit 1; }
APP=/opt/site-architecture
cd "$APP"
# git et npm tournent avec le propriétaire du dépôt (qui a la clé GitHub), pas en root
OWNER=$(stat -c %U "$APP")
as_owner() { sudo -u "$OWNER" -H bash -lc "cd '$APP' && $*"; }

echo "==> Code (en tant que $OWNER)"
as_owner "git pull --ff-only"

echo "==> Front"
as_owner "npm ci --no-audit --no-fund && npm run build"

echo "==> API"
as_owner "cd server && npm ci --no-audit --no-fund && npm run build"

echo "==> Configuration"
# Profil playground et Caddyfile à jour (sans toucher aux images)
bash infra/apply-profile.sh >/dev/null
cp infra/Caddyfile /etc/caddy/Caddyfile
cp infra/playground-api.service /etc/systemd/system/
systemctl daemon-reload

echo "==> Redémarrage"
systemctl enable --now playground-api caddy
systemctl restart playground-api
systemctl reload caddy

sleep 2
curl -fsS http://127.0.0.1:3000/api/health && echo " API OK"
curl -fsS -o /dev/null http://127.0.0.1/ && echo "Site OK"
