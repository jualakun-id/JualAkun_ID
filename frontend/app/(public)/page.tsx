import Link from 'next/link'
import {
  Zap, Shield, Headphones, Percent, Lock, MessageCircle,
  CheckCircle, CreditCard, Bell, ChevronRight, ShoppingCart,
  Wallet, Package, Star,
} from 'lucide-react'
import { serverFetch } from '@/lib/server-fetch'
import type { Product, Category } from '@/types'

type CatalogResponse = {
  products: (Product & { category?: { name: string; slug: string } })[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

export const revalidate = 300

export default async function HomePage() {
  const [popular, categories] = await Promise.all([
    serverFetch<CatalogResponse>('/catalog?sort=sold_count&limit=8', { revalidate: 300 }),
    serverFetch<(Category & { product_count: number })[]>('/catalog/categories', { revalidate: 600 }),
  ])

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative bg-[#7EC8E3] overflow-hidden pb-12">
        <div className="container mx-auto px-4 pt-10 pb-16 md:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Akun Digital<br />
                Murah &amp; <span className="text-[#1A4480]">Langsung Aktif</span>
              </h1>
              <p className="mt-4 text-white/90 text-lg max-w-md leading-relaxed">
                Marketplace akun digital terpercaya di Indonesia — Netflix, Spotify, ChatGPT, Canva, dan ratusan produk lainnya dengan harga terbaik.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/streaming"
                  className="bg-[#007FA5] hover:bg-[#006080] text-white font-semibold px-8 py-3.5 rounded-lg shadow-lg transition-colors text-base"
                >
                  Lihat Layanan
                </Link>
                <Link
                  href="/faq"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#007FA5] font-semibold px-8 py-3.5 rounded-lg transition-all text-base"
                >
                  Cara Pesan
                </Link>
              </div>
            </div>

            {/* Service logos grid (illustration placeholder) */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm" />
                <div className="absolute inset-4 grid grid-cols-3 gap-3">
                  {['Netflix', 'Spotify', 'YouTube', 'ChatGPT', 'Canva', 'Disney+'].map((s) => (
                    <div
                      key={s}
                      className="bg-white/30 hover:bg-white/50 rounded-xl flex items-center justify-center text-xs font-bold text-white text-center p-2 transition-colors"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1A2340]">Bergabung dengan JualAkun sekarang!</h2>
          <p className="text-[#718096] mt-2 text-base">
            Nikmati layanan premium dengan lebih hemat, aman, dan pastinya terpercaya.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard bg="#1D7FE8" value="10+" label="Layanan Tersedia" />
            <StatCard bg="#E8334A" value="500+" label="Target Transaksi" />
            <StatCard bg="#2DB87A" value="24/7" label="Support Aktif" />
            <StatCard bg="#F5A623" value="4.8/5" label="Rating Kepuasan" />
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1A2340] text-center">Manfaat Yang Bisa Kamu Dapatkan</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-5">
              <BenefitItem icon={<Percent />} text="Harga Hemat Hingga 70%" />
              <BenefitItem icon={<Lock />} text="Privasi Anda Tetap Aman" />
              <BenefitItem icon={<MessageCircle />} text="Layanan CS Cepat Tanggap" />
            </div>
            <div className="flex justify-center">
              <div className="w-56 h-56 bg-[#EBF5FF] rounded-3xl flex flex-col items-center justify-center gap-3 p-6">
                <div className="grid grid-cols-2 gap-3 w-full">
                  {['Netflix', 'Spotify', 'Disney+', 'ChatGPT'].map((s) => (
                    <div key={s} className="bg-white rounded-xl py-3 text-xs font-bold text-[#1A2340] text-center shadow-sm">
                      {s}
                    </div>
                  ))}
                </div>
                <p className="text-[#00B8D9] text-xs font-semibold">jualakun.id</p>
              </div>
            </div>
            <div className="space-y-5">
              <BenefitItem icon={<CheckCircle />} text="Akses Legal dan Terpercaya" />
              <BenefitItem icon={<CreditCard />} text="Metode Pembayaran Lengkap" />
              <BenefitItem icon={<Bell />} text="Notifikasi Email &amp; WhatsApp" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="bg-[#EBF5FF] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1A2340] text-center">Produk Digital</h2>

          {/* Category pills */}
          {categories && categories.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="bg-[#00B8D9] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                Semua
              </span>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="bg-white text-[#4A5568] border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#00B8D9] hover:text-white hover:border-[#00B8D9] transition-all"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {popular?.products?.length ? (
              popular.products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <p className="col-span-4 text-center text-[#718096] py-12">
                Belum ada produk. Jalankan <code className="bg-white px-1 rounded">supabase/seed.sql</code>.
              </p>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/streaming"
              className="inline-block border-2 border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9] hover:text-white font-semibold px-8 py-3 rounded-lg transition-all"
            >
              Lihat Semua Produk →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CARA BERLANGGANAN ── */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1A2340]">Cara Berlangganan</h2>
          <p className="text-[#718096] mt-2">Cara praktis mendapatkan akun digital di JualAkun</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-2">
            <StepCard num={1} label="Pilih Produk" icon={<Package />} />
            <StepCard num={2} label="Checkout" icon={<ShoppingCart />} />
            <StepCard num={3} label="Pembayaran" icon={<Wallet />} />
            <StepCard num={4} label="Pesanan Diterima" icon={<Bell />} />
            <StepCard num={5} label="Nikmati Akun" icon={<Star />} />
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="bg-[#EBF5FF] py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#1A2340] mb-8">Kenapa Pilih JualAkun?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <TrustCard icon={<Zap className="w-7 h-7 text-[#00B8D9]" />} title="Instan" desc="Akun terkirim otomatis ke dashboard dalam hitungan menit setelah pembayaran" />
            <TrustCard icon={<Shield className="w-7 h-7 text-[#00B8D9]" />} title="Bergaransi" desc="Garansi penggantian akun atau refund penuh jika ada masalah" />
            <TrustCard icon={<Headphones className="w-7 h-7 text-[#00B8D9]" />} title="Support 24/7" desc="Tim CS siap membantu via WhatsApp dan email kapan saja" />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1A2340] text-center">Pertanyaan Umum</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((faq) => (
              <Link
                key={faq.q}
                href="/faq"
                className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-5 hover:border-[#00B8D9] hover:shadow-sm transition-all group"
              >
                <span className="text-[#1A2340] font-medium group-hover:text-[#007FA5]">{faq.q}</span>
                <ChevronRight className="w-5 h-5 text-[#718096] shrink-0 group-hover:text-[#00B8D9]" />
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/faq" className="text-[#00B8D9] font-semibold hover:underline text-sm">
              Lihat semua pertanyaan →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─── Sub-components ─── */

function StatCard({ bg, value, label }: { bg: string; value: string; label: string }) {
  return (
    <div
      className="rounded-2xl p-6 text-center shadow-md"
      style={{ backgroundColor: bg }}
    >
      <div className="text-3xl md:text-4xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium text-white/80 mt-1">{label}</div>
    </div>
  )
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl border-2 border-[#00B8D9] flex items-center justify-center shrink-0 text-[#00B8D9]">
        {icon}
      </div>
      <span className="text-[#1A2340] font-medium">{text}</span>
    </div>
  )
}

function ProductCard({ product }: { product: Product & { category?: { name: string; slug: string } } }) {
  const isOutOfStock = product.stock_count === 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Logo area */}
      <div className="flex items-center justify-center py-6 px-4 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <div className="text-xl font-black text-[#1A2340] leading-tight">{product.name}</div>
          {product.category && (
            <span className="mt-1 inline-block text-xs text-[#00B8D9] font-medium bg-[#E0F2FE] px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-4 py-4 flex-1">
        {product.duration_label && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#718096]">Durasi</span>
            <span className="text-xs bg-[#E0F2FE] text-[#0284C7] px-2 py-0.5 rounded-full font-medium">
              {product.duration_label}
            </span>
          </div>
        )}
        <div className="text-[#1A2340] font-bold text-lg">
          Rp {product.price.toLocaleString('id-ID')}
        </div>
        {product.warranty_label && (
          <div className="mt-1 flex items-center gap-1 text-xs text-[#718096]">
            <Shield size={11} className="text-[#2DB87A]" />
            <span>Garansi {product.warranty_label}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        {isOutOfStock ? (
          <div className="w-full bg-gray-100 text-gray-400 font-semibold py-2.5 rounded-lg text-center text-sm cursor-not-allowed">
            Stok Habis
          </div>
        ) : (
          <Link
            href={`/produk/${product.slug}`}
            className="block w-full bg-[#00B8D9] hover:bg-[#009EB8] text-white font-semibold py-2.5 rounded-lg text-center text-sm transition-colors"
          >
            Beli Sekarang
          </Link>
        )}
      </div>
    </div>
  )
}

function StepCard({ num, label, icon }: { num: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 bg-[#EBF5FF] rounded-full flex items-center justify-center text-[#1D7FE8]">
        {icon}
      </div>
      <div className="bg-[#1D4ED8] rounded-xl px-4 py-2.5 text-center w-full">
        <div className="text-white/70 text-xs font-bold">{num}</div>
        <div className="text-white text-xs font-semibold mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function TrustCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
      <div className="flex justify-center mb-3">
        <div className="w-14 h-14 rounded-full bg-[#EBF5FF] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="font-bold text-[#1A2340]">{title}</h3>
      <p className="mt-1 text-sm text-[#718096] leading-relaxed">{desc}</p>
    </div>
  )
}

const FAQS = [
  { q: 'Kapan akun aktif setelah pembayaran?' },
  { q: 'Apa itu garansi dan bagaimana cara klaimnya?' },
  { q: 'Metode pembayaran apa saja yang tersedia?' },
  { q: 'Bagaimana jika akun yang saya beli bermasalah?' },
  { q: 'Apakah akun yang dijual legal dan aman?' },
]
