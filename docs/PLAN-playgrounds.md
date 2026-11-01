# Plan — Playgrounds activables (incus) pour site-architecture

## Contexte
Le site vitrine Vue 3 + Vite (`~/site-architecture`) a une carte « Bacs à sable » qui ne fait encore rien. Objectif : quand un visiteur clique, il obtient **un terminal root dans son navigateur**, connecté à un **container incus éphémère**. Le site sera hébergé sur un VPS et utilisé par plusieurs personnes en même temps. On commence petit (MVP) et on étend ensuite.

Ce plan est **destiné à une session Claude Code lancée directement sur le VPS**. Seule l'étape 0 se fait sur la machine de dev actuelle.

### Décisions prises avec l'utilisateur
| Sujet | Choix |
|---|---|
| Playground v1 | Terminal web uniquement (xterm.js) |
| Isolation | Containers incus **non privilégiés**, éphémères |
| Comptes | **Anonymes** : session par cookie, 1 playground actif par visiteur |
| Backend | **Node.js 24 + TypeScript** |
| Limites | **30 min, 0,5 CPU, 512 Mo** par playground |
| Réseau des playgrounds | **Aucun accès Internet** (pas d'interface réseau) |
| Images | Mon choix : **Ubuntu 24.04** pré-remplie + **Alpine** (légère) |
| Transfert du code | Dépôt **GitHub privé** |
| Domaine | Pas encore : HTTP sur l'IP du VPS, HTTPS plus tard |
| VPS | **Ubuntu, 2 vCPU / 2 Go RAM / 40 Go** (agrandi plus tard) |

### Conséquence de la petite taille du VPS
Le système, Node, Caddy et incus prennent environ 700 Mo. Avec 512 Mo par playground, on fixe **`MAX_PLAYGROUNDS=2`** simultanés (configurable), plus un **swap de 2 Go** pour protéger l'hôte. Au-delà de 2 playgrounds, l'API répond « complet, réessayez dans quelques minutes ». Quand le VPS grandit, on augmente seulement cette variable.

---

## Architecture

```
Navigateur ──HTTP/WS──► Caddy :80 ──► dist/ (front Vue statique)
                                   └─► /api, /ws ──► Node (Fastify) :3000
                                                        │ API REST incus sur socket unix
                                                        ▼
                                            /var/lib/incus/unix.socket
                                                        ▼
                                   containers pg-<id> (éphémères, sans réseau)
```

- **Source de vérité = incus** : aucune base de données en v1. Chaque container porte ses métadonnées dans des clés `user.pg.session`, `user.pg.image` et `user.pg.expires_at`. Au redémarrage, le backend reconstruit son état en listant les instances `pg-*`.
- **Relais du terminal** : le navigateur ouvre `/ws/playgrounds/:id`. Le backend fait `POST /1.0/instances/pg-<id>/exec` (`interactive: true`, `wait-for-websocket: true`) et ouvre les WebSockets de l'opération : fd `0` pour les données, `control` pour le redimensionnement (message `window-resize`). Il relaie ensuite les octets dans les deux sens. Lib `ws` avec l'URL `ws+unix:///var/lib/incus/unix.socket:/1.0/operations/<op>/websocket?secret=…`.

### Structure du dépôt (le front reste à la racine)
```
site-architecture/
├─ src/ …                  (front Vue existant)
├─ server/                 (nouveau backend TypeScript)
│  ├─ src/index.ts         Fastify, routes, démarrage, reaper
│  ├─ src/incus.ts         client REST incus (undici + socketPath)
│  ├─ src/playgrounds.ts   création, liste, arrêt, expiration, capacité
│  ├─ src/terminal.ts      relais WebSocket navigateur ↔ incus exec
│  ├─ src/session.ts       cookie anonyme signé (httpOnly, SameSite=Lax)
│  ├─ src/config.ts        variables d'env (MAX_PLAYGROUNDS, TTL_MIN, …)
│  └─ package.json, tsconfig.json
└─ infra/
   ├─ bootstrap-vps.sh     paquets, swap, ufw, utilisateur de service
   ├─ incus-preseed.yaml   pool btrfs, sans bridge réseau
   ├─ profile-playground.yaml
   ├─ build-images.sh      fabrique pg-ubuntu et pg-alpine
   ├─ Caddyfile
   └─ playground-api.service (systemd)
```

---

## Étapes

### Étape 0 — Sur la machine de dev (avant la session VPS)
1. `git init` dans `~/site-architecture`, ajouter `.gitignore` (node_modules, dist), premier commit, puis copier ce plan dans `docs/PLAN-playgrounds.md`.
2. L'utilisateur crée un dépôt GitHub **privé** et pousse (`git remote add origin … && git push -u origin main`).

### Étape 1 — Préparer le VPS (`infra/bootstrap-vps.sh`)
- `apt update && apt upgrade`, puis `apt install -y git curl ufw caddy incus btrfs-progs`. Incus 6.0 LTS est dans les dépôts d'Ubuntu 24.04 ; sinon, utiliser le dépôt Zabbly.
- Node 24 via nvm pour l'utilisateur de service, ou NodeSource 24.x.
- Swap : fichier de 2 Go (`fallocate`, `mkswap`, `/etc/fstab`) et `vm.swappiness=10`.
- Pare-feu : `ufw allow 22,80,443/tcp && ufw enable`.
- Utilisateur système `playground` ajouté au groupe `incus-admin`. **Attention** : ce groupe équivaut à root ; c'est compensé par le durcissement systemd de l'étape 7.
- Cloner le dépôt dans `/opt/site-architecture`.

### Étape 2 — Initialiser incus (`infra/incus-preseed.yaml`)
- `incus admin init --preseed` avec un **pool btrfs en fichier loop de 15 Go** (copie à l'écriture : création en environ 1 s et quotas disque).
- **Aucun réseau** par défaut : pas de `incusbr0` dans le profil des playgrounds.

### Étape 3 — Fabriquer les images (`infra/build-images.sh`)
Le VPS a Internet, contrairement aux playgrounds. On pré-installe donc tout au moment de la fabrication :
- **pg-ubuntu** : depuis `images:ubuntu/24.04`, avec un réseau temporaire, installer `bash-completion vim nano git curl wget python3 htop tree less man-db iproute2 procps jq unzip`, ajouter un message d'accueil (`/etc/motd` : « Playground — 30 min, pas d'Internet »), nettoyer apt, puis `incus publish --alias pg-ubuntu`.
- **pg-alpine** : depuis `images:alpine/3.20`, installer `bash vim nano git python3 htop tree jq`, puis `incus publish --alias pg-alpine`.
- Le script est relançable : il recrée les images s'il est rejoué.

### Étape 4 — Profil `playground` (`infra/profile-playground.yaml`)
```yaml
config:
  limits.cpu.allowance: 50%
  limits.memory: 512MB
  limits.memory.swap: "false"
  limits.processes: "256"
  security.privileged: "false"
  security.nesting: "false"
  security.idmap.isolated: "true"
  security.syscalls.intercept.mknod: "false"
devices:
  root: { type: disk, path: /, pool: default, size: 2GB }
  # pas de carte réseau : aucun accès Internet ni entre containers
```
Création : `incus launch pg-ubuntu pg-<id> --ephemeral --profile playground` (via l'API, `ephemeral: true`).

### Étape 5 — Backend (`server/`)
Dépendances : `fastify`, `@fastify/websocket`, `@fastify/cookie`, `@fastify/rate-limit`, `undici`, `ws`, `zod` ; en dev, `tsx` et `typescript`.

| Route | Rôle |
|---|---|
| `GET /api/images` | Liste les images proposées (id, nom, description) depuis `config.ts` |
| `POST /api/playgrounds` `{image}` | Vérifie la session, 1 playground actif par session et par IP, et la capacité. Crée et démarre `pg-<id>`, puis renvoie `{id, expiresAt}`. Si c'est complet : 503 avec un message clair. |
| `GET /api/playgrounds/current` | Playground actif de la session, ou 404 |
| `DELETE /api/playgrounds/:id` | Arrêt immédiat ; le container éphémère est supprimé |
| `WS /ws/playgrounds/:id` | Relais du terminal. Refusé si le playground n'appartient pas à la session. Messages JSON `{type:"resize",cols,rows}` côté navigateur, données brutes sinon |

- **Expiration** : un *reaper* tourne toutes les 30 s, arrête les instances dont `expires_at` est dépassé et nettoie les `pg-*` orphelins au démarrage. Il envoie un avertissement dans le terminal 2 minutes avant la fin.
- **Anti-abus** : `@fastify/rate-limit` (5 créations par heure et par IP), id aléatoire (`crypto.randomUUID`), validation des entrées avec zod, `trustProxy` activé derrière Caddy.
- **Config** par variables d'env : `MAX_PLAYGROUNDS=2`, `TTL_MIN=30`, `COOKIE_SECRET`, `INCUS_SOCKET`.

### Étape 6 — Front (dans `src/`)
- Ajouter `@xterm/xterm` et `@xterm/addon-fit`.
- Nouvelle vue `src/views/PlaygroundsView.vue` (`/bacs-a-sable`) : cartes des images réutilisant `TileGrid`/`TileCard` (variante `text`) et un bouton « Lancer ».
- Nouvelle vue `src/views/PlaygroundView.vue` (`/playground/:id`) :
  - terminal plein écran ;
  - barre avec le compte à rebours, le bouton « Arrêter » et l'état de connexion ;
  - reconnexion automatique du WebSocket, message « session expirée » à la fin.
- `src/api.js` : petites fonctions `fetch` (credentials `include`).
- Mettre à jour `src/router.js` (deux routes avant le catch-all) et `src/data/site.js` (la carte « Bacs à sable » pointe déjà vers `/bacs-a-sable`).
- Dev : `vite.config.js` avec un proxy `/api` et `/ws` (option `ws: true`) vers `127.0.0.1:3000`.

### Étape 7 — Déploiement
- `npm ci && npm run build` (front), puis `cd server && npm ci && npm run build`.
- `infra/Caddyfile` sur `:80` : `root * /opt/site-architecture/dist`, `try_files {path} /index.html`, `reverse_proxy /api/* /ws/* 127.0.0.1:3000`.
- `infra/playground-api.service` :
  - `User=playground`, `SupplementaryGroups=incus-admin`, `Restart=always` ;
  - fichier d'env `/etc/playground-api.env` ;
  - durcissement : `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `ReadWritePaths=/var/lib/incus/unix.socket`.
- `systemctl enable --now playground-api caddy`.

---

## Vérification (à faire par la session VPS)
1. `incus profile show playground` et `incus image list` : les profils et les images `pg-ubuntu` et `pg-alpine` sont présents.
2. Test manuel : `incus launch pg-ubuntu t1 --ephemeral --profile playground`, puis `incus exec t1 -- bash -c 'curl -m5 https://example.com; ip a; nproc; free -m'`. Attendu : curl échoue, pas d'`eth0`, mémoire limitée à 512 Mo. Ensuite `incus stop t1`, qui supprime le container.
3. API : `curl -c c.txt -X POST http://IP/api/playgrounds -H 'content-type: application/json' -d '{"image":"pg-ubuntu"}'` renvoie un id. Un deuxième POST avec le même cookie est refusé.
4. Capacité : trois sessions différentes, dont la troisième reçoit un 503.
5. Navigateur sur `http://IP/` : Bacs à sable → Lancer → terminal fonctionnel. Vérifier que le redimensionnement de la fenêtre s'applique (`stty size`).
6. Expiration : avec `TTL_MIN=2` temporairement, l'avertissement apparaît puis le container disparaît de `incus list`.
7. Redémarrer `playground-api` pendant qu'un playground tourne : il est retrouvé, puis nettoyé à expiration.
8. `free -m` avec 2 playgrounds actifs : l'hôte reste stable.

---

## Étapes suivantes (hors MVP, dans l'ordre suggéré)
1. **Domaine + HTTPS** : il suffit de remplacer `:80` par le domaine dans le Caddyfile, Let's Encrypt est automatique. **Prioritaire avant un usage public**, car le terminal passe en clair en HTTP.
2. File d'attente quand c'est complet, au lieu d'un 503.
3. Comptes (GitHub/email) avec des limites plus larges pour les connectés.
4. Scénarios guidés (étapes + vérifications automatiques).
5. Ports web exposés (sous-domaine par playground) et réseau sortant filtré pour certaines images.
6. Supervision (`incus` metrics, logs, alertes) et agrandissement du VPS (augmenter `MAX_PLAYGROUNDS`).
