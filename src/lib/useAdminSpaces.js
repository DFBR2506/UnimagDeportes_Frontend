import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { mapSpace } from '@/data/domain'

/** GET /admin/spaces: todos los espacios, incluidos los que están en mantenimiento (RN-06, RN-09). */
export default function useAdminSpaces() {
  const [spaces, setSpaces] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      const res = await api('/admin/spaces')
      const list = res.spaces.map(mapSpace).sort((a, b) => a.name.localeCompare(b.name, 'es'))
      setSpaces(list)
      setError(null)
      return list
    } catch (err) {
      setError(err)
      return []
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { spaces, loaded, error, reload }
}
