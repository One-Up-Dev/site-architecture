<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import CoursePanel from '../components/CoursePanel.vue'
import { getCurrent, stopPlayground, terminalUrl } from '../api'
import { exerciseBySlug } from '../data/site'

const MIN_WIDTH = 900
const route = useRoute()
const router = useRouter()
const host = ref(null)
const split = ref(null)
const state = ref('connexion')        // connexion | connecté | reconnexion | terminé
const notice = ref('')
const expiresAt = ref(null)
const now = ref(Date.now())
const exerciseSlug = ref(route.query.ex || '')
const term = shallowRef(null)
const narrow = ref(window.innerWidth < MIN_WIDTH)
let fit, ws, retries = 0, ended = false, clock, onResize

// ── Exercice d'origine ─────────────────────────────────────
const exercise = computed(() => exerciseBySlug(exerciseSlug.value))
const backTo = computed(() => exercise.value ? `/exercices/${exercise.value.slug}` : '/catalogue')
const backLabel = computed(() => exercise.value ? exercise.value.title : 'Catalogue')

// ── Largeur du terminal (poignée) et affichage du cours ────
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch { /* stockage indisponible */ } },
}
const termWidth = ref(Math.min(75, Math.max(30, Number(store.get('pg-split', 60)) || 60)))
const showCourse = ref(store.get('pg-course', '1') === '1')
watch(termWidth, v => store.set('pg-split', String(Math.round(v))))
watch(showCourse, v => { store.set('pg-course', v ? '1' : '0'); nextTick(sendResize) })

function startDrag(e) {
  e.preventDefault()
  const rect = split.value.getBoundingClientRect()
  const move = ev => {
    termWidth.value = Math.min(75, Math.max(30, ((ev.clientX - rect.left) / rect.width) * 100))
    sendResize()
  }
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); document.body.classList.remove('is-dragging') }
  document.body.classList.add('is-dragging')
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

