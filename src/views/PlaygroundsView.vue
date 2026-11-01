<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPlayground, getCurrent, getImages } from '../api'

const router = useRouter()
const images = ref([])
const current = ref(null)
const launching = ref('')
const error = ref('')

onMounted(async () => {
  try {
    ;[images.value, current.value] = await Promise.all([getImages(), getCurrent()])
  } catch (e) { error.value = e.message }
})

async function launch(id) {
  error.value = ''
  launching.value = id
  try {
    const p = await createPlayground(id)
    router.push({ name: 'playground', params: { id: p.id } })
  } catch (e) {
    error.value = e.message
    if (e.code === 'already_active') current.value = await getCurrent().catch(() => null)
  } finally { launching.value = '' }
}
</script>

<template>
  <main class="shell pgs">
    <h1 class="pgs__title">Bacs à sable</h1>
    <p class="pgs__intro">Lancez un environnement Linux vierge dans votre navigateur. Session de 30 minutes, sans accès Internet, effacée à la fin.</p>

    <div v-if="current" class="pgs__current">
      Vous avez déjà un bac à sable actif.
      <RouterLink :to="{ name: 'playground', params: { id: current.id } }">Le rouvrir →</RouterLink>
    </div>
    <p v-if="error" class="pgs__error" role="alert">{{ error }}</p>

    <div class="pgs__grid">
      <article v-for="img in images" :key="img.id" class="pgs__card">
        <h2>{{ img.name }}</h2>
        <p>{{ img.description }}</p>
        <button type="button" :disabled="!!launching || !!current" @click="launch(img.id)">
          {{ launching === img.id ? 'Démarrage…' : 'Lancer' }}
        </button>
      </article>
    </div>
  </main>
</template>

<style scoped>
.pgs { padding-top: 96px; }
.pgs__title { font-size: 28px; color: var(--c-title); }
.pgs__intro { margin-top: 8px; max-width: 60ch; }
.pgs__current, .pgs__error { margin-top: 24px; padding: 12px 16px; border: 1px solid var(--c-line); }
.pgs__current a { margin-left: 8px; text-decoration: underline; color: #000; }
.pgs__error { border-color: #e5a0a0; background: #fdf3f3; color: #8a1f1f; }
.pgs__grid { display: grid; gap: var(--gap); margin-top: 24px; grid-template-columns: repeat(auto-fill, var(--card)); }
.pgs__card {
  display: flex; flex-direction: column; aspect-ratio: 1 / 1; padding: 20px;
  background: var(--c-ink-soft); color: #ccc; box-shadow: var(--shadow-card);
}
.pgs__card h2 { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.pgs__card p { font-size: 12px; line-height: 1.5; }
.pgs__card button {
  margin-top: auto; padding: 8px; background: #fff; color: #000; border: 1px solid #fff; border-radius: 0;
  transition: background .15s, color .15s;
}
.pgs__card button:hover:not(:disabled) { background: transparent; color: #fff; }
.pgs__card button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 600px) {
  .pgs__grid { grid-template-columns: 1fr; }
  .pgs__card { aspect-ratio: auto; min-height: 180px; }
}
</style>
