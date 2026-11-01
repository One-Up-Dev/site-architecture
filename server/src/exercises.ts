// Catalogue des exercices lançables, lu depuis exercises/<slug>/exercise.json
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { z } from 'zod'
import { images } from './config.js'

const dir = resolve(process.env.EXERCISES_DIR ?? join(process.cwd(), '..', 'exercises'))

const Schema = z.object({
  image: z.enum(images.map(i => i.id) as [string, ...string[]]),
  setup: z.string().regex(/^[\w.-]+$/).optional(),
  cwd: z.string().regex(/^\/[\w./-]*$/).default('/root'),
})

export type Exercise = { slug: string; image: string; setupScript: string | null; cwd: string }

function load(): Map<string, Exercise> {
  const map = new Map<string, Exercise>()
  if (!existsSync(dir)) return map
  for (const slug of readdirSync(dir)) {
    if (!/^[a-z0-9-]+$/.test(slug)) continue
    const file = join(dir, slug, 'exercise.json')
    if (!existsSync(file)) continue
    const def = Schema.parse(JSON.parse(readFileSync(file, 'utf8')))
    let setupScript: string | null = null
    if (def.setup) {
      const p = join(dir, slug, def.setup)
      if (!existsSync(p)) throw new Error(`${slug} : script de setup introuvable (${def.setup})`)
      setupScript = readFileSync(p, 'utf8')
    }
    map.set(slug, { slug, image: def.image, setupScript, cwd: def.cwd })
  }
  return map
}

const exercises = load()
export const exercisesDir = dir
export const listExercises = () => [...exercises.keys()]
export const getExercise = (slug: string) => exercises.get(slug)
