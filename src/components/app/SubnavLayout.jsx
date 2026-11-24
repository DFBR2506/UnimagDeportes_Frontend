import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import FloatingNavbar from '@/components/smoothui/floating-navbar'
import { pageVariants } from '@/lib/anim'
import { resetMobileScroll } from '@/lib/scroll'
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
      <div className="pointer-events-none sticky top-20 z-30 -mt-2 mb-6 flex justify-center md:mb-8">
        <FloatingNavbar
          activeId={location.pathname}
          // en móvil las pestañas se reparten el ancho, sin iconos, para verse todas sin desplazar
          className="pointer-events-auto static max-w-[calc(100vw-1.5rem)] overflow-x-auto border-border bg-card/85 shadow-lg shadow-sidebar/10 max-sm:w-full max-sm:px-1.5 max-sm:[&_button]:w-full max-sm:[&_button]:px-1 max-sm:[&_button]:py-2 max-sm:[&_button]:text-[13px] max-sm:[&_li]:flex-auto max-sm:[&_span[aria-hidden]]:hidden max-sm:[&_ul]:w-full max-sm:[&_ul]:gap-0"
          hideOnScroll={false}
          items={tabs.map((t) => ({ ...t, onSelect: () => navigate(t.id) }))}
        />
      </div>

      <AnimatePresence mode="wait" onExitComplete={resetMobileScroll}>
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
