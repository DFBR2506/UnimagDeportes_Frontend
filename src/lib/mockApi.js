// Backend simulado para el recorrido MVP ("Entrar como estudiante/administrador").
// Responde en el navegador con las mismas rutas y formas que la API real
// (Unimag-Deportes/docs/techincal-plan/contracts), así las pantallas no cambian.
// El estado persiste en localStorage; la ocupación de franjas es determinista
// por (espacio, fecha, hora), como en el prototipo original.

import { ApiError } from '@/lib/apiError'
import { DEMO_CATALOG_VERSION, DEMO_PANORAMAS, DEMO_SPACE_IDS as SPACE_IDS, migrateDemoCatalog } from '@/data/demoSpaces'
import {
  addDays,
  bogotaParts,
  hasIncompatibleDisciplines,
  INCOMPATIBLE_FOOTBALL_MESSAGE,
  mondayOf,
  parseHour,
  toInstant,
  todayISO,
} from '@/data/domain'

const STATE_KEY = 'ud-demo-state-v1'
const ACTIVE = ['CONFIRMED', 'IN_USE']
const COUNTS_FOR_QUOTA = ['CONFIRMED', 'IN_USE', 'COMPLETED', 'CANCELLED_LATE', 'NO_SHOW']
const HOUR = 3_600_000
const TOLERANCE_MIN = 10
const LATE_MIN = 60
const CHECKIN_OPENS_MIN = 10
const CHECKIN_AFTER_END_MIN = 60
const DAILY_HOURS = 2
const MAX_DAYS = 6
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export const isDemoToken = (token) => typeof token === 'string' && token.startsWith('demo:')

const USERS = {
  student: { id: 'demo-student', email: 'maria.perez@unimagdalena.edu.co', name: 'María Pérez', role: 'USER' },
  admin: { id: 'demo-admin', email: 'admin.deportes@unimagdalena.edu.co', name: 'Equipo de Deportes', role: 'ADMIN' },
}

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

const seedState = () => {
  const today = todayISO()
  const res = (id, spaceId, day, hour, status, created) => ({
    id,
    spaceId,
    startAt: toInstant(day, hour),
    endAt: toInstant(day, hour + 1),
    status,
    createdAt: toInstant(created, 18),
    checkedInAt: null,
    equipment: [],
    userId: 'demo-student',
  })
  return {
    catalogVersion: DEMO_CATALOG_VERSION,
    spaces: [
      { id: SPACE_IDS.multiple1, name: 'Cancha múltiple 1', capacity: 20, requirements: 'Calzado deportivo', openingTime: '08:00', closingTime: '20:00', status: 'ACTIVE', disciplines: ['BASKETBALL', 'VOLLEYBALL'] },
      { id: SPACE_IDS.tennis1, name: 'Cancha de tenis 1', capacity: 4, requirements: 'Calzado deportivo', openingTime: '06:00', closingTime: '18:00', status: 'ACTIVE', disciplines: ['TENNIS'] },
      { id: SPACE_IDS.multiple2, name: 'Cancha múltiple 2', capacity: 20, requirements: 'Calzado deportivo', openingTime: '06:00', closingTime: '18:00', status: 'ACTIVE', disciplines: ['FOOTBALL_5', 'BASKETBALL'] },
      { id: SPACE_IDS.football5, name: 'Cancha fútbol 5', capacity: 10, requirements: '', openingTime: '07:00', closingTime: '21:00', status: 'MAINTENANCE', disciplines: ['FOOTBALL_5'] },
      { id: SPACE_IDS.football11, name: 'Cancha fútbol 11', capacity: 22, requirements: 'Guayos o tenis', openingTime: '07:00', closingTime: '21:00', status: 'ACTIVE', disciplines: ['FOOTBALL_11'] },
    ],
    reservations: [
      res('res-seed-1', SPACE_IDS.multiple1, today, 14, 'CONFIRMED', addDays(today, -1)),
      // Consecutiva con res-seed-1: dos elegibles simultáneas para el flujo de selección (RN-33).
      res('res-seed-4', SPACE_IDS.multiple1, today, 15, 'CONFIRMED', addDays(today, -1)),
      res('res-seed-2', SPACE_IDS.tennis1, addDays(today, -3), 15, 'COMPLETED', addDays(today, -5)),
      res('res-seed-3', SPACE_IDS.football11, addDays(today, -8), 18, 'NO_SHOW', addDays(today, -10)),
    ],
    blocks: [],
    equipment: [
      { id: 'e0000000-0001-4000-8000-000000000001', name: 'Balón de baloncesto', discipline: 'BASKETBALL', stock: 10, status: 'AVAILABLE' },
      { id: 'e0000000-0002-4000-8000-000000000002', name: 'Balón de voleibol', discipline: 'VOLLEYBALL', stock: 8, status: 'AVAILABLE' },
      { id: 'e0000000-0003-4000-8000-000000000003', name: 'Malla de voleibol', discipline: 'VOLLEYBALL', stock: 2, status: 'INACTIVE' },
      { id: 'e0000000-0004-4000-8000-000000000004', name: 'Raquetas de tenis', discipline: 'TENNIS', stock: 6, status: 'AVAILABLE' },
      { id: 'e0000000-0005-4000-8000-000000000005', name: 'Balón de fútbol 5', discipline: 'FOOTBALL_5', stock: 8, status: 'AVAILABLE' },
      { id: 'e0000000-0006-4000-8000-000000000006', name: 'Petos', discipline: null, stock: 20, status: 'AVAILABLE' },
    ],
    params: { weeklyHours: 4, noShows: 3 },
  }
}

