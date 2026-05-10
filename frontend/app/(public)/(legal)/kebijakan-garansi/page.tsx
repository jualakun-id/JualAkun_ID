import Link from 'next/link'
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Garansi & Refund',
  description:
    'Cara kerja garansi & refund di Jualakun.id — apa yang dijamin, apa yang nggak, dan langkah klaim. Plain language, no jargon.',
}

export default function KebijakanGaransiPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <ShieldCheck size={12} /> Garansi & Refund
        </span>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl font-extrabold text-ink leading-tight tracking-tight">
          Kebijakan Garansi & Refund
        </h1>
        <p className="mt-3 text-sm text-ink-subtle font-medium">
          Versi 1.1 · Berlaku mulai 10 Mei 2026
        </p>
      </div>

      {/* ── Pembukaan ────────────────────────────────────── */}
      <div className="mt-10 rounded-2xl border-2 border-black bg-brand-50 p-5 md:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <p className="text-ink leading-relaxed">
          Garansi kami nyata, bukan sekadar tulisan di banner. Kalau akun yang kamu beli bermasalah dalam masa garansi, kami pasti ganti atau refund — tinggal klaim, lewatin sedikit verifikasi, beres. Halaman ini menjelaskan bagaimana persisnya.
        </p>
      </div>

      {/* ── Quick reference card ─────────────────────────── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="text-success" size={22} strokeWidth={2.25} />
            <h2 className="font-heading text-lg font-extrabold text-ink">Yang dijamin</h2>
          </div>
          <ul className="mt-3 space-y-2 text-[15px] text-ink-muted leading-relaxed font-medium">
            <li>✅ Akun nggak bisa login dari awal</li>
            <li>✅ Akun ke-suspend tanpa kesalahan kamu</li>
            <li>✅ Subscription dibatalkan provider sebelum periode berakhir</li>
            <li>✅ Salah kirim akun (nama produk berbeda)</li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2.5">
            <XCircle className="text-danger" size={22} strokeWidth={2.25} />
            <h2 className="font-heading text-lg font-extrabold text-ink">Yang nggak dijamin</h2>
          </div>
          <ul className="mt-3 space-y-2 text-[15px] text-ink-muted leading-relaxed font-medium">
            <li>❌ Kamu ganti email/password sendiri lalu kena suspend</li>
            <li>❌ Akun di-share ke orang lain</li>
            <li>❌ Garansi sudah habis</li>
            <li>❌ Produk yang memang dijual tanpa garansi (tertera di halaman produk)</li>
          </ul>
        </div>
      </div>

      {/* ── Sections ─────────────────────────────────────── */}
      <div className="mt-10 space-y-10 text-ink-muted">
        <Section number="1" title="Berapa Lama Masa Garansinya?">
          <p>
            <strong className="text-ink">Tiap produk punya masa garansi sendiri</strong> — selalu tertera jelas di halaman produk sebelum kamu beli. Berikut umumnya:
          </p>
          <div className="mt-4 rounded-xl border border-black/10 overflow-hidden">
            <table className="w-full text-[15px]">
              <thead className="bg-brand-50 text-ink">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold">Tipe Produk</th>
                  <th className="text-left px-4 py-2.5 font-bold">Garansi</th>
                </tr>
              </thead>
              <tbody className="bg-white text-ink-muted font-medium">
                <Row label="Streaming reguler (legacy)" value="30 hari" />
                <Row label="AI tools premium (Claude Pro, ChatGPT)" value="30 hari (Full Garansi)" />
                <Row label="Tools kreator (Adobe CC, Canva Pro)" value="14–30 hari" />
                <Row label="Akun langka (label “Garansi 1D”)" value="1 hari" />
                <Row label="Akun super langka (label “Tanpa Garansi”)" value="Tidak ada" />
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Garansi <strong className="text-ink">mulai dihitung dari saat akun di-deliver</strong> ke dashboard kamu, bukan dari saat order dibuat.
          </p>
        </Section>

        <Section number="2" title="Cara Klaim Garansi (3 Langkah)">
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center">1</span>
              <div className="pt-0.5">
                <p className="font-bold text-ink">Buka pesanan yang bermasalah</p>
                <p className="mt-1 text-[15px]">Login → Dashboard → Pesanan Saya → klik order yang mau diklaim</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center">2</span>
              <div className="pt-0.5">
                <p className="font-bold text-ink">Tekan tombol &quot;Klaim Garansi&quot;</p>
                <p className="mt-1 text-[15px]">Tulis kronologi singkat (kapan mulai bermasalah, gejala apa) dan upload screenshot bukti (error message, suspend page, dll)</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center">3</span>
              <div className="pt-0.5">
                <p className="font-bold text-ink">Tunggu admin review (max 1×24 jam)</p>
                <p className="mt-1 text-[15px]">Kalau valid, kami kirim akun pengganti atau refund (kamu bisa pilih). Kalau perlu info tambahan, admin chat kamu lewat tiket.</p>
              </div>
            </li>
          </ol>
        </Section>

        <Section number="3" title="Pilihan Resolusi">
          <p>Setelah klaim diverifikasi, kamu bisa pilih:</p>
          <ul className="mt-3 space-y-2 list-disc pl-6">
            <li>
              <strong className="text-ink">Akun pengganti</strong> — kami kirim akun baru ke dashboard, sisa periode garansi tetap berlaku
            </li>
            <li>
              <strong className="text-ink">Refund kredit</strong> — saldo masuk akun Jualakun.id, bisa dipakai belanja lagi tanpa nunggu transfer (paling cepat)
            </li>
            <li>
              <strong className="text-ink">Refund ke metode bayar asal</strong> — uang balik ke rekening / e-wallet kamu (3–7 hari kerja, tergantung bank)
            </li>
          </ul>
          <p className="mt-3">
            Default-nya kami offer akun pengganti dulu, karena itu yang paling cepat. Tapi kalau memang stok habis atau kamu prefer refund, kami fasilitasi.
          </p>
        </Section>

        <Section number="4" title="Kalau Klaim Ditolak?">
          <p>
            Kami transparan kalau klaim ditolak — alasannya akan dijelaskan di balasan tiket. Beberapa alasan umum:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc pl-6">
            <li>Garansi sudah habis (lebih dari masa yang tertera)</li>
            <li>Produk memang dijual tanpa garansi (jelas di halaman produk)</li>
            <li>Bukti screenshot tidak menunjukkan masalah aktual</li>
            <li>Indikasi penyalahgunaan (akun di-share, dijual ulang, dll)</li>
          </ul>
          <p className="mt-3">
            Kalau kamu nggak setuju dengan keputusan, balas tiket dengan info tambahan — tim akan re-review. Kalau masih buntu, escalate ke{' '}
            <a href="mailto:cs@jualakun.id?subject=Eskalasi%20Klaim%20Garansi" className="text-brand-600 hover:text-brand-700 underline">cs@jualakun.id</a>.
          </p>
        </Section>

        <Section number="5" title="Tips Supaya Garansi Berlaku Maksimal">
          <ul className="space-y-2 list-disc pl-6">
            <li><strong className="text-ink">Jangan ganti email/password akun yang dibeli</strong>, kecuali memang dianjurkan di halaman produk</li>
            <li><strong className="text-ink">Jangan share akun</strong> ke teman/keluarga — banyak provider deteksi multiple location & auto-suspend</li>
            <li><strong className="text-ink">Login dari satu device dulu</strong>, baru pelan-pelan tambah device kalau perlu</li>
            <li><strong className="text-ink">Screenshot setiap masalah segera</strong>, supaya kalau klaim, bukti masih jelas dengan timestamp</li>
            <li><strong className="text-ink">Klaim sebelum garansi habis</strong> — tiket yang dibuka di hari terakhir tetap diproses, jadi jangan tunda</li>
          </ul>
        </Section>
      </div>

      {/* ── Footer note ──────────────────────────────────── */}
      <div className="mt-12 rounded-2xl border-2 border-black bg-white p-5 md:p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-brand-600 shrink-0 mt-1" size={22} strokeWidth={2.25} />
          <div className="text-ink">
            <p className="font-heading font-extrabold">Masih ragu?</p>
            <p className="mt-1.5 text-ink-muted text-[15px] leading-relaxed font-medium">
              Cek halaman <Link href="/syarat-ketentuan" className="text-brand-700 hover:text-brand-800 underline font-semibold">Syarat & Ketentuan</Link>{' '}
              untuk konteks lengkap, atau{' '}
              <Link href="/kontak" className="text-brand-700 hover:text-brand-800 underline font-semibold">tanya langsung</Link>{' '}
              ke kami sebelum belanja.
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
      <h2 className="font-heading text-xl md:text-2xl font-extrabold text-ink flex items-baseline gap-2.5 tracking-tight">
        <span className="text-brand-500 font-mono text-base">{number}.</span>
        <span>{title}</span>
      </h2>
      <div className="mt-3 leading-relaxed text-[15px] font-medium">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-t border-black/10">
      <td className="px-4 py-2.5">{label}</td>
      <td className="px-4 py-2.5 text-ink font-bold">{value}</td>
    </tr>
  )
}
