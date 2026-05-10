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
        <Link href="/daftar" className="text-ink-muted hover:text-ink">
          Belum punya akun? <span className="text-brand-600 font-bold">Daftar</span>
        </Link>
      </div>
    </>
  )
}
