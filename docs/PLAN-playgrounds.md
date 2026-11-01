# Plan — Playgrounds activables (incus) pour site-architecture

## État d'avancement (2026-11-01)
| Étape | État |
|---|---|
| 0. Dépôt GitHub privé | ✅ fait |
| 1. Préparer le VPS | 📝 scripté (`infra/bootstrap-vps.sh`), pas encore lancé |
| 2. Initialiser incus | ✅ en dev (`incus-preseed-dev.yaml`) · 📝 VPS (`incus-preseed-vps.yaml`) |
| 3. Images pg-ubuntu / pg-alpine | ✅ fabriquées et testées en dev |
| 4. Profil playground | ✅ testé : pas de réseau, 512 Mo, 0,5 CPU, 256 processus |
| 5. Backend | ✅ testé : création, doublon 409, capacité 503, terminal, redimensionnement, arrêt, expiration + avertissement, reprise après redémarrage |
| 6. Front | ✅ testé de bout en bout dans Chrome (desktop + mobile) |
| 7. Déploiement | 📝 scripté (`infra/deploy.sh`, Caddyfile, service systemd), à lancer sur le VPS |

### Étape A — Simplification du site (fait)
- Header réduit à Catalogue et À propos ; pas de Connexion, d'icônes sociales ni de bandeau cookies ; pied de page minimal.
- Catalogue de 4 sujets (Linux, Git, Python, Docker) avec des exercices de démonstration dans `src/data/site.js`.
- Pages : `/catalogue`, `/catalogue/:topic`, `/exercices/:slug` (bouton « Lancer l'exercice ») ; page libre `/bacs-a-sable` supprimée.
- Backend inchangé : chaque exercice pointe pour l'instant vers `pg-ubuntu` ou `pg-alpine`.

### Premier exercice : « La commande ls » (fait)
- `exercises/linux-ls/` contient un décor (`/root/projet` avec fichiers cachés, tailles et dates variées, script exécutable, lien symbolique) et un cours de 8 étapes, avec défis et réponses dépliables.
- La page de l'environnement affiche le terminal à gauche et le cours à droite. La poignée est déplaçable (30 à 75 %, position mémorisée), le cours peut être masqué, et chaque bloc de commande a un bouton **Essayer**. Sous 900 px, un message demande un écran plus large.
- L'API lance un **exercice** (`{exercise}`) et non plus une image : `GET /api/exercises` liste ceux qui sont lançables. Un exercice sans dossier affiche « Bientôt disponible ».
- Pas encore de vérification automatique des étapes.

### Étape B — Moteur d'exercices (à planifier)
- Images par exercice, fabriquées par `infra/build-images.sh`. Exemple : `pg-python-ml` avec uv et un cache uv pré-rempli (numpy, pandas, scikit-learn, matplotlib, jupyter), et `UV_OFFLINE=1`. Les librairies s'installent sans Internet.
- Exercices définis côté serveur (`server/exercises/*.yaml`) : image, consignes en étapes, scripts de vérification via `incus exec`. L'API choisit l'image à partir de l'exercice ; le client ne choisit plus une image arbitraire.
- Panneau de consignes à côté du terminal, avec un bouton « Vérifier l'étape ».
- Docker : `security.nesting=true` pour ces seules images, ou bien des exercices sans exécution de Docker. Décision à prendre.
- Surveiller la taille des images : 40 Go de disque, et environ 1 à 2 Go par image avec un cache ML.

**Changement de stratégie :** le développement se fait dans le container de dev (incus imbriqué), pas sur le VPS. Le VPS ne fait que déployer avec `infra/bootstrap-vps.sh` (une fois), puis `infra/deploy.sh` (à chaque mise à jour). Claude Code n'est pas nécessaire sur le VPS.

### Écarts par rapport au plan initial
- **CPU** : `limits.cpu.allowance: 50%` n'est qu'une *priorité*. Le plafond dur s'écrit `50ms/100ms`, vérifié avec `cpu.max = 50000 100000`.
- **Alpine** : 3.20 n'est plus disponible sur `images:`, on utilise **3.24**.
- **Dev imbriqué** : driver `dir` (pas de loop device, donc pas de quota disque). Il a aussi fallu réduire `/etc/subuid` et `/etc/subgid` (`root:1000000:998000000`) pour tenir dans la plage d'UID du container parent.
- **`COOKIE_SECRET`** est obligatoire quand `NODE_ENV=production` ; sans lui, les sessions sautent à chaque redémarrage.
- **`trustProxy`** est limité à `127.0.0.1` (Caddy), pour qu'un client ne puisse pas falsifier son IP via `X-Forwarded-For`.
- **Avertissement d'expiration** : il est renvoyé à un terminal qui se connecte après sa diffusion, sans doublon.

### Mise en ligne sur le VPS
```bash
# 1. sur le VPS, avec ton utilisateur sudo (pas root) : clé de déploiement GitHub, puis
sudo install -d -o "$USER" /opt/site-architecture
git clone git@github.com:One-Up-Dev/site-architecture.git /opt/site-architecture
sudo bash /opt/site-architecture/infra/bootstrap-vps.sh   # une seule fois
# 2. à chaque mise à jour poussée sur GitHub
sudo bash /opt/site-architecture/infra/deploy.sh
```

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
- **pg-alpine** : depuis `images:alpine/3.24`, installer `bash vim nano git python3 htop tree jq`, puis `incus publish --alias pg-alpine`.
- Le script est relançable : il recrée les images s'il est rejoué.

### Étape 4 — Profil `playground` (`infra/profile-playground.yaml`)
```yaml
config:
  limits.cpu.allowance: 50ms/100ms   # plafond dur ; "50%" ne serait qu'une priorité
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
