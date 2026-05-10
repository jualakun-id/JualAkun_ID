import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Verifikasi Email' }

export default function VerifikasiEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success border-2 border-success/40 shadow-[0_3px_0_rgba(15,143,79,0.4)]">
        <CheckCircle2 size={32} strokeWidth={2.25} />
      </div>
      <h1 className="mt-5 font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Email terverifikasi 🎉</h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Akunmu sudah aktif. Tinggal masuk dan kamu siap belanja akun langka di Jualakun.id.
      </p>
      <Link
        href="/masuk"
        className="mt-7 inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-400 text-ink px-7 py-3 text-base font-extrabold border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
      >
        Masuk Sekarang
      </Link>
    </div>
  )
}
