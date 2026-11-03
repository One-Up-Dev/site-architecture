<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'
import LevelBadge from '../components/LevelBadge.vue'
import { createPlayground, getCurrent, getExercises } from '../api'
import { breadcrumb, exerciseId } from '../data/site'

// Résolu par CatalogNodeView depuis /catalogue/<topic>/[<category>/]<slug>
const props = defineProps({
  topic: { type: Object, required: true },
  category: { type: Object, default: null },
  exercise: { type: Object, required: true },
})
const router = useRouter()
const id = computed(() => exerciseId(props.exercise))
const current = ref(null)
const launching = ref(false)
const error = ref('')
const available = ref(null)   // null = en cours de vérification

onMounted(async () => {
  const [cur, list] = await Promise.all([getCurrent().catch(() => null), getExercises().catch(() => [])])
  current.value = cur
  available.value = list.includes(id.value)
})

async function launch() {
  error.value = ''
  launching.value = true
  try {
    const p = await createPlayground(id.value)
    router.push({ name: 'playground', params: { id: p.id }, query: { ex: id.value } })
  } catch (e) {
    error.value = e.message
    if (e.code === 'already_active') current.value = await getCurrent().catch(() => null)
  } finally { launching.value = false }
}
</script>

<template>
  <main class="shell page">
      <AppBreadcrumb :items="breadcrumb(topic, category, exercise)" />
      <h1 class="page__title">{{ exercise.title }}</h1>
      <ul class="page__meta">
        <li>{{ category ? `${topic.name} › ${category.name}` : topic.name }}</li><li>{{ exercise.durationMin }} min</li><li class="page__lvl"><LevelBadge :level="exercise.level" /></li>
      </ul>
      <p class="page__intro">{{ exercise.summary }}</p>
      <p class="page__note">L’environnement s’ouvre dans votre navigateur : 30 minutes, sans accès Internet, effacé à la fin.</p>

      <div v-if="current" class="page__box">
        Vous avez déjà un environnement actif.
        <RouterLink :to="{ name: 'playground', params: { id: current.id } }">Le rouvrir →</RouterLink>
      </div>
      <p v-if="error && !current" class="page__box page__box--error" role="alert">{{ error }}</p>

      <button v-if="available !== false" type="button" class="page__launch" :disabled="launching || !!current || available === null" @click="launch">
        {{ launching ? 'Préparation de l’environnement…' : 'Lancer l’exercice' }}
      </button>
      <button v-else type="button" class="page__launch" disabled>Bientôt disponible</button>
  </main>
</template>

<style scoped>
.page { padding-top: 96px; max-width: 760px; }
.page__title { font-size: 28px; color: var(--c-title); }
.page__meta { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 12px 0 0; padding: 0; }
.page__meta li { padding: 2px 10px; border: 1px solid var(--c-line); font-size: 13px; }
.page__meta li.page__lvl { padding: 0; border: 0; display: flex; }
.page__lvl :deep(.level) { padding: 2px 10px; font-size: 13px; line-height: inherit; }
.page__intro { margin-top: 20px; font-size: 17px; color: var(--c-title); }
.page__note { margin-top: 8px; font-size: 14px; color: var(--c-muted); }
.page__box { margin-top: 24px; padding: 12px 16px; border: 1px solid var(--c-line); }
.page__box a { margin-left: 8px; text-decoration: underline; color: #000; }
.page__box--error { border-color: #e5a0a0; background: #fdf3f3; color: #8a1f1f; }
.page__launch {
  margin-top: 28px; padding: 12px 32px; background: #000; color: #fff; border: 1px solid #000; border-radius: 0;
  font-size: 16px; transition: background .15s, color .15s;
}
.page__launch:hover:not(:disabled) { background: #fff; color: #000; }
.page__launch:disabled { opacity: .45; cursor: not-allowed; }
</style>
