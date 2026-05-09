export const metadata = { title: 'Tentang JualAkun' }

export default function TentangPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-h1">Tentang JualAkun</h1>
      <p className="mt-4 text-text-muted">
        JualAkun adalah marketplace akun digital terpercaya di Indonesia. Kami menyediakan akun premium
        Netflix, Spotify, ChatGPT, Canva, dan ratusan produk digital lainnya dengan harga terjangkau,
        garansi resmi, dan pengiriman instan.
      </p>
      <h2 className="mt-8 font-heading text-h2">Visi</h2>
      <p className="mt-2 text-text-muted">
        Menjadi platform #1 di Indonesia untuk akses akun digital premium tanpa hambatan.
      </p>
      <h2 className="mt-8 font-heading text-h2">Mengapa JualAkun?</h2>
      <ul className="mt-2 list-disc space-y-2 pl-6 text-text-muted">
        <li>Pengiriman otomatis &lt; 5 menit setelah pembayaran berhasil.</li>
        <li>Garansi penggantian atau refund jika akun bermasalah.</li>
        <li>Support WhatsApp & email 24/7.</li>
        <li>Harga transparan, tanpa biaya tersembunyi.</li>
      </ul>
    </section>
  )
}
