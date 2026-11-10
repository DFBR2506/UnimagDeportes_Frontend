import { AnimatePresence, motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import Toaster from '@/components/smoothui/toast'
import Logo from '@/components/app/Logo'
import { DUR, EASE, pageVariants } from '@/lib/anim'

/**
 * Marco del flujo de acceso (UC01): franja superior institucional,
 * tarjeta central y pie con la universidad.
 */
export default function AuthLayout() {
  const location = useLocation()
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
        <div className="mx-auto flex h-16 w-full max-w-md items-center px-6 md:max-w-lg">
          <Logo className="text-base" />
        </div>
      </motion.header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-10 pt-10 md:items-center md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="w-full max-w-md md:max-w-lg"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.footer
        className="relative z-10 pb-6 text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.item, ease: EASE, delay: 0.6 }}
      >
        Universidad del Magdalena · Prototipo académico simulado
      </motion.footer>
      <Toaster />
    </div>
  )
}
