import { randomBytes } from 'node:crypto'

const int = (name: string, def: number) => {
  const v = Number(process.env[name] ?? def)
  if (!Number.isFinite(v) || v <= 0) throw new Error(`${name} invalide`)
  return v
}

if (process.env.NODE_ENV === 'production' && !process.env.COOKIE_SECRET) {
  throw new Error('COOKIE_SECRET est obligatoire en production (openssl rand -hex 32)')
}

export const config = {
  port: int('PORT', 3000),
  host: process.env.HOST ?? '127.0.0.1',
  incusSocket: process.env.INCUS_SOCKET ?? '/var/lib/incus/unix.socket',
  profile: process.env.PLAYGROUND_PROFILE ?? 'playground',
  maxPlaygrounds: int('MAX_PLAYGROUNDS', 2),
  ttlMinutes: int('TTL_MIN', 30),
  warnBeforeMinutes: int('WARN_BEFORE_MIN', 2),
  createPerHour: int('CREATE_PER_HOUR', 5),
  reaperIntervalMs: int('REAPER_INTERVAL_MS', 30_000),
  // En prod, COOKIE_SECRET doit être fixé (sinon les sessions sautent à chaque redémarrage)
  cookieSecret: process.env.COOKIE_SECRET ?? randomBytes(32).toString('hex'),
  secureCookie: process.env.SECURE_COOKIE === '1',
  // Ne faire confiance à X-Forwarded-For que s'il vient de Caddy (même machine)
  trustProxy: process.env.TRUST_PROXY ?? '127.0.0.1',
}

/** Images proposées aux visiteurs (alias incus → présentation). */
export const images = [
  { id: 'pg-ubuntu', name: 'Ubuntu 24.04', description: 'Bash, git, vim, nano, python3, jq, htop…' },
  { id: 'pg-alpine', name: 'Alpine 3.24', description: 'Image minimale et très rapide à démarrer.' },
] as const

export type ImageId = (typeof images)[number]['id']
export const NAME_PREFIX = 'pg-'
