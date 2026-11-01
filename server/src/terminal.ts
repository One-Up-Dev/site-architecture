// Relais navigateur ↔ shell incus.
// Protocole navigateur : binaire = octets du terminal ; texte = JSON de contrôle.
//   navigateur → serveur : {"type":"resize","cols":N,"rows":N}
//   serveur → navigateur : {"type":"warning"|"expired"|"exit"|"error", ...}
import type { WebSocket as ClientSocket } from 'ws'
import WebSocket from 'ws'
import { execInteractive, resize } from './incus.js'
import type { Playground } from './playgrounds.js'

const clamp = (n: unknown, min: number, max: number, def: number) => {
  const v = Math.floor(Number(n))
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def
}

// Connexions ouvertes par playground (pour les avertissements d'expiration)
const sockets = new Map<string, Set<ClientSocket>>()

export function notify(id: string, msg: object) {
  for (const s of sockets.get(id) ?? []) if (s.readyState === WebSocket.OPEN) s.send(JSON.stringify(msg))
}

export function closeAll(id: string, msg: object) {
  for (const s of sockets.get(id) ?? []) {
    if (s.readyState === WebSocket.OPEN) { s.send(JSON.stringify(msg)); s.close(1000) }
  }
  sockets.delete(id)
}

export async function attach(client: ClientSocket, p: Playground, cols0: unknown, rows0: unknown, cwd = '/root') {
  const cols = clamp(cols0, 10, 500, 80)
  const rows = clamp(rows0, 5, 200, 24)
  const set = sockets.get(p.id) ?? new Set()
  set.add(client); sockets.set(p.id, set)

  let session: Awaited<ReturnType<typeof execInteractive>>
  try {
    session = await execInteractive(p.name, ['/bin/bash', '-l'], cols, rows, cwd)
  } catch (e: any) {
    client.send(JSON.stringify({ type: 'error', message: 'Impossible d’ouvrir le terminal.' }))
    client.close(1011)
    set.delete(client)
    return
  }
  const { data, control } = session

  data.on('message', (buf: Buffer, isBinary: boolean) => {
    // incus envoie un message texte vide quand le processus se termine
    if (!isBinary && buf.length === 0) return
    if (client.readyState === WebSocket.OPEN) client.send(buf, { binary: true })
  })
  const end = () => {
    set.delete(client)
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'exit' }))
      client.close(1000)
    }
    for (const ws of [data, control]) if (ws.readyState === WebSocket.OPEN) ws.close()
  }
  data.on('close', end)
  data.on('error', end)

  client.on('message', (buf: Buffer, isBinary: boolean) => {
    if (isBinary) { if (data.readyState === WebSocket.OPEN) data.send(buf, { binary: true }); return }
    try {
      const m = JSON.parse(buf.toString())
      if (m?.type === 'resize') resize(control, clamp(m.cols, 10, 500, cols), clamp(m.rows, 5, 200, rows))
      else if (m?.type === 'input' && typeof m.data === 'string' && data.readyState === WebSocket.OPEN) data.send(Buffer.from(m.data), { binary: true })
    } catch { /* message ignoré */ }
  })
  client.on('close', () => {
    set.delete(client)
    for (const ws of [data, control]) if (ws.readyState === WebSocket.OPEN) ws.close()
  })
}
