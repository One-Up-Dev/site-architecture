<script setup>
// Rubrique d'un sujet : index de référence, filtrable par niveau (?niveau=)
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import LevelBadge from '../components/LevelBadge.vue'
import { breadcrumb, exercisePath, exercisesIn, levels } from '../data/site'

const props = defineProps({ topic: { type: Object, required: true }, category: { type: Object, required: true } })
const route = useRoute()
const router = useRouter()

const plain = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
const all = computed(() => exercisesIn(props.topic.slug, props.category.slug))
const present = computed(() => levels.filter(l => all.value.some(e => e.level === l)))
const level = computed(() => present.value.find(l => plain(l) === route.query.niveau) ?? null)
const items = computed(() => all.value.filter(e => !level.value || e.level === level.value))
const isCommand = computed(() => all.value.some(e => e.command))

const setLevel = l => router.replace({ query: l ? { niveau: plain(l) } : {} })
</script>

<template>
  <main class="shell page">
    <AppBreadcrumb :items="breadcrumb(topic, category)" />
    <h1 class="page__title">
      <span class="page__badge" :style="{ background: topic.color }" aria-hidden="true">{{ topic.name.slice(0, 2).toUpperCase() }}</span>
      {{ category.name }}
    </h1>
    <p class="page__intro">{{ category.description }}</p>

    <div class="bar">
      <h2 class="bar__count">{{ items.length }} exercice{{ items.length > 1 ? 's' : '' }}</h2>
      <div v-if="present.length > 1" class="bar__filter" role="group" aria-label="Filtrer par niveau">
        <button type="button" :aria-pressed="!level" @click="setLevel(null)">Tous</button>
        <button v-for="l in present" :key="l" type="button" :aria-pressed="level === l" @click="setLevel(l)">{{ l }}</button>
      </div>
    </div>

    <ul class="index" :class="{ 'index--cmd': isCommand }">
      <li v-for="e in items" :key="e.slug">
        <RouterLink :to="exercisePath(e)" class="index__row">
          <span class="index__name">{{ e.command ?? e.title }}</span>
          <span class="index__text">{{ e.summary }}</span>
          <span class="index__meta"><LevelBadge :level="e.level" /> {{ e.durationMin }} min</span>
        </RouterLink>
      </li>
    </ul>
    <p v-if="!items.length" class="page__empty">Aucun exercice pour ce niveau.</p>
  </main>
</template>

<style scoped>
.page { padding-top: 96px; }
.page__title { display: flex; align-items: center; gap: 12px; font-size: 28px; color: var(--c-title); }
.page__badge { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 8px; color: #fff; font-size: 15px; font-weight: 700; }
.page__intro { margin-top: 12px; max-width: 65ch; }
.page__empty { margin-top: 16px; color: var(--c-muted); }

.bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 40px; padding-bottom: 12px; border-bottom: 1px solid var(--c-line); }
.bar__count { font-size: 14px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--c-title); }
.bar__filter { display: flex; gap: 6px; }
.bar__filter button { padding: 4px 12px; background: #fff; color: #000; border: 1px solid var(--c-line); border-radius: 0; font-size: 13px; text-transform: capitalize; }
.bar__filter button:hover { border-color: #000; }
.bar__filter button[aria-pressed="true"] { background: #000; color: #fff; border-color: #000; }

.index { list-style: none; margin: 0; padding: 0; }
.index li { border-bottom: 1px solid var(--c-line); }
.index__row {
  display: grid; grid-template-columns: minmax(180px, 28%) 1fr auto; align-items: baseline; gap: 24px;
  padding: 16px 12px; color: #3a3a3a; transition: background .15s, color .15s;
}
.index--cmd .index__row { grid-template-columns: 140px 1fr auto; }
.index__row:hover { background: #000; color: #fff; }
.index__name { font-weight: 600; color: var(--c-title); }
.index--cmd .index__name { font-family: ui-monospace, "DejaVu Sans Mono", Menlo, monospace; font-size: 17px; }
.index__row:hover .index__name { color: #fff; }
.index__text { font-size: 14px; line-height: 1.5; }
.index__meta { display: flex; align-items: center; gap: 10px; font-size: 13px; white-space: nowrap; color: var(--c-muted); }
.index__row:hover .index__meta { color: #ccc; }
.index__row:hover :deep(.level) { border-color: #fff; color: #fff; }

@media (max-width: 700px) {
  .index__row, .index--cmd .index__row { grid-template-columns: 1fr; gap: 6px; }
}
</style>
