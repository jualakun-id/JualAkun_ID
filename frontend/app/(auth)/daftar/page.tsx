import Link from 'next/link'
import { RegisterForm } from './register-form'

export const metadata = { title: 'Daftar' }

type Props = { searchParams: Promise<{ ref?: string }> }

export default async function DaftarPage({ searchParams }: Props) {
  const { ref } = await searchParams
  return (
    <>
      <h1 className="font-heading text-h2">Daftar Akun Baru</h1>
      <p className="mt-2 text-sm text-text-muted">
        {ref ? `Bergabung via referral kode ${ref.toUpperCase()}.` : 'Buat akun untuk mulai berbelanja.'}
      </p>
      <div className="mt-6">
        <RegisterForm referralCode={ref ?? null} />
      </div>
      <div className="mt-6 text-center text-sm">
        <Link href="/masuk" className="text-text-muted hover:text-text">
          Sudah punya akun? <span className="text-primary">Masuk</span>
        </Link>
      </div>
    </>
  )
}
