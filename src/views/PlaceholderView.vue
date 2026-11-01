<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <main class="shell page">
    <h1>Page « {{ route.params.slug }} »</h1>
    <p>Page à construire : remplacez cette vue par votre propre contenu.</p>
    <RouterLink to="/" class="back">← Retour à l’accueil</RouterLink>
  </main>
</template>

<style scoped>
.page { padding-top: 96px; min-height: 40vh; }
h1 { font-size: 32px; color: var(--c-title); margin-bottom: 16px; }
.back { display: inline-block; margin-top: 24px; text-decoration: underline; }
</style>
