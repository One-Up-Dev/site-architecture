// Cycle de vie des playgrounds. Incus est la source de vérité (métadonnées dans user.pg.*).
import { randomUUID } from 'node:crypto'
import { config, NAME_PREFIX, type ImageId } from './config.js'
import { createInstance, listInstances, stopInstance, type Instance } from './incus.js'

export type Playground = {
  id: string
  name: string
  image: string
  session: string
  ip: string
  createdAt: string
  expiresAt: string
  status: string
}

export class PlaygroundError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) { super(message) }
}

const toPlayground = (i: Instance): Playground | null => {
  if (!i.name.startsWith(NAME_PREFIX) || !i.config['user.pg.session']) return null
  return {
    id: i.name.slice(NAME_PREFIX.length),
    name: i.name,
    image: i.config['user.pg.image'] ?? '',
    session: i.config['user.pg.session'],
    ip: i.config['user.pg.ip'] ?? '',
    createdAt: i.config['user.pg.created_at'] ?? i.created_at,
    expiresAt: i.config['user.pg.expires_at'] ?? i.created_at,
    status: i.status,
  }
}

export async function listPlaygrounds(): Promise<Playground[]> {
  return (await listInstances()).map(toPlayground).filter((p): p is Playground => p !== null)
}

export const publicView = (p: Playground) => ({
  id: p.id, image: p.image, createdAt: p.createdAt, expiresAt: p.expiresAt, status: p.status,
})

// Créations en cours (pas encore visibles dans incus) : évite de dépasser la capacité en cas de clics simultanés
let pending = 0
const pendingSessions = new Set<string>()

export async function createPlayground(image: ImageId, session: string, ip: string): Promise<Playground> {
  if (pendingSessions.has(session)) throw new PlaygroundError('Un playground est déjà en cours de création.', 409, 'pending')
  const all = await listPlaygrounds()
  if (all.some(p => p.session === session)) {
    throw new PlaygroundError('Vous avez déjà un bac à sable actif.', 409, 'already_active')
  }
  if (all.some(p => p.ip === ip)) {
    throw new PlaygroundError('Un bac à sable est déjà actif depuis votre connexion. Fermez-le ou attendez qu’il expire.', 409, 'ip_busy')
  }
  if (all.length + pending >= config.maxPlaygrounds) {
    throw new PlaygroundError('Tous les playgrounds sont occupés. Réessayez dans quelques minutes.', 503, 'full')
  }

  pending++
  pendingSessions.add(session)
  try {
    const id = randomUUID().replaceAll('-', '').slice(0, 12)
    const now = new Date()
    const expires = new Date(now.getTime() + config.ttlMinutes * 60_000)
    const meta = {
      'user.pg.session': session,
      'user.pg.image': image,
      'user.pg.ip': ip,
      'user.pg.created_at': now.toISOString(),
      'user.pg.expires_at': expires.toISOString(),
    }
    await createInstance(NAME_PREFIX + id, image, config.profile, meta)
    return { id, name: NAME_PREFIX + id, image, session, ip, createdAt: meta['user.pg.created_at'], expiresAt: meta['user.pg.expires_at'], status: 'Running' }
  } finally {
    pending--
    pendingSessions.delete(session)
  }
}

export async function findOwned(id: string, session: string): Promise<Playground | undefined> {
  if (!/^[a-f0-9]{12}$/.test(id)) return undefined
  return (await listPlaygrounds()).find(p => p.id === id && p.session === session)
}

/** Arrêt forcé ; le container est éphémère, donc supprimé par incus. */
export async function destroy(p: Playground) {
  try { await stopInstance(p.name) } catch (e: any) {
    if (e?.status !== 404) throw e
  }
}
