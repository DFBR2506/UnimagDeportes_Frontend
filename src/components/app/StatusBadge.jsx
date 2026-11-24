import Badge from '@/components/smoothui/badge'
import { RESERVATION_STATES } from '@/data/domain'

const SLOT_VARIANTS = {
  libre: 'success',
  ocupada: 'secondary',
  bloqueada: 'warning',
  mia: 'default',
}

export function ReservationBadge({ estado }) {
  const meta = RESERVATION_STATES[estado]
  if (!meta) return null
  return <Badge variant={meta.badge}>{meta.label}</Badge>
}

export function SlotBadge({ estado, motivo }) {
  const label =
    estado === 'libre'
      ? 'Libre'
      : estado === 'ocupada'
        ? 'Ocupada'
        : estado === 'mia'
          ? 'Tu reserva'
          : `Bloqueada · ${motivo ?? 'Institucional'}`
  return <Badge variant={SLOT_VARIANTS[estado] ?? 'secondary'}>{label}</Badge>
}
