<script setup>
import BrandLogo from './BrandLogo.vue'
import SocialIcon from './SocialIcon.vue'
import { footer, socials } from '../data/site'
</script>

<template>
  <footer class="foot">
    <div class="foot__inner">
      <div v-for="(col, i) in footer.columns" :key="i" class="foot__col">
        <div class="foot__head">
          <BrandLogo v-if="i === 0" size="lg" />
          <h2 v-else class="foot__title">{{ col.title }}</h2>
        </div>
        <ul class="foot__links">
          <li v-for="l in col.links" :key="l.label">
            <RouterLink v-if="l.to" :to="l.to">{{ l.label }}</RouterLink>
            <a v-else :href="l.href">{{ l.label }}</a>
          </li>
          <template v-if="col.socials">
            <li v-for="s in socials" :key="s.label"><SocialIcon v-bind="s" /></li>
          </template>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.foot { margin-top: 160px; padding: 48px 0; background: var(--c-ink); color: #fff; }
.foot__inner {
  max-width: 1320px; margin-inline: auto; padding: 0 12px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}
.foot__head { min-height: 60px; display: flex; align-items: center; margin-bottom: 20px; }
.foot__title { font-size: 16px; font-weight: 500; text-transform: uppercase; }
.foot__links { list-style: none; margin: 0; padding: 0; display: grid; gap: 13px; font-size: 15px; }
.foot__links a:hover { text-decoration: underline; }
@media (max-width: 768px) {
  .foot__inner { grid-template-columns: 1fr; gap: 40px; padding: 0 24px; }
}
</style>
