import Image from 'next/image'
import { Shield } from 'lucide-react'
import type { Product } from '@/types'
import { detectBrand, BrandLogo } from './brand-logo'
import { NavLink } from '@/components/ui/nav-link'

/**
 * Cek apakah diskon aktif sekarang berdasarkan original_price + window dates.
 * Diskon aktif kalau: original_price > price
 *   AND (starts_at null OR now >= starts_at)
 *   AND (ends_at null OR now <= ends_at)
 */
function isDiscountActive(p: {
  price: number
  original_price: number | null
  discount_starts_at: string | null
  discount_ends_at: string | null
}): boolean {
  if (p.original_price === null || p.original_price <= p.price) return false
  const now = Date.now()
  if (p.discount_starts_at && new Date(p.discount_starts_at).getTime() > now) return false
  if (p.discount_ends_at && new Date(p.discount_ends_at).getTime() < now) return false
  return true
}

export function LandingProductCard({
  product,
}: {
  product: Product & { category?: { name: string; slug: string } }
}) {
  const isOutOfStock = product.stock_count === 0
  const brand = detectBrand(product.name)
  const hasDiscount = isDiscountActive(product)
  const discountPct = hasDiscount
    ? Math.round(
        ((product.original_price! - product.price) / product.original_price!) * 100,
      )
    : 0
  // Garansi sebagai badge di card (admin hanya set guarantee_days, jangan tulis di nama)
  const durationLabel = product.duration_label ?? `${product.duration_days} hari`
  const warrantyLabel =
    product.warranty_label ??
    (product.guarantee_days > 0 ? `Garansi ${product.guarantee_days} hari` : null)

  return (
    <div
      className="rounded-xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] flex flex-col overflow-hidden hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-200 relative aspect-[3/5] p-4 gap-3"
      style={{
        backgroundColor: '#FAF7F2',
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(18,150,168,0.12) 1.5px, transparent 0)',
        backgroundSize: '14px 14px',
      }}
    >
      {/* Discount badge — neo-brutalist rounded rect, brand cyan untuk match
          art style (tidak compete dengan warna doodle yang saturated) */}
      {hasDiscount && (
        <span className="absolute top-4 left-4 bg-brand-500 text-ink text-sm font-extrabold px-3 py-1.5 rounded-md border-2 border-black shadow-[0_2px_0_rgba(0,0,0,0.9)] z-10">
          Diskon {discountPct}%
        </span>
      )}

      {/* Art / Brand area — 1:1 ratio (admin enforce square upload) */}
      <div className="relative rounded-lg overflow-hidden bg-white shrink-0 border-2 border-black aspect-square w-full">
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
          <h3 className="font-heading font-extrabold text-ink text-[15px] leading-tight line-clamp-2">{product.name}</h3>
          {product.category && (
            <span className="mt-1.5 inline-block text-[13px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}

          {/* Harga: original price (coret) di ATAS, harga jual di BAWAH.
              Ukuran sama (text-lg font-extrabold) — bedanya cuma color +
              line-through supaya hierarchy tetap jelas via visual treatment. */}
          <div className="mt-2 flex flex-col items-center gap-0.5">
            {hasDiscount && (
              <span className="text-ink-muted text-lg line-through font-extrabold leading-tight">
                Rp {product.original_price!.toLocaleString('id-ID')}
              </span>
            )}
            <span className="text-ink font-extrabold text-lg leading-tight">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
          </div>

          {(durationLabel || warrantyLabel) && (
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-[13px] text-ink-muted font-medium">
              {durationLabel && (
                <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                  {durationLabel}
                </span>
              )}
              {warrantyLabel && (
                <span className="inline-flex items-center gap-1">
                  <Shield size={12} className="text-stat-green" aria-hidden="true" />
                  <span>{warrantyLabel}</span>
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
              className="w-full bg-gray-100 text-gray-400 font-bold py-2.5 rounded-lg text-center text-sm border-2 border-gray-300 cursor-not-allowed"
            >
              Stok Habis
            </div>
          ) : (
            <NavLink
              href={`/produk/${product.slug}`}
              className="w-full bg-brand-500 hover:bg-brand-400 text-ink font-extrabold py-2.5 rounded-lg text-center text-sm border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 inline-flex items-center justify-center gap-1.5 data-[pending=true]:opacity-70 data-[pending=true]:pointer-events-none"
              spinnerPosition="leading"
            >
              Pesan Sekarang
            </NavLink>
          )}
        </div>
      </div>
    </div>
  )
}
