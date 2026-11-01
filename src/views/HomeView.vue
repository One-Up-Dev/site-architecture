<script setup>
import { computed, reactive, ref } from 'vue'
import SearchField from '../components/SearchField.vue'
import TileGrid from '../components/TileGrid.vue'
import SectionLabel from '../components/SectionLabel.vue'
import MoreButton from '../components/MoreButton.vue'
import { highlights, topicTiles, sections } from '../data/site'

const query = ref('')
const norm = s => (s || '').toLocaleLowerCase('fr').normalize('NFD').replace(/\p{Diacritic}/gu, '')
const matches = item => !query.value || norm([item.title, item.name, item.text, item.caption, item.author].join(' ')).includes(norm(query.value))

const mainTiles = computed(() => {
  const list = [...highlights, ...topicTiles].filter(matches)
  return query.value ? list : [...list, { kind: 'add', to: '/contribuer' }]
})

// Pagination « Plus » par section
const shown = reactive(Object.fromEntries(sections.map(s => [s.id, s.pageSize ?? Infinity])))
const sectionView = computed(() => sections.map(s => {
  const all = s.cards.filter(matches)
  const cards = all.slice(0, shown[s.id])
  if (s.addTile && !query.value) cards.push({ kind: 'add', to: '/contribuer' })
  return { ...s, cards, hasMore: all.length > shown[s.id] }
}).filter(s => s.cards.length))
</script>

<template>
  <main class="shell home">
    <h1 class="visually-hidden">Environnements interactifs</h1>
    <SearchField v-model="query" />
    <TileGrid :items="mainTiles" />

    <section v-for="s in sectionView" :key="s.id" :aria-labelledby="`sec-${s.id}`">
      <SectionLabel :id="`sec-${s.id}`">{{ s.label }}</SectionLabel>
      <TileGrid :items="s.cards" />
      <MoreButton v-if="s.hasMore" @click="shown[s.id] += s.pageSize">Plus</MoreButton>
    </section>

    <p v-if="query && !mainTiles.length && !sectionView.length" class="empty">Aucun résultat pour « {{ query }} ».</p>
  </main>
</template>

<style scoped>
.home { padding-top: 128px; }
.empty { margin-top: 32px; color: var(--c-muted); }
@media (max-width: 600px) { .home { padding-top: 128px; } }
</style>
