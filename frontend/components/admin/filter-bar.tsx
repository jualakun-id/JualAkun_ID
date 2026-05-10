import Link from 'next/link'
import { Search } from 'lucide-react'
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
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-black bg-white p-3 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      {pills && pills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {pills.map((p) => (
            <Link
              key={p.value}
              href={p.href}
              className={cn(
                'rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-colors',
                activeValue === p.value
                  ? 'border-black bg-brand-500 text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)]'
                  : 'border-black/15 bg-white text-ink-muted hover:border-brand-400 hover:text-brand-700',
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      ) : null}

      {searchQuery ? (
        <form className="flex-1 min-w-[200px] relative">
          <Search
            size={16}
            strokeWidth={2.25}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            name={searchQuery.name}
            placeholder={searchQuery.placeholder}
            defaultValue={searchQuery.defaultValue}
            className="w-full rounded-lg border-2 border-black/15 bg-white pl-10 pr-3.5 py-2 text-sm font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
        </form>
      ) : null}

      {rightSlot ? <div className="ml-auto">{rightSlot}</div> : null}
    </div>
  )
}
