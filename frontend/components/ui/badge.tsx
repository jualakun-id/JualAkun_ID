import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        terlaris: 'bg-warning/15 text-warning border-warning/30',
        garansi: 'bg-success/15 text-success border-success/30',
        instan: 'bg-accent/15 text-accent border-accent/30',
        habis: 'bg-danger/15 text-danger border-danger/30',
        baru: 'bg-primary/15 text-primary-light border-primary/30',
        diskon: 'bg-warning text-zinc-950 font-bold border-transparent',
      },
    },
    defaultVariants: { variant: 'instan' },
  },
)

type Props = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: Props) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
