<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TileGrid from '../components/TileGrid.vue'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import { breadcrumb, topicBySlug, exercisesOf, exerciseTile, categoryTile } from '../data/site'

const route = useRoute()
const topic = computed(() => topicBySlug(route.params.topic))
// Sujet avec rubriques : tuiles de rubrique. Sinon : les exercices directement.
const categories = computed(() => topic.value?.categories ?? [])
const tiles = computed(() => categories.value.length
  ? categories.value.map(c => categoryTile(topic.value, c))
  : exercisesOf(route.params.topic).map(exerciseTile))
const label = computed(() => {
  const n = tiles.value.length
  return categories.value.length ? `${n} rubrique${n > 1 ? 's' : ''}` : `${n} exercice${n > 1 ? 's' : ''}`
})
</script>

<template>
  <main class="shell page">
    <template v-if="topic">
      <AppBreadcrumb :items="breadcrumb(topic)" />
      <h1 class="page__title">
        <span class="page__badge" :style="{ background: topic.color }" aria-hidden="true">{{ topic.name.slice(0, 2).toUpperCase() }}</span>
        {{ topic.name }}
      </h1>
      <p class="page__intro">{{ topic.description }}</p>
      <h2 class="page__sub">{{ label }}</h2>
      <TileGrid :items="tiles" />
    </template>
    <template v-else>
      <h1 class="page__title">Sujet introuvable</h1>
      <p class="page__intro">Ce sujet n’existe pas (ou plus).</p>
      <RouterLink to="/catalogue" class="page__back">← Retour au catalogue</RouterLink>
    </template>
  </main>
</template>

<style scoped>
.page { padding-top: 96px; }
.page__back { display: inline-block; margin-bottom: 16px; text-decoration: underline; color: #000; }
.page__title { display: flex; align-items: center; gap: 12px; font-size: 28px; color: var(--c-title); }
.page__badge { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 8px; color: #fff; font-size: 15px; font-weight: 700; }
.page__intro { margin-top: 12px; max-width: 65ch; }
.page__sub { margin-top: 40px; font-size: 14px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--c-title); }
</style>
