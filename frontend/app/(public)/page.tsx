import Link from 'next/link'
import {
  Zap, Shield, Headphones, Percent, Lock, MessageCircle,
  CheckCircle, CreditCard, Bell, ShoppingCart,
  Wallet, Package, Star, Users, TrendingUp, Award,
} from 'lucide-react'
import { serverFetch } from '@/lib/server-fetch'
import type { Product, Category } from '@/types'

import { HeroIllustration } from '@/components/landing/hero-illustration'
import { StatCard } from '@/components/landing/stat-card'
import { BenefitItem } from '@/components/landing/benefit-item'
import { StepCard } from '@/components/landing/step-card'
import { TrustCard } from '@/components/landing/trust-card'
import { LandingProductCard } from '@/components/landing/landing-product-card'
import { TestimonialCard } from '@/components/landing/testimonial-card'
import { FAQAccordion } from '@/components/landing/faq-accordion'
import { BrandLogo } from '@/components/landing/brand-logo'

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
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative bg-sky-hero overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div className="animate-fade-up">
              <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                #1 Marketplace Akun Digital Indonesia
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
                Akun Digital<br />
                Murah &amp;{' '}
                <span className="text-brand-900">Langsung Aktif</span>
              </h1>
              <p className="mt-6 text-white/90 text-lg max-w-md leading-relaxed">
                Netflix, Spotify, ChatGPT, Canva, dan ratusan layanan premium lainnya — harga hemat, garansi resmi, kirim instan ke dashboard.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/streaming"
                  className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-8 py-3.5 rounded-lg shadow-lg shadow-brand-900/20 transition-colors text-base inline-flex items-center gap-2"
                >
                  Lihat Layanan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/faq"
                  className="text-white font-semibold underline-offset-4 hover:underline text-base"
                >
                  Cara Pesan →
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-5 text-white/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  <span>100% Garansi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  <span>Kirim &lt; 5 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" aria-hidden="true" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="animate-fade-in delay-150">
              <HeroIllustration />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 md:h-20" aria-hidden="true">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ink">
            Bergabung dengan JualAkun!
          </h2>
          <p className="text-ink-subtle mt-3 max-w-xl mx-auto">
            Nikmati layanan premium dengan lebih hemat, aman, dan pastinya terpercaya — bersama ribuan pengguna setia.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <StatCard variant="blue"   value="10+"   label="Layanan Tersedia"  icon={Users} />
            <StatCard variant="red"    value="500+"  label="Target Transaksi"  icon={TrendingUp} />
            <StatCard variant="green"  value="24/7"  label="Support Aktif"     icon={Headphones} />
            <StatCard variant="yellow" value="4.8/5" label="Rating Kepuasan"   icon={Award} />
          </div>
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">
              Manfaat Yang Kamu Dapatkan
            </h2>
            <p className="text-ink-subtle mt-3">
              Kenapa ribuan pengguna memilih JualAkun untuk langganan digital mereka.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <BenefitItem icon={Percent}       title="Hemat Hingga 70%"     desc="Harga jauh lebih murah dari langganan resmi." />
              <BenefitItem icon={Lock}          title="Privasi Aman"          desc="Data pribadi terenkripsi, akun tetap miliki kamu." />
              <BenefitItem icon={MessageCircle} title="CS Cepat Tanggap"      desc="Tim support siap bantu via WhatsApp 24 jam." />
            </div>

            {/* Center illustration */}
            <div className="flex justify-center order-1 md:order-2">
              <div className="relative w-64 h-64 bg-brand-50 rounded-3xl p-6 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {(['netflix','spotify','youtube','disneyplus','chatgpt','canva'] as const).map((b, i) => (
                    <div
                      key={b}
                      className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center animate-float"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      <BrandLogo brand={b} size={28} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 order-3">
              <BenefitItem icon={CheckCircle} title="100% Legal & Resmi" desc="Akun bersumber dari distributor resmi terpercaya." />
              <BenefitItem icon={CreditCard}  title="Bayar Apa Saja"     desc="Transfer bank, e-wallet, QRIS, virtual account." />
              <BenefitItem icon={Bell}        title="Notifikasi Otomatis" desc="Update status pesanan via email & WhatsApp." />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ───────────────────────────────────────── */}
      <section className="bg-brand-50 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">Produk Digital Populer</h2>
            <p className="text-ink-subtle mt-3">
              Pilih dari koleksi layanan terbaik dengan harga terjangkau.
            </p>
          </div>

          {/* Category pills */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <span className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                Semua
              </span>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="bg-white text-ink-muted border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {popular?.products?.length ? (
              popular.products.map((p) => <LandingProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-4 text-center text-ink-subtle py-12">
                <Package className="w-12 h-12 mx-auto text-ink-subtle/40 mb-3" aria-hidden="true" />
                <p>Belum ada produk tersedia.</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/streaming"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              Lihat Semua Produk
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ink">Cara Berlangganan</h2>
          <p className="text-ink-subtle mt-3">
            5 langkah mudah untuk mendapatkan akun digital favorit kamu.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            <StepCard num={1} label="Pilih Produk"     icon={Package} />
            <StepCard num={2} label="Checkout"         icon={ShoppingCart} />
            <StepCard num={3} label="Bayar"            icon={Wallet} />
            <StepCard num={4} label="Pesanan Diterima" icon={Bell} />
            <StepCard num={5} label="Nikmati Akun"     icon={Star} />
          </div>
        </div>
      </section>

      {/* ── TRUST ──────────────────────────────────────────── */}
      <section className="bg-brand-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Kenapa Pilih JualAkun?</h2>
          <p className="text-ink-subtle mb-12 max-w-xl mx-auto">
            Tiga alasan utama kenapa kami jadi pilihan terpercaya untuk akun digital.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustCard
              icon={Zap}
              title="Instan"
              desc="Akun terkirim otomatis ke dashboard dalam hitungan menit setelah pembayaran."
            />
            <TrustCard
              icon={Shield}
              title="Bergaransi"
              desc="Garansi penggantian akun atau refund penuh jika ada masalah dalam masa berlaku."
            />
            <TrustCard
              icon={Headphones}
              title="Support 24/7"
              desc="Tim CS siap membantu via WhatsApp dan email kapan saja kamu butuh."
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">Apa Kata Mereka</h2>
            <p className="text-ink-subtle mt-3">
              Cerita dari pengguna yang sudah merasakan manfaat JualAkun.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TestimonialCard
              name="Rizki Pratama"
              handle="@rizkipratama"
              avatarColor="#0089A8"
              rating={5}
              text="Beli Netflix di sini udah 3 bulan, lancar terus. Harganya jauh lebih murah dari resmi, garansi ada, support fast respon. Recommended!"
            />
            <TestimonialCard
              name="Anisa Wulandari"
              handle="@anisaw"
              avatarColor="#1567C8"
              rating={5}
              text="Mahasiswa banget butuh ChatGPT Plus tapi mahal kalau langganan sendiri. Di JualAkun bisa dapat dengan harga setengahnya, akun aman, terima kasih!"
            />
            <TestimonialCard
              name="Budi Santoso"
              handle="@budisan"
              avatarColor="#0F8F4F"
              rating={5}
              text="Spotify Premium dapet langsung 5 menit setelah bayar. Cs-nya juga ramah pas saya tanya cara login. Pasti repeat order."
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="bg-brand-50 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">Pertanyaan Umum</h2>
            <p className="text-ink-subtle mt-3">
              Jawaban untuk pertanyaan yang paling sering ditanyakan.
            </p>
          </div>
          <FAQAccordion items={FAQS} />
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="text-brand-600 font-semibold hover:text-brand-700 hover:underline text-sm inline-flex items-center gap-1"
            >
              Lihat semua pertanyaan
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-700 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Siap mulai berlangganan hemat?
              </h3>
              <p className="text-white/85 mt-1 text-sm md:text-base">
                Daftar gratis sekarang dan dapatkan akses ke semua produk terbaik.
              </p>
            </div>
            <Link
              href="/daftar"
              className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-3.5 rounded-lg shadow-lg transition-colors shrink-0"
            >
              Daftar Sekarang →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const FAQS = [
  {
    q: 'Kapan akun aktif setelah pembayaran?',
    a: 'Akun otomatis terkirim ke dashboard kamu dalam hitungan menit setelah pembayaran berhasil dikonfirmasi. Pemberitahuan juga akan dikirim via email dan WhatsApp.',
  },
  {
    q: 'Apa itu garansi dan bagaimana cara klaimnya?',
    a: 'Setiap produk memiliki masa garansi tertulis (umumnya 14–30 hari). Jika akun bermasalah dalam masa garansi, kamu bisa klaim langsung dari dashboard — kami akan ganti akun atau refund penuh.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, dan pembayaran retail (Indomaret, Alfamart) via Duitku Payment Gateway.',
  },
  {
    q: 'Bagaimana jika akun yang saya beli bermasalah?',
    a: 'Tenang — selama dalam masa garansi, hubungi CS kami di dashboard atau WhatsApp. Kami akan kirim akun pengganti atau refund penuh sesuai pilihan kamu.',
  },
  {
    q: 'Apakah akun yang dijual legal dan aman?',
    a: 'Ya. Semua akun bersumber dari distributor resmi dan licensed. Privasi kamu juga aman — tidak ada data pribadi yang dibagikan ke pihak ketiga.',
  },
]
