import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white shadow-sm hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
        secondary:
          'bg-white text-ink border border-gray-200 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50',
        ghost:
          'bg-transparent text-ink-muted hover:bg-gray-50 hover:text-ink',
        danger:
          'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
      },
      size: {
        sm: 'px-4 py-1.5 text-xs',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
