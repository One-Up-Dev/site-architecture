<template>
  <div class="more"><button type="button"><slot>Plus</slot></button></div>
</template>

<style scoped>
.more { display: flex; justify-content: center; margin-top: 50px; }
button {
  padding: 10px 40px; font-size: 14.4px; color: var(--c-muted);
  background: #fff; border: 1px solid var(--c-line); border-radius: 0; transition: border-color .15s, color .15s;
}
button:hover { border-color: #999; color: #222; }
</style>
