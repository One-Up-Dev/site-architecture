<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { getCurrent, stopPlayground, terminalUrl } from '../api'
import { exerciseBySlug } from '../data/site'

const route = useRoute()
const router = useRouter()
const host = ref(null)
const state = ref('connexion')        // connexion | connecté | reconnexion | terminé
const notice = ref('')
const expiresAt = ref(null)
const now = ref(Date.now())
const term = shallowRef(null)
// Exercice d'origine (?ex=slug) pour le lien de retour
const exercise = computed(() => exerciseBySlug(route.query.ex))
const backTo = computed(() => exercise.value ? `/exercices/${exercise.value.slug}` : '/catalogue')
const backLabel = computed(() => exercise.value ? exercise.value.title : 'Catalogue')
let fit, ws, retries = 0, ended = false, clock, onResize

const remaining = computed(() => {
  if (!expiresAt.value) return '--:--'
  const s = Math.max(0, Math.round((expiresAt.value - now.value) / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const urgent = computed(() => expiresAt.value && expiresAt.value - now.value < 2 * 60_000)

function finish(message) {
  ended = true
  state.value = 'terminé'
  notice.value = message
  ws?.close()
  term.value?.write(`\r\n\x1b[33m${message}\x1b[0m\r\n`)
  term.value?.options && (term.value.options.disableStdin = true)
}

function connect() {
  const t = term.value
  ws = new WebSocket(terminalUrl(route.params.id, t.cols, t.rows))
  ws.binaryType = 'arraybuffer'
  ws.onopen = () => { state.value = 'connecté'; retries = 0; t.focus() }
  ws.onmessage = ev => {
    if (typeof ev.data !== 'string') return t.write(new Uint8Array(ev.data))
    const m = JSON.parse(ev.data)
    if (m.type === 'warning') notice.value = `Attention : la session se termine dans ${Math.ceil(m.secondsLeft / 60)} min.`
    else if (m.type === 'expired') finish(m.reason === 'stopped' ? 'Environnement arrêté.' : 'Session expirée : l’environnement a été effacé.')
    else if (m.type === 'exit') finish('Le shell s’est terminé. Rechargez la page pour en ouvrir un nouveau.')
    else if (m.type === 'error') finish(m.message)
  }
  ws.onclose = ev => {
    if (ended) return
    if (ev.code === 4404) return finish('Environnement introuvable ou expiré.')
    if (retries++ < 5) {
      state.value = 'reconnexion'
      setTimeout(connect, 1000 * retries)
    } else finish('Connexion perdue.')
  }
}

const sendResize = () => {
  fit.fit()
  const t = term.value
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'resize', cols: t.cols, rows: t.rows }))
}

onMounted(async () => {
  const p = await getCurrent().catch(() => null)
  if (!p || p.id !== route.params.id) {
    state.value = 'terminé'
    notice.value = 'Cet environnement n’existe plus.'
    return
  }
  expiresAt.value = new Date(p.expiresAt).getTime()

  const t = new Terminal({
    cursorBlink: true,
    fontFamily: 'ui-monospace, "DejaVu Sans Mono", Menlo, monospace',
    fontSize: 14,
    theme: { background: '#111111', foreground: '#e6e6e6' },
  })
  fit = new FitAddon()
  t.loadAddon(fit)
  t.open(host.value)
  fit.fit()
  term.value = t
  const enc = new TextEncoder()
  t.onData(d => { if (ws?.readyState === WebSocket.OPEN) ws.send(enc.encode(d)) })
  onResize = () => sendResize()
  window.addEventListener('resize', onResize)
  clock = setInterval(() => { now.value = Date.now() }, 1000)
  connect()
})

onBeforeUnmount(() => {
  ended = true
  ws?.close()
  clearInterval(clock)
  window.removeEventListener('resize', onResize)
  term.value?.dispose()
})

async function stop() {
  try { await stopPlayground(route.params.id) } catch { /* déjà arrêté */ }
  finish('Environnement arrêté.')
}
</script>

<template>
  <main class="pg">
    <div class="pg__bar">
      <RouterLink :to="backTo" class="pg__back">← {{ backLabel }}</RouterLink>
      <span class="pg__state" :class="`is-${state}`">{{ state }}</span>
      <span class="pg__timer" :class="{ urgent }" title="Temps restant">⏱ {{ remaining }}</span>
      <button v-if="state !== 'terminé'" type="button" class="pg__stop" @click="stop">Arrêter</button>
      <button v-else type="button" class="pg__stop" @click="router.push(backTo)">Retour</button>
    </div>
    <p v-if="notice" class="pg__notice" role="status">{{ notice }}</p>
    <div ref="host" class="pg__term"></div>
  </main>
</template>

<style scoped>
.pg { display: flex; flex-direction: column; height: calc(100dvh - var(--nav-h)); padding: 12px 16px 16px; background: #fff; }
.pg__bar { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; padding-bottom: 12px; font-size: 14px; }
.pg__back { text-decoration: underline; color: #000; }
.pg__state { padding: 2px 10px; border: 1px solid var(--c-line); text-transform: capitalize; }
.pg__state.is-connecté { border-color: #7cc79a; color: #1d6b3c; }
.pg__state.is-reconnexion { border-color: #e6c46a; color: #7a5b00; }
.pg__state.is-terminé { border-color: #ccc; color: #888; }
.pg__timer { margin-left: auto; font-variant-numeric: tabular-nums; }
.pg__timer.urgent { color: #b42318; font-weight: 600; }
.pg__stop { padding: 6px 16px; background: #000; color: #fff; border: 1px solid #000; border-radius: 0; }
.pg__stop:hover { background: #fff; color: #000; }
.pg__notice { margin-bottom: 8px; padding: 8px 12px; background: #fff8e6; border: 1px solid #f0d48a; color: #6b4e00; font-size: 14px; }
.pg__term { flex: 1; min-height: 0; padding: 8px; background: #111; }
.pg__term :deep(.xterm) { height: 100%; }
</style>
