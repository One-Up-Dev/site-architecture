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

## Écrire un exercice
L'**identifiant** d'un exercice est son **chemin** : `<sujet>/[<rubrique>/]<nom>`, par exemple `linux/commandes/ls` ou `git/conflits`. Ce chemin sert à trois endroits :
- c'est son dossier dans `exercises/` ;
- c'est la valeur envoyée à l'API ;
- c'est son URL, sous la forme `/catalogue/<id>`.

L'exercice doit aussi être déclaré dans `src/data/site.js` avec :
- `topic`, `category` (facultatif) et `slug` ;
- le titre, la durée et le niveau (`débutant`, `intermédiaire` ou `avancé`) ;
- `command` (facultatif) : le nom affiché en police mono dans l'index de la rubrique.

Les rubriques d'un sujet sont déclarées dans `topics[].categories`. Un sujet sans rubriques garde ses exercices à plat.

Un exercice devient **lançable** dès que son dossier existe :

```
exercises/linux/commandes/ls/
├─ exercise.json   {"image": "pg-ubuntu", "setup": "setup.sh", "cwd": "/root/projet"}
├─ setup.sh        lancé en root dans le container juste après sa création (prépare les fichiers)
└─ cours.md        le cours, affiché à droite du terminal
```

- **`exercise.json`** :
  - `image` : `pg-ubuntu` ou `pg-alpine` ;
  - `setup` (optionnel) : script lancé à la création ;
  - `cwd` (optionnel) : dossier où s'ouvre le shell.
- **`setup.sh`** : doit renvoyer 0, sinon l'environnement est supprimé et le visiteur reçoit une erreur. Le container n'a **pas Internet**, donc tout ce qui est nécessaire doit être dans l'image.
- **`cours.md`** : du Markdown classique.
  - Un `## Titre` par étape.
  - Les blocs ```` ```bash ```` reçoivent un bouton **Essayer**, qui tape la commande dans le terminal sans la valider.
  - Pour une réponse à déplier : `<details><summary>Voir la réponse</summary>…</details>`.
- Redémarrer l'API après l'ajout d'un exercice : le catalogue est lu au démarrage.

## Feuille de route
Le plan des playgrounds (incus, backend, déploiement VPS) est dans [`docs/PLAN-playgrounds.md`](docs/PLAN-playgrounds.md).
