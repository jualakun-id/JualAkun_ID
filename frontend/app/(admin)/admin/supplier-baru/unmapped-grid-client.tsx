'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Plus, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { ProductForm } from '../produk/product-form'
import { formatRupiah } from '@/lib/utils'
import type { Category } from '@/types'

type UnmappedProduct = {
  id: string
  name: string
  price_usd: number
  wallet_price_text: string
  available: number
  sold: number
  warranty_type: string
  warranty_days: number
  hidden: boolean
  taken_by_product_id: string | null
}

type Props = {
  initialProducts: UnmappedProduct[]
  categories: Category[]
  exchangeRate: number
}

export function UnmappedGridClient({ initialProducts, categories, exchangeRate }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [importTarget, setImportTarget] = useState<UnmappedProduct | null>(null)

  function handleImportSuccess(supplierId: string) {
    // Hilangkan card yang sudah berhasil di-import dari grid
    setProducts((prev) => prev.filter((p) => p.id !== supplierId))
    setImportTarget(null)
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border-2 border-dashed border-black/20 bg-white/60 px-6 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-ink-subtle/40" aria-hidden="true" />
        <p className="mt-3 text-base font-medium text-ink-muted">
          Semua produk supplier sudah di-import. Tidak ada produk baru saat ini.
        </p>
        <p className="mt-1 text-sm text-ink-subtle">
          Halaman ini auto-refresh tiap kali Canboso menambah produk baru. Cek lagi nanti.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const costIdr = Math.round(p.price_usd * exchangeRate)
          return (
            <article
              key={p.id}
              className="flex flex-col rounded-2xl border-2 border-black bg-white p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]"
            >
              <h3 className="line-clamp-2 min-h-[3rem] text-sm font-extrabold text-ink">
                {p.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs">
                <Row
                  icon={<ShoppingBag size={12} strokeWidth={2.5} className="text-brand-600" />}
                  label="Harga pokok"
                  value={
                    <span className="tabular-nums">
                      {formatRupiah(costIdr)}{' '}
                      <span className="font-medium text-ink-subtle">
                        (${p.price_usd.toFixed(2)})
                      </span>
                    </span>
                  }
                />
                <Row
                  icon={<Package size={12} strokeWidth={2.5} className="text-success" />}
                  label="Stok tersedia"
                  value={<span className="tabular-nums font-bold">{p.available}</span>}
                />
                <Row
                  icon={<ShieldCheck size={12} strokeWidth={2.5} className="text-ink-muted" />}
                  label="Garansi"
                  value={
                    <span>
                      {p.warranty_days > 0 ? `${p.warranty_days} hari` : 'Tanpa garansi'}
                    </span>
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setImportTarget(p)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-4 py-2.5 text-sm border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
              >
                <Plus size={14} strokeWidth={2.5} />
                Import ke Katalog
              </button>

              <p className="mt-2 truncate text-[10px] font-mono text-ink-subtle" title={p.id}>
                id: {p.id}
              </p>
            </article>
          )
        })}
      </div>

      <Modal
        open={importTarget !== null}
        onClose={() => setImportTarget(null)}
        title={importTarget ? `Import: ${importTarget.name}` : 'Import Produk Supplier'}
        description="Nama, supplier ID, dan stok sudah pre-fill dari Canboso. Set kategori, harga jual, dan thumbnail, lalu publish."
        size="xl"
      >
        {importTarget ? (
          <ProductForm
            categories={categories}
            embedded
            initial={{
              name: importTarget.name,
              supplier_product_id: importTarget.id,
              display_stock: importTarget.available,
              guarantee_days: importTarget.warranty_days,
              // Default price = biaya pokok × 1.5 (markup 50% sebagai starting point).
              // Admin tetap WAJIB review sebelum publish.
              price: Math.round(importTarget.price_usd * exchangeRate * 1.5),
              is_active: false,
            }}
            onSuccess={() => handleImportSuccess(importTarget.id)}
          />
        ) : null}
      </Modal>
    </>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-ink-muted">
      <span className="flex items-center gap-1.5 font-semibold">
        {icon}
        {label}
      </span>
      <span className="text-right text-ink">{value}</span>
    </div>
  )
}
