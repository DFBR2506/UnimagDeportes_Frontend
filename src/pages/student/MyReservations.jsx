import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, QrCode } from 'lucide-react'
import TabsRoot, { TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/smoothui/tabs'
import SmoothButton from '@/components/smoothui/smooth-button'
import Empty from '@/components/smoothui/empty'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import { ReservationBadge } from '@/components/app/StatusBadge'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { ACTIVE_STATES, formatDate, formatRange, todayISO } from '@/data/domain'
import { useApp } from '@/store'

function ReservationCard({ res, onCancel }) {
  const isToday = res.date === todayISO()
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="min-w-0 space-y-1">
        <p className="font-display font-semibold text-card-foreground">{res.spaceName}</p>
        <p className="text-sm text-muted-foreground">
          {isToday ? 'Hoy' : formatDate(res.date)} · {formatRange(res.startHour, res.hours)}
        </p>
        {res.equipment.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="size-3.5" />
            {res.equipment.map((e) => `${e.quantity} × ${e.name}`).join(' · ')}
          </p>
        )}
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
    return <Empty description={emptyText} title="Nada por aquí" />
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
  const { reservations, refreshReservations } = useApp()
  const [loaded, setLoaded] = useState(false)

  // GET /reservations/mine: siempre fresco al entrar (el ciclo de vida cambia estados en el servidor).
  useEffect(() => {
    refreshReservations()
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [refreshReservations])

  const now = Date.now()
  const upcoming = reservations
    .filter((r) => ACTIVE_STATES.includes(r.estado) && new Date(r.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  const past = reservations
    .filter((r) => !upcoming.includes(r))
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))

  const onCancel = (res) => navigate(`/app/mis-reservas/cancelar/${res.id}`)
  const today = todayISO()
  const checkable = upcoming.find((r) => r.date === today)

  return (
    <div className="space-y-8">
      <PageHeader title="Mis reservas" subtitle="Solo ves reservas creadas por ti." />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
      >
        {!loaded && reservations.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <TabsRoot defaultValue="proximas">
            <TabsList variant="segment" className="max-w-sm">
              <TabsTab value="proximas">Próximas ({upcoming.length})</TabsTab>
              <TabsTab value="pasadas">Historial ({past.length})</TabsTab>
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
        )}
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
              Escanea el QR fijo del espacio dentro de la ventana de check-in.
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
