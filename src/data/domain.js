// Dominio del cliente: enumeraciones de la API, fechas en America/Bogota y
// adaptadores de los DTOs del backend a la forma que usan las pantallas.

export const DISCIPLINES = [
  { id: 'BASKETBALL', name: 'Baloncesto' },
  { id: 'VOLLEYBALL', name: 'Voleibol' },
  { id: 'FOOTBALL_5', name: 'Fútbol 5' },
  { id: 'FOOTBALL_11', name: 'Fútbol 11' },
  { id: 'TENNIS', name: 'Tenis de campo' },
]

export const disciplineName = (id) => DISCIPLINES.find((d) => d.id === id)?.name ?? id

export const INCOMPATIBLE_FOOTBALL_MESSAGE =
  'Fútbol 5 y Fútbol 11 no pueden pertenecer al mismo espacio.'

export const hasIncompatibleDisciplines = (disciplines) =>
  disciplines.includes('FOOTBALL_5') && disciplines.includes('FOOTBALL_11')

export const RESERVATION_STATES = {
  confirmada: { label: 'Confirmada', badge: 'default' },
  'en-uso': { label: 'En uso', badge: 'success' },
  completada: { label: 'Completada', badge: 'secondary' },
  'cancelada-tiempo': { label: 'Cancelada a tiempo', badge: 'outline' },
  'cancelada-tardia': { label: 'Cancelada tardía', badge: 'warning' },
  inasistencia: { label: 'Inasistencia', badge: 'destructive' },
  'cancelada-admin': { label: 'Cancelada por administrador', badge: 'outline' },
  'cancelada-suspension': { label: 'Cancelada por suspensión', badge: 'outline' },
}

const RESERVATION_STATUS = {
  CONFIRMED: 'confirmada',
  IN_USE: 'en-uso',
  COMPLETED: 'completada',
  CANCELLED_ON_TIME: 'cancelada-tiempo',
  CANCELLED_LATE: 'cancelada-tardia',
  NO_SHOW: 'inasistencia',
  CANCELLED_BY_ADMIN: 'cancelada-admin',
  CANCELLED_BY_SUSPENSION: 'cancelada-suspension',
}

/** Estados que cuentan contra la cuota semanal (sección 5.4 del contexto). */
export const COUNTS_FOR_QUOTA = ['confirmada', 'en-uso', 'completada', 'cancelada-tardia', 'inasistencia']
export const ACTIVE_STATES = ['confirmada', 'en-uso']

export const BLOCK_TYPES = [
  { value: 'CLASS', label: 'Clases y grupos formativos' },
  { value: 'EVENT', label: 'Eventos o torneos' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
]

export const WEEK_DAYS = [
  { value: 'MONDAY', short: 'Lun' },
  { value: 'TUESDAY', short: 'Mar' },
  { value: 'WEDNESDAY', short: 'Mié' },
  { value: 'THURSDAY', short: 'Jue' },
  { value: 'FRIDAY', short: 'Vie' },
  { value: 'SATURDAY', short: 'Sáb' },
  { value: 'SUNDAY', short: 'Dom' },
]

// ---------------------------------------------------------------------------
// Fechas. Colombia no tiene horario de verano: America/Bogota es siempre UTC-5.
// ---------------------------------------------------------------------------

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000
const pad = (n) => String(n).padStart(2, '0')

/** Fecha y hora locales de Bogotá de un instante ISO (con cualquier offset) o Date. */
export const bogotaParts = (value = new Date()) => {
  const d = new Date(new Date(value).getTime() + BOGOTA_OFFSET_MS)
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  }
}

/** Instante ISO-8601 con offset de Bogotá para una fecha y hora en punto. */
export const toInstant = (date, hour, minute = 0) => `${date}T${pad(hour)}:${pad(minute)}:00-05:00`

/** "06:00" o "06:00:00" → 6 */
export const parseHour = (hhmm) => Number(String(hhmm ?? '0').slice(0, 2))
export const toHHmm = (hour) => `${pad(hour)}:00`

