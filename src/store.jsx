import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, onSessionProblem, setToken } from '@/lib/api'
import ReauthDialog from '@/components/app/ReauthDialog'
import {
  DEFAULT_SETTINGS,
  DISCIPLINES,
  mapQuota,
  mapReservation,
  mapRules,
  mapSlot,
  mapSpace,
  toInstant,
} from '@/data/domain'

const AppContext = createContext(null)

/**
 * Estado compartido de la sesión contra la API real:
 * token (RN-55) + usuario de GET /me (RN-58), reglas vigentes, espacios activos,
 * reservas propias y cuota. Las pantallas piden el resto bajo demanda.
 */
export function AppProvider({ children }) {
  const [token, setTokenState] = useState(getToken)
  const [me, setMe] = useState(null)
  const [sessionNotice, setSessionNotice] = useState(null) // 'expired' tras un 401
  const [sessionError, setSessionError] = useState(null)
  const [sessionRetry, setSessionRetry] = useState(0)
  const [dataError, setDataError] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [spaces, setSpaces] = useState([])
  const [spacesLoaded, setSpacesLoaded] = useState(false)
  const [reservations, setReservations] = useState([])
  const [quota, setQuota] = useState(null)
  const [draft, setDraft] = useState(null)
  const [reauth, setReauth] = useState(null) // { resolve, reject } mientras se pide el código

  const clearSession = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setMe(null)
    setReservations([])
    setQuota(null)
    setSpaces([])
    setSpacesLoaded(false)
    setDraft(null)
    setSettings(DEFAULT_SETTINGS)
    setSessionError(null)
    setDataError(null)
    setDataLoaded(false)
  }, [])

  // 401 en cualquier petición → la sesión venció (RN-56); PROFILE_INCOMPLETE → pedir nombre (RN-59).
  useEffect(
    () =>
      onSessionProblem((error) => {
        if (error.status === 401) {
          clearSession()
          setSessionNotice('expired')
        } else if (error.code === 'PROFILE_INCOMPLETE') {
          setMe((m) => (m ? { ...m, needsName: true } : m))
        }
      }),
    [clearSession]
  )

  // Restaurar la sesión guardada.
  useEffect(() => {
    if (!token || me) return
    let alive = true
    setSessionError(null)
    api('/me')
      .then((user) => alive && getToken() === token && setMe(user))
      .catch((error) => {
        if (alive && getToken() === token && error.status !== 401) setSessionError(error)
      })
    return () => {
      alive = false
    }
  }, [token, me, sessionRetry])

  const refreshReservations = useCallback(async () => {
    const requestToken = getToken()
    const res = await api('/reservations/mine')
    const list = res.reservations.map(mapReservation)
    if (getToken() === requestToken) setReservations(list)
    return list
  }, [])

  const refreshQuota = useCallback(async () => {
    const requestToken = getToken()
    const q = mapQuota(await api('/quota/me'))
    if (getToken() === requestToken) setQuota(q)
    return q
  }, [])

  const refreshSpaces = useCallback(async () => {
    const requestToken = getToken()
    const res = await api('/spaces')
    const list = res.spaces.map(mapSpace).sort((a, b) => a.name.localeCompare(b.name, 'es'))
    if (getToken() === requestToken) {
      setSpaces(list)
      setSpacesLoaded(true)
    }
    return list
  }, [])

  const refreshRules = useCallback(async () => {
    const requestToken = getToken()
    const r = mapRules(await api('/rules'))
    if (getToken() === requestToken) setSettings(r)
    return r
  }, [])

  const refreshData = useCallback(async () => {
    const requestToken = getToken()
    setDataLoaded(false)
    setDataError(null)
    const results = await Promise.allSettled([
      refreshRules(), refreshSpaces(), refreshReservations(), refreshQuota(),
    ])
    if (getToken() !== requestToken) return
    const failure = results.find((result) => result.status === 'rejected')
    if (failure) setDataError(failure.reason)
    else setDataLoaded(true)
  }, [refreshRules, refreshSpaces, refreshReservations, refreshQuota])

  // Datos base una vez que el perfil está completo.
  const ready = Boolean(me && !me.needsName)
  useEffect(() => {
    if (!ready) return
    refreshData()
  }, [ready, token, refreshData])

  // ---------------------------------------------------------------- acceso (UC01)

  const startSession = async (newToken) => {
    setToken(newToken)
    setTokenState(newToken)
    setSessionNotice(null)
    setSessionError(null)
    setDataError(null)
    setDataLoaded(false)
    setMe(null)
    const user = await api('/me')
    if (getToken() === newToken) setMe(user)
    return user
  }

  const requestCode = (email) => api('/auth/code', { method: 'POST', body: { email }, auth: false })

  const verifyCode = async (email, code) => {
    const res = await api('/auth/verify', { method: 'POST', body: { email, code }, auth: false })
    return startSession(res.token)
  }

  /** Recorrido MVP: sesión simulada en el navegador, sin pasar por el backend. */
  const enterDemo = (role) => startSession(`demo:${role}`)

  const completeProfile = async (name) => {
    const user = await api('/me/profile', { method: 'PUT', body: { name } })
    setMe(user)
    return user
  }

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' }) // RN-61: solo auditoría
    } catch {
      // el token se elimina igual
    }
    clearSession()
  }

  // ------------------------------------------------- reautenticación (D-21)

  /** Ejecuta `fn`; si la API exige reautenticación, pide el código y reintenta una vez. */
  const withReauth = async (fn) => {
    try {
      return await fn()
    } catch (err) {
      if (err?.code !== 'REAUTH_REQUIRED') throw err
      await new Promise((resolve, reject) => setReauth({ resolve, reject }))
      return fn()
    }
  }

  const onReauthenticated = (newToken) => {
    setToken(newToken)
    setTokenState(newToken)
    reauth?.resolve()
    setReauth(null)
  }

  const onReauthCancel = () => {
    const err = new Error('Reautenticación cancelada')
    err.code = 'REAUTH_CANCELLED'
    reauth?.reject(err)
    setReauth(null)
  }

  // ---------------------------------------------------------------- consultas

  const spaceById = (id) => spaces.find((s) => s.id === id)
  const disciplineById = (id) => DISCIPLINES.find((d) => d.id === id)

  /** Franjas de un día (UC02), marcando las que son reservas propias. */
  const fetchAvailability = async (spaceId, date, discipline, signal) => {
    const res = await api(`/spaces/${spaceId}/availability`, { query: { date, discipline }, signal })
    return res.slots.map(mapSlot).map((slot) => {
      if (slot.estado !== 'ocupada') return slot
      const mine = reservations.some(
        (r) =>
          r.spaceId === spaceId &&
          r.date === date &&
          ['confirmada', 'en-uso'].includes(r.estado) &&
          slot.hour >= r.startHour &&
          slot.hour < r.startHour + r.hours
      )
      return mine ? { ...slot, estado: 'mia' } : slot
    })
  }

  const createReservation = async ({ spaceId, date, startHour, hours, equipment = [] }) => {
    const res = await api('/reservations', {
      method: 'POST',
      body: {
        spaceId,
        startAt: toInstant(date, startHour),
        slots: hours,
        ...(equipment.length ? { equipment } : {}),
      },
    })
    const created = mapReservation(res)
    setReservations((prev) => [created, ...prev.filter((r) => r.id !== created.id)])
    refreshQuota().catch(() => {})
    return created
  }

  const isAdmin = me?.role === 'ADMIN'

  const value = {
    // sesión
    token,
    me,
    session: me,
    isAdmin,
    sessionNotice,
    sessionError,
    retrySession: () => setSessionRetry((retry) => retry + 1),
    setSessionNotice,
    requestCode,
    verifyCode,
    enterDemo,
    completeProfile,
    logout,
    withReauth,
    // datos
    dataError,
    dataLoaded,
    refreshData,
    settings,
    refreshRules,
    spaces,
    spacesLoaded,
    refreshSpaces,
    spaceById,
    disciplineById,
    reservations,
    refreshReservations,
    quota,
    refreshQuota,
    fetchAvailability,
    createReservation,
    draft,
    setDraft,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      <ReauthDialog
        email={me?.email}
        onCancel={onReauthCancel}
        onSuccess={onReauthenticated}
        open={Boolean(reauth)}
      />
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
