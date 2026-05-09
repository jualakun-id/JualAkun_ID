import Link from 'next/link'
import { cn } from '@/lib/utils'

type Pill = { label: string; value: string; href: string }

type Props = {
  pills?: Pill[]
  activeValue?: string
  searchQuery?: { name: string; placeholder: string; defaultValue?: string }
  rightSlot?: React.ReactNode
}

export function FilterBar({ pills, activeValue, searchQuery, rightSlot }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3">
      {pills && pills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {pills.map((p) => (
            <Link
              key={p.value}
              href={p.href}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-medium',
                activeValue === p.value
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-surface-2 text-text-muted hover:text-text',
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      ) : null}

      {searchQuery ? (
        <form className="flex-1 min-w-[200px]">
          <input
            type="search"
            name={searchQuery.name}
            placeholder={searchQuery.placeholder}
            defaultValue={searchQuery.defaultValue}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none"
          />
        </form>
      ) : null}

      {rightSlot ? <div className="ml-auto">{rightSlot}</div> : null}
    </div>
  )
}
