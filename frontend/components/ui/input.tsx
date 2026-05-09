import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg border bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-subtle transition-colors duration-150 focus:outline-none focus:ring-2',
      error
        ? 'border-danger focus:border-danger focus:ring-danger/50'
        : 'border-border focus:border-primary focus:ring-primary/50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
