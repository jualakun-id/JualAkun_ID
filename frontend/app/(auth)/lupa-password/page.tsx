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
        <Link href="/masuk" className="text-ink-muted hover:text-ink">
          Inget password? <span className="text-brand-600 font-bold">Kembali masuk</span>
        </Link>
      </div>
    </>
  )
}
