import { motion } from 'motion/react'
import { DUR, EASE } from '@/lib/anim'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <motion.h1
          className="font-display text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl md:text-wrap"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: DUR.page, ease: EASE }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="max-w-2xl text-sm text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.item, ease: EASE, delay: 0.15 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div
          className="w-full *:w-full sm:w-auto sm:*:w-auto"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.item, ease: EASE, delay: 0.25 }}
        >
          {actions}
        </motion.div>
      )}
    </div>
  )
}
