<script setup>
// Pictogrammes génériques dessinés à la main (remplacez par vos propres icônes)
defineProps({ icon: String, label: String, href: String })
</script>

<template>
  <a class="social" :href="href" :aria-label="label" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <template v-if="icon === 'x'"><path d="M5 5l14 14M19 5L5 19" /></template>
      <template v-else-if="icon === 'linkedin'"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v7M8 7v.01M12 17v-7M12 13a3 3 0 0 1 6 0v4" /></template>
      <template v-else><rect x="3" y="6" width="18" height="12" rx="5" /><path d="M9 12v.01M15 12v.01" /></template>
    </svg>
  </a>
</template>

<style scoped>
.social { display: inline-flex; color: #fff; opacity: .9; transition: opacity .15s; }
.social:hover { opacity: 1; }
</style>
