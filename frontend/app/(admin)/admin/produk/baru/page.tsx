import { AdminHeader } from '@/components/admin/admin-header'
import { ProductForm } from '../product-form'
import { adminFetch } from '@/lib/admin-fetch'
import type { Category } from '@/types'

export const metadata = { title: 'Admin — Tambah Produk' }

export default async function AdminProdukBaruPage() {
  const categories = await adminFetch<(Category & { product_count: number })[]>('/catalog/categories')
  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Tambah Produk" subtitle="Buat produk baru. Status default = draft (tidak tampil di publik)." />
      <div className="max-w-2xl">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  )
}
