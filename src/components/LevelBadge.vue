<script setup>
// Étiquette de niveau : débutant | intermédiaire | avancé
defineProps({ level: { type: String, required: true } })
</script>

<template>
  <span class="level" :class="`level--${level.normalize('NFD').replace(/\p{Diacritic}/gu, '')}`">{{ level }}</span>
</template>

<style scoped>
.level { display: inline-block; padding: 1px 8px; border: 1px solid; font-size: 12px; line-height: 1.6; white-space: nowrap; }
.level--debutant { border-color: #7cc79a; color: #1d6b3c; }
.level--intermediaire { border-color: #e6c46a; color: #7a5b00; }
.level--avance { border-color: #e5a0a0; color: #8a1f1f; }
</style>
