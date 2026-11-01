import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PlaceholderView from './views/PlaceholderView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // Toutes les autres pages (À propos, Tarifs, etc.) pointent pour l'instant
    // vers une page générique ; remplacez-les par vos propres vues.
    { path: '/:slug(.*)', name: 'page', component: PlaceholderView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
