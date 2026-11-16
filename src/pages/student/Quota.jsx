import { useEffect } from 'react'
import { motion } from 'motion/react'
import { CalendarRange } from 'lucide-react'
import Progress from '@/components/smoothui/progress'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import AnimatedNumber from '@/components/app/AnimatedNumber'
import { ReservationBadge } from '@/components/app/StatusBadge'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import {
  COUNTS_FOR_QUOTA,
  addDays,
  bogotaParts,
  formatDate,
  formatRange,
  mondayOf,
  todayISO,
} from '@/data/domain'
import { useApp } from '@/store'

export default function Quota() {
  const { quota, reservations, refreshQuota, refreshReservations } = useApp()

  // GET /quota/me: la cuota se calcula en el servidor, no se guarda como saldo (RN-16).
  useEffect(() => {
    refreshQuota().catch(() => {})
    refreshReservations().catch(() => {})
  }, [refreshQuota, refreshReservations])

  const monday = quota?.weekStart ?? mondayOf(todayISO())
  const sunday = addDays(monday, 6)
  const resetDate = quota ? bogotaParts(quota.resetAt).date : addDays(monday, 7)

  const weekReservations = reservations
    .filter((r) => r.date >= monday && r.date <= sunday)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi cuota semanal"
        subtitle="La semana inicia el lunes a las 00:00 · America/Bogota."
      />

      <motion.section
        className="rounded-2xl border border-border bg-card p-7 shadow-xs md:p-9"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
          <CalendarRange className="size-5 text-accent-ink" />
          Semana del {formatDate(monday, { weekday: undefined })} al{' '}
          {formatDate(sunday, { weekday: undefined })}
        </h2>

        {quota ? (
          <>
            <div className="mt-7 grid grid-cols-2 gap-6 md:max-w-md">
              <div>
                <p className="font-display text-5xl font-bold text-foreground">
                  <AnimatedNumber value={quota.used} />
                  <span className="text-2xl"> h</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">usadas</p>
              </div>
              <div>
                <p className="font-display text-5xl font-bold text-accent-ink">
                  <AnimatedNumber value={quota.left} />
                  <span className="text-2xl"> h</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">disponibles</p>
              </div>
            </div>

            <div className="mt-7">
              <Progress
                aria-label="Horas usadas de la semana"
                max={quota.max}
                size="lg"
                value={Math.min(quota.used, quota.max)}
              />
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              Reinicio: {formatDate(resetDate)} · Cuota máxima: {quota.max} h
            </p>
          </>
        ) : (
          <div className="mt-7 space-y-4">
            <Skeleton className="h-14 w-64" />
            <Skeleton className="h-3 w-full" />
          </div>
        )}
      </motion.section>

      <section className="space-y-4">
        <motion.h2
          className="font-display text-xl font-semibold text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
        >
          Movimientos de la semana
        </motion.h2>
        {weekReservations.length === 0 ? (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            No tienes reservas en esta semana.
          </motion.p>
        ) : (
          <motion.ul className="space-y-3" {...staggerParent}>
            {weekReservations.map((r) => (
              <motion.li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-xs"
                {...staggerChild}
              >
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground">{r.spaceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(r.date)} · {formatRange(r.startHour, r.hours)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ReservationBadge estado={r.estado} />
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {COUNTS_FOR_QUOTA.includes(r.estado) ? `${r.hours} h` : '0 h'}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>
    </div>
  )
}
