import { useEffect, useState } from 'react'
import { openEventStream } from '@/lib/api'
import { onAvailabilityChanged } from '@/lib/availabilityEvents'
import { useApp } from '@/store'

/** Mutaciones locales, eventos remotos y reconexiones invalidan las consultas visibles. */
export default function useAvailabilityRevision(spaceId) {
  const { token } = useApp()
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!spaceId || !token) return
    const refresh = () => setRevision((value) => value + 1)
    const unsubscribe = onAvailabilityChanged((changedId) => {
      if (changedId === spaceId) refresh()
    })
    const close = openEventStream(
      `/spaces/${spaceId}/availability/stream`,
      (name) => {
        if (name === 'availability-changed') refresh()
      },
      // El servidor no reproduce eventos perdidos: consultar al (re)conectar.
      { onConnect: refresh }
    )
    return () => {
      unsubscribe()
      close()
    }
  }, [spaceId, token])

  return revision
}
