import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import TabsRoot, {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@/components/smoothui/tabs'
import SmoothButton from '@/components/smoothui/smooth-button'
import Empty from '@/components/smoothui/empty'
import PageHeader from '@/components/app/PageHeader'
import { ReservationBadge } from '@/components/app/StatusBadge'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { formatDate, formatRange, todayISO } from '@/data/mock'
import { useApp } from '@/store'

function ReservationCard({ res, onCancel }) {
  const { spaceById, disciplineById } = useApp()
  const space = spaceById(res.spaceId)
  const discipline = disciplineById(res.disciplineId)
  const isToday = res.date === todayISO()
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="min-w-0 space-y-1">
        <p className="font-display font-semibold text-card-foreground">
          {space?.name} · {discipline?.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {isToday ? 'Hoy' : formatDate(res.date)} · {formatRange(res.startHour, res.hours)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ReservationBadge estado={res.estado} />
        {res.estado === 'confirmada' && (
          <SmoothButton color="destructive" onClick={() => onCancel(res)} size="sm" variant="soft">
            Cancelar
          </SmoothButton>
        )}
      </div>
    </div>
  )
}

function List({ items, onCancel, emptyText }) {
  if (items.length === 0) {
    return <Empty title="Nada por aquí" >{emptyText}</Empty>
  }
  return (
    <motion.div className="space-y-3" {...staggerParent}>
      {items.map((res) => (
        <motion.div key={res.id} {...staggerChild}>
          <ReservationCard onCancel={onCancel} res={res} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function MyReservations() {
  const navigate = useNavigate()
  const { reservations } = useApp()
  const today = todayISO()

  const upcoming = reservations
    .filter((r) => ['confirmada', 'en-uso'].includes(r.estado) && r.date >= today)
    .sort((a, b) => `${a.date}${a.startHour}`.localeCompare(`${b.date}${b.startHour}`))
  const past = reservations
    .filter((r) => !upcoming.includes(r))
    .sort((a, b) => `${b.date}${b.startHour}`.localeCompare(`${a.date}${a.startHour}`))

  const onCancel = (res) => navigate(`/app/mis-reservas/cancelar/${res.id}`)
  const checkable = upcoming.find((r) => r.date === today)

  return (
    <div className="space-y-8">
      <PageHeader title="Mis reservas" subtitle="Solo ves reservas creadas por ti." />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
      >
        <TabsRoot defaultValue="proximas">
          <TabsList variant="segment" className="max-w-sm">
            <TabsTab value="proximas">Próximas ({upcoming.length})</TabsTab>
            <TabsTab value="pasadas">Pasadas ({past.length})</TabsTab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel animated value="proximas">
            <List
              emptyText="Cuando reserves un espacio aparecerá aquí."
              items={upcoming}
              onCancel={onCancel}
            />
          </TabsPanel>
          <TabsPanel animated value="pasadas">
            <List emptyText="Aún no tienes historial." items={past} onCancel={onCancel} />
          </TabsPanel>
        </TabsRoot>
      </motion.div>

      {checkable && (
        <motion.section
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-sidebar p-6 text-sidebar-foreground shadow-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          <div className="space-y-1">
            <h2 className="font-display font-semibold">¿Vas a ingresar al espacio?</h2>
            <p className="text-sm text-sidebar-foreground/75">
              Usa el QR fijo del espacio dentro de la ventana de check-in.
            </p>
          </div>
          <SmoothButton
            color="amber"
            onClick={() => navigate(`/checkin/${checkable.spaceId}`)}
            prefix={<QrCode />}
            variant="solid"
          >
            Ver check-in
          </SmoothButton>
        </motion.section>
      )}
    </div>
  )
}
