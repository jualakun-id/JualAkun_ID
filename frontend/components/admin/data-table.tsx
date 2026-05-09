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
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-subtle">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-medium',
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
              <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className={cn(
                  'border-b border-border-subtle last:border-b-0 hover:bg-surface-2/50',
                  rowClassName?.(row),
                )}
              >
                {columns.map((col) => {
                  const value = col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-text',
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
