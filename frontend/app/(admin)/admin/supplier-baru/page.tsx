import { AdminHeader } from '@/components/admin/admin-header'
import { adminFetch } from '@/lib/admin-fetch'
import type { Category } from '@/types'
import { UnmappedGridClient } from './unmapped-grid-client'

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

type Balance = {
  balance_usd: number
  balance_idr: number
  exchange_rate: number
}

export const metadata = { title: 'Admin — Produk Supplier Baru' }

export default async function AdminSupplierBaruPage() {
  const [unmapped, categories, balance] = await Promise.all([
    adminFetch<UnmappedResponse>('/admin/supplier/unmapped'),
    adminFetch<Category[]>('/catalog/categories'),
    adminFetch<Balance | null>('/admin/supplier/balance'),
  ])

  const exchangeRate = balance?.exchange_rate ?? 18000

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Produk Supplier Baru"
        subtitle={`${unmapped?.total ?? 0} produk Canboso belum di-import ke katalog`}
      />

      <p className="mt-3 max-w-3xl text-sm text-ink-muted">
        Daftar produk Canboso yang belum di-link ke katalog JualAkun. Klik{' '}
        <strong className="text-ink">Import ke Katalog</strong> untuk buat produk baru — nama,
        supplier ID, dan harga pokok akan otomatis ter-isi; kamu tinggal pilih kategori, harga
        jual, dan thumbnail.
      </p>

      <UnmappedGridClient
        initialProducts={unmapped?.products ?? []}
        categories={categories ?? []}
        exchangeRate={exchangeRate}
      />
    </div>
  )
}
