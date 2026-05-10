import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'

type Item = { count: number; label: string; href: string; severity?: 'warn' | 'danger' }

export function ActionItems({ items }: { items: Item[] }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <h3 className="font-heading text-xl font-extrabold text-ink tracking-tight">Action Items</h3>
      <div className="mt-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex items-start gap-2.5 rounded-xl border-2 border-success/40 bg-success/10 px-3.5 py-3 text-sm font-medium text-success">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" strokeWidth={2.25} />
            <span><strong className="font-bold">Semua aman</strong> — tidak ada action item yang perlu ditangani.</span>
          </div>
        ) : (
          items.map((it, i) => (
            <Link
              key={i}
              href={it.href}
              className={`group flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                it.severity === 'danger'
                  ? 'border-danger/40 bg-danger/10 text-danger hover:bg-danger/15 hover:-translate-y-0.5'
                  : 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/15 hover:-translate-y-0.5'
              }`}
            >
              <AlertTriangle size={18} strokeWidth={2.25} className="shrink-0" />
              <span className="flex-1">
                <strong className="font-extrabold">{it.count}</strong> {it.label}
              </span>
              <ChevronRight size={16} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
