import Link from 'next/link'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Column<T> = {
  key: string
  header: string
  render?: (row: T, index: number) => React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
  /** Set untuk membuat kolom sortable. Value = nama field di backend (mis. 'price', 'created_at') */
  sortKey?: string
}

export type SortDir = 'asc' | 'desc'

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  emptyMessage?: string
  rowClassName?: (row: T) => string
  /** Untuk sortable: nama field yang sedang aktif sort (match column.sortKey) */
  sortBy?: string | null
  /** Arah sort sekarang */
  sortDir?: SortDir
  /**
   * Base path untuk build href tiap sortable header.
   * Path harus include semua filter params kecuali sort_by, sort_dir, page.
   * (DataTable akan append sort_by, sort_dir, dan reset page=1.)
   */
  sortBasePath?: string
}

/**
 * Build href untuk sortable column: keep filter params, set sort_by + sort_dir,
 * reset page ke 1. Toggle dir kalau klik kolom yang sama.
 */
function buildSortHref(basePath: string, sortKey: string, currentBy: string | null | undefined, currentDir: SortDir | undefined): string {
  const nextDir: SortDir = currentBy === sortKey && currentDir === 'asc' ? 'desc' : 'asc'
  const sep = basePath.includes('?') ? '&' : '?'
  return `${basePath}${sep}sort_by=${sortKey}&sort_dir=${nextDir}&page=1`
}

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  emptyMessage = 'Tidak ada data.',
  rowClassName,
  sortBy,
  sortDir,
  sortBasePath,
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-black bg-white shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-ink border-b-2 border-black/10">
          <tr>
            {columns.map((col) => {
              const isActive = col.sortKey && sortBy === col.sortKey
              const Icon = !col.sortKey
                ? null
                : isActive
                  ? sortDir === 'asc'
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown
              const headerContent = (
                <span
                  className={cn(
                    'inline-flex items-center gap-1',
                    col.align === 'right' ? 'justify-end w-full' : col.align === 'center' ? 'justify-center w-full' : '',
                  )}
                >
                  {col.header}
                  {Icon ? (
                    <Icon
                      size={12}
                      strokeWidth={2.5}
                      className={isActive ? 'text-brand-700' : 'text-ink-muted/60'}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
              )

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs uppercase tracking-wider font-extrabold whitespace-nowrap',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.className,
                  )}
                  aria-sort={
                    isActive
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : col.sortKey
                        ? 'none'
                        : undefined
                  }
                >
                  {col.sortKey && sortBasePath ? (
                    <Link
                      href={buildSortHref(sortBasePath, col.sortKey, sortBy ?? null, sortDir)}
                      className={cn(
                        'inline-flex hover:text-brand-700 transition-colors cursor-pointer',
                        isActive && 'text-brand-700',
                      )}
                      scroll={false}
                    >
                      {headerContent}
                    </Link>
                  ) : (
                    headerContent
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-14 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border-2 border-brand-200 mb-3">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </div>
                <p className="text-ink-muted font-medium">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  'border-b border-black/5 last:border-b-0 hover:bg-brand-50/50 transition-colors',
                  rowClassName?.(row),
                )}
              >
                {columns.map((col) => {
                  const value = col.render
                    ? col.render(row, idx)
                    : String((row as Record<string, unknown>)[col.key] ?? '')
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3.5 text-ink font-medium',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      )}
                    >
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
