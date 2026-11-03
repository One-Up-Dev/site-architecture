<script setup>
// /catalogue/:topic/:a/:b? → rubrique ou exercice, selon les données
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CategoryView from './CategoryView.vue'
import ExerciseView from './ExerciseView.vue'
import { resolveCatalog } from '../data/site'

const route = useRoute()
const node = computed(() => resolveCatalog(route.params.topic, route.params.a, route.params.b))
</script>

<template>
  <CategoryView v-if="node?.kind === 'category'" :key="route.path" :topic="node.topic" :category="node.category" />
  <ExerciseView v-else-if="node?.kind === 'exercise'" :key="route.path" :topic="node.topic" :category="node.category" :exercise="node.exercise" />
  <main v-else class="shell page">
    <h1 class="page__title">Page introuvable</h1>
    <p class="page__intro">Cette rubrique ou cet exercice n’existe pas (ou plus).</p>
    <RouterLink to="/catalogue" class="page__back">← Retour au catalogue</RouterLink>
  </main>
</template>

<style scoped>
.page { padding-top: 96px; }
.page__title { font-size: 28px; color: var(--c-title); }
.page__intro { margin-top: 12px; }
.page__back { display: inline-block; margin-top: 16px; text-decoration: underline; color: #000; }
</style>
