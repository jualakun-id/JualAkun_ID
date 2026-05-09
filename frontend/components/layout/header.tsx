'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/#streaming', label: 'Streaming' },
  { href: '/#gaming', label: 'Gaming' },
  { href: '/#ai-produktif', label: 'AI & Produktif' },
  { href: '/#faq', label: 'FAQ' },
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    handler()
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isActive = (href: string) => {
    // Anchor link (e.g. /#streaming) only active when on homepage
    if (href.includes('#')) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-sm border-b border-gray-100' : ''
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Jualakun.id home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-base font-black text-white shadow-sm">
            J
          </div>
          <span className="font-bold text-lg text-ink">
            Jualakun<span className="text-brand-500">.id</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-ink-muted hover:text-ink hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/masuk"
            className="text-sm font-medium px-3 py-2 rounded-lg text-ink-muted hover:text-ink hover:bg-gray-50 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-colors"
          >
            Daftar
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          className="md:hidden p-2 rounded-lg text-ink hover:bg-gray-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1 text-sm font-medium" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-2.5 rounded-lg ${
                    active ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-ink-muted hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <hr className="border-gray-100 my-2" />
            <Link
              href="/masuk"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-ink-muted hover:bg-gray-50"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              onClick={() => setMenuOpen(false)}
              className="mt-1 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-center font-semibold hover:bg-brand-600"
            >
              Daftar Sekarang
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
