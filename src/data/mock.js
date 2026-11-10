// Datos simulados del prototipo — sin backend real.

export const DISCIPLINES = [
  { id: 'baloncesto', name: 'Baloncesto' },
  { id: 'voleibol', name: 'Voleibol' },
  { id: 'futbol5', name: 'Fútbol 5' },
  { id: 'futbol11', name: 'Fútbol 11' },
  { id: 'tenis', name: 'Tenis de campo' },
]

export const INITIAL_SPACES = [
  {
    id: 'cancha-multiple',
    name: 'Cancha múltiple',
    disciplines: ['baloncesto', 'voleibol'],
    aforo: 20,
    open: 8,
    close: 20,
    estado: 'activo',
  },
  {
    id: 'cancha-tenis-1',
    name: 'Cancha de tenis 1',
    disciplines: ['tenis'],
    aforo: 4,
    open: 6,
    close: 18,
    estado: 'activo',
  },
  {
    id: 'cancha-tenis-2',
    name: 'Cancha de tenis 2',
    disciplines: ['tenis'],
    aforo: 4,
    open: 6,
    close: 18,
    estado: 'activo',
  },
  {
    id: 'cancha-futbol-5',
    name: 'Cancha fútbol 5',
    disciplines: ['futbol5'],
    aforo: 10,
    open: 7,
    close: 21,
    estado: 'mantenimiento',
  },
  {
    id: 'cancha-futbol-11',
    name: 'Cancha fútbol 11',
    disciplines: ['futbol11'],
    aforo: 22,
    open: 7,
    close: 21,
    estado: 'activo',
  },
]

export const INITIAL_SETTINGS = {
  toleranciaMin: 10,
  cancelacionTardiaMin: 60,
  franjaMin: 60,
  maxFranjas: 2,
  cuotaSemanalHoras: 4,
  anticipacionMaxDias: 10,
  ventanaCheckin: '10 min antes + tolerancia',
  suspension: '3 inasistencias en 30 días → 7 días',
}

export const RESERVATION_STATES = {
  confirmada: { label: 'Confirmada', badge: 'default' },
  'en-uso': { label: 'En uso', badge: 'success' },
  completada: { label: 'Completada', badge: 'secondary' },
  'cancelada-tiempo': { label: 'Cancelada a tiempo', badge: 'outline' },
  'cancelada-tardia': { label: 'Cancelada tardía', badge: 'warning' },
  inasistencia: { label: 'Inasistencia', badge: 'destructive' },
  'cancelada-admin': { label: 'Cancelada por administrador', badge: 'outline' },
}

// ---------------------------------------------------------------------------
// Fechas (zona horaria del navegador; el prototipo asume America/Bogota)
// ---------------------------------------------------------------------------

export const toISODate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toISODate(new Date())

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

export const formatHour = (h) => {
  const period = h < 12 ? 'a. m.' : 'p. m.'
  let hour = h % 12
  if (hour === 0) hour = 12
  return `${hour}:00 ${period}`
}

export const formatRange = (start, hours = 1) =>
  `${formatHour(start)}–${formatHour(start + hours)}`

/** Lunes de la semana a la que pertenece una fecha. */
export const mondayOf = (iso) => {
  const d = new Date(`${iso}T12:00:00`)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return toISODate(d)
}

/** Próximos N días (incluye hoy) — RN-14: anticipación máxima. */
export const nextDays = (n) => {
  const t = todayISO()
  return Array.from({ length: n + 1 }, (_, i) => addDays(t, i))
}

// ---------------------------------------------------------------------------
// Ocupación simulada pero determinista por (espacio, fecha, hora)
// ---------------------------------------------------------------------------

const hash = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

export const seededState = (spaceId, iso, hour) => {
  const h = hash(`${spaceId}|${iso}|${hour}`)
  const r = h % 100
  if (r < 12) return { estado: 'bloqueada', motivo: 'Clases' }
  if (r < 40) return { estado: 'ocupada' }
  return { estado: 'libre' }
}

export const seedReservations = () => {
  const today = todayISO()
  return [
    {
      id: 'res-seed-1',
      spaceId: 'cancha-multiple',
      disciplineId: 'baloncesto',
      date: today,
      startHour: 14,
      hours: 1,
      estado: 'confirmada',
      nombre: null,
    },
    {
      id: 'res-seed-2',
      spaceId: 'cancha-tenis-1',
      disciplineId: 'tenis',
      date: addDays(today, -3),
      startHour: 15,
      hours: 1,
      estado: 'completada',
      nombre: null,
    },
    {
      id: 'res-seed-3',
      spaceId: 'cancha-futbol-11',
      disciplineId: 'futbol11',
      date: addDays(today, -8),
      startHour: 18,
      hours: 1,
      estado: 'inasistencia',
      nombre: null,
    },
  ]
}
