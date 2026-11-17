import { useCallback, useEffect, useReducer, useState } from 'react'
import { api } from '@/lib/api'
import { normalizePanorama } from '@/lib/validatePanorama'
import { useApp } from '@/store'

const invalidationListeners = new Set()
const IDLE = { url: null, status: 'idle', error: null }
const LOADING = { url: null, status: 'loading', error: null }

export function invalidateSpacePanorama(id) {
  invalidationListeners.forEach((listener) => listener(id))
}

/** Retiene solo el panorama montado: no acumula imágenes grandes en una caché global. */
export default function useSpacePanorama(id, version = 0) {
  const { token } = useApp()
  const [attempt, incrementAttempt] = useReducer((value) => value + 1, 0)
  const retry = useCallback(() => incrementAttempt(), [])
  const [state, setState] = useState({ key: null, ...IDLE })
  const key = id && token ? `${token}:${id}:${version}:${attempt}` : null

  useEffect(() => {
    const listener = (changedId) => {
      if (changedId === id) retry()
    }
    invalidationListeners.add(listener)
    return () => invalidationListeners.delete(listener)
  }, [id, retry])

  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    let url = null

    ;(async () => {
      try {
        const blob = await api(`/spaces/${id}/images/PANORAMA`, { as: 'blob', signal: controller.signal })
        const normalized = await normalizePanorama(blob, { signal: controller.signal })
        controller.signal.throwIfAborted()
        url = URL.createObjectURL(normalized)
        setState({ key, url, status: 'ready', error: null })
      } catch (error) {
        if (controller.signal.aborted) return
        const unavailable = error.status === 404 || error.code === 'IMAGE_NOT_AVAILABLE'
        setState({ key, url: null, status: unavailable ? 'unavailable' : 'error', error })
      }
    })()

    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [id, key])

  const resource = !key ? IDLE : state.key === key ? state : LOADING
  return { url: resource.url, status: resource.status, error: resource.error, retry }
}
