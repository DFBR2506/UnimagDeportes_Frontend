import { cn } from '@/lib/utils'

/** Escudo del Área de Deportes (public/logo.svg) + nombre. */
export default function Logo({ className, compact = false, markClassName }) {
  return (
    <span className={cn('inline-flex select-none items-center gap-2.5 font-display', className)}>
      <img alt="" className={cn('size-9 shrink-0', markClassName)} draggable={false} src="/logo.svg" />
      <span className="inline-flex items-baseline gap-1">
        <span className="font-bold tracking-tight">UNIMAG</span>
        {!compact && <span className="font-semibold text-sidebar-primary tracking-tight">DEPORTES</span>}
      </span>
    </span>
  )
}
