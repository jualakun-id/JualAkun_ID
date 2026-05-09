export const metadata = { title: 'Kebijakan Garansi & Refund' }

export default function KebijakanGaransiPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 text-ink-muted">
      <h1 className="font-heading text-h1 text-ink">Kebijakan Garansi &amp; Refund</h1>

      <h2 className="mt-8 font-heading text-h2 text-ink">1. Cakupan Garansi</h2>
      <p className="mt-2">
        Setiap akun yang Anda beli dilindungi garansi sesuai durasi yang tertera (umumnya 30 hari sejak
        pengiriman). Garansi mencakup:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Akun tidak bisa login sejak diterima</li>
        <li>Akun ter-banned/disuspend tanpa kesalahan buyer</li>
        <li>Subscription dibatalkan sepihak oleh provider sebelum periode berakhir</li>
      </ul>

      <h2 className="mt-6 font-heading text-h2 text-ink">2. Yang Tidak Tercakup</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Buyer mengubah email/password sehingga akun ter-banned</li>
        <li>Buyer share akun ke pihak ketiga</li>
        <li>Garansi sudah habis</li>
      </ul>

      <h2 className="mt-6 font-heading text-h2 text-ink">3. Cara Klaim</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-6">
        <li>Buka halaman pesanan di dashboard</li>
        <li>Klik "Klaim Garansi", isi alasan + lampirkan screenshot</li>
        <li>Admin akan respons dalam 1x24 jam</li>
      </ol>

      <h2 className="mt-6 font-heading text-h2 text-ink">4. Resolusi</h2>
      <p className="mt-2">
        Admin dapat memilih: (a) kirim akun pengganti, (b) refund kredit yang bisa dipakai belanja, atau
        (c) refund ke metode pembayaran asal (proses 3-7 hari kerja).
      </p>
    </section>
  )
}
