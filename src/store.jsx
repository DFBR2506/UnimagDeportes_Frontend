import { createContext, useContext, useEffect, useState } from 'react'
import {
  DISCIPLINES,
  INITIAL_SETTINGS,
  INITIAL_SPACES,
  mondayOf,
  addDays,
  seedReservations,
  seededState,
  todayISO,
} from '@/data/mock'

const AppContext = createContext(null)

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const usePersisted = (key, initial) => {
  const [value, setValue] = useState(() => load(key, initial))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // almacenamiento no disponible: el prototipo sigue en memoria
    }
  }, [key, value])
  return [value, setValue]
}

let idSeq = 0
const newId = () => `res-${Date.now()}-${idSeq++}`

export function AppProvider({ children }) {
  const [session, setSession] = usePersisted('ud-session', null)
  const [reservations, setReservations] = usePersisted('ud-reservas', seedReservations())
  const [settings, setSettings] = usePersisted('ud-reglas', INITIAL_SETTINGS)
  const [spaces, setSpaces] = usePersisted('ud-espacios', INITIAL_SPACES)
  const [blocks, setBlocks] = usePersisted('ud-bloqueos', [])
  const [draft, setDraft] = useState(null)

  const spaceById = (id) => spaces.find((s) => s.id === id)
  const disciplineById = (id) => DISCIPLINES.find((d) => d.id === id)

  /** Franjas de un espacio en una fecha, combinando semilla, bloqueos y reservas propias. */
  const slotsFor = (spaceId, iso) => {
    const space = spaceById(spaceId)
    if (!space) return []
    const slots = []
    for (let h = space.open; h < space.close; h++) {
      const block = blocks.find(
        (b) => b.spaceId === spaceId && b.date === iso && h >= b.startHour && h < b.endHour
      )
      const mine = reservations.find(
        (r) =>
          r.spaceId === spaceId &&
          r.date === iso &&
          ['confirmada', 'en-uso'].includes(r.estado) &&
          h >= r.startHour &&
          h < r.startHour + r.hours
      )
      if (block) {
        slots.push({ hour: h, estado: 'bloqueada', motivo: block.motivo })
      } else if (mine) {
        slots.push({ hour: h, estado: 'mia' })
      } else {
        slots.push({ hour: h, ...seededState(spaceId, iso, h) })
      }
    }
    return slots
  }

  /** Horas que cuentan contra la cuota en la semana de `iso` (RN-16/17 + tabla 5.4). */
  const quotaUsed = (iso = todayISO()) => {
    const monday = mondayOf(iso)
    const sunday = addDays(monday, 6)
    return reservations
      .filter((r) => r.date >= monday && r.date <= sunday)
      .filter((r) =>
        ['confirmada', 'en-uso', 'completada', 'cancelada-tardia', 'inasistencia'].includes(r.estado)
      )
      .reduce((acc, r) => acc + r.hours, 0)
  }

  const quota = {
    max: settings.cuotaSemanalHoras,
    used: quotaUsed(),
    get left() {
      return Math.max(0, this.max - this.used)
    },
  }

  const addReservation = ({ spaceId, disciplineId, date, startHour, hours }) => {
    const res = {
      id: newId(),
      spaceId,
      disciplineId,
      date,
      startHour,
      hours,
      estado: 'confirmada',
      nombre: session?.name ?? null,
    }
    setReservations((prev) => [res, ...prev])
    return res
  }

  /** ¿Una cancelación ahora sería tardía? (RN-21/22) */
  const isLateCancel = (res) => {
    const start = new Date(`${res.date}T${String(res.startHour).padStart(2, '0')}:00:00`)
    return start.getTime() - Date.now() < settings.cancelacionTardiaMin * 60 * 1000
  }

  const cancelReservation = (id) => {
    const res = reservations.find((r) => r.id === id)
    if (!res) return null
    const estado = isLateCancel(res) ? 'cancelada-tardia' : 'cancelada-tiempo'
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)))
    return estado
  }

  const checkInReservation = (id) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, estado: 'en-uso' } : r)))
  }

  const addBlock = (block) => {
    setBlocks((prev) => [{ ...block, id: newId() }, ...prev])
    // RN-43: reservas afectadas se cancelan por administrador y no cuentan cuota.
    let affected = 0
    setReservations((prev) =>
      prev.map((r) => {
        const hit =
          r.spaceId === block.spaceId &&
          r.date === block.date &&
          ['confirmada', 'en-uso'].includes(r.estado) &&
          r.startHour < block.endHour &&
          r.startHour + r.hours > block.startHour
        if (hit) affected++
        return hit ? { ...r, estado: 'cancelada-admin' } : r
      })
    )
    return affected
  }

  const saveSpace = (space) => {
    setSpaces((prev) => {
      const exists = prev.some((s) => s.id === space.id)
      return exists ? prev.map((s) => (s.id === space.id ? space : s)) : [...prev, space]
    })
  }

  const login = (email) => setSession({ email, name: null })
  const setName = (name) => setSession((s) => ({ ...s, name }))
  const logout = () => {
    setSession(null)
    setDraft(null)
  }

  const value = {
    session,
    login,
    setName,
    logout,
    isAdmin: Boolean(session?.email?.toLowerCase().startsWith('admin')),
    reservations,
    addReservation,
    cancelReservation,
    checkInReservation,
    isLateCancel,
    quota,
    settings,
    setSettings,
    spaces,
    saveSpace,
    spaceById,
    disciplineById,
    blocks,
    addBlock,
    slotsFor,
    draft,
    setDraft,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
