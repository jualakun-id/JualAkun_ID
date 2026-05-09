import Link from 'next/link'
import { Mail, Phone, Clock, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/branding/logo'

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="container mx-auto px-4 py-14 max-w-7xl">
        {/* ── TOP: Brand intro ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-10 border-b border-white/10">
          <div className="max-w-sm">
            <Logo size="lg" showTagline inverted />
            <p className="mt-5 text-sm text-white/60 leading-relaxed">
              Marketplace akun digital langka & sulit dicari di tempat lain — premium, asli, dengan garansi resmi.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-end text-xs text-white/50">
            <ShieldCheck size={14} className="text-brand-400" />
            <span>Terdaftar &amp; Aman</span>
          </div>
        </div>

        {/* ── BOTTOM: Links + Contact ──────────────────────── */}
        <div className="grid gap-10 pt-10 grid-cols-1 sm:grid-cols-3">
          <FooterColumn
            title="Jualakun.id"
            links={[
              { href: '/tentang', label: 'Tentang Kami' },
              { href: '/#cara-pesan', label: 'Cara Pesan' },
              { href: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
              { href: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
              { href: '/kontak', label: 'Laporan Kendala' },
            ]}
          />

          <FooterColumn
            title="Produk"
            links={[
              { href: '/#streaming', label: 'Streaming' },
              { href: '/#gaming', label: 'Gaming' },
              { href: '/#ai-produktif', label: 'AI & Produktif' },
              { href: '/#faq', label: 'FAQ' },
            ]}
          />

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-brand-400 shrink-0" />
                <a href="mailto:cs@jualakun.id" className="hover:text-brand-400 transition-colors">
                  cs@jualakun.id
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-brand-400 shrink-0" />
                <span>WhatsApp Support</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={14} className="text-brand-400 shrink-0 mt-0.5" />
                <span>Setiap hari, 06.00 – 00.00 WIB</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Copyright bar ─────────────────────────────────── */}
      <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Jualakun.id. Hak cipta dilindungi.
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-white/60">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-brand-400 transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
