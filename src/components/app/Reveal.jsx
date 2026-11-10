import { motion } from 'motion/react'
import { DUR, EASE } from '@/lib/anim'

/** Entrada lenta y suave con desplazamiento + desenfoque. */
export default function Reveal({ children, delay = 0, className, ...props }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: DUR.item, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
