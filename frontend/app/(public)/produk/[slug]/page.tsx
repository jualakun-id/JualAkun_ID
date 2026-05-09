import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star, Shield, Zap, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { serverFetch } from '@/lib/server-fetch'
import { formatRupiah, formatDate } from '@/lib/utils'

type ProductDetail = {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  price: number
  duration_days: number
  guarantee_days: number
  stock_count: number
  sold_count: number
  rating_avg: number
  rating_count: number
  category: { name: string; slug: string } | null
  reviews: { id: string; rating: number; comment: string | null; created_at: string }[]
}

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 120

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await serverFetch<ProductDetail>(`/catalog/${slug}`, { revalidate: 300 })
  if (!product) return { title: 'Produk tidak ditemukan' }
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 200),
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await serverFetch<ProductDetail>(`/catalog/${slug}`, { revalidate: 120 })
  if (!product) notFound()

  const isOutOfStock = product.stock_count === 0

  return (
    <section className="container mx-auto px-4 py-10">
      <nav className="text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        {product.category ? (
          <>
            {' / '}
            <Link href={`/${product.category.slug}`} className="hover:text-brand-600">
              {product.category.name}
            </Link>
          </>
        ) : null}
        {' / '}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-subtle">No image</div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="instan">⚡ Instan</Badge>
            <Badge variant="garansi">🛡️ Garansi {product.guarantee_days} hari</Badge>
            {isOutOfStock ? <Badge variant="habis">Stok Habis</Badge> : null}
          </div>

          <h1 className="mt-3 font-heading text-h1">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm text-ink-muted">
            {product.rating_count > 0 ? (
              <span className="flex items-center gap-1 text-warning">
                <Star size={14} strokeWidth={1.5} fill="currentColor" />
                {product.rating_avg.toFixed(1)} ({product.rating_count} ulasan)
              </span>
            ) : null}
            <span>· {product.sold_count.toLocaleString('id-ID')} terjual</span>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <div className="font-heading text-3xl font-bold text-brand-500">
              {formatRupiah(product.price)}
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink-muted">
              <span className="flex items-center gap-2"><Clock size={16} strokeWidth={1.5} /> Durasi {product.duration_days} hari</span>
              <span className="flex items-center gap-2"><Shield size={16} strokeWidth={1.5} /> Garansi {product.guarantee_days} hari</span>
              <span className="flex items-center gap-2"><Zap size={16} strokeWidth={1.5} /> Pengiriman otomatis</span>
              <span className="text-ink-subtle">Stok: {product.stock_count} unit</span>
            </div>
            <BuyButton productId={product.id} disabled={isOutOfStock} />
          </div>

          {product.description ? (
            <div className="mt-6">
              <h3 className="font-heading text-h3">Deskripsi</h3>
              <div className="mt-2 whitespace-pre-line text-ink-muted">{product.description}</div>
            </div>
          ) : null}
        </div>
      </div>

      {product.reviews.length > 0 ? (
        <div className="mt-12">
          <h3 className="font-heading text-h2">Ulasan Pembeli</h3>
          <div className="mt-4 space-y-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-warning">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} strokeWidth={1.5} fill="currentColor" />
                  ))}
                  <span className="ml-2 text-xs text-ink-subtle">{formatDate(r.created_at)}</span>
                </div>
                {r.comment ? <p className="mt-2 text-sm text-ink">{r.comment}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function BuyButton({ productId, disabled }: { productId: string; disabled: boolean }) {
  return (
    <Link
      href={`/checkout?product=${productId}`}
      aria-disabled={disabled}
      className={`mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 font-semibold transition-colors ${
        disabled
          ? 'pointer-events-none bg-gray-50 text-ink-subtle'
          : 'bg-brand-500 text-white hover:bg-brand-600'
      }`}
    >
      {disabled ? 'Stok Habis' : 'Beli Sekarang'}
    </Link>
  )
}
