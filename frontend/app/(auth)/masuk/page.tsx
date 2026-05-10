import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata = { title: 'Masuk' }

export default function MasukPage() {
  return (
    <>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Selamat datang lagi</h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Masuk ke akunmu untuk akses dashboard, riwayat pesanan, dan klaim garansi.
      </p>
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
