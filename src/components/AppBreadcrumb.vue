<script setup>
// Fil d'Ariane : le dernier élément est la page courante (non cliquable)
defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <nav class="crumbs" aria-label="Fil d’Ariane">
    <ol>
      <li v-for="(c, i) in items" :key="c.to">
        <RouterLink v-if="i < items.length - 1" :to="c.to">{{ c.label }}</RouterLink>
        <span v-else aria-current="page">{{ c.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs { margin-bottom: 20px; font-size: 14px; }
.crumbs ol { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 0; padding: 0; }
.crumbs li + li::before { content: '›'; margin-right: 6px; color: #999; }
.crumbs a { text-decoration: underline; color: #000; }
.crumbs span { color: var(--c-muted); }
</style>
