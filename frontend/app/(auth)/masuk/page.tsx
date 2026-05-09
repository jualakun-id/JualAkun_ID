import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata = { title: 'Masuk' }

export default function MasukPage() {
  return (
    <>
      <h1 className="font-heading text-h2">Masuk ke JualAkun</h1>
      <p className="mt-2 text-sm text-text-muted">Akses dashboard dan riwayat pesanan Anda.</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/lupa-password" className="text-primary hover:text-primary-light">
          Lupa password?
        </Link>
        <Link href="/daftar" className="text-text-muted hover:text-text">
          Belum punya akun? <span className="text-primary">Daftar</span>
        </Link>
      </div>
    </>
  )
}
