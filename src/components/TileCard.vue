<script setup>
// Carte carrée unique, quatre variantes : text | logo | content | add
defineProps({ item: { type: Object, required: true } })
</script>

<template>
  <RouterLink v-if="item.kind !== 'add'" :to="item.to" class="tile" :class="`tile--${item.kind}`">
    <template v-if="item.kind === 'text'">
      <h3 class="tile__title">{{ item.title }}</h3>
      <p class="tile__text">{{ item.text }}</p>
    </template>

    <template v-else-if="item.kind === 'logo'">
      <span class="tile__logo" :style="{ '--accent': item.color }" aria-hidden="true">
        <span class="tile__badge">{{ item.name.slice(0, 2).toUpperCase() }}</span>
        <span class="tile__name">{{ item.name }}</span>
      </span>
      <span v-if="item.caption" class="tile__caption">{{ item.caption }}</span>
      <span v-if="item.author" class="tile__author">{{ item.author }}</span>
      <span class="visually-hidden">{{ item.name }}</span>
    </template>

    <template v-else>
      <h3 class="tile__title">{{ item.title }}</h3>
      <p class="tile__text">{{ item.text }}</p>
    </template>
  </RouterLink>

  <RouterLink v-else :to="item.to || '/contribuer'" class="tile tile--add" aria-label="Ajouter">
    <span aria-hidden="true">+</span>
  </RouterLink>
</template>

<style scoped>
.tile {
  position: relative; display: flex; flex-direction: column;
  width: 100%; aspect-ratio: 1 / 1; overflow: hidden;
  background: var(--c-bg); border: 1px solid var(--c-line);
  box-shadow: var(--shadow-card); color: #3a3a3a;
  transition: border-color .15s, box-shadow .15s, transform .15s;
}
.tile:hover { border-color: #bdbdbd; box-shadow: 0 4px 14px rgba(0,0,0,.08); }

/* Carte sombre (mise en avant) */
.tile--text { background: var(--c-ink-soft); border-color: var(--c-ink-soft); padding: 20px; }
.tile--text .tile__title { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.tile--text .tile__text { color: #ccc; font-size: 12px; line-height: 1.5; }

/* Tuile logo centrée */
.tile--logo { align-items: center; justify-content: center; gap: 12px; padding: 16px; text-align: center; }
.tile__logo { display: flex; align-items: center; gap: 10px; color: var(--accent); font-weight: 600; font-size: 18px; line-height: 1.2; text-align: left; }
.tile__badge {
  display: grid; place-items: center; width: 40px; height: 40px; flex: none;
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 700; border-radius: 8px;
}
.tile__name { color: #222; }
.tile__caption { font-size: 14px; color: #3a3a3a; }
.tile__author { font-size: 13px; color: #3a3a3a; }

/* Carte de contenu */
.tile--content { padding: 16px; }
.tile--content .tile__title { color: var(--c-title); font-size: 15.2px; font-weight: 600; margin-bottom: 8px; }
.tile--content .tile__text {
  color: var(--c-muted); font-size: 12.8px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden;
}

/* Tuile « + » en pointillés */
.tile--add {
  align-items: center; justify-content: center; border: 1px dashed #ccc; box-shadow: none;
  color: #999; font-size: 36px; font-weight: 300; background: transparent;
}
.tile--add:hover { color: #555; border-color: #999; }

@media (max-width: 600px) {
  .tile { aspect-ratio: auto; height: 200px; }
}
</style>
