// Preajustes de animación compartidos — deliberadamente lentos y suaves.
export const EASE = [0.22, 1, 0.36, 1]

export const DUR = {
  page: 0.9,
  item: 0.8,
  micro: 0.5,
}

export const springSlow = {
  type: 'spring',
  stiffness: 55,
  damping: 16,
  mass: 1.1,
}

export const pageVariants = {
  initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DUR.page, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(4px)',
    transition: { duration: 0.45, ease: EASE },
  },
}

export const staggerParent = {
  initial: 'hidden',
  animate: 'show',
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
  },
}

export const staggerChild = {
  variants: {
    hidden: { opacity: 0, y: 22, filter: 'blur(5px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: DUR.item, ease: EASE },
    },
  },
}

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(5px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DUR.item, ease: EASE, delay },
  },
})
