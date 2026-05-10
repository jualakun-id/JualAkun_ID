import Link from 'next/link'
import { FileText, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Aturan main pakai Jualakun.id — ditulis biar jelas, bukan biar kamu pusing. Tentang akun, pembayaran, garansi, dan hal-hal yang perlu kamu tahu sebelum belanja.',
}

export default function SyaratKetentuanPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <FileText size={12} /> Aturan Main
        </span>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl font-extrabold text-ink leading-tight">
          Syarat & Ketentuan
        </h1>
        <p className="mt-3 text-sm text-ink-subtle">
          Versi 1.1 · Berlaku mulai 10 Mei 2026
        </p>
      </div>

      {/* ── Pembukaan ────────────────────────────────────── */}
      <div className="mt-10 rounded-2xl border-2 border-black bg-brand-50 p-5 md:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <p className="text-ink leading-relaxed">
          Dokumen ini bukan kontrak hukum berbahasa robot — kami tulis dengan bahasa manusia supaya kamu beneran ngerti apa yang kamu setujui. Tapi tetap mengikat secara hukum, jadi <strong>baca pelan-pelan</strong> sebelum daftar atau belanja, ya.
        </p>
      </div>

      {/* ── Sections ─────────────────────────────────────── */}
      <div className="mt-10 space-y-10 text-ink-muted">
        <Section number="1" title="Kapan Syarat Ini Berlaku">
          <p>
            Begitu kamu klik &quot;Daftar&quot;, login, atau melakukan pembelian di Jualakun.id, otomatis kamu setuju semua poin di halaman ini. Kalau ada yang nggak kamu sepakati, please <strong className="text-ink">jangan lanjutkan transaksi</strong> — lebih baik tanya dulu via WhatsApp atau email <a href="mailto:cs@jualakun.id" className="text-brand-600 hover:text-brand-700 underline">cs@jualakun.id</a>.
          </p>
          <p className="mt-3">
            Kamu juga harus <strong className="text-ink">berusia minimal 17 tahun</strong> atau punya izin dari orang tua/wali. Karena ini transaksi keuangan, kami nggak bisa terima user di bawah umur tanpa pendamping.
          </p>
        </Section>

        <Section number="2" title="Akun & Keamanan">
          <p>
            Kamu wajib pakai data asli (email aktif, nomor WA aktif) waktu daftar — karena ke situ kami kirim akun pesanan, notifikasi pembayaran, dan klaim garansi. Akun fiktif berisiko nggak bisa nerima delivery.
          </p>
          <p className="mt-3">
            <strong className="text-ink">Password adalah tanggung jawab kamu.</strong> Kalau akun Jualakun.id kamu kebobolan dan ada transaksi nggak sah, kami akan bantu investigasi tapi tidak bertanggung jawab atas kerugian yang muncul karena password bocor (misalnya: kamu pakai password yang sama dengan akun lain yang udah pernah leaked).
          </p>
          <p className="mt-3">
            Satu user = satu akun. Membuat akun ganda untuk abuse promo / referral akan kena suspend.
          </p>
        </Section>

        <Section number="3" title="Pembelian & Pembayaran">
          <p>
            Semua pembayaran diproses lewat <strong className="text-ink">Duitku</strong> sebagai payment gateway resmi kami. Metode yang tersedia: GoPay, OVO, DANA, ShopeePay, QRIS, Virtual Account semua bank besar (BCA, BNI, BRI, Mandiri, Permata), retail (Indomaret, Alfamart), dan kartu kredit.
          </p>
          <p className="mt-3">
            Pesanan yang sudah dibuat harus dibayar dalam <strong className="text-ink">24 jam</strong>. Lewat dari itu, sistem otomatis mengubah status jadi <em>expired</em> dan stok dikembalikan ke pool — kamu perlu order ulang kalau masih mau.
          </p>
          <p className="mt-3">
            Harga di website adalah harga final dalam Rupiah (IDR), sudah termasuk biaya layanan. Tidak ada biaya tersembunyi. Biaya admin payment gateway (kalau ada, misal untuk virtual account bank tertentu) ditampilkan eksplisit di halaman checkout sebelum kamu konfirmasi.
          </p>
        </Section>

        <Section number="4" title="Pengiriman Akun">
          <p>
            Setelah pembayaran <strong className="text-ink">dikonfirmasi sukses</strong> oleh Duitku, akun yang kamu beli langsung dikirim ke dashboard akun Jualakun.id kamu — biasanya kurang dari 5 menit. Notifikasi juga dikirim via:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Email ke alamat yang terdaftar</li>
            <li>WhatsApp ke nomor yang terdaftar</li>
            <li>Notifikasi in-app di dashboard</li>
          </ul>
          <p className="mt-3">
            Kalau lewat 30 menit kamu belum dapat akun, hubungi kami via WhatsApp — biasanya itu cuma masalah notifikasi yg pending, akun-nya udah ada di dashboard. Kalau memang belum delivered, kami refund 100%.
          </p>
        </Section>

        <Section number="5" title="Garansi & Klaim">
          <p>
            Mayoritas produk kami punya masa garansi (tertera jelas di tiap halaman produk — biasanya 1, 7, 14, atau 30 hari). Ada juga produk yang <strong className="text-ink">tanpa garansi</strong> — biasanya akun super langka atau yang harga modalnya sudah sangat tipis. Status garansi selalu transparan di halaman produk sebelum kamu beli.
          </p>
          <p className="mt-3">
            <strong className="text-ink">Cara klaim garansi:</strong>
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-6">
            <li>Buka dashboard → Pesanan Saya → pilih order yang bermasalah</li>
            <li>Klik &quot;Klaim Garansi&quot; → tulis kronologi singkat → upload screenshot bukti masalah</li>
            <li>Admin review dalam 1×24 jam → kalau valid, kami kirim akun pengganti atau refund (pilihan kamu)</li>
          </ol>
          <p className="mt-3">
            Garansi <strong className="text-ink">tidak berlaku</strong> untuk: akun yang kamu rusak sendiri (misalnya ganti email/password tanpa konfirmasi), akun yang kena suspend karena pelanggaran ToS dari penyedia layanan asli (misal Spotify suspend karena akses dari multiple negara dalam waktu dekat), atau klaim setelah masa garansi habis.
          </p>
        </Section>

        <Section number="6" title="Yang Boleh & Tidak Boleh">
          <p>
            Akun yang kamu beli adalah untuk <strong className="text-ink">penggunaan pribadi</strong>. Boleh dipakai untuk kerja, belajar, hobi — silakan. Tapi ada beberapa hal yang nggak boleh:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li><strong className="text-ink">Jual ulang</strong> akun ke pihak lain dengan harga lebih tinggi (akun untuk satu user, bukan untuk reseller)</li>
            <li><strong className="text-ink">Klaim refund palsu</strong> — bilang akun bermasalah padahal kamu pakai dengan baik. Kami punya log delivery dan akses</li>
            <li><strong className="text-ink">Bikin akun ganda</strong> untuk abuse promo, referral, atau garansi</li>
            <li><strong className="text-ink">Reverse engineer / scraping</strong> sistem kami untuk tujuan komersial</li>
            <li>Pakai akun untuk <strong className="text-ink">aktivitas ilegal</strong> (penyebaran konten terlarang, fraud, dll)</li>
          </ul>
          <p className="mt-3">
            Pelanggaran = akun Jualakun.id kamu di-suspend, semua pesanan aktif di-cancel tanpa refund, dan kasus serius bisa kami laporkan ke pihak berwenang.
          </p>
        </Section>

        <Section number="7" title="Refund & Pembatalan">
          <p>
            Karena produk kami adalah <strong className="text-ink">akun digital yang langsung delivered</strong>, refund tidak otomatis tersedia setelah akun dikirim. Refund hanya berlaku untuk:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Akun gagal delivered (sistem error) → refund 100% otomatis</li>
            <li>Akun bermasalah dalam masa garansi & kami tidak punya stok pengganti → refund 100%</li>
            <li>Klaim ditolak karena di luar syarat garansi → tidak ada refund (sudah jelas di halaman produk sebelum beli)</li>
          </ul>
          <p className="mt-3">
            Refund diproses ke metode pembayaran asal dalam <strong className="text-ink">1-3 hari kerja</strong>, atau bisa juga dikonversi jadi <strong className="text-ink">saldo Jualakun.id</strong> (langsung masuk, bisa dipakai belanja lagi tanpa tunggu transfer).
          </p>
        </Section>

        <Section number="8" title="Batas Tanggung Jawab">
          <p>
            Kami berusaha keras menjaga kualitas, tapi ada hal di luar kontrol kami yang perlu kamu pahami:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Kalau penyedia layanan asli (Anthropic, OpenAI, Google, Adobe, dll) melakukan perubahan kebijakan yang mengakhiri layanan tertentu — itu di luar kontrol kami. Kami akan informasikan & kompensasi sesuai sisa masa garansi.</li>
            <li>Kerugian tidak langsung (lost profit, lost data, dll) tidak menjadi tanggung jawab kami. Tanggung jawab maksimal kami adalah <strong className="text-ink">sebesar nilai transaksi</strong> produk yang bermasalah.</li>
            <li>Kami tidak menjamin uptime 100% — kadang ada maintenance terjadwal atau gangguan dari payment gateway / penyedia layanan.</li>
          </ul>
        </Section>

        <Section number="9" title="Perubahan Syarat">
          <p>
            Kami bisa update syarat ini sewaktu-waktu (misalnya: tambah metode bayar baru, sesuaikan dengan regulasi pemerintah, dll). Kalau ada perubahan signifikan, kami:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>Update tanggal &quot;berlaku mulai&quot; di atas halaman ini</li>
            <li>Kirim notifikasi email ke semua user terdaftar (untuk perubahan major)</li>
            <li>Tampilkan banner di dashboard sampai kamu acknowledge</li>
          </ul>
          <p className="mt-3">
            Kalau kamu tetap pakai Jualakun.id setelah perubahan, artinya kamu menyetujui versi baru.
          </p>
        </Section>

        <Section number="10" title="Hukum yang Berlaku">
          <p>
            Syarat ini diatur oleh <strong className="text-ink">hukum Republik Indonesia</strong>. Kalau ada sengketa, kita selesaikan dulu secara musyawarah dalam 30 hari. Kalau nggak ketemu titik terang, sengketa diselesaikan via Pengadilan Negeri di tempat domisili pengelola Jualakun.id.
          </p>
        </Section>
      </div>

      {/* ── Footer note ──────────────────────────────────── */}
      <div className="mt-12 rounded-2xl border-2 border-black bg-white p-5 md:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-brand-600 shrink-0 mt-1" size={20} />
          <div className="text-ink">
            <p className="font-semibold">Masih ada yang nggak jelas?</p>
            <p className="mt-1.5 text-ink-muted text-sm leading-relaxed">
              Mendingan tanya dulu sebelum belanja. Hubungi kami via{' '}
              <a href="mailto:cs@jualakun.id" className="text-brand-600 hover:text-brand-700 underline">cs@jualakun.id</a>{' '}
              atau{' '}
              <Link href="/kontak" className="text-brand-600 hover:text-brand-700 underline">halaman kontak</Link>{' '}
              — admin manusia akan bantu jawab.
            </p>
          </div>
        </div>
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
