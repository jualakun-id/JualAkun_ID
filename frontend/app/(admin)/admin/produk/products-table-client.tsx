'use client'

import { useState } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { StockBadge } from '@/components/admin/stock-badge'
import { EditProductModal } from './edit-product-modal'
import { formatRupiah } from '@/lib/utils'
import type { Category } from '@/types'

type ProductRow = {
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
  products: ProductRow[]
  categories: Category[]
  rowOffset: number
}

/**
 * Client wrapper untuk DataTable produk + EditProductModal.
 * Row click → buka modal edit untuk produk tersebut.
 */
export function ProductsTableClient({ products, categories, rowOffset }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <>
      <DataTable
        rows={products as unknown as Record<string, unknown>[]}
        rowClassName={() => 'cursor-pointer'}
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
            render: (r) => {
              const row = r as unknown as ProductRow
              const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories
              return (
                <button
                  type="button"
                  onClick={() => setEditingId(row.id)}
                  className="text-left hover:text-brand-700 transition-colors"
                >
                  <div className="font-bold text-ink">{row.name}</div>
                  <div className="text-xs text-ink-subtle font-medium">
                    {cat?.name ?? '—'} · {row.duration_days} hari
                  </div>
                </button>
              )
            },
          },
          {
            key: 'sku',
            header: 'SKU',
            render: (r) => {
              const row = r as unknown as ProductRow
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
            render: (r) => formatRupiah((r as unknown as ProductRow).price),
            align: 'right',
          },
          {
            key: 'stock_count',
            header: 'Stok',
            render: (r) => <StockBadge count={(r as unknown as ProductRow).stock_count} />,
            align: 'center',
          },
          {
            key: 'sold_count',
            header: 'Terjual',
            render: (r) => (r as unknown as ProductRow).sold_count.toLocaleString('id-ID'),
            align: 'right',
          },
          {
            key: 'is_active',
            header: 'Status',
            render: (r) => {
              const active = (r as unknown as ProductRow).is_active
              return (
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
                    active
                      ? 'bg-success/15 text-success border-success/40'
                      : 'bg-gray-100 text-ink-muted border-gray-300'
                  }`}
                >
                  {active ? 'Aktif' : 'Draft'}
                </span>
              )
            },
            align: 'center',
          },
        ]}
      />

      <EditProductModal
        open={editingId !== null}
        productId={editingId}
        categories={categories}
        onClose={() => setEditingId(null)}
      />
    </>
  )
}
