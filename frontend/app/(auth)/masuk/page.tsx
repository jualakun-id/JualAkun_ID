import Link from 'next/link'
import { Suspense } from 'react'
import { Clock } from 'lucide-react'
import { LoginForm } from './login-form'

export const metadata = { title: 'Masuk' }

type Props = { searchParams: Promise<{ reason?: string; next?: string }> }

export default async function MasukPage({ searchParams }: Props) {
  const sp = await searchParams
  const idleLogout = sp.reason === 'idle'

  return (
    <>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
        {idleLogout ? 'Sesi berakhir' : 'Selamat datang lagi'}
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        {idleLogout
          ? 'Untuk keamanan, kamu otomatis logout karena tidak ada aktivitas selama 15 menit. Silakan login kembali.'
          : 'Masuk ke akunmu untuk akses dashboard, riwayat pesanan, dan klaim garansi.'}
      </p>

      {idleLogout ? (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border-2 border-warning/40 bg-warning/10 px-3.5 py-3 text-sm font-medium text-warning">
          <Clock size={16} className="shrink-0 mt-0.5" strokeWidth={2.25} />
          <span>Sesi sebelumnya kedaluwarsa karena idle</span>
        </div>
      ) : null}

      <div className="mt-7">
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm font-medium">
        <Link href="/lupa-password" className="text-brand-600 hover:text-brand-700 underline underline-offset-2">
          Lupa password?
        </Link>
        <span className="text-ink-muted">
          Belum punya akun?{' '}
          <Link href="/daftar" className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-2">
            Daftar
          </Link>
        </span>
      </div>
    </>
  )
}
