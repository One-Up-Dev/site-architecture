<template>
  <h2 class="label"><slot /></h2>
</template>

<style scoped>
.label {
  width: var(--card); max-width: 100%; margin-top: 48px; padding: 6px 12px;
  background: var(--c-ink-soft); color: #fff; text-align: center;
  font-size: 14px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
}
@media (max-width: 600px) { .label { width: 100%; } }
</style>
