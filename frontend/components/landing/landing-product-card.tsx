import Link from 'next/link'
import { Shield } from 'lucide-react'
import type { Product } from '@/types'
import { BrandLogoFromName, detectBrand, BrandLogo } from './brand-logo'

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
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative">
      {/* Discount badge */}
      {hasDiscount && (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
          Diskon {discountPct}%
        </span>
      )}

      {/* Brand logo area */}
      <div className="flex items-center justify-center py-7 px-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="h-14 flex items-center justify-center">
          {brand === 'generic' ? (
            <div className="text-center">
              <div className="text-xl font-bold text-ink leading-tight">
                {product.name.split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
          ) : (
            <BrandLogo brand={brand} size={48} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 flex-1 flex flex-col items-center text-center">
        <h3 className="font-bold text-ink text-base leading-tight">{product.name}</h3>
        {product.category && (
          <span className="mt-1.5 inline-block text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        )}

        <div className="mt-3 flex items-baseline justify-center gap-2">
          <span className="text-ink font-bold text-lg">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          {hasDiscount && (
            <span className="text-ink-subtle text-xs line-through">
              {product.original_price!.toLocaleString('id-ID')}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-subtle">
          {product.duration_label && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
              {product.duration_label}
            </span>
          )}
          {product.warranty_label && (
            <span className="inline-flex items-center gap-1">
              <Shield size={11} className="text-stat-green" aria-hidden="true" />
              <span>Garansi {product.warranty_label}</span>
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        {isOutOfStock ? (
          <div
            aria-disabled="true"
            className="w-full bg-gray-100 text-gray-400 font-semibold py-2.5 rounded-lg text-center text-sm cursor-not-allowed"
          >
            Stok Habis
          </div>
        ) : (
          <Link
            href={`/produk/${product.slug}`}
            className="block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg text-center text-sm transition-colors"
          >
            Pesan Sekarang
          </Link>
        )}
      </div>
    </div>
  )
}
