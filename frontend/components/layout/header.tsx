'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00B8D9] text-sm font-black text-white">
            J
          </div>
          <span className={`font-bold text-lg ${scrolled ? 'text-[#1A2340]' : 'text-white'}`}>
            Jual<span className="text-[#00B8D9]">Akun</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {[
            { href: '/streaming', label: 'Streaming' },
            { href: '/gaming', label: 'Gaming' },
            { href: '/ai-produktif', label: 'AI & Produktif' },
            { href: '/faq', label: 'FAQ' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-[#00B8D9] transition-colors ${
                scrolled ? 'text-[#4A5568]' : 'text-white/90 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/masuk"
            className={`text-sm font-medium transition-colors ${
              scrolled ? 'text-[#4A5568] hover:text-[#1A2340]' : 'text-white/90 hover:text-white'
            }`}
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              scrolled
                ? 'bg-[#00B8D9] text-white hover:bg-[#009EB8]'
                : 'border-2 border-white text-white hover:bg-white hover:text-[#00B8D9]'
            }`}
          >
            Daftar
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 ${scrolled ? 'text-[#1A2340]' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-[#4A5568]">
            <Link href="/streaming" onClick={() => setMenuOpen(false)} className="hover:text-[#00B8D9]">Streaming</Link>
            <Link href="/gaming" onClick={() => setMenuOpen(false)} className="hover:text-[#00B8D9]">Gaming</Link>
            <Link href="/ai-produktif" onClick={() => setMenuOpen(false)} className="hover:text-[#00B8D9]">AI & Produktif</Link>
            <Link href="/faq" onClick={() => setMenuOpen(false)} className="hover:text-[#00B8D9]">FAQ</Link>
            <hr className="border-gray-100" />
            <Link href="/masuk" onClick={() => setMenuOpen(false)} className="hover:text-[#00B8D9]">Masuk</Link>
            <Link
              href="/daftar"
              onClick={() => setMenuOpen(false)}
              className="inline-block rounded-full bg-[#00B8D9] px-5 py-2 text-center font-semibold text-white"
            >
              Daftar Sekarang
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
