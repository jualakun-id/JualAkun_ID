import Link from 'next/link'
import Image from 'next/image'
import { Shield } from 'lucide-react'
import type { Product } from '@/types'
import { detectBrand, BrandLogo } from './brand-logo'

export function LandingProductCard({
  product,
}: {
  product: Product & { category?: { name: string; slug: string } }
}) {
  const isOutOfStock = product.stock_count === 0
  const brand = detectBrand(product.name)
  const hasDiscount =
    product.original_price !== null && product.original_price > product.price
  const discountPct = hasDiscount
    ? Math.round(
        ((product.original_price! - product.price) / product.original_price!) * 100,
      )
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative aspect-[3/4]">
      {/* Discount badge */}
      {hasDiscount && (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
          Diskon {discountPct}%
        </span>
      )}

      {/* Art / Brand area — 55% of card height */}
      <div
        className="relative bg-gradient-to-br from-brand-50 via-white to-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 shrink-0"
        style={{ height: '55%' }}
      >
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : brand !== 'generic' ? (
          <BrandLogo brand={brand} size={72} />
        ) : (
          <div className="text-center px-4">
            <div className="text-2xl font-extrabold text-ink leading-tight tracking-tight">
              {product.name.split(' ').slice(0, 2).join(' ')}
            </div>
          </div>
        )}
      </div>

      {/* Content + CTA — fills remaining 45% */}
      <div className="flex-1 flex flex-col px-4 py-3 min-h-0">
        <div className="flex-1 flex flex-col items-center text-center">
          <h3 className="font-bold text-ink text-sm leading-tight line-clamp-2">{product.name}</h3>
          {product.category && (
            <span className="mt-1.5 inline-block text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}

          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-ink font-bold text-base">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            {hasDiscount && (
              <span className="text-ink-subtle text-[11px] line-through">
                {product.original_price!.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {(product.duration_label || product.warranty_label) && (
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-ink-subtle">
              {product.duration_label && (
                <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full font-medium">
                  {product.duration_label}
                </span>
              )}
              {product.warranty_label && (
                <span className="inline-flex items-center gap-1">
                  <Shield size={10} className="text-stat-green" aria-hidden="true" />
                  <span>{product.warranty_label}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-2">
          {isOutOfStock ? (
            <div
              aria-disabled="true"
              className="w-full bg-gray-100 text-gray-400 font-semibold py-2 rounded-lg text-center text-xs cursor-not-allowed"
            >
              Stok Habis
            </div>
          ) : (
            <Link
              href={`/produk/${product.slug}`}
              className="block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 rounded-lg text-center text-xs transition-colors"
            >
              Pesan Sekarang
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
