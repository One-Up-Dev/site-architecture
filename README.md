# site-architecture

Site d'exercices pratiques en Vue 3 + Vite : un catalogue de sujets (Linux, Git, Python, Docker), chacun avec ses exercices. Chaque exercice ouvre un environnement Linux éphémère dans le navigateur (container incus).

## Lancer
```bash
npm install
npm run dev -- --host 127.0.0.1   # http://127.0.0.1:5173
npm run build                     # sortie dans dist/
```

## Où mettre votre contenu
- `src/data/site.js` : **tout le contenu** (logo, menu, sujets, exercices, sections de l'accueil, pied de page)
- `src/styles/tokens.css` : couleurs, police, taille des cartes, espacements
- `public/` : vos images ; mettez `brand.logoSrc: '/logo.svg'` pour un logo image

## Structure
| Fichier | Rôle |
|---|---|
| `views/HomeView.vue` | accueil : recherche, 4 sujets, sections « À la une » et « Populaires » |
| `views/CatalogueView.vue` | tous les sujets et leurs exercices |
| `views/TopicView.vue` | page d'un sujet (`/catalogue/:topic`) |
| `views/ExerciseView.vue` | page d'un exercice et bouton « Lancer l'exercice » (`/exercices/:slug`) |
| `views/PlaygroundView.vue` | terminal (xterm.js), compte à rebours, arrêt |
| `components/AppNavbar.vue` | barre noire : logo, Catalogue, À propos ; hamburger sous 992px |
| `components/TileGrid.vue` / `TileCard.vue` | grille de cartes de 200px ; variantes `logo` (sujet) et `content` (exercice) |
| `components/AppFooter.vue` | pied de page minimal |

## Playgrounds (terminal Linux dans le navigateur)
Chaque exercice lance un container incus éphémère (image définie par l'exercice) : 30 min, 0,5 CPU, 512 Mo, sans Internet. Il n'y a pas de playground libre.

**Dev** (dans le container de dev, avec incus imbriqué) :
```bash
# une fois : incus admin init --preseed < infra/incus-preseed-dev.yaml
#            ./infra/apply-profile.sh && ./infra/build-images.sh
cd server && npm install
sg incus-admin -c "COOKIE_SECRET=dev npx tsx watch src/index.ts"   # API sur :3000
npm run dev -- --host 127.0.0.1                                    # front sur :5173 (proxy /api et /ws)
```

| Dossier | Contenu |
|---|---|
| `server/` | API Fastify + relais WebSocket vers `incus exec` (TypeScript) |
| `infra/` | init incus, profil, fabrication des images, Caddy, systemd, scripts VPS |
| `src/views/ExerciseView.vue`, `PlaygroundView.vue` | lancement depuis un exercice, page du terminal (xterm.js) |

## Feuille de route
Le plan des playgrounds (incus, backend, déploiement VPS) est dans [`docs/PLAN-playgrounds.md`](docs/PLAN-playgrounds.md).
