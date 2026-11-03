// Catalogue des exercices lançables, lu depuis exercises/<id>/exercise.json
// L'identifiant est le chemin du dossier : linux/commandes/ls, git/conflits…
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { z } from 'zod'
import { images } from './config.js'

/** <topic>/[<category>/]<slug> */
export const EXERCISE_ID = /^[a-z0-9-]+(\/[a-z0-9-]+){1,2}$/

const dir = resolve(process.env.EXERCISES_DIR ?? join(process.cwd(), '..', 'exercises'))

const Schema = z.object({
  image: z.enum(images.map(i => i.id) as [string, ...string[]]),
  setup: z.string().regex(/^[\w.-]+$/).optional(),
  cwd: z.string().regex(/^\/[\w./-]*$/).default('/root'),
})

export type Exercise = { id: string; image: string; setupScript: string | null; cwd: string }

/** Dossiers (relatifs à `dir`) qui contiennent un exercise.json, sur 3 niveaux au plus. */
function findExerciseDirs(base: string, depth = 0): string[] {
  if (depth > 3) return []
  const found: string[] = []
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[a-z0-9-]+$/.test(entry.name)) continue
    const sub = join(base, entry.name)
    if (existsSync(join(sub, 'exercise.json'))) found.push(relative(dir, sub).split(sep).join('/'))
    else found.push(...findExerciseDirs(sub, depth + 1))
  }
  return found
}

function load(): Map<string, Exercise> {
  const map = new Map<string, Exercise>()
  if (!existsSync(dir)) return map
  for (const id of findExerciseDirs(dir)) {
    if (!EXERCISE_ID.test(id)) throw new Error(`${id} : chemin d'exercice invalide (attendu <sujet>/[<rubrique>/]<nom>)`)
    const file = join(dir, id, 'exercise.json')
    const def = Schema.parse(JSON.parse(readFileSync(file, 'utf8')))
    let setupScript: string | null = null
    if (def.setup) {
      const p = join(dir, id, def.setup)
      if (!existsSync(p)) throw new Error(`${id} : script de setup introuvable (${def.setup})`)
      setupScript = readFileSync(p, 'utf8')
    }
    map.set(id, { id, image: def.image, setupScript, cwd: def.cwd })
  }
  return map
}

const exercises = load()
export const exercisesDir = dir
export const listExercises = () => [...exercises.keys()]
export const getExercise = (slug: string) => exercises.get(slug)
