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
    <div
      className="rounded-xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] flex flex-col overflow-hidden hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-200 relative aspect-[3/4] p-4 gap-3"
      style={{
        backgroundColor: '#FAF7F2',
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(6,182,212,0.12) 1.5px, transparent 0)',
        backgroundSize: '14px 14px',
      }}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <span className="absolute top-5 left-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
          Diskon {discountPct}%
        </span>
      )}

      {/* Art / Brand area — wrapped in framed container with uniform cream margin all sides */}
      <div
        className="relative rounded-lg overflow-hidden bg-white shrink-0 border-2 border-black"
        style={{ height: '50%' }}
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
          <div className="w-full h-full flex items-center justify-center">
            <BrandLogo brand={brand} size={72} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center px-4">
            <div className="text-center text-2xl font-extrabold text-ink leading-tight tracking-tight">
              {product.name.split(' ').slice(0, 2).join(' ')}
            </div>
          </div>
        )}
      </div>

      {/* Content + CTA — fills remaining space */}
      <div className="flex-1 flex flex-col px-1.5 min-h-0 relative">
        <div className="flex-1 flex flex-col items-center text-center">
          <h3 className="font-bold text-ink text-sm leading-tight line-clamp-2">{product.name}</h3>
          {product.category && (
            <span className="mt-1.5 inline-block text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
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
              className="w-full bg-gray-100 text-gray-400 font-semibold py-2 rounded-lg text-center text-xs border-2 border-gray-300 cursor-not-allowed"
            >
              Stok Habis
            </div>
          ) : (
            <Link
              href={`/produk/${product.slug}`}
              className="block w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-2 rounded-lg text-center text-xs border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
            >
              Pesan Sekarang
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
