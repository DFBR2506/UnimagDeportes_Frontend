import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, QrCode, ScrollText, TriangleAlert } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Progress from '@/components/smoothui/progress'
import Alert from '@/components/smoothui/alert'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import AnimatedNumber from '@/components/app/AnimatedNumber'
import { staggerChild, staggerParent } from '@/lib/anim'
import { ACTIVE_STATES, bogotaParts, formatDate, formatRange, todayISO } from '@/data/domain'
import { useApp } from '@/store'

export default function Home() {
  const navigate = useNavigate()
  const { session, quota, reservations } = useApp()

  const now = Date.now()
  // próxima reserva activa que aún no termina
  const next = reservations
    .filter((r) => ACTIVE_STATES.includes(r.estado) && new Date(r.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0]

  const firstName = session.name?.split(' ')[0] ?? 'deportista'
  const suspendedUntil = session.suspendedUntil ? bogotaParts(session.suspendedUntil).date : null

  const quickLinks = [
    {
      to: '/app/mis-reservas',
      icon: ClipboardList,
      title: 'Mis reservas',
      text: next
        ? `Próxima: ${next.spaceName} · ${next.date === todayISO() ? 'hoy' : formatDate(next.date)} · ${formatRange(next.startHour, next.hours)}`
        : 'Aún no tienes reservas próximas',
    },
    {
      to: next ? `/checkin/${next.spaceId}` : '/app/mis-reservas',
      icon: QrCode,
      title: 'Check-in QR',
      text: 'Confirma asistencia al ingresar al espacio',
    },
    {
      to: '/app/mis-reservas/reglas',
      icon: ScrollText,
      title: 'Reglas de uso',
      text: 'Consulta los valores vigentes del sistema',
    },
  ]

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Hola, ${firstName}`}
        subtitle="Tu actividad deportiva universitaria, en un solo lugar."
      />

      {suspendedUntil && (
        <Alert icon={<TriangleAlert className="size-4" />} title="Cuenta suspendida" variant="destructive">
          No puedes crear reservas hasta el {formatDate(suspendedUntil)}. Puedes seguir consultando tus
          reservas. (RN-40)
        </Alert>
      )}

      <motion.div className="grid gap-5 lg:grid-cols-5" {...staggerParent}>
        <motion.section
          className="relative overflow-hidden rounded-2xl bg-sidebar p-7 text-sidebar-foreground shadow-lg lg:col-span-3"
          {...staggerChild}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-sidebar-primary/20 blur-2xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative space-y-4">
            <h2 className="font-display text-2xl font-semibold">Reserva tu próximo espacio</h2>
            <p className="text-sm text-sidebar-foreground/75">
              Consulta franjas libres y confirma en segundos.
            </p>
            <SmoothButton
              color="amber"
              onClick={() => navigate('/app/disponibilidad')}
              suffix={<ArrowRight />}
              variant="solid"
            >
              Consultar disponibilidad
            </SmoothButton>
          </div>
        </motion.section>

        <motion.section
          className="rounded-2xl border border-border bg-card p-7 shadow-xs lg:col-span-2"
          {...staggerChild}
        >
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            Mi cuota semanal
          </h2>
          {quota ? (
            <>
              <p className="mt-3 font-display text-4xl font-bold text-foreground">
                <AnimatedNumber value={quota.used} /> h{' '}
                <span className="text-base font-medium text-muted-foreground">usadas</span>
              </p>
              <div className="mt-4">
                <Progress aria-label="Cuota semanal" max={quota.max} value={Math.min(quota.used, quota.max)} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {quota.left} h disponibles · reinicia el lunes
              </p>
            </>
          ) : (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          )}
        </motion.section>
      </motion.div>

      <section className="space-y-4">
        <motion.h2
          className="font-display text-xl font-semibold text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Accesos rápidos
        </motion.h2>
        <motion.div className="space-y-3" {...staggerParent}>
          {quickLinks.map(({ to, icon: Icon, title, text }) => (
            <motion.div key={title} {...staggerChild}>
              <Link
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-colors duration-300 hover:border-accent/40 hover:bg-accent/5 focus-ring"
                to={to}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-ink">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-card-foreground">{title}</span>
                  <span className="block truncate text-sm text-muted-foreground">{text}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-ink" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
