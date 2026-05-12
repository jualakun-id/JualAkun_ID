import Image from 'next/image'
import Link from 'next/link'
import { NavLink } from '@/components/ui/nav-link'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jualakun.id'

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

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${product.name} — akun premium asli dengan garansi ${product.guarantee_days} hari, kirim instan ke dashboard Jualakun.id`,
    image: product.thumbnail_url ? [product.thumbnail_url] : [`${SITE_URL}/api/og`],
    sku: product.slug,
    mpn: product.slug,
    brand: { '@type': 'Brand', name: 'Jualakun.id' },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produk/${product.slug}`,
      priceCurrency: 'IDR',
      price: product.price,
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: isOutOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Jualakun.id' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'IDR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'ID',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'MIN',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 5,
            unitCode: 'MIN',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'ID',
        returnPolicyCategory: product.guarantee_days > 0
          ? 'https://schema.org/MerchantReturnFiniteReturnWindow'
          : 'https://schema.org/MerchantReturnNotPermitted',
        ...(product.guarantee_days > 0 && {
          merchantReturnDays: product.guarantee_days,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        }),
      },
    },
    ...(product.rating_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating_avg.toFixed(1),
        reviewCount: product.rating_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(product.reviews.length > 0 && {
      review: product.reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: { '@type': 'Person', name: 'Pembeli Jualakun.id' },
        datePublished: r.created_at,
        ...(r.comment && { reviewBody: r.comment }),
      })),
    }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
      ...(product.category
        ? [{
            '@type': 'ListItem',
            position: 2,
            name: product.category.name,
            item: `${SITE_URL}/#${product.category.slug}`,
          }]
        : []),
      {
        '@type': 'ListItem',
        position: product.category ? 3 : 2,
        name: product.name,
        item: `${SITE_URL}/produk/${product.slug}`,
      },
    ],
  }

  return (
    <section className="container mx-auto max-w-6xl px-4 py-10 md:py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav className="text-[15px] text-ink-muted font-medium">
        <Link href="/" className="hover:text-brand-700">Beranda</Link>
        {product.category ? (
          <>
            {' / '}
            <Link href={`/#${product.category.slug}`} className="hover:text-brand-700">
              {product.category.name}
            </Link>
          </>
        ) : null}
        {' / '}
        <span className="text-ink font-semibold">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:gap-12 md:grid-cols-2">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[0_4px_0_rgba(0,0,0,0.9)]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(18,150,168,0.10) 1.5px, transparent 0)',
            backgroundSize: '14px 14px',
          }}
        >
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
            <div className="flex h-full w-full items-center justify-center text-ink-subtle font-medium">Tidak ada gambar</div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="instan">⚡ Kirim Instan</Badge>
            {product.guarantee_days > 0 ? (
              <Badge variant="garansi">🛡️ Garansi {product.guarantee_days} hari</Badge>
            ) : (
              <Badge variant="habis">Tanpa garansi</Badge>
            )}
            {isOutOfStock ? <Badge variant="habis">Stok Habis</Badge> : null}
          </div>

          <h1 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight leading-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-[15px] text-ink-muted font-medium">
            {product.rating_count > 0 ? (
              <span className="flex items-center gap-1 text-warning font-bold">
                <Star size={16} fill="currentColor" />
                {product.rating_avg.toFixed(1)}
                <span className="text-ink-muted font-medium">({product.rating_count} ulasan)</span>
              </span>
            ) : null}
            {product.rating_count > 0 && product.sold_count > 0 ? <span>·</span> : null}
            {product.sold_count > 0 ? (
              <span>{product.sold_count.toLocaleString('id-ID')} terjual</span>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
            <div className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              {formatRupiah(product.price)}
            </div>
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-ink-muted font-medium">
              <li className="flex items-center gap-2.5">
                <Clock size={18} strokeWidth={2.25} className="text-brand-600 shrink-0" />
                <span>Durasi <strong className="text-ink">{product.duration_days} hari</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Shield size={18} strokeWidth={2.25} className="text-brand-600 shrink-0" />
                <span>
                  {product.guarantee_days > 0 ? (
                    <>Garansi <strong className="text-ink">{product.guarantee_days} hari</strong></>
                  ) : (
                    <span className="text-ink-muted">Tanpa garansi (akun langka)</span>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap size={18} strokeWidth={2.25} className="text-brand-600 shrink-0" />
                <span>Kirim otomatis ke dashboard <strong className="text-ink">&lt; 5 menit</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${product.stock_count > 0 ? 'bg-success' : 'bg-danger'}`} aria-hidden="true" />
                <span>
                  {product.stock_count > 0
                    ? <>Stok tersedia <strong className="text-ink">{product.stock_count} unit</strong></>
                    : <span className="text-danger font-semibold">Stok habis</span>}
                </span>
              </li>
            </ul>
            <BuyButton productId={product.id} disabled={isOutOfStock} />
          </div>

          {product.description ? (
            <div className="mt-7">
              <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink tracking-tight">Deskripsi</h2>
              <div className="mt-3 whitespace-pre-line text-[15px] text-ink-muted leading-relaxed font-medium">
                {product.description}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {product.reviews.length > 0 ? (
        <div className="mt-14">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Ulasan Pembeli</h2>
          <p className="mt-2 text-[15px] text-ink-muted font-medium">
            {product.rating_count} pembeli sudah kasih review untuk produk ini.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                    {Array.from({ length: 5 - r.rating }).map((_, i) => (
                      <Star key={`empty-${i}`} size={16} className="text-gray-200" fill="currentColor" />
                    ))}
                  </div>
                  <span className="ml-auto text-xs text-ink-subtle font-medium">{formatDate(r.created_at)}</span>
                </div>
                {r.comment ? (
                  <p className="mt-3 text-[15px] text-ink leading-relaxed font-medium">{r.comment}</p>
                ) : (
                  <p className="mt-3 text-[15px] text-ink-subtle italic">Tidak ada komentar</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function BuyButton({ productId, disabled }: { productId: string; disabled: boolean }) {
  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-base font-extrabold border-2 border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        Stok Habis
      </div>
    )
  }
  return (
    <NavLink
      href={`/checkout?product=${productId}`}
      className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-6 py-3.5 text-base font-extrabold border-2 border-black transition-all duration-150 bg-brand-500 text-ink hover:bg-brand-400 shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.9)] data-[pending=true]:opacity-70 data-[pending=true]:pointer-events-none"
      spinnerPosition="leading"
      loadingLabel={<span>Memproses...</span>}
    >
      Beli Sekarang →
    </NavLink>
  )
}
