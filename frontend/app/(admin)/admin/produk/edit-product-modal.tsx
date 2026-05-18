'use client'

import { useEffect, useState } from 'react'
import { Loader2, Package, Boxes } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { ProductForm } from './product-form'
import { StockManager } from './[id]/stock-manager'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import type { Category } from '@/types'

type ProductDetail = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  duration_days: number
  price: number
  guarantee_days: number
  is_active: boolean
  stock_count: number
  display_stock: number
  sold_count: number
  original_price: number | null
  discount_starts_at: string | null
  discount_ends_at: string | null
  supplier_product_id: string | null
  supplier_synced_at: string | null
  auto_manage_publish: boolean
  cost_stats: {
    sample_size: number
    avg_cost_idr: number
    avg_revenue_idr: number
    avg_margin_pct: number
  } | null
}

type Props = {
  open: boolean
  productId: string | null
  categories: Category[]
  onClose: () => void
  /** Tab yang dibuka saat modal mount. Default 'detail'. */
  initialTab?: Tab
}

type Tab = 'detail' | 'stok'

/**
 * EditProductModal — modal popup untuk edit produk + kelola stok dalam 1 tempat.
 * Tabs: Detail Produk (ProductForm) | Kelola Stok (StockManager).
 *
 * Fetch detail produk on-mount via api.get(/admin/products/:id) — kasih full
 * data ke form (includes discount fields, original_price, dll).
 */
export function EditProductModal({ open, productId, categories, onClose, initialTab = 'detail' }: Props) {
  const toast = useToast()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>(initialTab)

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null)
      setTab(initialTab)
      return
    }

    let cancelled = false
    setLoading(true)
    api.get<ProductDetail>(`/admin/products/${productId}`).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        toast.error(result.message ?? 'Gagal memuat produk')
        onClose()
        return
      }
      setProduct(result.data)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product?.name ?? 'Edit Produk'}
      description={
        product
          ? `SKU ${product.slug} · Stok Tampilan: ${product.display_stock} · Terjual: ${product.sold_count}`
          : 'Memuat data produk...'
      }
      size="xl"
    >
      {loading || !product ? (
        <div className="flex items-center justify-center py-16 text-ink-muted">
          <Loader2 size={28} className="animate-spin text-brand-600" strokeWidth={2} />
        </div>
      ) : (
        <>
          {/* Tabs nav */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border-2 border-black bg-white p-1.5 shadow-[0_2px_0_rgba(0,0,0,0.9)] mb-6">
            <button
              type="button"
              onClick={() => setTab('detail')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                tab === 'detail'
                  ? 'bg-brand-500 text-ink'
                  : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              <Package size={16} strokeWidth={2.25} />
              Detail Produk
            </button>
            <button
              type="button"
              onClick={() => setTab('stok')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                tab === 'stok'
                  ? 'bg-brand-500 text-ink'
                  : 'text-ink-muted hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              <Boxes size={16} strokeWidth={2.25} />
              Kelola Stok
            </button>
          </div>

          {/* Tab content */}
          {tab === 'detail' ? (
            <ProductForm
              categories={categories}
              initial={{
                ...product,
                description: product.description ?? undefined,
                thumbnail_url: product.thumbnail_url ?? undefined,
              }}
              embedded
              onSuccess={() => onClose()}
            />
          ) : (
            <StockManager productId={product.id} initialStock={product.stock_count} embedded />
          )}
        </>
      )}
    </Modal>
  )
}
