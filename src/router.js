import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PlaceholderView from './views/PlaceholderView.vue'

// Chargées à la demande (xterm.js n'alourdit pas les autres pages)
const CatalogueView = () => import('./views/CatalogueView.vue')
const TopicView = () => import('./views/TopicView.vue')
const CatalogNodeView = () => import('./views/CatalogNodeView.vue')
const PlaygroundView = () => import('./views/PlaygroundView.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/catalogue', name: 'catalogue', component: CatalogueView },
    { path: '/catalogue/:topic', name: 'topic', component: TopicView },
    // Rubrique (/catalogue/linux/commandes) ou exercice (/catalogue/linux/commandes/ls, /catalogue/git/conflits)
    { path: '/catalogue/:topic/:a/:b?', name: 'catalog-node', component: CatalogNodeView },
    { path: '/playground/:id', name: 'playground', component: PlaygroundView, meta: { fullscreen: true } },
    // Pages à rédiger (À propos, Mentions légales…) : vue générique en attendant
    { path: '/:slug(.*)', name: 'page', component: PlaceholderView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
