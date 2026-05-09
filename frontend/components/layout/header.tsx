'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/branding/logo'

const NAV_ITEMS = [
  { href: '/#ai', label: 'AI & Asisten' },
  { href: '/#kreator', label: 'Kreator' },
  { href: '/#cara-pesan', label: 'Cara Pesan' },
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
      <div className="container mx-auto flex h-[88px] items-center justify-end md:justify-between px-4 max-w-7xl relative">
        {/* Logo — centered on mobile, left-aligned on desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Logo size="md" showTagline />
        </div>

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
            className="text-sm font-semibold px-4 py-2 rounded-lg text-ink-muted hover:text-brand-600 hover:bg-brand-50 transition-all duration-150"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="text-sm font-semibold px-5 py-2 rounded-lg border-2 border-black bg-brand-700 text-white hover:bg-brand-800 shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
          >
            Daftar
          </Link>
        </div>

        {/* Mobile hamburger — line art style with neo-brutalist shadow */}
        <button
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          className="md:hidden relative p-2 rounded-lg text-ink bg-white border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} strokeWidth={3} /> : <Menu size={22} strokeWidth={3} />}
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
              className="mt-1 px-5 py-2.5 rounded-lg border-2 border-black bg-brand-700 text-white text-center font-semibold shadow-[0_3px_0_rgba(0,0,0,0.9)] active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)]"
            >
              Daftar Sekarang
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
