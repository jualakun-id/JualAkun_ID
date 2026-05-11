'use client'

import { useEffect, useState } from 'react'
import { X, Check, ChevronDown, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

type Product = {
  id: string
  name: string
  slug: string
}

type Props = {
  value: string[] | null
  onChange: (value: string[] | null) => void
  disabled?: boolean
}

/**
 * Multi-select produk untuk valid_for_products kupon. Null = berlaku semua
 * produk (default kupon). Array = restricted hanya ke produk ter-pilih.
 */
export function ProductMultiSelect({ value, onChange, disabled }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.get<{ products: Product[] }>('/admin/products?limit=100').then((result) => {
      if (cancelled) return
      setLoading(false)
      if (result.ok) setProducts(result.data.products)
    })
    return () => { cancelled = true }
  }, [])

  const selected = value ?? []
  const isAll = value === null || value.length === 0

  function toggle(id: string) {
    const current = value ?? []
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    onChange(next.length === 0 ? null : next)
  }

  function selectAll() {
    onChange(null)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading}
        className="w-full inline-flex items-center justify-between gap-2 rounded-lg border-2 border-black/15 bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-brand-400 focus:border-brand-500 focus:outline-none disabled:opacity-50"
      >
        <span className="truncate">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-ink-muted"><Loader2 size={12} className="animate-spin" /> Memuat...</span>
          ) : isAll ? (
            <span className="text-ink-muted">Semua produk</span>
          ) : (
            <span className="text-ink">{selected.length} produk dipilih</span>
          )}
        </span>
        <ChevronDown size={14} strokeWidth={2.5} className="shrink-0 text-ink-muted" />
      </button>

      {open && !loading ? (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border-2 border-black bg-white shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <button
            type="button"
            onClick={selectAll}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b border-black/10 hover:bg-brand-50 ${isAll ? 'bg-brand-50 text-brand-700' : 'text-ink-muted'}`}
          >
            {isAll ? <Check size={14} strokeWidth={2.5} /> : <span className="w-3.5" />}
            Semua produk (tanpa restriction)
          </button>
          {products.map((p) => {
            const checked = selected.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-brand-50 ${checked ? 'bg-brand-50/60' : ''}`}
              >
                {checked ? (
                  <Check size={14} strokeWidth={2.5} className="text-brand-700" />
                ) : (
                  <span className="w-3.5" />
                )}
                <span className={`text-left flex-1 ${checked ? 'font-bold text-ink' : 'text-ink-muted'}`}>{p.name}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      {!isAll && !open ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.slice(0, 5).map((id) => {
            const p = products.find((x) => x.id === id)
            return (
              <span key={id} className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-bold text-brand-700">
                {p?.name ?? id.slice(0, 8)}
                <button type="button" onClick={() => toggle(id)} className="hover:text-brand-900">
                  <X size={10} strokeWidth={3} />
                </button>
              </span>
            )
          })}
          {selected.length > 5 ? (
            <span className="text-xs text-ink-subtle italic">+{selected.length - 5} lain</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
