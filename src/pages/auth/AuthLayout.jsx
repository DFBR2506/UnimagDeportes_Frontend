import { AnimatePresence, motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import Toaster from '@/components/smoothui/toast'
import Logo from '@/components/app/Logo'
import { DUR, EASE, pageVariants } from '@/lib/anim'
import { cn } from '@/lib/utils'
import { useApp } from '@/store'
import { resolveAccessProgress } from './accessSteps'

/** Progreso del acceso (correo → código → perfil); no aparece en la bienvenida. */
function StepIndicator({ pathname, needsName }) {
  const progress = resolveAccessProgress(pathname, needsName)
  if (!progress) return null
  const { steps, current } = progress
  return (
    <ol aria-label="Progreso del acceso" className="mb-6 flex items-center justify-center gap-1.5 sm:mb-8 sm:gap-2">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.label} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 && (
              <span className={cn('h-px w-3 transition-colors duration-500 min-[360px]:w-6 sm:w-10', done || active ? 'bg-accent' : 'bg-border')} />
            )}
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors min-[360px]:px-2.5 duration-500',
                active && 'bg-accent text-accent-foreground',
                done && 'bg-surface-success text-accent-ink',
                !active && !done && 'text-muted-foreground'
              )}
            >
              {done ? <Check className="size-3.5" /> : <span className="tabular-nums">{i + 1}</span>}
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Marco del flujo de acceso (UC01): franja superior institucional,
 * tarjeta central que encierra todo el proceso y pie con la universidad.
 */
export default function AuthLayout() {
  const location = useLocation()
  const { me } = useApp()
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Fondo decorativo animado, muy lento */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-48 right-[-20%] h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-3xl"
        animate={{ y: [0, 36, 0], x: [0, -24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-[-15%] h-[30rem] w-[30rem] rounded-full bg-sidebar-primary/15 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.header
        className="relative z-10 border-b-4 border-sidebar-primary bg-sidebar text-sidebar-foreground"
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ duration: DUR.page, ease: EASE }}
      >
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-center px-6 md:max-w-lg">
          <Logo className="text-base" />
        </div>
      </motion.header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-6 md:items-center md:py-12">
        {/* todo el proceso de acceso vive dentro de una misma tarjeta */}
        <motion.div
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/95 text-center shadow-2xl shadow-sidebar/10 backdrop-blur-sm md:max-w-lg"
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DUR.page, ease: EASE, delay: 0.1 }}
        >
          <div aria-hidden className="h-1.5 bg-gradient-to-r from-sidebar via-accent to-sidebar" />
          <div className="px-5 pt-7 pb-8 sm:px-10 sm:pt-10 sm:pb-11">
            <StepIndicator needsName={Boolean(me?.needsName)} pathname={location.pathname} />
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <motion.footer
        className="relative z-10 pb-6 text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.item, ease: EASE, delay: 0.6 }}
      >
        Universidad del Magdalena · Unimag Deportes
      </motion.footer>
      <Toaster />
    </div>
  )
}
