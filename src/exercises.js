// Cours des exercices : exercises/<slug>/cours.md, chargés à la demande
import { marked } from 'marked'

const courses = import.meta.glob('/exercises/*/cours.md', { query: '?raw', import: 'default' })

/** HTML du cours d'un exercice, ou null s'il n'existe pas. */
export async function loadCourse(slug) {
  const load = courses[`/exercises/${slug}/cours.md`]
  if (!load) return null
  // Contenu rédigé par l'équipe et versionné dans le dépôt (jamais saisi par un visiteur)
  return marked.parse(await load())
}
