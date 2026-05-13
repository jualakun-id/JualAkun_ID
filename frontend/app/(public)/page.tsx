import Link from 'next/link'
import Image from 'next/image'
import { NavLink } from '@/components/ui/nav-link'
import {
  Zap, Shield, Headphones, Percent, Lock, MessageCircle,
  CheckCircle, CreditCard,
  Users, TrendingUp, Award,
} from 'lucide-react'
import { serverFetch } from '@/lib/server-fetch'
import type { Product } from '@/types'

import { HeroIllustration } from '@/components/landing/hero-illustration'
import { StatCard } from '@/components/landing/stat-card'
import { BenefitItem } from '@/components/landing/benefit-item'
import { StepCard } from '@/components/landing/step-card'
import { TrustCard } from '@/components/landing/trust-card'
import { TestimonialCard } from '@/components/landing/testimonial-card'
import { FAQAccordion } from '@/components/landing/faq-accordion'
import { ProductBrowserSection } from '@/components/landing/product-browser-section'
import { Reveal } from '@/components/reveal'

type CatalogResponse = {
  products: (Product & { category?: { name: string; slug: string } })[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

type Category = { id: string; name: string; slug: string; sort_order: number; is_active: boolean }

export const revalidate = 300

export default async function HomePage() {
  const [initialCatalog, categories] = await Promise.all([
    serverFetch<CatalogResponse>('/catalog?sort=sold_count&limit=8', { revalidate: 300 }),
    serverFetch<Category[]>('/catalog/categories', { revalidate: 300 }),
  ])

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative bg-sky-hero overflow-hidden">
        <div className="container mx-auto px-4 pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-24 md:pb-32 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
            {/* Text */}
            <div className="animate-fade-up text-center md:text-left">
              <span className="inline-block bg-white/25 backdrop-blur-sm border border-white/30 text-white text-sm font-bold px-3.5 py-1.5 rounded-full mb-5">
                Anti Mainstream, Tetap Asli.
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
                Akun Langka,<br />
                <span className="text-brand-900">Tetap Asli</span> &amp; Aktif.
              </h1>
              <p className="mt-5 sm:mt-6 text-white/90 text-base sm:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                Akun premium yang sulit kamu temui di tempat lain — Cursor, Claude Pro, ChatGPT Plus, dan layanan eksklusif lainnya. <strong className="text-white">Asli</strong>, kirim instan, banyak yang bergaransi.
              </p>
              <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                <Link
                  href="/#produk"
                  className="group bg-white text-brand-700 hover:text-brand-800 font-extrabold px-7 sm:px-8 py-3.5 rounded-lg border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-base inline-flex items-center gap-2"
                >
                  Lihat Katalog
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/#cara-pesan"
                  className="group bg-brand-500 text-ink hover:bg-brand-400 font-bold px-7 sm:px-8 py-3 rounded-lg border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-base inline-flex items-center gap-2"
                >
                  Cara Pesan
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-white text-sm font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  <span>100% Asli &amp; Resmi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  <span>Kirim &lt; 5 menit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  <span>Garansi Tersedia</span>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="animate-fade-in delay-150 w-full max-w-md sm:max-w-lg md:max-w-none mx-auto">
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
          <Reveal>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
              Bukan Marketplace Biasa
            </h2>
            <p className="text-ink-muted text-base md:text-lg font-medium mt-4 max-w-xl mx-auto">
              Kami fokus ke akun yang jarang dijual di tempat lain — semua resmi, mayoritas bergaransi.
            </p>
          </Reveal>
          <Reveal delay={1} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <StatCard variant="blue"   value="10+"  label="Akun Eksklusif"
              imageUrl="https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/stat-blue.webp?v=2" />
            <StatCard variant="red"    value="100%" label="Asli &amp; Resmi"
              imageUrl="https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/stat-red.webp?v=2" />
            <StatCard variant="green"  value="< 5m" label="Kirim Otomatis"
              imageUrl="https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/stat-green.webp?v=2" />
            <StatCard variant="yellow" value="24/7" label="Support Cepat"
              imageUrl="https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/stat-yellow.webp?v=2" />
          </Reveal>
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
              Kenapa Beda dari yang Lain?
            </h2>
            <p className="text-ink-muted text-base md:text-lg font-medium mt-4">
              Ini yang bikin Jualakun.id worth di-cek sebelum kamu pesan di tempat lain.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <BenefitItem icon={Award}         title="Akun yang Sulit Dicari" desc="Kami stock layanan yang jarang ada di marketplace lain." />
              <BenefitItem icon={CheckCircle}   title="100% Asli & Resmi"      desc="Bukan akun bajakan. Semua bersumber dari distributor licensed." />
              <BenefitItem icon={Percent}       title="Lebih Hemat 60–70%"     desc="Harga di bawah langganan resmi langsung." />
            </div>

            {/* Center illustration — Vexx-style vault dengan brand logos berhamburan */}
            <div className="flex justify-center order-1 md:order-2">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)]">
                <Image
                  src="/landing/why-us.webp"
                  alt="Vault berisi akun premium asli dari brand-brand top — Google, ChatGPT, Claude, Adobe, Canva, Notion, Suno, dan lainnya"
                  fill
                  sizes="(min-width: 768px) 384px, 90vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            <div className="space-y-6 order-3">
              <BenefitItem icon={Lock}          title="Privasi Aman"            desc="Data pribadi terenkripsi, tidak dibagikan ke pihak ketiga." />
              <BenefitItem icon={CreditCard}    title="Bayar Apa Saja"          desc="Transfer bank, e-wallet, QRIS, virtual account, retail." />
              <BenefitItem icon={MessageCircle} title="CS Real Person"          desc="Bukan bot. Tim support manusia siap bantu kapan saja." />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT CATALOG (unified, dgn filter category dropdown + sort + pagination) ── */}
      <ProductBrowserSection
        categories={(categories ?? []).map((c) => ({ slug: c.slug, name: c.name }))}
        initialData={initialCatalog}
      />

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="cara-pesan" className="bg-white py-16 md:py-20 scroll-mt-24">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Cara Berlangganan</h2>
          <p className="text-ink-muted text-base md:text-lg font-medium mt-4">
            5 langkah mudah untuk mendapatkan akun digital favorit kamu.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-3 lg:gap-5 max-w-md sm:max-w-2xl md:max-w-none mx-auto">
            <StepCard num={1} label="Pilih Produk"     imageSrc="/landing/step-1-pilih-produk.webp" />
            <StepCard num={2} label="Checkout"         imageSrc="/landing/step-2-checkout.webp" />
            <StepCard num={3} label="Bayar"            imageSrc="/landing/step-3-bayar.webp" />
            <StepCard num={4} label="Pesanan Diterima" imageSrc="/landing/step-4-pesanan-diterima.webp" />
            <div className="col-span-2 sm:col-span-3 md:col-span-1 flex justify-center">
              <StepCard num={5} label="Nikmati Akun" imageSrc="/landing/step-5-nikmati-akun.webp" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ──────────────────────────────────────────── */}
      <section className="bg-brand-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-4">Yang Bikin Kami Beda</h2>
          <p className="text-ink-muted text-base md:text-lg font-medium mb-12 max-w-xl mx-auto">
            Bukan janji marketing — ini standar yang kami pegang untuk setiap pesanan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustCard
              icon={Award}
              title="Akun Langka"
              desc="Layanan yang jarang dijual di marketplace lain — Cursor, Claude Pro, Linear, dan lainnya."
            />
            <TrustCard
              icon={CheckCircle}
              title="Bukan Akun Bajakan"
              desc="Semua bersumber dari distributor resmi & licensed. Asli, bisa dicek validitasnya."
            />
            <TrustCard
              icon={Shield}
              title="Garansi Sampai Tuntas"
              desc="Untuk produk bergaransi: akun bermasalah? Ganti baru atau refund penuh, tanpa drama."
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Apa Kata Mereka</h2>
            <p className="text-ink-muted text-base md:text-lg font-medium mt-4">
              Cerita dari pengguna yang sudah merasakan manfaat Jualakun.id.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TestimonialCard
              name="Rizki Pratama"
              handle="@rizkipratama · developer"
              avatarColor="#1296A8"
              rating={5}
              text="Pakai Cursor Pro buat coding harian. Beli di sini langganan 1 bulan, jauh lebih murah dari $20 bayar pakai dolar. Akun langsung masuk dashboard, nggak nunggu admin. Solid."
            />
            <TestimonialCard
              name="Anisa Wulandari"
              handle="@anisaw · mahasiswa"
              avatarColor="#1567C8"
              rating={5}
              text="Skripsi butuh Claude Pro buat baca paper panjang. Tempat lain susah dicari, di Jualakun.id ada. 30 hari pakai, belum pernah error. Garansinya juga real, pernah klaim 1× — diganti 12 jam."
            />
            <TestimonialCard
              name="Budi Santoso"
              handle="@budisan · content creator"
              avatarColor="#0F8F4F"
              rating={5}
              text="Adobe CC + Firefly buat editing reel & feed. Harganya masuk akal banget untuk tools selengkap ini. Bayar pakai QRIS, akun jadi 5 menit. Pasti repeat order pas habis garansi."
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="bg-brand-50 py-16 md:py-20 scroll-mt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <Reveal className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">Pertanyaan Umum</h2>
            <p className="text-ink-muted text-base md:text-lg font-medium mt-4">
              Jawaban untuk pertanyaan yang paling sering ditanyakan.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <FAQAccordion items={FAQS} />
          </Reveal>
        </div>
      </section>

      {/* ── CTA STRIP ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-700 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Cari yang nggak ada di tempat lain?
              </h3>
              <p className="text-white mt-2 text-base md:text-lg font-medium">
                Daftar gratis dan langsung akses koleksi akun langka kami.
              </p>
            </div>
            <NavLink
              href="/daftar"
              className="bg-white text-brand-700 hover:text-brand-800 font-extrabold px-8 py-3.5 rounded-lg border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.9)] transition-all duration-150 shrink-0 inline-flex items-center gap-2 data-[pending=true]:opacity-70 data-[pending=true]:pointer-events-none"
              spinnerPosition="leading"
            >
              Daftar Sekarang →
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  )
}


const FAQS = [
  {
    q: 'Bagaimana cara membeli akun di Jualakun.id?',
    a: 'Pilih produk di salah satu kategori → klik "Pesan Sekarang" → login/daftar → bayar via QRIS (GoPay, OVO, DANA, ShopeePay, dll) → admin verifikasi → akun dikirim ke email & WhatsApp kamu.',
  },
  {
    q: 'Kapan akun aktif setelah pembayaran?',
    a: 'Akun otomatis terkirim ke dashboard kamu dalam hitungan menit setelah pembayaran berhasil dikonfirmasi. Notifikasi juga akan dikirim via email dan WhatsApp.',
  },
  {
    q: 'Apakah akun yang dijual legal dan aman?',
    a: 'Ya. Kami menjual akun premium yang sah dari distributor resmi, bukan akun bajakan. Mayoritas produk bergaransi — durasi spesifik tertera di halaman tiap produk.',
  },
  {
    q: 'Apa itu garansi dan bagaimana cara klaimnya?',
    a: 'Mayoritas produk kami punya masa garansi (umumnya 14–30 hari, cek halaman produk untuk detail). Jika akun bergaransi bermasalah, klik tombol "Klaim Garansi" di halaman pesanan, sertakan screenshot — admin akan kirim akun pengganti dalam 1×24 jam.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Pembayaran via QRIS standar nasional — bisa scan pakai semua app e-wallet & m-banking: GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile, Mandiri Livin, BRImo, BNI Mobile, Permata Mobile, dan e-wallet lain yang support QRIS.',
  },
  {
    q: 'Berapa lama masa garansi yang berlaku?',
    a: 'Untuk produk bergaransi, default 30 hari untuk akun streaming, AI, dan produktif. Sebagian akun (terutama yang sangat langka) tidak bergaransi — selalu cek halaman detail produk sebelum membeli.',
  },
  {
    q: 'Bagaimana jika akun yang saya beli bermasalah?',
    a: 'Untuk produk bergaransi: selama masih dalam masa garansi, hubungi CS kami di dashboard atau WhatsApp. Kami akan kirim akun pengganti atau refund penuh sesuai pilihan kamu. Untuk produk tanpa garansi, ini di luar tanggungan kami — pastikan baca info produk sebelum membeli.',
  },
  {
    q: 'Apakah ada program referral?',
    a: 'Ya. Setiap teman yang daftar via link referral kamu dan transaksi pertama, kamu dapat kredit Rp 5.000 yang bisa langsung dipakai belanja di Jualakun.id.',
  },
]
