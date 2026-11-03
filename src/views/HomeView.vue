<script setup>
import { computed, ref } from 'vue'
import SearchField from '../components/SearchField.vue'
import TileGrid from '../components/TileGrid.vue'
import SectionLabel from '../components/SectionLabel.vue'
import { topics, sections, exercises, topicBySlug, categoryOf, topicTile, exerciseTile } from '../data/site'

const query = ref('')
const norm = s => (s || '').toLocaleLowerCase('fr').normalize('NFD').replace(/\p{Diacritic}/gu, '')
const has = (...fields) => !query.value || norm(fields.join(' ')).includes(norm(query.value))

const topicTiles = computed(() => topics.filter(t => has(t.name, t.summary)).map(topicTile))

// Sans recherche : sections éditoriales. Avec recherche : tous les exercices correspondants.
const sectionView = computed(() => {
  const match = e => has(e.title, e.command, e.summary, topicBySlug(e.topic)?.name, categoryOf(e.topic, e.category)?.name)
  if (query.value) {
    const found = exercises.filter(match)
    return found.length ? [{ id: 'results', label: 'Exercices', tiles: found.map(exerciseTile) }] : []
  }
  return sections.map(s => ({ ...s, tiles: s.exercises.map(exerciseTile) })).filter(s => s.tiles.length)
})
</script>

<template>
  <main class="shell home">
    <h1 class="visually-hidden">Exercices pratiques en ligne</h1>
    <SearchField v-model="query" />
    <TileGrid v-if="topicTiles.length" :items="topicTiles" />

    <section v-for="s in sectionView" :key="s.id" :aria-labelledby="`sec-${s.id}`">
      <SectionLabel :id="`sec-${s.id}`">{{ s.label }}</SectionLabel>
      <TileGrid :items="s.tiles" />
    </section>

    <p v-if="query && !topicTiles.length && !sectionView.length" class="empty">Aucun résultat pour « {{ query }} ».</p>
  </main>
</template>

<style scoped>
.home { padding-top: 128px; }
.empty { margin-top: 32px; color: var(--c-muted); }
</style>
