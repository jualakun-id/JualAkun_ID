import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Verifikasi Email' }

export default function VerifikasiEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 size={28} strokeWidth={1.5} />
      </div>
      <h1 className="mt-4 font-heading text-h2">Email Terverifikasi</h1>
      <p className="mt-2 text-sm text-text-muted">
        Akun Anda sudah aktif. Silakan masuk untuk mulai berbelanja.
      </p>
      <Link
        href="/masuk"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Masuk Sekarang
      </Link>
    </div>
  )
}