export const todayISO = () => bogotaParts().date

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export const formatDate = (iso, opts = {}) => {
  const text = new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...opts,
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const formatHour = (h, minute = 0) => {
  const period = h < 12 || h === 24 ? 'a. m.' : 'p. m.'
  let hour = h % 12
  if (hour === 0) hour = 12
  return `${hour}:${pad(minute)} ${period}`
}

export const formatRange = (start, hours = 1) => `${formatHour(start)}–${formatHour(start + hours)}`

/** Hora (h:mm a. m.) de un instante ISO en Bogotá. */
export const formatInstantTime = (iso) => {
  const { hour, minute } = bogotaParts(iso)
  return formatHour(hour, minute)
}

/** Lunes de la semana a la que pertenece una fecha. */
export const mondayOf = (iso) => {
  const d = new Date(`${iso}T12:00:00`)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return toISODate(d)
}

/** Próximos N días (incluye hoy). */
export const nextDays = (n) => {
  const t = todayISO()
  return Array.from({ length: n + 1 }, (_, i) => addDays(t, i))
}

// ---------------------------------------------------------------------------
// Adaptadores de DTOs
// ---------------------------------------------------------------------------

/** SpaceInfo → espacio de la UI. */
export const mapSpace = (s) => ({
  id: s.id,
  name: s.name,
  aforo: s.capacity,
  requirements: s.requirements ?? '',
  open: parseHour(s.openingTime),
  close: parseHour(s.closingTime),
  estado: s.status === 'ACTIVE' ? 'activo' : 'mantenimiento',
  disciplines: [...(s.disciplines ?? [])].sort(
    (a, b) => DISCIPLINES.findIndex((d) => d.id === a) - DISCIPLINES.findIndex((d) => d.id === b)
  ),
})

const SLOT_STATUS = { FREE: 'libre', OCCUPIED: 'ocupada', BLOCKED: 'bloqueada' }

/** Franja de GET /spaces/{id}/availability o /admin/occupancy → franja de la UI. */
export const mapSlot = (s) => ({
  hour: bogotaParts(s.startAt).hour,
  estado: SLOT_STATUS[s.status] ?? 'ocupada',
  bookable: s.bookable ?? s.status === 'FREE',
  motivo: s.reason ?? null,
  reservationId: s.reservationId ?? null,
})

/** ReservationDto → reserva de la UI. */
export const mapReservation = (r) => {
  const start = bogotaParts(r.startAt)
  const end = bogotaParts(r.endAt)
  const hours = Math.max(1, Math.round((new Date(r.endAt) - new Date(r.startAt)) / 3_600_000))
  return {
    id: r.id,
    spaceId: r.space?.id,
    spaceName: r.space?.name,
    date: start.date,
    startHour: start.hour,
    endHour: end.hour,
    hours,
    startAt: r.startAt,
    endAt: r.endAt,
    estado: RESERVATION_STATUS[r.status] ?? 'confirmada',
    createdAt: r.createdAt,
    checkedInAt: r.checkedInAt,
    equipment: r.equipment ?? [],
  }
}

/** GET /quota/me → cuota de la UI. */
export const mapQuota = (q) => ({
  max: q.limitHours,
  used: q.usedHours,
  left: q.availableHours,
  weekStart: bogotaParts(q.weekStart).date,
  resetAt: q.resetAt,
})

/** GET /rules (o /admin/parameters) → parámetros que muestran las pantallas. */
export const mapRules = (r) => ({
  franjaMin: r.reservation.slotMinutes,
  maxFranjas: r.reservation.maxSlotsPerReservation,
  anticipacionMaxDias: r.reservation.maxAdvanceDays,
  anticipacionMinMin: r.reservation.minAdvanceMinutes,
  toleranciaMin: r.reservation.bookingToleranceMinutes,
  cuotaSemanalHoras: r.quota.weeklyHours,
  cancelacionTardiaMin: r.cancellation.lateThresholdMinutes,
  checkinAntesMin: r.checkIn.opensMinutesBefore,
  checkinCierraAlFinal: r.checkIn.closesAtReservationEnd,
  recordatorioHoras: r.reminder.hoursBefore,
  inasistenciasSuspension: r.sanctions.noShowsForSuspension,
  diasSuspension: r.sanctions.suspensionDays,
  emailDomain: r.emailDomain,
})

/** Valores mientras carga GET /rules (los predeterminados del backend). */
export const DEFAULT_SETTINGS = {
  franjaMin: 60,
  maxFranjas: 2,
  anticipacionMaxDias: 6,
  anticipacionMinMin: 0,
  toleranciaMin: 10,
  cuotaSemanalHoras: 4,
  cancelacionTardiaMin: 60,
  checkinAntesMin: 10,
  checkinCierraAlFinal: true,
  recordatorioHoras: 2,
  inasistenciasSuspension: 3,
  diasSuspension: 7,
  emailDomain: '@unimagdalena.edu.co',
}
