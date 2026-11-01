# site-architecture

Site vitrine en Vue 3 + Vite. Il reprend une **architecture** de page de type catalogue (barre de navigation, recherche, grille de tuiles carrées, sections, pagination « Plus », pied de page en 3 colonnes, bandeau cookies), avec du code et du contenu originaux.

## Lancer
```bash
npm install
npm run dev -- --host 127.0.0.1   # http://127.0.0.1:5173
npm run build                     # sortie dans dist/
```

## Où mettre votre contenu
- `src/data/site.js` : **tout le contenu** (logo, liens, tuiles, sections, pied de page, cookies)
- `src/styles/tokens.css` : couleurs, police, taille des cartes, espacements
- `public/` : vos images ; mettez `brand.logoSrc: '/logo.svg'` pour un logo image

## Structure
| Fichier | Rôle |
|---|---|
| `components/AppNavbar.vue` | barre noire de 65px, menu hamburger sous 992px |
| `components/SearchField.vue` | recherche soulignée, filtre en direct |
| `components/TileGrid.vue` / `TileCard.vue` | grille de cartes de 200px ; variantes `text`, `logo`, `content`, `add` |
| `components/SectionLabel.vue` | étiquette de section noire |
| `components/MoreButton.vue` | pagination « Plus » |
| `components/AppFooter.vue` | pied de page en 3 colonnes |
| `components/CookieNotice.vue` | bandeau cookies (mémorisé dans localStorage) |
| `views/PlaceholderView.vue` | page générique pour les routes pas encore construites |

## Feuille de route
Le plan des playgrounds (incus, backend, déploiement VPS) est dans [`docs/PLAN-playgrounds.md`](docs/PLAN-playgrounds.md).
