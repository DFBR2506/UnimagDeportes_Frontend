import { useEffect } from 'react'
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

/** Explicaciones en lenguaje claro, con los valores vigentes de GET /rules. */
const explain = (s) => [
  {
    q: '¿Qué pasa si no asisto?',
    a: `La reserva queda como inasistencia y sus horas siguen contando en tu cuota. Con ${s.inasistenciasSuspension} inasistencias en el mismo mes calendario tu cuenta se suspende por ${s.diasSuspension} días.`,
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: `Sí, desde Mis reservas y sin autorización del administrador, mientras no hayas hecho check-in. Si faltan menos de ${s.cancelacionTardiaMin} minutos para el inicio, la cancelación es tardía y las horas no se devuelven.`,
  },
  {
    q: '¿Cómo confirmo mi asistencia?',
    a: `Escanea el QR fijo impreso en la entrada del espacio. La ventana abre ${s.checkinAntesMin} minutos antes del inicio${s.checkinCierraAlFinal ? ' y cierra cuando termina la reserva' : ` y cierra hasta ${s.checkinCierraMinDespues} minutos después del fin, inclusive`}.`,
  },
  {
    q: '¿Puedo pedir implementos?',
    a: 'Sí, al confirmar la reserva puedes solicitar implementos opcionales según las unidades libres en esa franja.',
  },
  {
    q: '¿Las reservas tienen costo?',
    a: 'No. No hay cobros monetarios: el único mecanismo de control es la cuota semanal de horas, igual para todas las personas.',
  },
]

export default function Rules() {
  const { settings, refreshRules } = useApp()

  useEffect(() => {
    refreshRules().catch(() => {})
  }, [refreshRules])

  const rows = [
    ['Franja', `${settings.franjaMin} minutos`],
    [
      'Duración máxima',
      `${settings.maxFranjas} franjas consecutivas (${(settings.maxFranjas * settings.franjaMin) / 60} horas)`,
    ],
    ['Cuota semanal', `${settings.cuotaSemanalHoras} horas`],
    ['Anticipación máxima', `${settings.anticipacionMaxDias} días`],
    ['Tolerancia', `${settings.toleranciaMin} minutos tras el inicio`],
    ['Cancelación tardía', `Menos de ${settings.cancelacionTardiaMin} minutos`],
    [
      'Ventana de check-in',
      `${settings.checkinAntesMin} min antes${settings.checkinCierraAlFinal ? ' hasta el fin de la reserva' : ` hasta ${settings.checkinCierraMinDespues} min después del fin`}`,
    ],
    ['Recordatorio', `${settings.recordatorioHoras} horas antes por correo`],
    [
      'Suspensión',
      `${settings.inasistenciasSuspension} inasistencias en el mes → ${settings.diasSuspension} días`,
    ],
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Reglas de uso"
        subtitle="Valores vigentes configurados para todas las personas."
      />

      <motion.section
        className="rounded-2xl border border-border bg-card px-5 shadow-xs sm:px-7"
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
          <AccordionRoot className="rounded-2xl border border-border bg-card px-2 shadow-xs sm:px-5">
            {explain(settings).map(({ q, a }) => (
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