// ── Minuteur ───────────────────────────────────────────────
const remaining = computed(() => {
  if (!expiresAt.value) return '--:--'
  const s = Math.max(0, Math.round((expiresAt.value - now.value) / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const urgent = computed(() => expiresAt.value && expiresAt.value - now.value < 2 * 60_000)

// ── Terminal ───────────────────────────────────────────────
function finish(message) {
  ended = true
  state.value = 'terminé'
  notice.value = message
  ws?.close()
  term.value?.write(`\r\n\x1b[33m${message}\x1b[0m\r\n`)
  if (term.value) term.value.options.disableStdin = true
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

function sendResize() {
  if (!fit || !term.value) return
  fit.fit()
  const t = term.value
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'resize', cols: t.cols, rows: t.rows }))
}

/** « ▶ Essayer » : tape la commande dans le terminal, sans la valider. */
function tryCommand(cmd) {
  if (ws?.readyState !== WebSocket.OPEN || state.value !== 'connecté') return
  ws.send(new TextEncoder().encode(cmd.replace(/\n+/g, ' ')))
  term.value?.focus()
}

async function setupTerminal() {
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
  connect()
}

onMounted(async () => {
  onResize = () => {
    narrow.value = window.innerWidth < MIN_WIDTH
    sendResize()
  }
  window.addEventListener('resize', onResize)

  const p = await getCurrent().catch(() => null)
  if (!p || p.id !== route.params.id) {
    state.value = 'terminé'
    notice.value = 'Cet environnement n’existe plus.'
    return
  }
  expiresAt.value = new Date(p.expiresAt).getTime()
  if (p.exercise) exerciseSlug.value = p.exercise
  clock = setInterval(() => { now.value = Date.now() }, 1000)
  if (!narrow.value) setupTerminal()
})

// Écran élargi après coup : créer le terminal à ce moment-là
watch(narrow, async v => {
  if (!v && !term.value && expiresAt.value && !ended) { await nextTick(); setupTerminal() }
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
    <div v-if="narrow" class="pg__narrow">
      <p>Cet exercice nécessite un écran d’au moins {{ MIN_WIDTH }} px de large.</p>
      <p>Agrandissez la fenêtre ou revenez depuis un ordinateur.</p>
      <RouterLink :to="backTo">← {{ backLabel }}</RouterLink>
    </div>

    <template v-else>
      <div class="pg__bar">
        <RouterLink :to="backTo" class="pg__back">← {{ backLabel }}</RouterLink>
        <span class="pg__state" :class="`is-${state}`">{{ state }}</span>
        <span class="pg__timer" :class="{ urgent }" title="Temps restant"><span class="pg__clock" aria-hidden="true"></span>{{ remaining }}</span>
        <button v-if="exercise" type="button" class="pg__ghost" @click="showCourse = !showCourse">
          {{ showCourse ? 'Masquer le cours' : 'Afficher le cours' }}
        </button>
        <button v-if="state !== 'terminé'" type="button" class="pg__stop" @click="stop">Arrêter</button>
        <button v-else type="button" class="pg__stop" @click="router.push(backTo)">Retour</button>
      </div>
      <p v-if="notice" class="pg__notice" role="status">{{ notice }}</p>

      <div ref="split" class="pg__split" :style="{ '--term': (exercise && showCourse ? termWidth : 100) + '%' }">
        <div class="pg__term"><div ref="host" class="pg__xterm"></div></div>
        <template v-if="exercise && showCourse">
          <div class="pg__handle" role="separator" aria-orientation="vertical" aria-label="Redimensionner" @pointerdown="startDrag"></div>
          <CoursePanel class="pg__course" :slug="exercise.slug" @try="tryCommand" />
        </template>
      </div>
    </template>
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
.pg__clock { display: inline-block; width: 12px; height: 12px; margin-right: 6px; vertical-align: -1px; border: 1.5px solid currentColor; border-radius: 50%; position: relative; }
.pg__clock::after { content: ''; position: absolute; left: 4px; top: 1.5px; width: 3px; height: 3.5px; border-left: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; }
.pg__ghost { padding: 6px 14px; background: #fff; color: #000; border: 1px solid var(--c-line); border-radius: 0; }
.pg__ghost:hover { border-color: #000; }
.pg__stop { padding: 6px 16px; background: #000; color: #fff; border: 1px solid #000; border-radius: 0; }
.pg__stop:hover { background: #fff; color: #000; }
.pg__notice { margin-bottom: 8px; padding: 8px 12px; background: #fff8e6; border: 1px solid #f0d48a; color: #6b4e00; font-size: 14px; }

.pg__split { flex: 1; min-height: 0; display: flex; border: 1px solid var(--c-line); }
.pg__term { flex: 0 0 var(--term); min-width: 0; padding: 8px; background: #111; }
.pg__xterm { height: 100%; }
.pg__xterm :deep(.xterm) { height: 100%; }
.pg__xterm :deep(.xterm-viewport) { overflow-x: hidden; }
.pg__xterm :deep(.xterm .scrollbar.horizontal) { display: none !important; }
.pg__term { overflow: hidden; }
.pg__handle { flex: 0 0 6px; cursor: col-resize; background: var(--c-line); transition: background .15s; touch-action: none; }
.pg__handle:hover { background: #999; }
.pg__course { flex: 1; min-width: 0; }

.pg__narrow { margin: auto; max-width: 420px; padding: 24px; text-align: center; border: 1px solid var(--c-line); }
.pg__narrow p { margin-bottom: 8px; }
.pg__narrow a { display: inline-block; margin-top: 8px; text-decoration: underline; color: #000; }
</style>

<style>
/* Pendant le glissement de la poignée : pas de sélection de texte, curseur constant */
body.is-dragging { user-select: none; cursor: col-resize; }
body.is-dragging iframe, body.is-dragging .xterm { pointer-events: none; }
</style>
