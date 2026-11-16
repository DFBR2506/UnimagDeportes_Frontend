// Cliente HTTP de la API Unimag Deportes (Spring Boot).
// Contratos: Unimag-Deportes/docs/techincal-plan/contracts/README.md

import { ApiError } from '@/lib/apiError'
import { isDemoToken, mockRequest } from '@/lib/mockApi'

export { ApiError }

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'ud-token'

// RN-55: el token viaja solo en Authorization; se guarda en el navegador, nunca en cookies ni URL.
let token = null
try {
  token = localStorage.getItem(TOKEN_KEY)
} catch {
  // almacenamiento no disponible: la sesión vive solo en memoria
}

export const getToken = () => token

export const setToken = (value) => {
  token = value
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignorado
  }
}

// Avisos globales de sesión (401 → volver a iniciar sesión, PROFILE_INCOMPLETE → pedir nombre).
const listeners = new Set()
export const onSessionProblem = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const emit = (error) => listeners.forEach((fn) => fn(error))

const buildUrl = (path, query) => {
  const url = `${BASE}${path}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, v)
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

const parseError = async (res) => {
  let body = {}
  try {
    body = await res.json()
  } catch {
    // respuesta sin JSON
  }
  return new ApiError(res.status, body)
}

/**
 * Petición a la API.
 * @param {string} path  ruta relativa a la raíz de la API (p. ej. `/spaces`)
 * @param {object} opts  { method, body (JSON), form (FormData), query, as: 'json'|'text'|'blob', auth, signal }
 */
export async function api(path, { method = 'GET', body, form, query, as = 'json', auth = true, signal } = {}) {
  // Recorrido MVP: la sesión de demostración se atiende en el navegador, sin backend.
  if (isDemoToken(token)) return mockRequest(token, path, { method, body, form, query, as })

  const headers = {}
  if (auth && token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(0, { message: 'No hay conexión con el servidor. Intenta de nuevo.' })
  }

  if (!res.ok) {
    const error = await parseError(res)
    if (auth && (res.status === 401 || error.code === 'PROFILE_INCOMPLETE')) emit(error)
    throw error
  }
  if (res.status === 204) return null
  if (as === 'text') return res.text()
  if (as === 'blob') return res.blob()
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

/**
 * Server-Sent Events con Authorization (EventSource no admite encabezados y el
 * token nunca va en la URL). Llama a `onEvent(name, data)` por cada evento.
 * Devuelve una función para cerrar el flujo.
 */
export function openEventStream(path, onEvent) {
  if (isDemoToken(token)) return () => {} // sin backend no hay flujo en vivo
  const controller = new AbortController()
  ;(async () => {
    while (!controller.signal.aborted) {
      try {
        const res = await fetch(buildUrl(path), {
          headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!res.ok || !res.body) {
          if (res.status === 401) emit(await parseError(res))
          return
        }
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
        let buffer = ''
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += value
          let sep
          while ((sep = buffer.search(/\r?\n\r?\n/)) >= 0) {
            const chunk = buffer.slice(0, sep)
            buffer = buffer.slice(buffer.slice(sep).match(/^\r?\n\r?\n/)[0].length + sep)
            let name = 'message'
            const data = []
            for (const line of chunk.split(/\r?\n/)) {
              if (line.startsWith('event:')) name = line.slice(6).trim()
              else if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
            }
            if (data.length) {
              let parsed = data.join('\n')
              try {
                parsed = JSON.parse(parsed)
              } catch {
                // texto plano
              }
              onEvent(name, parsed)
            }
          }
        }
      } catch (err) {
        if (err?.name === 'AbortError') return
      }
      // reconexión suave si el servidor cerró el flujo
      await new Promise((r) => setTimeout(r, 5000))
    }
  })()
  return () => controller.abort()
}

/** Mensaje en español para mostrar al usuario a partir de un error de la API. */
export const errorMessage = (err, fallback = 'Ocurrió un error inesperado.') =>
  err instanceof ApiError ? err.message || fallback : fallback
