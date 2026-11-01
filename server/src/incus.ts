// Client minimal pour l'API REST d'incus via son socket unix.
import { Agent, request } from 'undici'
import WebSocket from 'ws'
import { config } from './config.js'

const agent = new Agent({ connect: { socketPath: config.incusSocket } })

export class IncusError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
}

type IncusResponse<T> = {
  type: 'sync' | 'async' | 'error'
  status_code: number
  error?: string
  error_code?: number
  metadata: T
  operation?: string
}

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<IncusResponse<T>> {
  const res = await request(`http://incus${path}`, {
    dispatcher: agent,
    method: method as 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = (await res.body.json()) as IncusResponse<T>
  if (json.type === 'error') throw new IncusError(json.error ?? 'erreur incus', json.error_code ?? res.statusCode)
  return json
}

export type Operation = {
  id: string
  status: string
  status_code: number
  err: string
  metadata: Record<string, any> | null
}

/** Attend la fin d'une opération asynchrone ; lève une erreur si elle échoue. */
export async function wait(opPath: string, timeoutS = 120): Promise<Operation> {
  const r = await api<Operation>('GET', `${opPath}/wait?timeout=${timeoutS}`)
  if (r.metadata.status_code >= 400) throw new IncusError(r.metadata.err || 'opération échouée', r.metadata.status_code)
  return r.metadata
}

export type Instance = {
  name: string
  status: string
  config: Record<string, string>
  created_at: string
}

export const listInstances = async () =>
  (await api<Instance[]>('GET', '/1.0/instances?recursion=1')).metadata

export async function createInstance(name: string, image: string, profile: string, userConfig: Record<string, string>) {
  const r = await api('POST', '/1.0/instances', {
    name,
    type: 'container',
    ephemeral: true,
    start: true,
    profiles: [profile],
    config: userConfig,
    source: { type: 'image', alias: image },
  })
  await wait(r.operation!, 120)
}

export async function stopInstance(name: string) {
  const r = await api('PUT', `/1.0/instances/${encodeURIComponent(name)}/state`, { action: 'stop', force: true, timeout: 10 })
  await wait(r.operation!, 30)
}

export type ExecSession = { data: WebSocket; control: WebSocket; opPath: string }

/** Lance un shell interactif et renvoie ses WebSockets (données + contrôle). */
export async function execInteractive(name: string, command: string[], cols: number, rows: number): Promise<ExecSession> {
  const r = await api<{ id: string; metadata: { fds: Record<string, string> } }>(
    'POST', `/1.0/instances/${encodeURIComponent(name)}/exec`, {
      command,
      cwd: '/root',
      environment: { TERM: 'xterm-256color', HOME: '/root', USER: 'root', LANG: 'C.UTF-8' },
      interactive: true,
      'wait-for-websocket': true,
      width: cols,
      height: rows,
    })
  const opPath = r.operation!
  const fds = r.metadata.metadata.fds
  const open = (secret: string) => new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(`ws+unix://${config.incusSocket}:${opPath}/websocket?secret=${secret}`)
    ws.once('open', () => resolve(ws))
    ws.once('error', reject)
  })
  // L'ordre importe : incus attend la connexion "control" avant "0"
  const control = await open(fds.control)
  const data = await open(fds['0'])
  return { data, control, opPath }
}

export function resize(control: WebSocket, cols: number, rows: number) {
  if (control.readyState !== WebSocket.OPEN) return
  control.send(JSON.stringify({ command: 'window-resize', args: { width: String(cols), height: String(rows) } }))
}
