<script setup>
import TileGrid from '../components/TileGrid.vue'
import SectionLabel from '../components/SectionLabel.vue'
import { topics, exercisesOf, topicTile, exerciseTile } from '../data/site'
</script>

<template>
  <main class="shell page">
    <h1 class="page__title">Catalogue</h1>
    <p class="page__intro">Choisissez un sujet, puis un exercice : un environnement prêt à l’emploi s’ouvre dans votre navigateur.</p>
    <TileGrid :items="topics.map(topicTile)" />

    <section v-for="t in topics" :key="t.slug" :aria-labelledby="`cat-${t.slug}`">
      <SectionLabel :id="`cat-${t.slug}`">{{ t.name }}</SectionLabel>
      <TileGrid :items="exercisesOf(t.slug).map(exerciseTile)" />
    </section>
  </main>
</template>

<style scoped>
.page { padding-top: 96px; }
.page__title { font-size: 28px; color: var(--c-title); }
.page__intro { margin-top: 8px; max-width: 60ch; }
</style>
