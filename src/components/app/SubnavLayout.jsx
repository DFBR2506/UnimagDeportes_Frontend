import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import FloatingNavbar from '@/components/smoothui/floating-navbar'
import { pageVariants } from '@/lib/anim'
import { cn } from '@/lib/utils'

/**
 * Sección con subsecciones bajo una barra flotante (estilo Disney+) anclada justo
 * debajo de la topbar. `tabs`: [{ id: ruta, label, icon }].
 * Se usa en Mis reservas (estudiante) y en Espacios (administrador).
 */
export default function SubnavLayout({ tabs, className = 'max-w-5xl' }) {
  const location = useLocation()
  const navigate = useNavigate()
  // useOutlet captura el elemento actual: la vista saliente conserva su contenido durante la transición.
  const outlet = useOutlet()

  return (
    <div className={cn('mx-auto', className)}>
      <div className="pointer-events-none sticky top-20 z-30 -mt-2 mb-8 flex justify-center">
        <FloatingNavbar
          activeId={location.pathname}
          className="pointer-events-auto static max-w-[calc(100vw-1.5rem)] overflow-x-auto border-border bg-card/85 shadow-lg shadow-sidebar/10"
          hideOnScroll={false}
          items={tabs.map((t) => ({ ...t, onSelect: () => navigate(t.id) }))}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
