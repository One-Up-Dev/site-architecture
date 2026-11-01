<script setup>
import TileCard from './TileCard.vue'
defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <div class="grid">
    <TileCard v-for="(item, i) in items" :key="item.to ?? i" :item="item" />
  </div>
</template>

<style scoped>
/* Cartes de 200px, alignées à gauche dans le conteneur centré */
.grid {
  display: grid; gap: var(--gap); margin-top: 16px;
  grid-template-columns: repeat(auto-fill, var(--card));
}
@media (max-width: 600px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
