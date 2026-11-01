<script setup>
// Cours d'un exercice (Markdown → HTML) avec un bouton « ▶ Essayer » sur chaque bloc de commandes
import { nextTick, ref, watch } from 'vue'
import { loadCourse } from '../exercises'

const props = defineProps({ slug: { type: String, required: true } })
const emit = defineEmits(['try'])
const html = ref('')
const missing = ref(false)
const root = ref(null)

async function render() {
  const h = await loadCourse(props.slug)
  missing.value = !h
  html.value = h ?? ''
  await nextTick()
  for (const pre of root.value?.querySelectorAll('pre > code.language-bash') ?? []) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'course__try'
    btn.textContent = 'Essayer'
    btn.title = 'Copier la commande dans le terminal'
    btn.addEventListener('click', () => emit('try', pre.textContent.trim()))
    pre.parentElement.classList.add('course__cmd')
    pre.parentElement.appendChild(btn)
  }
}
watch(() => props.slug, render, { immediate: true })
</script>

<template>
  <article ref="root" class="course">
    <p v-if="missing" class="course__missing">Pas de cours pour cet exercice.</p>
    <div v-else class="course__body" v-html="html"></div>
  </article>
</template>

<style scoped>
.course { height: 100%; overflow-y: auto; padding: 24px 28px 48px; background: #fff; color: #333; font-size: 15px; line-height: 1.65; }
.course__missing { color: var(--c-muted); }
.course__body :deep(h1) { font-size: 24px; color: var(--c-title); margin-bottom: 12px; }
.course__body :deep(h2) {
  margin: 36px 0 12px; padding-top: 20px; border-top: 1px solid var(--c-line);
  font-size: 18px; color: var(--c-title);
}
.course__body :deep(h3) { margin: 24px 0 8px; font-size: 15px; text-transform: uppercase; letter-spacing: .05em; color: var(--c-title); }
.course__body :deep(p), .course__body :deep(ul), .course__body :deep(table) { margin: 10px 0; }
.course__body :deep(ul) { padding-left: 20px; }
.course__body :deep(code) { padding: 1px 5px; background: #f2f2f2; border-radius: 3px; font-family: ui-monospace, 'DejaVu Sans Mono', monospace; font-size: .9em; }
.course__body :deep(pre) {
  margin: 12px 0; padding: 12px 14px; background: #111; color: #e6e6e6; overflow-x: auto; border-radius: 2px;
}
.course__body :deep(pre code) { padding: 0; background: none; color: inherit; font-size: 14px; }
.course__body :deep(.course__cmd) { position: relative; }
.course__body :deep(.course__try) {
  position: absolute; top: 8px; right: 8px; padding: 3px 10px; font-size: 12px;
  background: #fff; color: #000; border: 1px solid #fff; border-radius: 2px; transition: background .15s, color .15s;
}
/* Triangle « lecture » dessiné en CSS (pas de dépendance à la police) */
.course__body :deep(.course__try)::before {
  content: ''; display: inline-block; margin-right: 6px; vertical-align: 0;
  border-style: solid; border-width: 4px 0 4px 7px; border-color: transparent transparent transparent currentColor;
}
.course__body :deep(.course__try:hover) { background: #111; color: #fff; }
.course__body :deep(blockquote) { margin: 16px 0; padding: 10px 14px; background: #f7f7f7; border-left: 3px solid #000; }
.course__body :deep(blockquote p) { margin: 0; }
.course__body :deep(details) { margin: 8px 0 4px; padding: 8px 14px; border: 1px dashed #ccc; }
.course__body :deep(summary) { cursor: pointer; font-size: 14px; color: var(--c-muted); }
.course__body :deep(details[open] summary) { margin-bottom: 6px; }
.course__body :deep(table) { width: 100%; border-collapse: collapse; font-size: 14px; }
.course__body :deep(th), .course__body :deep(td) { padding: 6px 8px; border-bottom: 1px solid var(--c-line); text-align: left; vertical-align: top; }
.course__body :deep(th) { background: #fafafa; font-weight: 600; }
</style>
