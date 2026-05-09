import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-heading text-h3">
          <span className="font-bold text-text">Jual</span>
          <span className="font-extrabold text-primary">Akun</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
          <Link href="/streaming" className="hover:text-text">Streaming</Link>
          <Link href="/gaming" className="hover:text-text">Gaming</Link>
          <Link href="/ai-produktif" className="hover:text-text">AI &amp; Produktif</Link>
          <Link href="/faq" className="hover:text-text">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/masuk" className="text-sm text-text-muted hover:text-text">
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  )
}
