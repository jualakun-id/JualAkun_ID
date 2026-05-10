import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg border-2 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal transition-colors duration-150 focus:outline-none focus:ring-2',
      error
        ? 'border-danger focus:border-danger focus:ring-danger/40'
        : 'border-black/15 focus:border-brand-500 focus:ring-brand-500/25',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
