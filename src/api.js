// Appels à l'API des playgrounds (même origine : cookie de session envoyé automatiquement)
async function call(method, path, body) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Erreur ${res.status}`)
    err.status = res.status
    err.code = data.error
    throw err
  }
  return data
}

export const getExercises = () => call('GET', '/api/exercises')
export const getCurrent = () => call('GET', '/api/playgrounds/current').catch(e => { if (e.status === 404) return null; throw e })
export const createPlayground = exercise => call('POST', '/api/playgrounds', { exercise })
export const stopPlayground = id => call('DELETE', `/api/playgrounds/${id}`)

export function terminalUrl(id, cols, rows) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${location.host}/ws/playgrounds/${id}?cols=${cols}&rows=${rows}`
}
