<script setup>
import BrandLogo from './BrandLogo.vue'
import { footer } from '../data/site'
</script>

<template>
  <footer class="foot">
    <div class="foot__inner">
      <BrandLogo size="lg" />
      <ul class="foot__links">
        <li v-for="l in footer.links" :key="l.to"><RouterLink :to="l.to">{{ l.label }}</RouterLink></li>
      </ul>
    </div>
    <p class="foot__copy">{{ footer.copyright }}</p>
  </footer>
</template>

<style scoped>
.foot { margin-top: 160px; padding: 48px 0 32px; background: var(--c-ink); color: #fff; }
.foot__inner {
  max-width: 1320px; margin-inline: auto; padding: 0 24px;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;
}
.foot__links { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 32px; font-size: 15px; }
.foot__links a:hover { text-decoration: underline; }
.foot__copy { max-width: 1320px; margin: 32px auto 0; padding: 0 24px; font-size: 13px; color: #999; }
@media (max-width: 600px) {
  .foot__inner { flex-direction: column; align-items: flex-start; }
  .foot__links { flex-direction: column; gap: 14px; }
}
</style>
