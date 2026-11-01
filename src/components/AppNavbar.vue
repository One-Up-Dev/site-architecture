<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import SocialIcon from './SocialIcon.vue'
import { navLinks, loginLink, socials } from '../data/site'

const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="nav">
    <nav class="nav__bar" aria-label="Navigation principale">
      <div class="nav__left">
        <BrandLogo />
        <div class="nav__socials">
          <SocialIcon v-for="s in socials" :key="s.label" v-bind="s" />
        </div>
      </div>

      <button class="nav__toggle" :aria-expanded="open" aria-controls="nav-menu" @click="open = !open">
        <span class="visually-hidden">Menu</span>
        <span class="nav__burger" aria-hidden="true"></span>
      </button>

      <ul id="nav-menu" class="nav__menu" :class="{ 'is-open': open }">
        <li v-for="l in navLinks" :key="l.to"><RouterLink class="nav__link" :to="l.to">{{ l.label }}</RouterLink></li>
        <li><RouterLink class="nav__login" :to="loginLink.to">{{ loginLink.label }}</RouterLink></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.nav { background: var(--c-ink); color: #fff; }
.nav__bar {
  min-height: var(--nav-h); display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; padding: 0 16px;
}
.nav__left { display: flex; align-items: center; gap: 48px; }
.nav__socials { display: flex; gap: 14px; }
.nav__menu { display: flex; align-items: center; gap: 32px; list-style: none; margin: 0; padding: 0; }
.nav__link { display: block; padding: 8px; color: var(--c-nav-link); transition: color .15s; }
.nav__link:hover, .nav__link.router-link-active { color: #fff; }
.nav__login {
  display: block; padding: 6px 24px; background: #fff; color: #000;
  border: 1px solid #fff; transition: background .15s, color .15s;
}
.nav__login:hover { background: transparent; color: #fff; }

.nav__toggle {
  display: none; width: 56px; height: 40px; padding: 4px 12px;
  background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 0;
}
.nav__burger, .nav__burger::before, .nav__burger::after {
  display: block; width: 30px; height: 2px; background: rgba(255,255,255,.55); position: relative; content: '';
}
.nav__burger::before { position: absolute; top: -9px; }
.nav__burger::after { position: absolute; top: 9px; }

/* Repli du menu sous 992px (même comportement « navbar-expand-lg ») */
@media (max-width: 991.98px) {
  .nav__socials { display: none; }
  .nav__toggle { display: block; }
  .nav__menu {
    display: none; flex-basis: 100%; flex-direction: column; align-items: flex-start;
    gap: 0; padding: 8px 0 16px;
  }
  .nav__menu.is-open { display: flex; }
  .nav__login { margin-top: 8px; }
}
</style>
