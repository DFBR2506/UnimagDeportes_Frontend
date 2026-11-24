import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

// Las imágenes de los espacios (PREVIEW y PANORAMA) exigen Bearer, así que no
// pueden ir directo en <img src>: se descargan como blob y se cachean por sesión.
const cache = new Map() // `${id}:${kind}` → Promise<objectURL>

const load = (id, kind) => {
  const key = `${id}:${kind}`
  if (!cache.has(key)) {
    const p = api(`/spaces/${id}/images/${kind}`, { as: 'blob' }).then((blob) => URL.createObjectURL(blob))
    p.catch(() => cache.delete(key))
    cache.set(key, p)
  }
  return cache.get(key)
}

/** Invalida la caché tras reemplazar una imagen (PUT /admin/spaces/{id}/images/{kind}). */
export const invalidateSpaceImage = (id, kind) => {
  const key = `${id}:${kind}`
  cache.get(key)?.then((url) => URL.revokeObjectURL(url)).catch(() => {})
  cache.delete(key)
}

/** URL local de la imagen del espacio, o null mientras carga o si falla. */
export default function useSpaceImage(id, kind = 'PREVIEW', version = 0) {
  const [state, setState] = useState({ key: null, url: null })
  const key = id ? `${id}:${kind}:${version}` : null

  useEffect(() => {
    if (!id) return
    let alive = true
    load(id, kind)
      .then((url) => alive && setState({ key, url }))
      .catch(() => alive && setState({ key, url: null }))
    return () => {
      alive = false
    }
  }, [id, kind, key])

  return state.key === key ? state.url : null
}
