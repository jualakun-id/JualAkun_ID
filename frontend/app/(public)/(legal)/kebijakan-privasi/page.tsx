export const metadata = { title: 'Kebijakan Privasi' }

export default function KebijakanPrivasiPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 text-text-muted">
      <h1 className="font-heading text-h1 text-text">Kebijakan Privasi</h1>
      <p className="mt-2 text-sm text-text-subtle">Versi 1.0 — berlaku 2026-05-09</p>

      <h2 className="mt-8 font-heading text-h2 text-text">1. Data yang Kami Kumpulkan</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Email, nama, dan nomor WhatsApp (untuk identitas dan notifikasi)</li>
        <li>Riwayat transaksi dan preferensi produk</li>
        <li>Data teknis: IP, user agent, log akses</li>
      </ul>

      <h2 className="mt-6 font-heading text-h2 text-text">2. Penggunaan Data</h2>
      <p className="mt-2">
        Data digunakan untuk: pemrosesan pesanan, pengiriman akun, notifikasi, support, dan analitik
        internal. Kami tidak menjual data Anda ke pihak ketiga.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">3. Penyimpanan &amp; Keamanan</h2>
      <p className="mt-2">
        Credentials akun di-enkripsi AES-256 di database. Password user di-hash via bcrypt. Server kami
        di Supabase (EU/SG region) dengan TLS 1.3.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">4. Pihak Ketiga</h2>
      <p className="mt-2">
        Kami menggunakan: Supabase (database/auth), Duitku (payment), WAHA (WhatsApp), Resend
        (email), Cloudflare (hosting). Setiap pihak punya kebijakan privasi sendiri.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">5. Hak Anda</h2>
      <p className="mt-2">
        Anda dapat meminta export atau penghapusan data Anda kapan saja dengan menghubungi
        support@jualakun.id.
      </p>
    </section>
  )
}
