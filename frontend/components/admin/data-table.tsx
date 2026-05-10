import { cn } from '@/lib/utils'

type Column<T> = {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  emptyMessage?: string
  rowClassName?: (row: T) => string
}

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  emptyMessage = 'Tidak ada data.',
  rowClassName,
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-black bg-white shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-ink border-b-2 border-black/10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs uppercase tracking-wider font-extrabold whitespace-nowrap',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-14 text-center text-ink-muted font-medium">
                {emptyMessage}
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
                    ? col.render(row)
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
