import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'
import { z } from 'zod'
import { config, images } from './config.js'
import { ensureSession, readSession } from './session.js'
import {
  PlaygroundError, createPlayground, destroy, findOwned, listPlaygrounds, publicView,
} from './playgrounds.js'
import { attach, closeAll, notify } from './terminal.js'

// Playgrounds déjà avertis par le reaper (avant la fin de session)
const warned = new Set<string>()

const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' }, trustProxy: config.trustProxy })
await app.register(cookie, { secret: config.cookieSecret })
await app.register(rateLimit, { global: false })
await app.register(websocket, { options: { maxPayload: 64 * 1024 } })

app.setErrorHandler((err, req, reply) => {
  if (err instanceof PlaygroundError) return reply.code(err.status).send({ error: err.code, message: err.message })
  if ((err as any).statusCode === 429) return reply.code(429).send({ error: 'rate_limited', message: 'Trop de lancements. Réessayez plus tard.' })
  req.log.error(err)
  return reply.code(500).send({ error: 'internal', message: 'Erreur interne.' })
})

app.get('/api/health', async () => ({ ok: true }))

app.get('/api/images', async () => images)

app.get('/api/playgrounds/current', async (req, reply) => {
  const sid = ensureSession(req, reply)
  const p = (await listPlaygrounds()).find(x => x.session === sid)
  if (!p) return reply.code(404).send({ error: 'none', message: 'Aucun playground actif.' })
  return publicView(p)
})

const CreateBody = z.object({ image: z.enum(images.map(i => i.id) as [string, ...string[]]) })

app.post('/api/playgrounds', {
  config: { rateLimit: { max: config.createPerHour, timeWindow: '1 hour' } },
}, async (req, reply) => {
  const sid = ensureSession(req, reply)
  const body = CreateBody.safeParse(req.body)
  if (!body.success) return reply.code(400).send({ error: 'bad_request', message: 'Image inconnue.' })
  const p = await createPlayground(body.data.image as any, sid, req.ip)
  req.log.info({ id: p.id, image: p.image, ip: req.ip }, 'playground créé')
  return reply.code(201).send(publicView(p))
})

app.delete<{ Params: { id: string } }>('/api/playgrounds/:id', async (req, reply) => {
  const sid = readSession(req)
  const p = sid ? await findOwned(req.params.id, sid) : undefined
  if (!p) return reply.code(404).send({ error: 'not_found', message: 'Playground introuvable.' })
  closeAll(p.id, { type: 'expired', reason: 'stopped' })
  await destroy(p)
  req.log.info({ id: p.id }, 'playground arrêté')
  return reply.code(204).send()
})

app.get<{ Params: { id: string }; Querystring: { cols?: string; rows?: string } }>(
  '/ws/playgrounds/:id', { websocket: true }, async (socket, req) => {
    const sid = readSession(req)
    const p = sid ? await findOwned(req.params.id, sid) : undefined
    if (!p) {
      socket.send(JSON.stringify({ type: 'error', message: 'Playground introuvable ou expiré.' }))
      return socket.close(4404)
    }
    await attach(socket, p, req.query.cols, req.query.rows)
    // Connexion après l'avertissement diffusé par le reaper : le renvoyer à ce terminal
    const left = new Date(p.expiresAt).getTime() - Date.now()
    if (warned.has(p.id) && left > 0 && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: 'warning', secondsLeft: Math.round(left / 1000) }))
    }
  })

// ── Reaper : expiration, avertissements, nettoyage ─────────────
async function reap() {
  try {
    const now = Date.now()
    for (const p of await listPlaygrounds()) {
      const left = new Date(p.expiresAt).getTime() - now
      if (left <= 0) {
        closeAll(p.id, { type: 'expired', reason: 'timeout' })
        await destroy(p).catch(e => app.log.warn(e, 'arrêt impossible'))
        warned.delete(p.id)
        app.log.info({ id: p.id }, 'playground expiré')
      } else if (left <= config.warnBeforeMinutes * 60_000 && !warned.has(p.id)) {
        warned.add(p.id)
        notify(p.id, { type: 'warning', secondsLeft: Math.round(left / 1000) })
      }
    }
  } catch (e) { app.log.error(e, 'reaper') }
}

await app.listen({ port: config.port, host: config.host })
const existing = await listPlaygrounds().catch(() => [])
app.log.info({ existing: existing.length, max: config.maxPlaygrounds, ttlMin: config.ttlMinutes }, 'playgrounds retrouvés au démarrage')
await reap()
const timer = setInterval(reap, config.reaperIntervalMs)

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => { clearInterval(timer); await app.close(); process.exit(0) })
}
