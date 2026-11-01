<script setup>
const model = defineModel({ type: String, default: '' })
</script>

<template>
  <label class="search">
    <span class="visually-hidden">Rechercher</span>
    <input v-model="model" type="search" placeholder="Rechercher..." autocomplete="off" />
  </label>
</template>

<style scoped>
.search { display: block; width: 200px; max-width: 100%; }
input {
  width: 100%; padding: 6px 12px 6px 0; font: inherit; color: #212529;
  background: transparent; border: 0; border-bottom: 1px solid #ccc; border-radius: 0; outline: none;
  transition: border-color .15s;
}
input::placeholder { color: #999; }
input:focus { border-bottom-color: #000; }
</style>
