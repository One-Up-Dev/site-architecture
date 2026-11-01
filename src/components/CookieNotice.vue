<script setup>
import { ref } from 'vue'
import { cookieNotice } from '../data/site'

const KEY = 'cookie-notice-ok'
const read = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
const visible = ref(!read())
function accept() {
  try { localStorage.setItem(KEY, '1') } catch {}
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="cookie" role="dialog" aria-live="polite" aria-label="Cookies">
    <p>{{ cookieNotice.text }}</p>
    <button type="button" @click="accept">{{ cookieNotice.button }}</button>
  </div>
</template>

<style scoped>
.cookie {
  position: fixed; left: 20px; bottom: 20px; z-index: 50; width: min(300px, calc(100% - 40px));
  background: #fafafa; border: 1px solid #ddd; border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,.12); font-family: var(--font); overflow: hidden;
}
.cookie p { padding: 16px 20px; font-size: 15px; color: #444; line-height: 1.55; }
.cookie button {
  display: block; width: 100%; padding: 10px; border: 0; border-top: 1px solid #ddd;
  background: #eee; color: #4caf50; font-weight: 700; letter-spacing: .03em;
}
.cookie button:hover { background: #e4e4e4; }
@media (max-width: 600px) { .cookie { width: calc(100% - 40px); } }
</style>
