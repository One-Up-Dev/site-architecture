<script setup>
import { brand } from '../data/site'
defineProps({ size: { type: String, default: 'md' } })
</script>

<template>
  <RouterLink to="/" class="brand" :class="`brand--${size}`" aria-label="Accueil">
    <img v-if="brand.logoSrc" :src="brand.logoSrc" alt="" />
    <span v-else class="brand__mark" aria-hidden="true">
      <span v-for="l in brand.lines" :key="l">{{ l }}</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.brand { display: inline-flex; align-items: center; color: #fff; }
.brand__mark { display: flex; flex-direction: column; font-weight: 400; line-height: 1.15; letter-spacing: .02em; white-space: nowrap; }
.brand--md .brand__mark { font-size: 13px; }
.brand--lg .brand__mark { font-size: 15px; }
.brand img { height: 40px; width: auto; }
</style>
