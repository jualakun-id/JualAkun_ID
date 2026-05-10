import Link from 'next/link'
import { CheckCircle2, Clock, Bell } from 'lucide-react'

type Props = { searchParams: Promise<{ order_id?: string }> }

export const metadata = { title: 'Pesanan Berhasil' }

export default async function CheckoutSelesaiPage({ searchParams }: Props) {
  const { order_id } = await searchParams
  return (
    <section className="container mx-auto max-w-xl px-4 py-12 md:py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-success/15 text-success border-2 border-success/40 shadow-[0_4px_0_rgba(15,143,79,0.4)]">
        <CheckCircle2 size={36} strokeWidth={2.25} />
      </div>

      <h1 className="mt-6 font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
        Pesanan Diterima 🎉
      </h1>
      <p className="mt-3 text-[15px] sm:text-base text-ink-muted leading-relaxed font-medium">
        Pembayaran kamu sedang kami konfirmasi. Setelah berhasil, akun otomatis dikirim ke dashboard dalam <strong className="text-ink">&lt; 5 menit</strong>.
      </p>

      {/* Process steps */}
      <div className="mt-8 rounded-2xl border-2 border-black bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(0,0,0,0.9)] text-left">
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="flex-none w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border-2 border-brand-200 flex items-center justify-center">
              <Clock size={18} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink text-sm">Konfirmasi pembayaran</p>
              <p className="mt-0.5 text-sm text-ink-muted font-medium leading-relaxed">
                Duitku verifikasi pembayaran kamu — biasanya beberapa detik untuk QRIS/e-wallet, sampai 10 menit untuk virtual account
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-none w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border-2 border-brand-200 flex items-center justify-center">
              <CheckCircle2 size={18} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink text-sm">Akun otomatis terkirim</p>
              <p className="mt-0.5 text-sm text-ink-muted font-medium leading-relaxed">
                Begitu pembayaran sukses, akun langsung muncul di dashboard kamu — nggak perlu chat admin
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-none w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border-2 border-brand-200 flex items-center justify-center">
              <Bell size={18} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink text-sm">Notifikasi WA & email</p>
              <p className="mt-0.5 text-sm text-ink-muted font-medium leading-relaxed">
                Kami juga ping kamu via WhatsApp dan email biar nggak miss
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
        {order_id ? (
          <Link
            href={`/dashboard/pesanan/${order_id}`}
            className="bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
          >
            Lihat Pesanan →
          </Link>
        ) : null}
        <Link
          href="/dashboard"
          className="bg-white hover:bg-gray-50 text-ink font-extrabold px-6 py-3 rounded-lg border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150 text-sm"
        >
          Ke Dashboard
        </Link>
      </div>
    </section>
  )
}
