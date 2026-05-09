import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

type Props = { searchParams: Promise<{ order_id?: string }> }

export const metadata = { title: 'Pesanan Berhasil' }

export default async function CheckoutSelesaiPage({ searchParams }: Props) {
  const { order_id } = await searchParams
  return (
    <section className="container mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 size={32} strokeWidth={1.5} />
      </div>
      <h1 className="mt-5 font-heading text-h1">Pesanan Berhasil</h1>
      <p className="mt-3 text-ink-muted">
        Pembayaran sedang diproses. Setelah dikonfirmasi, akun akan otomatis terkirim ke dashboard
        Anda dalam &lt; 5 menit.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order_id ? (
          <Link
            href={`/dashboard/pesanan/${order_id}`}
            className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
          >
            Lihat Pesanan
          </Link>
        ) : null}
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-ink hover:border-brand-500"
        >
          Ke Dashboard
        </Link>
      </div>
    </section>
  )
}
