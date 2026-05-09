import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

type Item = { count: number; label: string; href: string; severity?: 'warn' | 'danger' }

export function ActionItems({ items }: { items: Item[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="font-heading text-h3">Action Items</h3>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-3 text-sm text-success">
            Semua aman — tidak ada action item.
          </p>
        ) : (
          items.map((it, i) => (
            <Link
              key={i}
              href={it.href}
              className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors ${
                it.severity === 'danger'
                  ? 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/15'
                  : 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/15'
              }`}
            >
              <AlertTriangle size={16} strokeWidth={1.5} />
              <span><strong>{it.count}</strong> {it.label}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
