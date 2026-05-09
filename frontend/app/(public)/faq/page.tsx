const FAQS = [
  {
    q: 'Bagaimana cara membeli akun di JualAkun?',
    a: 'Pilih produk → klik "Beli Sekarang" → login/daftar → bayar via Midtrans → akun otomatis terkirim ke dashboard Anda dalam < 5 menit.',
  },
  {
    q: 'Apakah akunnya legal & aman?',
    a: 'Ya. Kami menjual akun premium yang sah, bukan akun bajakan. Setiap akun digaransi sesuai durasi yang tertera.',
  },
  {
    q: 'Bagaimana jika akun tidak bisa login?',
    a: 'Klik tombol "Klaim Garansi" di halaman pesanan, sertakan screenshot, dan admin akan kirim akun pengganti dalam 1x24 jam.',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Semua metode di Midtrans: GoPay, OVO, DANA, ShopeePay, QRIS, Virtual Account (BCA, BNI, BRI, Mandiri, Permata), dan kartu kredit.',
  },
  {
    q: 'Berapa lama garansinya?',
    a: 'Garansi 30 hari (default) untuk akun streaming/AI/produktif. Cek halaman produk untuk detail.',
  },
  {
    q: 'Apakah ada program referral?',
    a: 'Ya. Setiap teman yang daftar via link Anda dan transaksi pertama, Anda dapat kredit Rp 5.000 yang bisa dipakai belanja.',
  },
]

export const metadata = { title: 'FAQ — Pertanyaan yang Sering Ditanyakan' }

export default function FaqPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-h1">FAQ</h1>
      <p className="mt-2 text-text-muted">Pertanyaan umum tentang JualAkun.</p>

      <div className="mt-8 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-lg border border-border bg-surface p-5 open:shadow-glow-sm"
          >
            <summary className="cursor-pointer list-none font-heading text-h4 text-text">
              <span className="mr-2 text-primary group-open:rotate-90 inline-block transition-transform">›</span>
              {f.q}
            </summary>
            <p className="mt-3 text-sm text-text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
