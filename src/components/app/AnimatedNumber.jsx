import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { EASE } from '@/lib/anim'

/** Contador que sube lentamente hasta el valor final. */
export default function AnimatedNumber({ value, suffix = '', className, duration = 1.6 }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => `${Math.round(v)}${suffix}`)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) {
      mv.set(value)
      return
    }
    started.current = true
    const controls = animate(mv, value, { duration, ease: EASE, delay: 0.3 })
    return () => controls.stop()
  }, [value, duration, mv])

  return <motion.span className={className}>{rounded}</motion.span>
}
