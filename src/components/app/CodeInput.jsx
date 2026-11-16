import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/smoothui/otp-slots'
import { cn } from '@/lib/utils'

const SLOT_CLASS =
  'h-14 w-11 rounded-xl bg-background font-display text-2xl text-foreground sm:w-13 data-[active=true]:border-accent data-[active=true]:ring-accent/30'

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
      <InputOTPGroup className="gap-1.5 sm:gap-2">
        {[0, 1, 2].map((i) => (
          <InputOTPSlot key={i} className={slot} index={i} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="gap-1.5 sm:gap-2">
        {[3, 4, 5].map((i) => (
          <InputOTPSlot key={i} className={slot} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
