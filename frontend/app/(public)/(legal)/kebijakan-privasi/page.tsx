import Link from 'next/link'
import { Lock, Eye, Mail } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Bagaimana kami mengumpulkan, menyimpan, dan menggunakan data kamu di Jualakun.id. Ditulis dengan jujur — apa yang kami simpan, kenapa, dan apa yang nggak akan kami lakukan.',
}

export default function KebijakanPrivasiPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Lock size={12} /> Privasi Kamu
        </span>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl font-extrabold text-ink leading-tight">
          Kebijakan Privasi
        </h1>
        <p className="mt-3 text-sm text-ink-subtle">
          Versi 1.1 · Berlaku mulai 10 Mei 2026
        </p>
      </div>

      {/* ── Pembukaan ────────────────────────────────────── */}
      <div className="mt-10 rounded-2xl border-2 border-black bg-brand-50 p-5 md:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <p className="text-ink leading-relaxed">
          Kami nggak suka kebijakan privasi yang panjang dan penuh istilah hukum — biasanya cuma untuk nyembunyiin yang sebenarnya dilakukan. Halaman ini ditulis sebaliknya: <strong>data apa yang kami simpan, kenapa, dan apa yang nggak akan kami lakukan</strong>. Singkat dan jujur.
        </p>
      </div>

      {/* ── TL;DR ────────────────────────────────────────── */}
      <div className="mt-8 rounded-2xl border-2 border-black bg-white p-5 md:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-base font-extrabold text-ink flex items-center gap-2">
          <Eye size={18} className="text-brand-600" /> Versi Singkat (TL;DR)
        </h2>
        <ul className="mt-3 space-y-2 text-ink-muted text-sm leading-relaxed">
          <li>✅ Kami simpan data minimal yang perlu untuk transaksi (email, WA, riwayat order).</li>
          <li>✅ Credentials akun yang kamu beli di-enkripsi AES-256 di database.</li>
          <li>✅ Kamu bisa minta hapus data kamu kapan saja.</li>
          <li>❌ Kami <strong>tidak</strong> jual data kamu ke pihak ketiga.</li>
          <li>❌ Kami <strong>tidak</strong> kirim email promosi tanpa kamu opt-in.</li>
          <li>❌ Kami <strong>tidak</strong> tracking aktivitas kamu di website lain.</li>
        </ul>
      </div>

      {/* ── Sections ─────────────────────────────────────── */}
      <div className="mt-10 space-y-10 text-ink-muted">
        <Section number="1" title="Data Apa Saja yang Kami Kumpulkan">
          <p>
            Kami cuma simpan data yang <strong className="text-ink">benar-benar diperlukan</strong> untuk menjalankan layanan. Berikut breakdown-nya:
          </p>

          <h3 className="mt-5 font-heading text-base font-bold text-ink">a. Saat kamu daftar</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong className="text-ink">Email</strong> — untuk login, reset password, dan delivery akun</li>
            <li><strong className="text-ink">Nomor WhatsApp</strong> — untuk notifikasi pembayaran & klaim garansi</li>
            <li><strong className="text-ink">Nama panggilan</strong> — sapaan di dashboard & email</li>
            <li><strong className="text-ink">Password</strong> — di-hash via bcrypt, plain-text-nya tidak pernah disimpan</li>
          </ul>

          <h3 className="mt-5 font-heading text-base font-bold text-ink">b. Saat kamu transaksi</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Riwayat order (produk, harga, tanggal, status)</li>
            <li>Metode pembayaran yang dipakai (QRIS via e-wallet pilihanmu)</li>
            <li>Catatan tiket support / klaim garansi</li>
          </ul>

          <h3 className="mt-5 font-heading text-base font-bold text-ink">c. Data teknis (otomatis)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>IP address & user agent (browser/device kamu) — untuk security & deteksi fraud</li>
            <li>Log waktu login & aktivitas dashboard</li>
            <li>Cookie session (untuk login persisten)</li>
          </ul>
          <p className="mt-3">
            Yang <strong className="text-ink">tidak</strong> kami kumpulkan: lokasi geo-tracking, contact list, browsing history di luar Jualakun.id, atau data apapun dari device kamu yang nggak relevan dengan layanan.
          </p>
        </Section>

        <Section number="2" title="Untuk Apa Data Itu Dipakai">
          <p>
            Tujuan penggunaan data kami sebatas hal-hal yang kamu bisa expect dari sebuah marketplace:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li><strong className="text-ink">Memproses pesanan</strong> — verify pembayaran, kirim akun ke dashboard, generate invoice</li>
            <li><strong className="text-ink">Komunikasi penting</strong> — notifikasi delivery, status pembayaran, expiry warning, balasan tiket support</li>
            <li><strong className="text-ink">Klaim garansi</strong> — verifikasi ownership order, kirim akun pengganti</li>
            <li><strong className="text-ink">Keamanan akun</strong> — deteksi login mencurigakan, blokir aktivitas fraud</li>
            <li><strong className="text-ink">Analitik internal</strong> — produk mana yang banyak dicari, metode bayar mana yang paling dipakai (data agregat, bukan per-user)</li>
          </ul>
          <p className="mt-3">
            Kami <strong className="text-ink">tidak akan</strong> kirim email promosi, push notif marketing, atau hubungi kamu untuk hal-hal yang nggak relevan dengan transaksi kamu — kecuali kamu opt-in eksplisit di pengaturan dashboard.
          </p>
        </Section>

        <Section number="3" title="Bagaimana Data Disimpan & Diamankan">
          <p>
            Keamanan data adalah hal yang serius buat kami. Ini stack-nya:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-ink">Database utama:</strong> Supabase (PostgreSQL managed) di region Singapore. Ada backup otomatis harian, point-in-time recovery 7 hari.
            </li>
            <li>
              <strong className="text-ink">Password user:</strong> di-hash dengan bcrypt (cost factor 10) — bahkan tim internal kami nggak bisa lihat password aslinya.
            </li>
            <li>
              <strong className="text-ink">Credentials akun digital yang kamu beli:</strong> di-enkripsi AES-256-GCM sebelum disimpan di database. Kunci enkripsi terpisah dari database itu sendiri.
            </li>
            <li>
              <strong className="text-ink">Transmisi:</strong> semua koneksi pakai TLS 1.3. Tidak ada data plaintext yang lewat jaringan.
            </li>
            <li>
              <strong className="text-ink">Akses internal:</strong> hanya admin yang authorized yang bisa akses panel admin, dan setiap akses tercatat di log audit.
            </li>
          </ul>
        </Section>

        <Section number="4" title="Pihak Ketiga yang Kami Pakai">
          <p>
            Untuk menjalankan layanan, kami pakai beberapa service eksternal. Masing-masing punya kebijakan privasi sendiri:
          </p>
          <div className="mt-4 rounded-xl border border-black/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-ink">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Service</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Untuk Apa</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Data yg Dishare</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <ProviderRow name="Supabase" purpose="Database & auth" data="Email, profile, riwayat order" />
                <ProviderRow name="GoPay Merchant" purpose="QRIS payment receiver" data="Nominal transfer (tidak ada data pribadi)" />
                <ProviderRow name="WAHA" purpose="WhatsApp notifikasi" data="Nomor WA & isi pesan" />
                <ProviderRow name="Resend" purpose="Email transaksional" data="Email & isi pesan" />
                <ProviderRow name="Vercel" purpose="Hosting frontend" data="IP, user agent (log akses)" />
                <ProviderRow name="Cloudflare" purpose="Backend Workers + CDN" data="IP, user agent (log akses)" />
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            Kami pilih service-service ini karena standar keamanannya tinggi (semua compliant dengan GDPR / SOC 2). Tapi tetap, kalau kamu mau detail kebijakan privasi mereka, link tersedia di website masing-masing.
          </p>
        </Section>

        <Section number="5" title="Berapa Lama Data Disimpan">
          <ul className="list-disc space-y-1.5 pl-6">
            <li><strong className="text-ink">Akun aktif:</strong> selama akun masih ada</li>
            <li><strong className="text-ink">Riwayat transaksi:</strong> minimal 5 tahun (untuk keperluan akuntansi & pajak sesuai regulasi Indonesia)</li>
            <li><strong className="text-ink">Log keamanan:</strong> 90 hari, lalu di-purge</li>
            <li><strong className="text-ink">Credentials akun yang kamu beli:</strong> di-purge dari sistem 30 hari setelah masa garansi habis</li>
            <li><strong className="text-ink">Akun yang kamu request hapus:</strong> data personal di-anonim dalam 7 hari, kecuali yang wajib disimpan untuk pajak (anonim, tanpa identitas)</li>
          </ul>
        </Section>

        <Section number="6" title="Hak-Hak Kamu">
          <p>
            Sebagai pemilik data, kamu punya hak penuh atas:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li><strong className="text-ink">Akses</strong> — minta export semua data kamu yang kami simpan, dalam format JSON / CSV</li>
            <li><strong className="text-ink">Koreksi</strong> — minta edit data yang salah (langsung dari dashboard, atau via support kalau ada batasan)</li>
            <li><strong className="text-ink">Penghapusan</strong> — minta delete akun & data terkait kapan saja</li>
            <li><strong className="text-ink">Portabilitas</strong> — minta data kamu dalam format machine-readable untuk dipindah ke service lain</li>
            <li><strong className="text-ink">Withdraw consent</strong> — kalau kamu pernah opt-in promosi, bisa unsubscribe kapan saja</li>
          </ul>
          <p className="mt-3">
            Cara request semua itu: kirim email ke <a href="mailto:cs@jualakun.id" className="text-brand-600 hover:text-brand-700 underline">cs@jualakun.id</a> dengan subject &quot;Privacy Request: [jenis request]&quot;. Kami proses dalam <strong className="text-ink">7 hari kerja</strong>.
          </p>
        </Section>

        <Section number="7" title="Cookie & Tracking">
          <p>
            Kami pakai cookie minimal — cuma untuk session login dan preferensi UI (misal: remember last visited section). Tidak ada cookie pihak ketiga untuk advertising / cross-site tracking.
          </p>
          <p className="mt-3">
            Untuk analytics, kami pakai self-hosted solution (data tetap di infrastruktur kami sendiri, tidak dikirim ke Google Analytics / Facebook Pixel / dll).
          </p>
        </Section>

        <Section number="8" title="Anak di Bawah Umur">
          <p>
            Layanan kami untuk pengguna usia <strong className="text-ink">17 tahun ke atas</strong>. Kalau kamu di bawah umur dan terlanjur daftar tanpa persetujuan ortu, langsung hubungi kami untuk hapus akun & data terkait.
          </p>
        </Section>

        <Section number="9" title="Perubahan Kebijakan">
          <p>
            Kalau ada perubahan signifikan di kebijakan ini, kami:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Update tanggal &quot;berlaku mulai&quot; di atas halaman ini</li>
            <li>Kirim email notifikasi ke semua user terdaftar</li>
            <li>Tampilkan banner di dashboard untuk perubahan major</li>
          </ul>
        </Section>

        <Section number="10" title="Kontak untuk Hal Privasi">
          <p>
            Punya pertanyaan, concern, atau request terkait data kamu? Hubungi:
          </p>
          <div className="mt-4 rounded-xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
            <div className="flex items-start gap-3">
              <Mail className="text-brand-600 shrink-0 mt-1" size={20} />
              <div className="text-ink">
                <p>
                  Email:{' '}
                  <a href="mailto:cs@jualakun.id" className="text-brand-600 hover:text-brand-700 underline font-semibold">
                    cs@jualakun.id
                  </a>
                </p>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Subject line: <strong className="text-ink">Privacy: [topik]</strong> — supaya langsung di-route ke tim yang handle privacy.
                </p>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Atau via <Link href="/kontak" className="text-brand-600 hover:text-brand-700 underline">halaman kontak</Link> — dijawab dalam jam operasional 06.00–00.00 WIB.
                </p>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </section>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink flex items-baseline gap-2.5">
        <span className="text-brand-500 font-mono text-base">{number}.</span>
        <span>{title}</span>
      </h2>
      <div className="mt-3 leading-relaxed">{children}</div>
    </div>
  )
}

function ProviderRow({ name, purpose, data }: { name: string; purpose: string; data: string }) {
  return (
    <tr className="border-t border-black/10">
      <td className="px-4 py-2.5 font-semibold text-ink">{name}</td>
      <td className="px-4 py-2.5 text-ink-muted">{purpose}</td>
      <td className="px-4 py-2.5 text-ink-muted">{data}</td>
    </tr>
  )
}
