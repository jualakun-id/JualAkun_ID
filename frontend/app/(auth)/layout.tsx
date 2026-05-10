import { Logo } from '@/components/branding/logo'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-brand-50 text-ink px-4 py-12"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(18,150,168,0.15) 1.5px, transparent 0)',
        backgroundSize: '18px 18px',
      }}
    >
      <Link href="/" className="mb-8 transition-transform hover:-translate-y-0.5">
        <Logo size="md" showTagline />
      </Link>
      <div className="w-full max-w-md rounded-2xl border-2 border-black bg-white text-ink p-7 sm:p-8 shadow-[0_6px_0_rgba(0,0,0,0.9)]">
        {children}
      </div>
      <p className="mt-7 text-sm text-ink-muted font-medium">
        © {new Date().getFullYear()} Jualakun.id
      </p>
    </div>
  )
}
