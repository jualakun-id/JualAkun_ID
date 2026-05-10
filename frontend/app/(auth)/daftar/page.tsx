import Link from 'next/link'
import { Gift } from 'lucide-react'
import { RegisterForm } from './register-form'

export const metadata = { title: 'Daftar' }

type Props = { searchParams: Promise<{ ref?: string }> }

export default async function DaftarPage({ searchParams }: Props) {
  const { ref } = await searchParams
  return (
    <>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Bikin akun baru</h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Gratis, cuma butuh 1 menit. Setelah daftar kamu langsung bisa belanja.
      </p>
      {ref ? (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border-2 border-brand-200 bg-brand-50 px-3.5 py-3 text-sm font-medium text-brand-700">
          <Gift size={16} className="shrink-0 mt-0.5" />
          <span>Bergabung via kode referral <strong className="font-mono font-bold">{ref.toUpperCase()}</strong> — kamu & temanmu sama-sama dapat kredit pas transaksi pertama.</span>
        </div>
      ) : null}
      <div className="mt-6">
        <RegisterForm referralCode={ref ?? null} />
      </div>
      <div className="mt-6 text-center text-sm font-medium">
        <Link href="/masuk" className="text-ink-muted hover:text-ink">
          Sudah punya akun? <span className="text-brand-600 font-bold">Masuk</span>
        </Link>
      </div>
    </>
  )
}
