import Link from 'next/link'
import { Mail, Phone, Clock } from 'lucide-react'
import { Logo } from '@/components/branding/logo'

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <Logo size="lg" showTagline inverted />
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            Marketplace akun digital langka & sulit dicari di tempat lain — premium, asli, dengan garansi resmi.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-white/40">
            <span>Terdaftar dan aman</span>
          </div>
        </div>

        {/* Links */}
        <FooterColumn
          title="Jualakun.id"
          links={[
            { href: '/tentang', label: 'Tentang Kami' },
            { href: '/#faq', label: 'Cara Pesan' },
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
          <h4 className="text-sm font-semibold text-white mb-3">Hubungi Kami</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-brand-400 shrink-0" />
              <span>cs@jualakun.id</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-brand-400 shrink-0" />
              <span>WhatsApp Support</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={14} className="text-brand-400 shrink-0 mt-0.5" />
              <span>Jam Operasional<br />06.00 – 00.00 WIB</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Jualakun.id. Hak cipta dilindungi.
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-white/60">
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
