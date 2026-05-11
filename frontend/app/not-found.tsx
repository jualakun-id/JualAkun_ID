import Link from 'next/link'
import { Search, Home, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/branding/logo'

export const metadata = {
  title: 'Halaman Tidak Ditemukan',
  description: 'Halaman yang kamu cari nggak ada di Jualakun.id. Yuk balik ke beranda.',
}

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 py-12"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(18,150,168,0.15) 1.5px, transparent 0)',
        backgroundSize: '18px 18px',
      }}
    >
      <Link href="/" className="mb-10 transition-transform hover:-translate-y-0.5">
        <Logo size="md" showTagline />
      </Link>

      <div className="w-full max-w-lg rounded-2xl border-2 border-black bg-white p-7 sm:p-9 shadow-[0_6px_0_rgba(0,0,0,0.9)] text-center">
        {/* Big 404 with doodle vibe */}
        <div className="font-heading text-7xl sm:text-8xl font-extrabold text-brand-500 tracking-tighter leading-none">
          404
        </div>

        <h1 className="mt-5 font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Hmm, halamannya nggak ketemu
        </h1>

        <p className="mt-3 text-[15px] sm:text-base text-ink-muted leading-relaxed font-medium">
          Mungkin URL-nya salah ketik, atau halaman yang kamu cari sudah dipindah. Yuk balik ke beranda — ada banyak akun langka yang menunggu.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
          >
            <Home size={16} strokeWidth={2.5} />
            Ke Beranda
          </Link>
          <Link
            href="/#produk"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
          >
            <Search size={16} strokeWidth={2.5} />
            Lihat Katalog
          </Link>
        </div>
      </div>

      <Link
        href="/kontak"
        className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700 transition-colors"
      >
        <MessageCircle size={14} />
        Yakin halamannya harusnya ada? Hubungi kami
      </Link>
    </main>
  )
}
