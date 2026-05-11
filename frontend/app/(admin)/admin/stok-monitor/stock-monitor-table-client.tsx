'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Boxes } from 'lucide-react'
import { DataTable, type SortDir } from '@/components/admin/data-table'
import { StockBadge } from '@/components/admin/stock-badge'
import { EditProductModal } from '../produk/edit-product-modal'
import { formatRupiah } from '@/lib/utils'
import type { Category } from '@/types'

type StockRow = {
  id: string
  name: string
  slug: string
  price: number
  duration_days: number
  stock_count: number
  sold_count: number
  is_active: boolean
  thumbnail_url: string | null
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null
}

type Props = {
  rows: StockRow[]
  categories: Category[]
  rowOffset: number
  sortBy: string | null
  sortDir: SortDir
  sortBasePath: string
}

/**
 * Client wrapper untuk DataTable stok-monitor + EditProductModal (tab Stok default).
 * Row click → buka modal dengan tab Kelola Stok terbuka langsung.
 */
export function StockMonitorTableClient({ rows, categories, rowOffset, sortBy, sortDir, sortBasePath }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <>
      <DataTable
        rows={rows as unknown as Record<string, unknown>[]}
        rowClassName={() => 'cursor-pointer'}
        sortBy={sortBy}
        sortDir={sortDir}
        sortBasePath={sortBasePath}
        emptyMessage="Tidak ada produk yang cocok dengan filter."
        columns={[
          {
            key: 'no',
            header: 'No',
            render: (_r, idx) => (
              <span className="font-mono text-xs font-bold text-ink-subtle tabular-nums">
                {rowOffset + idx + 1}
              </span>
            ),
            align: 'center',
            className: 'w-12',
          },
          {
            key: 'name',
            header: 'Produk',
            sortKey: 'name',
            render: (r) => {
              const row = r as unknown as StockRow
              const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
              return (
                <button
                  type="button"
                  onClick={() => setEditingId(row.id)}
                  className="flex items-center gap-3 text-left hover:text-brand-700 transition-colors"
                >
                  {row.thumbnail_url ? (
                    <Image
                      src={row.thumbnail_url}
                      alt={row.name}
                      width={40}
                      height={40}
                      className="rounded-lg border-2 border-black/10 object-cover shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg border-2 border-dashed border-black/15 bg-brand-50/40 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-ink">{row.name}</div>
                    <div className="text-xs text-ink-subtle font-medium">
                      {cat?.name ?? '—'} · {row.duration_days} hari
                    </div>
                  </div>
                </button>
              )
            },
          },
          {
            key: 'sku',
            header: 'SKU',
            sortKey: 'slug',
            render: (r) => {
              const row = r as unknown as StockRow
              return (
                <button
                  type="button"
                  onClick={() => setEditingId(row.id)}
                  className="inline-flex items-center rounded-md border border-black/10 bg-brand-50/40 px-2 py-1 font-mono text-xs font-bold text-ink-muted hover:border-brand-400 hover:text-brand-700 transition-colors"
                >
                  {row.slug}
                </button>
              )
            },
          },
          {
            key: 'price',
            header: 'Harga',
            sortKey: 'price',
            render: (r) => formatRupiah((r as unknown as StockRow).price),
            align: 'right',
          },
          {
            key: 'stock_count',
            header: 'Stok',
            sortKey: 'stock_count',
            render: (r) => <StockBadge count={(r as unknown as StockRow).stock_count} />,
            align: 'center',
          },
          {
            key: 'sold_count',
            header: 'Terjual',
            sortKey: 'sold_count',
            render: (r) => (r as unknown as StockRow).sold_count.toLocaleString('id-ID'),
            align: 'right',
          },
          {
            key: 'action',
            header: '',
            render: (r) => {
              const row = r as unknown as StockRow
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingId(row.id)
                  }}
                  className="inline-flex items-center gap-1 rounded-md border-2 border-black bg-brand-500 px-2.5 py-1 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
                >
                  <Boxes size={12} strokeWidth={2.5} />
                  Kelola Stok
                </button>
              )
            },
            align: 'right',
          },
        ]}
      />

      <EditProductModal
        open={editingId !== null}
        productId={editingId}
        categories={categories}
        initialTab="stok"
        onClose={() => setEditingId(null)}
      />
    </>
  )
}
