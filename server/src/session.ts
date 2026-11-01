// Session anonyme : un identifiant aléatoire dans un cookie signé.
import { randomUUID } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from './config.js'

const COOKIE = 'pg_sid'

export function readSession(req: FastifyRequest): string | null {
  const raw = req.cookies[COOKIE]
  if (!raw) return null
  const u = req.unsignCookie(raw)
  return u.valid && u.value ? u.value : null
}

export function ensureSession(req: FastifyRequest, reply: FastifyReply): string {
  const existing = readSession(req)
  if (existing) return existing
  const sid = randomUUID()
  reply.setCookie(COOKIE, sid, {
    path: '/', httpOnly: true, sameSite: 'lax', signed: true,
    secure: config.secureCookie, maxAge: 60 * 60 * 24 * 7,
  })
  return sid
}
