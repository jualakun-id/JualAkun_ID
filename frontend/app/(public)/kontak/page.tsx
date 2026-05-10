import Link from 'next/link'
import { Mail, MessageCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Kontak',
  description:
    'Hubungi tim Jualakun.id — WhatsApp, email, atau lapor kendala langsung. Admin manusia siap bantu di jam operasional 06.00–00.00 WIB.',
}

const QUICK_HELP = [
  {
    q: 'Akun belum masuk dashboard padahal sudah bayar',
    a: 'Tunggu 5–10 menit dulu — kadang ada delay notifikasi. Kalau setelah 30 menit belum muncul, hubungi WhatsApp kami dengan order ID-nya.',
  },
  {
    q: 'Akun yang dibeli bermasalah',
    a: 'Buka dashboard → Pesanan Saya → klik "Klaim Garansi" → upload screenshot. Admin balas dalam 1×24 jam dengan akun pengganti atau refund.',
  },
  {
    q: 'Mau request akun yang nggak ada di katalog',
    a: 'Kirim WA dengan nama produknya. Kalau memungkinkan, kami stock dalam 1–3 hari. Beberapa akun memang super langka jadi nggak bisa dijamin.',
  },
]

export default function KontakPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1.5 rounded-full">
          <MessageCircle size={14} /> Hubungi Kami
        </span>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl font-extrabold text-ink tracking-tight leading-tight">
          Ada pertanyaan? Kami balas cepat.
        </h1>
        <p className="mt-4 text-[17px] text-ink-muted leading-relaxed font-medium">
          Bukan bot, bukan template auto-reply. Admin manusia yang baca dan jawab — biasanya respons di bawah 30 menit selama jam operasional.
        </p>
      </div>

      {/* ── Channels ─────────────────────────────────────── */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <a
          href="https://wa.me/628000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border-2 border-black bg-white p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success border-2 border-success/30 shrink-0">
              <MessageCircle size={22} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-extrabold text-ink">WhatsApp</h2>
              <p className="text-sm text-ink-muted font-medium">Paling cepat</p>
            </div>
            <ChevronRight size={20} className="text-ink-muted group-hover:translate-x-0.5 group-hover:text-brand-600 transition-transform" />
          </div>
          <p className="mt-4 text-[15px] text-ink leading-relaxed font-medium">
            Klik untuk chat langsung. Respons rata-rata <strong className="text-brand-700">&lt; 30 menit</strong> selama jam operasional.
          </p>
        </a>

        <a
          href="mailto:cs@jualakun.id"
          className="group rounded-2xl border-2 border-black bg-white p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:shadow-[0_6px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border-2 border-brand-200 shrink-0">
              <Mail size={22} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-xl font-extrabold text-ink">Email</h2>
              <p className="text-sm text-ink-muted font-medium">Untuk hal detail</p>
            </div>
            <ChevronRight size={20} className="text-ink-muted group-hover:translate-x-0.5 group-hover:text-brand-600 transition-transform" />
          </div>
          <p className="mt-4 text-[15px] text-ink leading-relaxed font-medium">
            <strong className="text-brand-700">cs@jualakun.id</strong> — cocok untuk laporan kendala panjang, request akun, atau privacy request.
          </p>
        </a>
      </div>

      {/* ── Operating hours ──────────────────────────────── */}
      <div className="mt-6 rounded-2xl border-2 border-black bg-brand-50 p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-brand-700 shrink-0" strokeWidth={2.25} />
          <div className="flex-1">
            <p className="font-heading font-extrabold text-ink">Jam operasional</p>
            <p className="text-[15px] text-ink-muted font-medium mt-0.5">
              Setiap hari, <strong className="text-ink">06.00 – 00.00 WIB</strong>. Pesan di luar jam tetap kami baca, dibalas pas buka.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Help ───────────────────────────────────── */}
      <div className="mt-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
          Sebelum hubungi, cek dulu di sini
        </h2>
        <p className="mt-3 text-[15px] text-ink-muted font-medium">
          3 hal yang paling sering ditanyain — mungkin jawabanmu udah ada.
        </p>
        <div className="mt-5 space-y-3">
          {QUICK_HELP.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]"
            >
              <h3 className="font-heading font-bold text-ink text-base">{item.q}</h3>
              <p className="mt-2 text-[15px] text-ink-muted leading-relaxed font-medium">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link
            href="/#faq"
            className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800 text-sm font-bold underline underline-offset-2"
          >
            Lihat semua FAQ →
          </Link>
        </div>
      </div>

      {/* ── Lapor kendala serius ─────────────────────────── */}
      <div className="mt-12 rounded-2xl border-2 border-black bg-white p-6 md:p-7 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-brand-600 shrink-0 mt-1" size={22} strokeWidth={2.25} />
          <div>
            <h3 className="font-heading text-lg font-extrabold text-ink">Laporan Kendala Serius</h3>
            <p className="mt-2 text-[15px] text-ink-muted leading-relaxed font-medium">
              Untuk masalah yang butuh investigasi (akun di-suspend tanpa sebab, transaksi double-charge, dugaan fraud), kirim email ke{' '}
              <a href="mailto:cs@jualakun.id?subject=Laporan%20Kendala" className="text-brand-700 hover:text-brand-800 font-bold underline underline-offset-2">
                cs@jualakun.id
              </a>{' '}
              dengan subject <strong className="text-ink">&quot;Laporan Kendala&quot;</strong>. Sertakan order ID & kronologi singkat — admin senior akan handle dalam 1×24 jam.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
