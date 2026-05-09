export const metadata = { title: 'Syarat & Ketentuan' }

export default function SyaratKetentuanPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 text-text-muted">
      <h1 className="font-heading text-h1 text-text">Syarat &amp; Ketentuan</h1>
      <p className="mt-2 text-sm text-text-subtle">Versi 1.0 — berlaku 2026-05-09</p>

      <h2 className="mt-8 font-heading text-h2 text-text">1. Penerimaan Syarat</h2>
      <p className="mt-2">
        Dengan menggunakan layanan Jualakun.id, Anda menyetujui untuk terikat oleh syarat dan
        ketentuan ini.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">2. Akun Pengguna</h2>
      <p className="mt-2">
        Anda bertanggung jawab atas keamanan akun, password, dan semua aktivitas yang terjadi di akun
        Anda.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">3. Pembelian &amp; Pengiriman</h2>
      <p className="mt-2">
        Akun digital akan dikirim otomatis ke dashboard buyer setelah pembayaran berhasil dikonfirmasi
        oleh Duitku. Pesanan yang tidak dibayar dalam 24 jam akan otomatis kedaluwarsa.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">4. Garansi</h2>
      <p className="mt-2">
        Garansi berlaku sesuai durasi yang tertera pada masing-masing produk. Klaim garansi dilakukan via
        tiket di dashboard.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">5. Larangan</h2>
      <p className="mt-2">
        Pengguna dilarang menjual ulang akun, melakukan refund palsu, atau menyalahgunakan layanan.
        Pelanggaran akan mengakibatkan penangguhan akun.
      </p>

      <h2 className="mt-6 font-heading text-h2 text-text">6. Perubahan Syarat</h2>
      <p className="mt-2">
        Jualakun.id berhak mengubah syarat ini sewaktu-waktu. Perubahan akan diumumkan di halaman ini.
      </p>
    </section>
  )
}
