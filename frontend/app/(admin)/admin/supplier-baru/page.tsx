import { AdminHeader } from '@/components/admin/admin-header'
import { adminFetch } from '@/lib/admin-fetch'
import type { Category } from '@/types'
import { UnmappedGridClient } from './unmapped-grid-client'
import { OrphanListClient } from './orphan-list-client'

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

type UnmappedResponse = {
  walletCurrency: string
  total: number
  products: UnmappedProduct[]
}

type Orphan = {
  product_id: string
  product_name: string
  supplier_product_id: string
  first_orphan_at: string
  confirmed_at: string
}

type Balance = {
  balance_usd: number
  balance_idr: number
  exchange_rate: number
}

export const metadata = { title: 'Admin — Produk Supplier Baru' }

export default async function AdminSupplierBaruPage() {
  const [unmapped, categories, balance, orphans] = await Promise.all([
    adminFetch<UnmappedResponse>('/admin/supplier/unmapped'),
    adminFetch<Category[]>('/catalog/categories'),
    adminFetch<Balance | null>('/admin/supplier/balance'),
    adminFetch<Orphan[]>('/admin/supplier/orphans'),
  ])

  const exchangeRate = balance?.exchange_rate ?? 18000
  const unmappedCount = unmapped?.total ?? 0
  const orphanCount = orphans?.length ?? 0

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Produk Supplier"
        subtitle={
          `${unmappedCount} produk Canboso belum di-import` +
          (orphanCount > 0 ? ` · ${orphanCount} link rusak` : '')
        }
      />

      <p className="mt-3 max-w-3xl text-sm text-ink-muted">
        Satu halaman untuk semua isu supplier: produk Canboso yang belum di-link ke katalog{' '}
        <strong className="text-ink">dan</strong> produk JualAkun dengan link supplier yang sudah
        rusak.
      </p>

      {/* ── Section 1: Link Rusak (kalau ada) ───────────────────── */}
      <OrphanListClient initialOrphans={orphans ?? []} />

      {/* ── Section 2: Belum di-Import ──────────────────────────── */}
      <div className="mt-8">
        <h2 className="text-lg font-extrabold text-ink">
          Belum di-Import ({unmappedCount})
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Klik <strong className="text-ink">Import ke Katalog</strong> untuk buat produk baru —
          nama, supplier ID, dan harga pokok akan otomatis ter-isi; kamu tinggal pilih kategori,
          harga jual, dan thumbnail.
        </p>

        <UnmappedGridClient
          initialProducts={unmapped?.products ?? []}
          categories={categories ?? []}
          exchangeRate={exchangeRate}
        />
      </div>
    </div>
  )
}
