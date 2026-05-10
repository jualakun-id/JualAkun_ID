import Link from 'next/link'
import { Sparkles, Heart, ShieldCheck, Zap, MessageCircle, Users } from 'lucide-react'

export const metadata = {
  title: 'Tentang Kami',
  description:
    'Cerita di balik Jualakun.id — kenapa kami fokus jualan akun digital langka yang sulit dicari, dan bagaimana kami menjaga semuanya tetap asli & bergaransi.',
}

export default function TentangPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Sparkles size={12} /> Cerita Kami
        </span>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl font-extrabold text-ink leading-tight">
          Lahir dari frustrasi nyari akun langka di Indonesia.
        </h1>
        <p className="mt-5 text-ink-muted text-lg leading-relaxed">
          Pernah nggak sih, kamu pengen coba <strong className="text-ink">Cursor</strong>, <strong className="text-ink">Claude Pro</strong>, atau <strong className="text-ink">Suno Premium</strong> — tapi pas cek harganya jadi nyesek karena bayar pakai dolar? Atau pas cari di marketplace, yang muncul cuma Netflix, Spotify, Disney+ — itu-itu lagi.
        </p>
        <p className="mt-4 text-ink-muted text-lg leading-relaxed">
          Itu masalah yang sama yang kami alami. Jadi kami bikin <strong className="text-brand-600">Jualakun.id</strong>.
        </p>
      </div>

      {/* ── Mengapa kami berbeda ─────────────────────────── */}
      <div className="mt-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink">Anti Mainstream, Tetap Asli.</h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Hampir semua marketplace akun digital di Indonesia jualan barang yang sama: Netflix, Spotify, YouTube Premium. Pasarnya udah penuh, harganya udah perang. Kami pilih jalan beda — fokus di <strong className="text-ink">akun-akun yang justru paling sulit kamu temui</strong>:
        </p>
        <ul className="mt-5 space-y-3 text-ink-muted leading-relaxed">
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold shrink-0">→</span>
            <span><strong className="text-ink">AI tools premium</strong> — ChatGPT Plus, Claude Pro, Grok Super, Gemini AI Pro, Google Ultra. Tools yang ngubah cara kamu kerja, tapi langganan resminya $20/bulan ke atas.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold shrink-0">→</span>
            <span><strong className="text-ink">Tools kreator</strong> — Adobe CC, Canva Pro, CapCut Pro. Yang bikin kamu produktif tanpa nunggu trial habis.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold shrink-0">→</span>
            <span><strong className="text-ink">AI generation langka</strong> — Suno Premium, Kling AI, ElevenLabs, Krea Business. Yang aksesnya di Indonesia ribet karena butuh kartu kredit luar.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-500 font-bold shrink-0">→</span>
            <span><strong className="text-ink">Akun bisnis spesifik</strong> — Adobe Stock Contributor untuk yang mau jadi kontributor stock photo/video.</span>
          </li>
        </ul>
        <p className="mt-5 text-ink-muted leading-relaxed">
          Intinya: kalau kamu lagi cari akun yang nggak ada di tempat lain, itulah yang kami siapkan.
        </p>
      </div>

      {/* ── Janji kami ───────────────────────────────────── */}
      <div className="mt-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink">Yang Kami Janjikan</h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Beli akun digital itu rawan ketipu — kami sadar betul itu. Makanya semua yang kami jual punya 4 standar yang nggak bisa ditawar:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<ShieldCheck className="text-brand-600" size={22} />}
            title="Asli, bukan bajakan"
            desc="Akun kami didapat dari distributor & kontributor resmi. Bukan akun crack, bukan akun curian. Kalau ada yang bilang Netflix Rp 5.000 sebulan, itu pasti masalah — bukan dari kami."
          />
          <FeatureCard
            icon={<Zap className="text-brand-600" size={22} />}
            title="Kirim instan"
            desc="Setelah pembayaran berhasil, akun otomatis muncul di dashboard kamu — biasanya kurang dari 5 menit. Nggak perlu chat admin, nggak perlu nunggu reply."
          />
          <FeatureCard
            icon={<Heart className="text-brand-600" size={22} />}
            title="Bergaransi"
            desc="Mayoritas produk kami punya garansi (durasinya tertera di tiap halaman produk). Kalau akun bermasalah dalam masa garansi, kami ganti atau refund — pilihan kamu."
          />
          <FeatureCard
            icon={<MessageCircle className="text-brand-600" size={22} />}
            title="Support manusia"
            desc="Bukan bot. Kalau ada masalah, lapor via WhatsApp atau dashboard — admin manusia yang bales, dan response-nya cepat di jam operasional 06.00–00.00 WIB."
          />
        </div>
      </div>

      {/* ── Untuk siapa ──────────────────────────────────── */}
      <div className="mt-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink">Untuk Siapa Jualakun.id?</h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Kami nggak bikin platform untuk semua orang — kami bikin untuk:
        </p>
        <ul className="mt-4 space-y-2.5 text-ink-muted leading-relaxed">
          <li>
            🎓 <strong className="text-ink">Mahasiswa & developer</strong> yang butuh ChatGPT Plus / Claude Pro / Cursor untuk skripsi atau project, tanpa harus minta kartu kredit ortu.
          </li>
          <li>
            🎨 <strong className="text-ink">Content creator & freelancer</strong> yang butuh Adobe CC / Canva Pro / CapCut Pro untuk produksi konten harian.
          </li>
          <li>
            🎵 <strong className="text-ink">Musisi & video creator</strong> yang explore AI generation — Suno untuk lagu, Kling untuk video, ElevenLabs untuk voice.
          </li>
          <li>
            💼 <strong className="text-ink">Pekerja knowledge & founder startup</strong> yang butuh Google Ultra / Gemini Pro / Grok Super untuk research dan productivity.
          </li>
        </ul>
      </div>

      {/* ── Bagaimana kami menjaga harga tetap masuk akal ── */}
      <div className="mt-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink">Kenapa Bisa Lebih Murah?</h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Pertanyaan paling sering ditanyain. Jawabannya jujur: kami beli akun premium dalam jumlah besar lewat partnership distributor & program family/team plan resmi, lalu sediakan slot untuk customer Indonesia. Jadi kamu dapat akses real ke layanan asli, dengan harga yang masuk akal di kantong rupiah.
        </p>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Yang <strong className="text-ink">tidak</strong> kami lakukan: jualan akun trial yang habis dalam seminggu, akun share yang kepakai 50 orang, atau akun curian yang bisa di-banned kapan saja. Ini bisnis jangka panjang — kalau curang, kami bangkrut bulan depan.
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="mt-14 rounded-2xl border-2 border-black bg-brand-50 p-6 md:p-8 shadow-[0_4px_0_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-3">
          <Users className="text-brand-700 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-heading text-xl font-extrabold text-ink">Siap nyobain?</h3>
            <p className="mt-2 text-ink-muted leading-relaxed">
              Cek katalog produk kami — ada 16+ akun premium dari kategori AI & kreator yang siap kirim instan ke dashboard kamu.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/#ai"
                className="bg-brand-500 hover:bg-brand-400 text-ink font-bold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm inline-flex items-center"
              >
                Lihat Katalog
              </Link>
              <Link
                href="/kontak"
                className="bg-white hover:bg-gray-50 text-ink font-bold px-5 py-2.5 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm inline-flex items-center"
              >
                Tanya Dulu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="font-heading text-base font-extrabold text-ink">{title}</h3>
      </div>
      <p className="mt-2.5 text-sm text-ink-muted leading-relaxed">{desc}</p>
    </div>
  )
}
