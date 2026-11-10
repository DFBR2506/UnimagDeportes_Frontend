import { motion } from 'motion/react'
import AccordionRoot, {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@/components/smoothui/accordion'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { useApp } from '@/store'

const EXPLAIN = [
  {
    q: '¿Qué pasa si no asisto?',
    a: 'La reserva queda como inasistencia y sus horas siguen contando en tu cuota. Tres inasistencias en 30 días suspenden tu cuenta por 7 días.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, desde Mis reservas y sin autorización del administrador. Si faltan menos de 60 minutos para el inicio, la cancelación es tardía y las horas no se devuelven.',
  },
  {
    q: '¿Cómo confirmo mi asistencia?',
    a: 'Escanea el QR fijo impreso en la entrada del espacio. La ventana va desde 10 minutos antes del inicio hasta el fin de la tolerancia.',
  },
  {
    q: '¿Las reservas tienen costo?',
    a: 'No. No hay cobros monetarios: el único mecanismo de control es la cuota semanal de horas, igual para todas las personas.',
  },
]

export default function Rules() {
  const { settings } = useApp()

  const rows = [
    ['Franja', `${settings.franjaMin} minutos`],
    ['Duración máxima', `${settings.maxFranjas} franjas consecutivas (${settings.maxFranjas} horas)`],
    ['Cuota semanal', `${settings.cuotaSemanalHoras} horas`],
    ['Anticipación máxima', `${settings.anticipacionMaxDias} días`],
    ['Tolerancia', `${settings.toleranciaMin} minutos`],
    ['Cancelación tardía', `Menos de ${settings.cancelacionTardiaMin} minutos`],
    ['Ventana de check-in', settings.ventanaCheckin],
    ['Suspensión', settings.suspension],
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reglas de uso"
        subtitle="Valores vigentes configurados para todas las personas."
      />

      <motion.section
        className="rounded-2xl border border-border bg-card px-7 shadow-xs"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <motion.dl className="divide-y divide-border" {...staggerParent}>
          {rows.map(([label, value]) => (
            <motion.div
              key={label}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              {...staggerChild}
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-medium text-card-foreground">{value}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.section>

      <section className="space-y-4">
        <motion.h2
          className="font-display text-xl font-semibold text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          En lenguaje claro
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}
        >
          <AccordionRoot className="rounded-2xl border border-border bg-card px-5 shadow-xs">
            {EXPLAIN.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionHeader>
                  <AccordionTrigger>{q}</AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel>{a}</AccordionPanel>
              </AccordionItem>
            ))}
          </AccordionRoot>
        </motion.div>
      </section>
    </div>
  )
}
