import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PlaceholderView from './views/PlaceholderView.vue'

// Chargées à la demande : xterm.js n'alourdit pas la page d'accueil
const PlaygroundsView = () => import('./views/PlaygroundsView.vue')
const PlaygroundView = () => import('./views/PlaygroundView.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/bacs-a-sable', name: 'playgrounds', component: PlaygroundsView },
    { path: '/playground/:id', name: 'playground', component: PlaygroundView, meta: { fullscreen: true } },
    // Toutes les autres pages (À propos, Tarifs, etc.) pointent pour l'instant
    // vers une page générique ; remplacez-les par vos propres vues.
    { path: '/:slug(.*)', name: 'page', component: PlaceholderView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
