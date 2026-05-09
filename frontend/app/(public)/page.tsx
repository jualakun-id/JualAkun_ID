import Link from 'next/link'
import {
  Zap, Shield, Headphones, Percent, Lock, MessageCircle,
  CheckCircle, CreditCard, Bell, ShoppingCart,
  Wallet, Package, Star, Users, TrendingUp, Award,
} from 'lucide-react'
import { serverFetch } from '@/lib/server-fetch'
import type { Product } from '@/types'

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

const CATEGORY_SECTIONS = [
  {
    slug: 'streaming',
    label: 'Streaming',
    desc: 'Netflix, Spotify, Disney+, YouTube Premium, dan layanan streaming favorit lainnya.',
  },
  {
    slug: 'gaming',
    label: 'Gaming',
    desc: 'Game Pass, PlayStation Plus, Steam Wallet untuk para gamer.',
  },
  {
    slug: 'ai-produktif',
    label: 'AI & Produktif',
    desc: 'ChatGPT, Canva Pro, Notion AI, dan tools produktivitas terkini.',
  },
] as const

export default async function HomePage() {
  const [streaming, gaming, aiProduktif] = await Promise.all([
    serverFetch<CatalogResponse>('/catalog?category_slug=streaming&sort=sold_count&limit=8', { revalidate: 300 }),
    serverFetch<CatalogResponse>('/catalog?category_slug=gaming&sort=sold_count&limit=8', { revalidate: 300 }),
    serverFetch<CatalogResponse>('/catalog?category_slug=ai-produktif&sort=sold_count&limit=8', { revalidate: 300 }),
  ])

  const sectionsData = [
    { ...CATEGORY_SECTIONS[0], data: streaming },
    { ...CATEGORY_SECTIONS[1], data: gaming },
    { ...CATEGORY_SECTIONS[2], data: aiProduktif },
  ]

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative bg-sky-hero overflow-hidden">
        <div className="container mx-auto px-4 pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-24 md:pb-32 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div className="animate-fade-up text-center md:text-left">
              <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                Anti Mainstream, Tetap Asli.
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
                Akun Digital<br />
                Murah &amp;{' '}
                <span className="text-brand-900">Langsung Aktif</span>
              </h1>
              <p className="mt-5 sm:mt-6 text-white/90 text-base sm:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                Netflix, Spotify, ChatGPT, Canva, dan ratusan layanan premium lainnya — harga hemat, garansi resmi, kirim instan ke dashboard.
              </p>
              <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link
                  href="/#streaming"
                  className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-7 sm:px-8 py-3.5 rounded-lg shadow-lg shadow-brand-900/20 transition-colors text-base inline-flex items-center gap-2"
                >
                  Lihat Layanan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/#faq"
                  className="text-white font-semibold underline-offset-4 hover:underline text-base"
                >
                  Cara Pesan →
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-white/85 text-xs">
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
            <div className="animate-fade-in delay-150 max-w-xs sm:max-w-sm md:max-w-md mx-auto w-full">
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
            Bergabung dengan Jualakun.id!
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
              Kenapa ribuan pengguna memilih Jualakun.id untuk langganan digital mereka.
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

      {/* ── CATEGORY SECTIONS ──────────────────────────────── */}
      {sectionsData.map((section, idx) => (
        <CategorySection key={section.slug} section={section} bgAlt={idx % 2 === 0} />
      ))}

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ink">Cara Berlangganan</h2>
          <p className="text-ink-subtle mt-3">
            5 langkah mudah untuk mendapatkan akun digital favorit kamu.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4 max-w-3xl md:max-w-none mx-auto">
            <StepCard num={1} label="Pilih Produk"     icon={Package} />
            <StepCard num={2} label="Checkout"         icon={ShoppingCart} />
            <StepCard num={3} label="Bayar"            icon={Wallet} />
            <StepCard num={4} label="Pesanan Diterima" icon={Bell} />
            <div className="col-span-2 sm:col-span-3 md:col-span-1 flex justify-center">
              <StepCard num={5} label="Nikmati Akun" icon={Star} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ──────────────────────────────────────────── */}
      <section className="bg-brand-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Kenapa Pilih Jualakun.id?</h2>
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
              Cerita dari pengguna yang sudah merasakan manfaat Jualakun.id.
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
              text="Mahasiswa banget butuh ChatGPT Plus tapi mahal kalau langganan sendiri. Di Jualakun.id bisa dapat dengan harga setengahnya, akun aman, terima kasih!"
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
      <section id="faq" className="bg-brand-50 py-16 md:py-20 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-ink">Pertanyaan Umum</h2>
            <p className="text-ink-subtle mt-3">
              Jawaban untuk pertanyaan yang paling sering ditanyakan.
            </p>
          </div>
          <FAQAccordion items={FAQS} />
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
              <p className="text-white/85 mt-1 text-base">
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

