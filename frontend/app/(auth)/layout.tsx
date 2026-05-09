import { Logo } from '@/components/branding/logo'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-brand-50 px-4 py-12"
      style={{ fontFamily: 'var(--font-poppins), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <Link href="/" className="mb-6">
        <Logo size="md" showTagline />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {children}
      </div>
      <p className="mt-6 text-xs text-ink-subtle">
        © {new Date().getFullYear()} Jualakun.id
      </p>
    </div>
  )
}
