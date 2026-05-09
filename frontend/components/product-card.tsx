import Link from 'next/link'
import Image from 'next/image'
import { Star, Shield, Zap } from 'lucide-react'
import { cn, formatRupiah } from '@/lib/utils'
import type { Product } from '@/types'

type ProductCardData = Pick<
  Product,
  | 'slug'
  | 'name'
  | 'price'
  | 'original_price'
  | 'thumbnail_url'
  | 'rating_avg'
  | 'rating_count'
  | 'sold_count'
  | 'stock_count'
> & {
  duration_label?: string | null
  warranty_label?: string | null
  is_featured?: boolean
}

type Props = {
  product: ProductCardData
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: Props) {
  const isOutOfStock = product.stock_count === 0
  const hasDiscount =
    product.original_price !== null &&
    product.original_price !== undefined &&
    product.original_price > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0

  return (
    <Link
      href={`/produk/${product.slug}`}
      aria-disabled={isOutOfStock}
      className={cn(
        'group block rounded-xl border border-border bg-surface p-4 transition-all duration-200',
        isOutOfStock
          ? 'pointer-events-none opacity-60'
          : 'hover:border-primary/50 hover:shadow-glow-sm',
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-2">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-300',
              !isOutOfStock && 'group-hover:scale-105',
            )}
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-subtle">
            <span className="text-xs">No image</span>
          </div>
        )}

        {hasDiscount && !isOutOfStock ? (
          <span className="absolute left-2 top-2 rounded-md bg-warning px-2 py-0.5 text-xs font-bold text-zinc-950">
            -{discountPct}%
          </span>
        ) : null}

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-[2px]">
            <span className="rounded-md border border-danger/30 bg-danger/15 px-3 py-1 text-xs font-semibold text-danger">
              Stok Habis
            </span>
          </div>
        ) : null}
      </div>

      {(product.duration_label || product.warranty_label) ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.duration_label ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
              <Zap size={12} strokeWidth={1.5} />
              {product.duration_label}
            </span>
          ) : null}
          {product.warranty_label ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              <Shield size={12} strokeWidth={1.5} />
              {product.warranty_label}
            </span>
          ) : null}
        </div>
      ) : null}

      <h3
        className={cn(
          'line-clamp-2 font-heading text-h4 font-semibold text-text',
          product.duration_label || product.warranty_label ? 'mt-2' : 'mt-3',
        )}
      >
        {product.name}
      </h3>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading text-h3 font-bold text-primary">
          {formatRupiah(product.price)}
        </span>
        {hasDiscount ? (
          <span className="text-sm text-text-muted line-through">
            {formatRupiah(product.original_price!)}
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-2 text-xs text-text-subtle">
        {product.rating_count > 0 ? (
          <>
            <span className="flex items-center gap-1 text-warning">
              <Star size={12} strokeWidth={1.5} fill="currentColor" />
              {product.rating_avg.toFixed(1)}
            </span>
            <span aria-hidden>·</span>
          </>
        ) : null}
        <span>{product.sold_count.toLocaleString('id-ID')} terjual</span>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="aspect-square w-full animate-pulse rounded-lg bg-surface-2" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-surface-2" />
    </div>
  )
}

export function ProductCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  )
}
