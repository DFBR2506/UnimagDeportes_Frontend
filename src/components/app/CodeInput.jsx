import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/smoothui/otp-slots'
import { cn } from '@/lib/utils'

const SLOT_CLASS =
  'h-12 w-full max-w-11 min-w-0 rounded-xl bg-background font-display text-xl text-foreground sm:h-14 sm:w-13 sm:max-w-none sm:text-2xl data-[active=true]:border-accent data-[active=true]:ring-accent/30'

/** Código de 6 dígitos (RN-51) con el componente OTP de SmoothUI. */
export default function CodeInput({ value, onChange, onComplete, invalid, className, ...props }) {
  const slot = cn(SLOT_CLASS, invalid && 'border-destructive')
  return (
    <InputOTP
      autoFocus
      containerClassName={cn('justify-center gap-2 sm:gap-3', className)}
      maxLength={6}
      onChange={onChange}
      onComplete={onComplete}
      value={value}
      {...props}
    >
      <InputOTPGroup className="min-w-0 flex-1 justify-end gap-1.5 sm:flex-none sm:gap-2">
        {[0, 1, 2].map((i) => (
          <InputOTPSlot key={i} className={slot} index={i} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="min-w-0 flex-1 gap-1.5 sm:flex-none sm:gap-2">
        {[3, 4, 5].map((i) => (
          <InputOTPSlot key={i} className={slot} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
