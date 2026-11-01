<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TileGrid from '../components/TileGrid.vue'
import { topicBySlug, exercisesOf, exerciseTile } from '../data/site'

const route = useRoute()
const topic = computed(() => topicBySlug(route.params.topic))
const tiles = computed(() => exercisesOf(route.params.topic).map(exerciseTile))
</script>

<template>
  <main class="shell page">
    <template v-if="topic">
      <RouterLink to="/catalogue" class="page__back">← Catalogue</RouterLink>
      <h1 class="page__title">
        <span class="page__badge" :style="{ background: topic.color }" aria-hidden="true">{{ topic.name.slice(0, 2).toUpperCase() }}</span>
        {{ topic.name }}
      </h1>
      <p class="page__intro">{{ topic.description }}</p>
      <h2 class="page__sub">{{ tiles.length }} exercice{{ tiles.length > 1 ? 's' : '' }}</h2>
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
