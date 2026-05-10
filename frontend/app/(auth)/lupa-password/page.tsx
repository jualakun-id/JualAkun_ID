import Link from 'next/link'
import { ForgotForm } from './forgot-form'

export const metadata = { title: 'Lupa Password' }

export default function LupaPasswordPage() {
  return (
    <>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Lupa password?</h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Tenang — masukkan email kamu, kami kirim link reset dalam beberapa detik.
      </p>
      <div className="mt-7">
        <ForgotForm />
      </div>
      <div className="mt-6 text-center text-sm font-medium">
        <span className="text-ink-muted">
          Inget password?{' '}
          <Link href="/masuk" className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-2">
            Kembali masuk
          </Link>
        </span>
      </div>
    </>
  )
}