let state = null
const getState = () => {
  if (state) return state
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) state = JSON.parse(raw)
  } catch {
    // almacenamiento no disponible: se usa memoria
  }
  if (!state) return (state = seedState())
  if (migrateDemoCatalog(state)) save()
  return state
}
const save = () => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // ignorado
  }
}

/** Imágenes subidas en esta sesión (no se persisten: pesan demasiado para localStorage). */
const images = new Map() // `${spaceId}:${kind}` → Blob

let seq = 0
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${seq++}`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// Utilidades de dominio
// ---------------------------------------------------------------------------

const fail = (status, code, message, details) => {
  throw new ApiError(status, { code, message, details })
}
const invalid = (fields, message = 'La solicitud contiene campos inválidos.') =>
  fail(400, 'VALIDATION_ERROR', message, { fields })

const hash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  return (h ^ (h >>> 16)) >>> 0
}

/** Ocupación simulada pero determinista por (espacio, fecha, hora). */
const seeded = (spaceId, date, hour) => {
  const r = hash(`${spaceId}|${date}|${hour}`) % 100
  if (r < 12) return 'BLOCKED'
  if (r < 40) return 'OCCUPIED'
  return 'FREE'
}

const resHours = (r) => Math.max(1, Math.round((new Date(r.endAt) - new Date(r.startAt)) / HOUR))
const covers = (r, date, hour) => {
  const start = bogotaParts(r.startAt)
  return start.date === date && hour >= start.hour && hour < start.hour + resHours(r)
}

/** Estado de una franja combinando bloqueos, reservas y la ocupación simulada. */
const slotInfo = (s, spaceId, date, hour) => {
  const block = s.blocks.find((b) => b.spaceId === spaceId && b.date === date && hour >= b.startHour && hour < b.endHour)
  if (block) return { status: 'BLOCKED', reason: block.reason }
  const res = s.reservations.find((r) => r.spaceId === spaceId && ACTIVE.includes(r.status) && covers(r, date, hour))
  if (res) return { status: 'OCCUPIED', reservationId: res.id }
  const base = seeded(spaceId, date, hour)
  if (base === 'BLOCKED') return { status: 'BLOCKED', reason: 'Clases' }
  if (base === 'OCCUPIED') return { status: 'OCCUPIED', reservationId: `demo-${spaceId.slice(-3)}-${date}-${hour}` }
  return { status: 'FREE' }
}

/** RN-27/28: una franja iniciada sigue reservable solo durante la tolerancia. */
const pastTolerance = (date, hour, now = bogotaParts()) =>
  date < now.date || (date === now.date && (hour < now.hour || (hour === now.hour && now.minute > TOLERANCE_MIN)))

const getSpace = (s, id) => s.spaces.find((sp) => sp.id === id) ?? fail(404, 'SPACE_NOT_FOUND', 'El espacio no existe.')

const spaceDto = (sp) => ({
  id: sp.id,
  name: sp.name,
  capacity: sp.capacity,
  requirements: sp.requirements,
  openingTime: sp.openingTime,
  closingTime: sp.closingTime,
  status: sp.status,
  disciplines: sp.disciplines,
})

const reservationDto = (s, r) => ({
  id: r.id,
  space: { id: r.spaceId, name: s.spaces.find((sp) => sp.id === r.spaceId)?.name ?? 'Espacio' },
  startAt: r.startAt,
  endAt: r.endAt,
  status: r.status,
  createdAt: r.createdAt,
  checkedInAt: r.checkedInAt,
  equipment: r.equipment.map((e) => ({
    equipmentId: e.equipmentId,
    name: s.equipment.find((q) => q.id === e.equipmentId)?.name ?? 'Implemento',
    quantity: e.quantity,
  })),
})

const rulesDto = (s) => ({
  reservation: { slotMinutes: 60, maxSlotsPerReservation: 2, maxAdvanceDays: MAX_DAYS, minAdvanceMinutes: 0, bookingToleranceMinutes: TOLERANCE_MIN },
  quota: { weeklyHours: s.params.weeklyHours, dailyHours: DAILY_HOURS, weekStartsOn: 'MONDAY', timeZone: 'America/Bogota' },
  cancellation: { lateThresholdMinutes: LATE_MIN },
  checkIn: { opensMinutesBefore: CHECKIN_OPENS_MIN, closesAtReservationEnd: false, closesMinutesAfterEnd: CHECKIN_AFTER_END_MIN },
  reminder: { hoursBefore: 2 },
  sanctions: { noShowsForSuspension: s.params.noShows, window: 'CALENDAR_MONTH', suspensionDays: 7 },
  emailDomain: '@unimagdalena.edu.co',
})

const quotaUsed = (s, userId, monday) => {
  const sunday = addDays(monday, 6)
  return s.reservations
    .filter((r) => r.userId === userId && COUNTS_FOR_QUOTA.includes(r.status))
    .filter((r) => {
      const d = bogotaParts(r.startAt).date
      return d >= monday && d <= sunday
    })
    .reduce((acc, r) => acc + resHours(r), 0)
}

/** Unidades de un implemento comprometidas simultáneamente en [startMs, endMs) (RN-65). */
const committed = (s, equipmentId, startMs, endMs, ignoreId) => {
  let max = 0
  for (let t = startMs; t < endMs; t += HOUR) {
    let sum = 0
    for (const r of s.reservations) {
      if (!ACTIVE.includes(r.status) || r.id === ignoreId) continue
      if (new Date(r.startAt).getTime() <= t && t < new Date(r.endAt).getTime()) {
        sum += r.equipment.find((e) => e.equipmentId === equipmentId)?.quantity ?? 0
      }
    }
    max = Math.max(max, sum)
  }
  return max
}

const equipmentDto = (e) => ({ id: e.id, name: e.name, discipline: e.discipline, stock: e.stock, status: e.status })

/** QR decorativo y determinista por espacio (el prototipo no codifica datos reales). */
const qrSvg = (spaceId) => {
  const size = 21
  let seed = hash(spaceId) || 7
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0
    return seed / 2 ** 32
  }
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)
  let cells = ''
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inFinder(x, y) && rand() < 0.45) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`
    }
  }
  const finder = (x, y) =>
    `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" fill="none" stroke="#000" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 23 23" shape-rendering="crispEdges" fill="#000"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/>${cells}${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}</svg>`
}