type SectionData = {
  slug: string
  label: string
  desc: string
  data: CatalogResponse | null
}

function CategorySection({ section, bgAlt }: { section: SectionData; bgAlt: boolean }) {
  const products = section.data?.products ?? []
  return (
    <section
      id={section.slug}
      className={`scroll-mt-20 py-16 md:py-20 ${bgAlt ? 'bg-brand-50' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-ink">{section.label}</h2>
          <p className="text-ink-subtle mt-3 max-w-xl mx-auto">{section.desc}</p>
        </div>

        {products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <LandingProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl border border-dashed border-gray-200 ${bgAlt ? 'bg-white/50' : 'bg-brand-50/50'}`}>
            <Package className="w-10 h-10 mx-auto text-ink-subtle/40 mb-2" aria-hidden="true" />
            <p className="text-ink-subtle text-sm">Belum ada produk di kategori {section.label}.</p>
          </div>
        )}
      </div>
    </section>
  )
}

const FAQS = [
  {
    q: 'Bagaimana cara membeli akun di Jualakun.id?',
    a: 'Pilih produk di salah satu kategori → klik "Pesan Sekarang" → login/daftar → bayar via Duitku → akun otomatis terkirim ke dashboard kamu dalam < 5 menit.',
  },
  {
    q: 'Kapan akun aktif setelah pembayaran?',
    a: 'Akun otomatis terkirim ke dashboard kamu dalam hitungan menit setelah pembayaran berhasil dikonfirmasi. Notifikasi juga akan dikirim via email dan WhatsApp.',
  },
  {
    q: 'Apakah akun yang dijual legal dan aman?',
    a: 'Ya. Kami menjual akun premium yang sah dari distributor resmi, bukan akun bajakan. Setiap akun digaransi sesuai durasi yang tertera di halaman produk.',
  },
  {
    q: 'Apa itu garansi dan bagaimana cara klaimnya?',
    a: 'Setiap produk memiliki masa garansi (umumnya 14–30 hari). Jika akun bermasalah dalam masa garansi, klik tombol "Klaim Garansi" di halaman pesanan, sertakan screenshot — admin akan kirim akun pengganti dalam 1×24 jam.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Semua metode di Duitku: GoPay, OVO, DANA, ShopeePay, QRIS, Virtual Account (BCA, BNI, BRI, Mandiri, Permata), retail (Indomaret, Alfamart), dan kartu kredit.',
  },
  {
    q: 'Berapa lama masa garansi yang berlaku?',
    a: 'Garansi default 30 hari untuk akun streaming, AI, dan produktif. Cek halaman detail produk untuk durasi spesifik per layanan.',
  },
  {
    q: 'Bagaimana jika akun yang saya beli bermasalah?',
    a: 'Tenang — selama dalam masa garansi, hubungi CS kami di dashboard atau WhatsApp. Kami akan kirim akun pengganti atau refund penuh sesuai pilihan kamu.',
  },
  {
    q: 'Apakah ada program referral?',
    a: 'Ya. Setiap teman yang daftar via link referral kamu dan transaksi pertama, kamu dapat kredit Rp 5.000 yang bisa langsung dipakai belanja di Jualakun.id.',
  },
]
