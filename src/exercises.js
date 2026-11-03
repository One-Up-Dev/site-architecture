// Cours des exercices : exercises/<id>/cours.md (id = linux/commandes/ls), chargés à la demande
import { marked } from 'marked'

const courses = import.meta.glob('/exercises/**/cours.md', { query: '?raw', import: 'default' })

/** HTML du cours d'un exercice, ou null s'il n'existe pas. */
export async function loadCourse(id) {
  const load = courses[`/exercises/${id}/cours.md`]
  if (!load) return null
  // Contenu rédigé par l'équipe et versionné dans le dépôt (jamais saisi par un visiteur)
  return marked.parse(await load())
}