// ---------------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------------

const userFor = (token) => USERS[token.slice(5)] ?? USERS.student

const routes = []
const route = (method, pattern, handler) =>
  routes.push([method, new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`), handler])

route('GET', '/me', ({ user }) => ({ ...user, suspendedUntil: null, needsName: false }))
route('PUT', '/me/profile', ({ user, body }) => {
  if (!body?.name?.trim()) invalid({ name: 'no puede estar vacío' }, 'El nombre es obligatorio.')
  return { ...user, name: body.name.trim(), suspendedUntil: null, needsName: false }
})
route('POST', '/auth/logout', () => null)
route('POST', '/auth/reauth/code', () => ({ message: 'Se envió un código de reautenticación a tu correo institucional.' }))
route('POST', '/auth/reauth/verify', ({ token }) => ({ token, expiresAt: toInstant(addDays(todayISO(), 1), 0), reauthAt: new Date().toISOString() }))

route('GET', '/rules', ({ s }) => rulesDto(s))
route('GET', '/admin/parameters', ({ s }) => rulesDto(s))
route('PUT', '/admin/parameters', ({ s, body }) => {
  const fields = {}
  const weekly = body?.quota?.weeklyHours
  const noShows = body?.sanctions?.noShowsForSuspension
  if (weekly !== undefined && (!Number.isInteger(weekly) || weekly < 1 || weekly > 168)) fields['quota.weeklyHours'] = 'debe estar entre 1 y 168'
  if (noShows !== undefined && (!Number.isInteger(noShows) || noShows < 1 || noShows > 31)) fields['sanctions.noShowsForSuspension'] = 'debe estar entre 1 y 31'
  if (Object.keys(fields).length) invalid(fields)
  if (weekly !== undefined) s.params.weeklyHours = weekly
  if (noShows !== undefined) s.params.noShows = noShows
  save()
  return rulesDto(s)
})

route('GET', '/spaces', ({ s, query }) => ({
  spaces: s.spaces
    .filter((sp) => sp.status === 'ACTIVE' && (!query.discipline || sp.disciplines.includes(query.discipline)))
    .map(spaceDto),
}))

route('GET', '/spaces/:id/availability', ({ s, params, query }) => {
  const space = getSpace(s, params.id)
  const date = query.date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || Number.isNaN(new Date(`${date}T12:00:00`).getTime())) {
    fail(400, 'INVALID_DATE', 'La fecha no tiene un formato válido.')
  }
  const today = todayISO()
  const maxDate = addDays(today, MAX_DAYS)
  if (date < today || date > maxDate) {
    fail(400, 'OUTSIDE_CALENDAR_HORIZON', 'El calendario muestra desde hoy hasta dentro de 7 días.', { maxDate })
  }
  const open = parseHour(space.openingTime)
  const close = parseHour(space.closingTime)
  const slots = []
  for (let h = open; h < close; h++) {
    const info = slotInfo(s, space.id, date, h)
    slots.push({
      startAt: toInstant(date, h),
      endAt: toInstant(date, h + 1),
      status: info.status,
      bookable: info.status === 'FREE' && space.status === 'ACTIVE' && !pastTolerance(date, h),
      reason: info.reason ?? null,
    })
  }
  return { spaceId: space.id, date, discipline: query.discipline ?? null, slots }
})

route('GET', '/spaces/:id/images/:kind', async ({ params, signal }) => {
  const blob = images.get(`${params.id}:${params.kind}`)
  if (blob) return blob

  // PREVIEW mantiene su comportamiento original. Solo PANORAMA usa archivos locales.
  const filename = params.kind === 'PANORAMA' ? DEMO_PANORAMAS[params.id] : null
  if (!filename) fail(404, 'IMAGE_NOT_AVAILABLE', 'La imagen no está disponible en el recorrido de demostración.')

  for (const extension of ['png', 'jpg', 'jpeg', 'webp']) {
    signal?.throwIfAborted()
    const candidate = filename.replace(/\.[^.]+$/, `.${extension}`)
    let response
    try {
      response = await fetch(`${import.meta.env.BASE_URL}panoramas/${candidate}`, { signal, cache: 'no-cache' })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      fail(0, 'NETWORK_ERROR', 'No se pudo descargar el panorama de demostración. Intenta de nuevo.')
    }

    // Solo busca otra extensión si falta el archivo, incluido el HTML de respaldo de Vite.
    if (response.status === 404 || (response.ok && response.headers.get('Content-Type')?.includes('text/html'))) continue
    if (!response.ok) fail(response.status, 'PANORAMA_LOAD_FAILED', 'No se pudo descargar el panorama de demostración.')
    return response.blob()
  }
  fail(404, 'IMAGE_NOT_AVAILABLE', `Añade ${filename} (o el mismo nombre con .jpg, .jpeg o .webp) en public/panoramas/ y vuelve a intentar.`)
})

route('GET', '/quota/me', ({ s, user }) => {
  const monday = mondayOf(todayISO())
  const used = quotaUsed(s, user.id, monday)
  const limit = s.params.weeklyHours
  return {
    weekStart: toInstant(monday, 0),
    weekEnd: toInstant(addDays(monday, 7), 0),
    limitHours: limit,
    usedHours: used,
    availableHours: Math.max(0, limit - used),
    resetAt: toInstant(addDays(monday, 7), 0),
  }
})

route('GET', '/reservations/mine', ({ s, user }) => ({
  reservations: s.reservations
    .filter((r) => r.userId === user.id)
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
    .map((r) => reservationDto(s, r)),
}))

route('POST', '/reservations', ({ s, user, body }) => {
  if (user.role !== 'USER') fail(403, 'FORBIDDEN', 'Solo los estudiantes pueden crear reservas.')
  const { spaceId, startAt, slots, equipment = [] } = body ?? {}
  const fields = {}
  if (!spaceId) fields.spaceId = 'obligatorio'
  if (!startAt) fields.startAt = 'obligatorio'
  if (![1, 2].includes(slots)) fields.slots = 'debe ser 1 o 2'
  if (Object.keys(fields).length) invalid(fields, 'La reserva debe tener una o dos franjas consecutivas.')

  const space = getSpace(s, spaceId)
  const start = bogotaParts(startAt)
  const today = todayISO()
  if (space.status !== 'ACTIVE') fail(409, 'SPACE_IN_MAINTENANCE', 'El espacio está en mantenimiento.')
  if (start.date > addDays(today, MAX_DAYS) || pastTolerance(start.date, start.hour)) {
    fail(409, 'OUTSIDE_BOOKING_WINDOW', 'La franja está fuera de la anticipación máxima o ya pasó la tolerancia.')
  }
  const open = parseHour(space.openingTime)
  const close = parseHour(space.closingTime)
  if (start.hour < open || start.hour + slots > close) invalid({ startAt: 'fuera del horario del espacio' })

  const infos = Array.from({ length: slots }, (_, i) => slotInfo(s, spaceId, start.date, start.hour + i))
  if (infos.some((i) => i.status === 'BLOCKED')) fail(409, 'BLOCKED_SLOT', 'La franja tiene un bloqueo institucional.')
  // RN-10: de vez en cuando otra persona gana la franja, para mostrar el conflicto.
  if (infos.some((i) => i.status === 'OCCUPIED') || Math.random() < 0.12) {
    fail(409, 'SLOT_TAKEN', 'La franja ya no está disponible.')
  }

  const startMs = new Date(startAt).getTime()
  const endMs = startMs + slots * HOUR
  const overlaps = s.reservations.some(
    (r) => r.userId === user.id && ACTIVE.includes(r.status) && new Date(r.startAt) < endMs && new Date(r.endAt) > startMs
  )
  if (overlaps) fail(409, 'OVERLAPPING_RESERVATION', 'Ya tienes una reserva que se solapa con esa franja.')

  // RN-67: máximo diario fijo de 2 h por fecha en America/Bogota, entre todos los espacios;
  // se valida antes de la cuota semanal y con los mismos estados de consumo.
  const dailyUsed = s.reservations
    .filter((r) => r.userId === user.id && COUNTS_FOR_QUOTA.includes(r.status) && bogotaParts(r.startAt).date === start.date)
    .reduce((acc, r) => acc + resHours(r), 0)
  if (dailyUsed + slots > DAILY_HOURS) {
    fail(409, 'DAILY_QUOTA_EXCEEDED', `La reserva supera el máximo diario de ${DAILY_HOURS} horas.`, {
      date: start.date,
      dailyLimitHours: DAILY_HOURS,
      usedHours: dailyUsed,
      requestedHours: slots,
      availableHours: Math.max(0, DAILY_HOURS - dailyUsed),
    })
  }

  const monday = mondayOf(start.date)
  const used = quotaUsed(s, user.id, monday)
  const limit = s.params.weeklyHours
  if (used + slots > limit) {
    const available = Math.max(0, limit - used)
    fail(409, 'QUOTA_EXCEEDED', `La reserva supera tu cuota semanal. Te quedan ${available} horas disponibles.`, {
      weekStart: toInstant(monday, 0),
      weeklyLimitHours: limit,
      usedHours: used,
      requestedHours: slots,
      availableHours: available,
    })
  }

  const seen = new Set()
  for (const item of equipment) {
    if (seen.has(item.equipmentId)) invalid({ equipment: 'no se admite repetir un implemento' })
    seen.add(item.equipmentId)
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      fail(400, 'INVALID_QUANTITY', 'La cantidad debe ser mayor que cero.')
    }
    const eq = s.equipment.find((e) => e.id === item.equipmentId) ?? fail(404, 'EQUIPMENT_NOT_FOUND', 'El implemento no existe.')
    const available = eq.stock - committed(s, eq.id, startMs, endMs)
    if (eq.status !== 'AVAILABLE' || item.quantity > available) {
      fail(409, 'EQUIPMENT_UNAVAILABLE', `No hay suficientes unidades de ${eq.name} para esa franja.`, {
        equipmentId: eq.id,
        requested: item.quantity,
        available: Math.max(0, available),
      })
    }
  }

  const created = {
    id: newId('res'),
    spaceId,
    startAt: toInstant(start.date, start.hour),
    endAt: toInstant(start.date, start.hour + slots),
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    checkedInAt: null,
    equipment: equipment.map(({ equipmentId, quantity }) => ({ equipmentId, quantity })),
    userId: user.id,
  }
  s.reservations.unshift(created)
  save()
  return reservationDto(s, created)
})

const ownReservation = (s, user, id) => {
  const r = s.reservations.find((x) => x.id === id) ?? fail(404, 'RESERVATION_NOT_FOUND', 'La reserva no existe.')
  if (r.userId !== user.id) fail(403, 'FORBIDDEN', 'La reserva no pertenece al usuario.')
  return r
}
const assertCancellable = (r) => {
  if (r.status !== 'CONFIRMED' || new Date(r.endAt) <= Date.now()) {
    fail(409, 'RESERVATION_NOT_CANCELLABLE', r.status === 'IN_USE' ? 'La reserva ya tiene check-in y no se puede cancelar.' : 'La reserva no se puede cancelar.')
  }
}
const isLate = (r) => new Date(r.startAt).getTime() - Date.now() < LATE_MIN * 60_000

route('GET', '/reservations/:id/cancellation-preview', ({ s, user, params }) => {
  const r = ownReservation(s, user, params.id)
  assertCancellable(r)
  const late = isLate(r)
  return {
    reservationId: r.id,
    late,
    hoursCounted: late ? resHours(r) : 0,
    message: late
      ? 'La cancelación es tardía: el espacio queda libre, pero las horas siguen contando como usadas.'
      : 'La cancelación es a tiempo: el espacio queda libre y las horas se devuelven a tu cuota.',
  }
})

route('POST', '/reservations/:id/cancellation', ({ s, user, params }) => {
  const r = ownReservation(s, user, params.id)
  assertCancellable(r)
  const late = isLate(r)
  r.status = late ? 'CANCELLED_LATE' : 'CANCELLED_ON_TIME'
  save()
  return {
    id: r.id,
    status: r.status,
    cancelledAt: new Date().toISOString(),
    hoursCounted: late ? resHours(r) : 0,
    equipment: reservationDto(s, r).equipment,
  }
})

// ---------------------------------------------------------------------------
// Check-in (UC05): ventana desde opensMinutesBefore hasta endAt + 1 hora, inclusive.
// ---------------------------------------------------------------------------

const opensAtOf = (r) => {
  const { date, hour, minute } = bogotaParts(new Date(r.startAt).getTime() - CHECKIN_OPENS_MIN * 60_000)
  return toInstant(date, hour, minute)
}
const closesMsOf = (r) => new Date(r.endAt).getTime() + CHECKIN_AFTER_END_MIN * 60_000
const closesAtOf = (r) => {
  const { date, hour, minute } = bogotaParts(closesMsOf(r))
  return toInstant(date, hour, minute)
}

/** Reservas propias `CONFIRMED` sin check-in dentro de la ventana, ordenadas por inicio. */
const checkinEligible = (s, user, spaceId, now) =>
  s.reservations
    .filter((r) => r.userId === user.id && r.spaceId === spaceId)
    .filter((r) => r.status === 'CONFIRMED' && !r.checkedInAt)
    .filter((r) => now >= new Date(r.startAt).getTime() - CHECKIN_OPENS_MIN * 60_000 && now <= closesMsOf(r))
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .map((r) => ({
      reservationId: r.id,
      spaceId: r.spaceId,
      startAt: r.startAt,
      endAt: r.endAt,
      opensAt: opensAtOf(r),
      closesAt: closesAtOf(r),
    }))

/** Confirma por identificador revalidando usuario, espacio, estado y hora (RN-33, RN-36). */
const confirmCheckin = (s, user, spaceId, reservationId, now) => {
  const r =
    s.reservations.find((x) => x.id === reservationId && x.spaceId === spaceId && x.userId === user.id) ??
    fail(404, 'RESERVATION_NOT_FOUND', 'La reserva no existe o no corresponde a este espacio.')
  if (r.checkedInAt) {
    // Repetir conserva la fecha original y el estado actual, sin otra auditoría.
    return { reservationId: r.id, spaceId: r.spaceId, status: r.status, checkedInAt: r.checkedInAt }
  }
  if (r.status !== 'CONFIRMED') {
    if (r.status.startsWith('CANCELLED')) fail(409, 'RESERVATION_CANCELLED', 'La reserva fue cancelada.')
    fail(409, 'CHECKIN_WINDOW_CLOSED', 'La reserva ya no admite el primer check-in.')
  }
  if (now < new Date(r.startAt).getTime() - CHECKIN_OPENS_MIN * 60_000) {
    fail(409, 'CHECKIN_TOO_EARLY', 'El check-in aún no está disponible.', { opensAt: opensAtOf(r) })
  }
  if (now > closesMsOf(r)) {
    fail(409, 'CHECKIN_WINDOW_CLOSED', 'La ventana de check-in cerró (cierre una hora después del fin, inclusive).')
  }
  const endMs = new Date(r.endAt).getTime()
  const otherUsing = s.reservations.some(
    (x) =>
      x.userId !== user.id &&
      x.spaceId === spaceId &&
      ACTIVE.includes(x.status) &&
      new Date(x.startAt).getTime() <= now &&
      now < new Date(x.endAt).getTime()
  )
  // Antes del fin, la ocupación de otro usuario impide el check-in; una confirmación tardía no (RN-36).
  if (now < endMs && otherUsing) {
    fail(403, 'FORBIDDEN', 'Otro usuario tiene una reserva en curso y la tuya aún no ha terminado.')
  }
  r.status = now < endMs ? 'IN_USE' : 'COMPLETED'
  r.checkedInAt = new Date().toISOString()
  save()
  return { reservationId: r.id, spaceId: r.spaceId, status: r.status, checkedInAt: r.checkedInAt }
}

route('GET', '/checkin/:spaceId/reservations', ({ s, user, params }) =>
  checkinEligible(s, user, params.spaceId, Date.now())
)

route('POST', '/checkin/:spaceId/reservations/:reservationId', ({ s, user, params }) =>
  confirmCheckin(s, user, params.spaceId, params.reservationId, Date.now())
)

route('POST', '/checkin/:spaceId', ({ s, user, params }) => {
  const now = Date.now()
  const eligible = checkinEligible(s, user, params.spaceId, now)
  if (eligible.length > 1) {
    fail(409, 'CHECKIN_SELECTION_REQUIRED', 'Tienes varias reservas elegibles en este espacio; confirma la que corresponda.')
  }
  if (eligible.length === 1) return confirmCheckin(s, user, params.spaceId, eligible[0].reservationId, now)
  // Fallback conservado para compatibilidad: repetir sobre una reserva activa con fin futuro.
  const mine = s.reservations
    .filter((r) => r.userId === user.id && r.spaceId === params.spaceId)
    .filter((r) => ACTIVE.includes(r.status) && new Date(r.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  const r = mine[0] ?? fail(404, 'NO_ACTIVE_RESERVATION', 'No tienes una reserva activa en este espacio.')
  if (r.checkedInAt) return { reservationId: r.id, spaceId: r.spaceId, status: r.status, checkedInAt: r.checkedInAt }
  const opens = new Date(r.startAt).getTime() - CHECKIN_OPENS_MIN * 60_000
  if (now < opens) {
    fail(409, 'CHECKIN_TOO_EARLY', 'El check-in aún no está disponible.', { opensAt: opensAtOf(r) })
  }
  r.status = 'IN_USE'
  r.checkedInAt = new Date().toISOString()
  save()
  return { reservationId: r.id, spaceId: r.spaceId, status: r.status, checkedInAt: r.checkedInAt }
})

route('POST', '/contact', ({ body }) => {
  const fields = {}
  if (!body?.subject?.trim()) fields.subject = 'no puede estar vacío'
  if (!body?.message?.trim()) fields.message = 'no puede estar vacío'
  if (Object.keys(fields).length) invalid(fields, 'El asunto y el mensaje son obligatorios.')
  return { message: 'Tu mensaje fue enviado al área de deportes.' }
})

route('GET', '/equipment', ({ s, query }) => ({
  equipment: s.equipment.filter((e) => !query.discipline || e.discipline === query.discipline).map(equipmentDto),
}))

route('GET', '/equipment/availability', ({ s, query }) => {
  const startMs = new Date(query.startAt).getTime()
  const endMs = new Date(query.endAt).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) invalid({ endAt: 'debe ser mayor que startAt' })
  return {
    startAt: query.startAt,
    endAt: query.endAt,
    items: s.equipment
      .filter((e) => e.status === 'AVAILABLE' && (!query.discipline || e.discipline === query.discipline || e.discipline === null))
      .map((e) => {
        const used = committed(s, e.id, startMs, endMs)
        return { equipmentId: e.id, name: e.name, stock: e.stock, committed: used, available: e.stock - used }
      })
      .filter((i) => i.available > 0),
  }
})

const validateEquipment = (s, body, current) => {
  const fields = {}
  if (body.name !== undefined && (!String(body.name).trim() || String(body.name).length > 200)) fields.name = 'obligatorio, máximo 200 caracteres'
  if (body.stock !== undefined && (!Number.isInteger(body.stock) || body.stock < 0)) fields.stock = 'debe ser mayor o igual a 0'
  if (body.status !== undefined && !['AVAILABLE', 'INACTIVE'].includes(body.status)) fields.status = 'valor inválido'
  if (Object.keys(fields).length) invalid(fields)
  const name = body.name?.trim()
  if (name && s.equipment.some((e) => e.id !== current?.id && e.name.toLowerCase() === name.toLowerCase())) {
    fail(409, 'EQUIPMENT_NAME_ALREADY_EXISTS', 'Ya existe otro implemento con ese nombre.')
  }
}

route('POST', '/admin/equipment', ({ s, body }) => {
  if (body?.name === undefined) invalid({ name: 'obligatorio' })
  if (body?.stock === undefined) invalid({ stock: 'obligatorio' })
  validateEquipment(s, body)
  const eq = {
    id: newId('eq'),
    name: body.name.trim(),
    discipline: body.discipline ?? null,
    stock: body.stock,
    status: body.status ?? 'AVAILABLE',
  }
  s.equipment.push(eq)
  save()
  return equipmentDto(eq)
})

route('PUT', '/admin/equipment/:id', ({ s, params, body }) => {
  const eq = s.equipment.find((e) => e.id === params.id) ?? fail(404, 'EQUIPMENT_NOT_FOUND', 'El implemento no existe.')
  validateEquipment(s, body ?? {}, eq)
  if (body.stock !== undefined) {
    // RN-65: el stock no puede quedar por debajo de lo ya comprometido en reservas futuras.
    const future = s.reservations.filter((r) => ACTIVE.includes(r.status) && new Date(r.endAt) > Date.now())
    const peak = future.reduce((m, r) => Math.max(m, committed(s, eq.id, Math.max(Date.now(), new Date(r.startAt).getTime()), new Date(r.endAt).getTime())), 0)
    if (body.stock < peak) {
      fail(409, 'STOCK_BELOW_COMMITTED', `El stock no puede ser menor a ${peak}: ya hay unidades comprometidas en reservas futuras.`)
    }
  }
  if (body.name !== undefined) eq.name = body.name.trim()
  if (body.stock !== undefined) eq.stock = body.stock
  if (body.status !== undefined) eq.status = body.status
  if ('discipline' in body) eq.discipline = body.discipline
  save()
  return equipmentDto(eq)
})

route('GET', '/admin/spaces', ({ s }) => ({ spaces: s.spaces.map(spaceDto) }))

route('POST', '/admin/spaces', async ({ s, form }) => {
  let input = {}
  try {
    input = JSON.parse(await form.get('space').text())
  } catch {
    invalid({ space: 'JSON inválido' })
  }
  const fields = {}
  if (!input.name?.trim()) fields.name = 'no puede estar vacío'
  if (!Number.isInteger(input.capacity) || input.capacity < 1) fields.capacity = 'debe ser mayor que 0'
  if (!/^\d{2}:\d{2}$/.test(input.openingTime ?? '')) fields.openingTime = 'formato HH:mm'
  if (!/^\d{2}:\d{2}$/.test(input.closingTime ?? '')) fields.closingTime = 'formato HH:mm'
  else if (input.openingTime >= input.closingTime) fields.closingTime = 'debe ser mayor que openingTime'
  if (!input.disciplines?.length) fields.disciplines = 'al menos una disciplina'
  else if (hasIncompatibleDisciplines(input.disciplines)) fields.disciplines = INCOMPATIBLE_FOOTBALL_MESSAGE
  if (!(form.get('preview') instanceof Blob)) fields.preview = 'imagen obligatoria'
  if (!(form.get('panorama') instanceof Blob)) fields.panorama = 'imagen obligatoria'
  if (Object.keys(fields).length) invalid(fields)

  const space = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    capacity: input.capacity,
    requirements: input.requirements ?? '',
    openingTime: input.openingTime,
    closingTime: input.closingTime,
    status: input.status ?? 'ACTIVE',
    disciplines: input.disciplines,
  }
  images.set(`${space.id}:PREVIEW`, form.get('preview'))
  images.set(`${space.id}:PANORAMA`, form.get('panorama'))
  s.spaces.push(space)
  save()
  return spaceDto(space)
})

route('PUT', '/admin/spaces/:id', ({ s, params, body }) => {
  const space = getSpace(s, params.id)
  const next = { ...space, ...body }
  const fields = {}
  if (!String(next.name ?? '').trim()) fields.name = 'no puede estar vacío'
  if (next.openingTime >= next.closingTime) fields.closingTime = 'debe ser mayor que openingTime'
  if (!next.disciplines?.length) fields.disciplines = 'al menos una disciplina'
  else if (hasIncompatibleDisciplines(next.disciplines)) fields.disciplines = INCOMPATIBLE_FOOTBALL_MESSAGE
  if (Object.keys(fields).length) invalid(fields)
  Object.assign(space, { ...next, name: next.name.trim(), requirements: next.requirements ?? '' })
  save()
  return spaceDto(space)
})

route('PUT', '/admin/spaces/:id/images/:kind', ({ s, params, form }) => {
  getSpace(s, params.id)
  const image = form?.get('image')
  if (!(image instanceof Blob)) invalid({ image: 'obligatoria' })
  images.set(`${params.id}:${params.kind}`, image)
  return null
})

route('GET', '/admin/spaces/:id/qr', ({ s, params }) => {
  getSpace(s, params.id)
  return new Blob([qrSvg(params.id)], { type: 'image/svg+xml' })
})

route('GET', '/admin/occupancy', ({ s, query }) => {
  const date = query.date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) invalid({ date: 'valor inválido' }, 'La fecha es obligatoria.')
  const spaces = s.spaces
    .filter((sp) => (!query.spaceId || sp.id === query.spaceId) && (!query.discipline || sp.disciplines.includes(query.discipline)))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return {
    date,
    spaces: spaces.map((sp) => ({
      spaceId: sp.id,
      spaceName: sp.name,
      slots: Array.from({ length: parseHour(sp.closingTime) - parseHour(sp.openingTime) }, (_, i) => {
        const h = parseHour(sp.openingTime) + i
        const info = slotInfo(s, sp.id, date, h)
        return {
          startAt: toInstant(date, h),
          endAt: toInstant(date, h + 1),
          status: info.status,
          reservationId: info.status === 'OCCUPIED' ? info.reservationId : null,
        }
      }),
    })),
  }
})

route('GET', '/admin/indicators', ({ s, query }) => {
  if (!query.period) invalid({ period: 'obligatorio' })
  if (!['WEEKLY', 'MONTHLY'].includes(query.period)) fail(400, 'INVALID_PERIOD', 'El período debe ser WEEKLY o MONTHLY.', { field: 'period' })
  const today = todayISO()
  let from
  let to
  if (query.period === 'WEEKLY') {
    from = mondayOf(today)
    to = addDays(from, 7)
  } else {
    from = `${today.slice(0, 8)}01`
    const d = new Date(`${from}T12:00:00`)
    d.setMonth(d.getMonth() + 1)
    to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }
  const base = query.period === 'WEEKLY' ? [24, 3, 2, 1] : [96, 11, 7, 2]
  const created = s.reservations.filter((r) => {
    const d = bogotaParts(r.createdAt).date
    return d >= from && d < to && r.id.startsWith('res-') && !r.id.startsWith('res-seed')
  }).length
  return {
    period: query.period,
    from: toInstant(from, 0),
    to: toInstant(to, 0),
    reservations: base[0] + created,
    lateCancellations: base[1] + s.reservations.filter((r) => r.status === 'CANCELLED_LATE' && r.id.startsWith('res-') && !r.id.startsWith('res-seed')).length,
    noShows: base[2],
    suspendedUsers: base[3],
  }
})

route('POST', '/admin/blocks', ({ s, body }) => {
  const space = getSpace(s, body?.spaceId)
  const fields = {}
  if (!['CLASS', 'EVENT', 'MAINTENANCE'].includes(body.type)) fields.type = 'valor inválido'
  if (!body.reason?.trim()) fields.reason = 'no puede estar vacío'
  const start = bogotaParts(body.startAt)
  const end = bogotaParts(body.endAt)
  const endHour = end.date === start.date ? end.hour + (end.minute > 0 ? 1 : 0) : 24
  if (!(endHour > start.hour)) fields.endAt = 'debe ser mayor que startAt'
  const rec = body.recurrence
  if (rec && (!rec.daysOfWeek?.length || !rec.until || rec.until < start.date)) fields.recurrence = 'mal formada'
  if (Object.keys(fields).length) invalid(fields)

  // Fechas afectadas: una sola, o todas las del patrón semanal hasta `until`.
  const dates = []
  if (rec) {
    for (let d = start.date; d <= rec.until; d = addDays(d, 1)) {
      if (rec.daysOfWeek.includes(DAY_NAMES[new Date(`${d}T12:00:00`).getDay()])) dates.push(d)
    }
  } else {
    dates.push(start.date)
  }

  const hit = (r, date) => {
    const rs = bogotaParts(r.startAt)
    return rs.date === date && rs.hour < endHour && rs.hour + resHours(r) > start.hour
  }
  const affected = s.reservations.filter((r) => r.spaceId === space.id && ACTIVE.includes(r.status) && dates.some((d) => hit(r, d)))
  if (affected.some((r) => r.status === 'IN_USE')) {
    fail(409, 'RESERVATION_IN_USE', 'Alguna franja afecta una reserva en curso; no se creó ningún bloqueo.')
  }
  affected.forEach((r) => {
    r.status = 'CANCELLED_BY_ADMIN'
  })
  for (const date of dates) {
    s.blocks.push({ id: newId('blk'), spaceId: space.id, date, startHour: start.hour, endHour, reason: body.reason.trim(), type: body.type })
  }
  save()
  return {
    recurrenceGroup: rec ? crypto.randomUUID() : null,
    createdBlocks: dates.length * (endHour - start.hour),
    cancelledReservations: affected.length,
  }
})

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

export async function mockRequest(token, path, { method = 'GET', body, form, query = {}, as = 'json', signal } = {}) {
  signal?.throwIfAborted()
  await sleep(120 + Math.random() * 180)
  signal?.throwIfAborted()
  const cleanQuery = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  for (const [m, regex, handler] of routes) {
    if (m !== method) continue
    const match = regex.exec(path)
    if (!match) continue
    const user = userFor(token)
    const isAdminRoute = path.startsWith('/admin') || path.startsWith('/auth/reauth')
    if (isAdminRoute && user.role !== 'ADMIN') fail(403, 'FORBIDDEN', 'Solo un Administrador puede hacer esto.')
    const result = await handler({
      s: getState(),
      user,
      token,
      params: match.groups ?? {},
      query: cleanQuery,
      body,
      form,
      signal,
    })
    if (result instanceof Blob && as === 'text') return result.text()
    return result
  }
  return fail(404, 'NOT_FOUND', 'Esta función no está disponible en el recorrido de demostración.')
}
