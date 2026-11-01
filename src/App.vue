<script setup>
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import CookieNotice from './components/CookieNotice.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <AppNavbar />
  <RouterView />
  <AppFooter v-if="!route.meta.fullscreen" />
  <CookieNotice />
</template>
