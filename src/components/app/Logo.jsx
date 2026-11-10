import { cn } from '@/lib/utils'

export default function Logo({ className, compact = false }) {
  return (
    <span className={cn('inline-flex select-none items-baseline gap-1 font-display', className)}>
      <span className="font-bold tracking-tight">UNIMAG</span>
      {!compact && <span className="font-semibold text-sidebar-primary tracking-tight">DEPORTES</span>}
    </span>
  )
}
