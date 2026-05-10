import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { ProductForm } from '../product-form'
import { StockManager } from './stock-manager'
import { adminFetch } from '@/lib/admin-fetch'
import type { Category } from '@/types'

type Product = {
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
  sold_count: number
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminProdukDetailPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    adminFetch<Product>(`/admin/products/${id}`),
    adminFetch<(Category & { product_count: number })[]>('/catalog/categories'),
  ])
  if (!product) notFound()

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title={product.name} subtitle={`Stok: ${product.stock_count} · Terjual: ${product.sold_count}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductForm
          categories={categories ?? []}
          initial={{ ...product, description: product.description ?? undefined, thumbnail_url: product.thumbnail_url ?? undefined }}
        />
        <StockManager productId={product.id} initialStock={product.stock_count} />
      </div>
    </div>
  )
}
