import Link from 'next/link'
import { Mail, Phone, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00B8D9] text-sm font-black text-white">
              J
            </div>
            <span className="font-bold text-lg text-white">
              Jual<span className="text-[#00B8D9]">Akun</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            JualAkun hadir untuk bantu kamu mendapatkan akses ke layanan favorit dengan cara yang aman, mudah, dan hemat.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-white/40">
            <span>Terdaftar dan aman</span>
          </div>
        </div>

        {/* Links */}
        <FooterColumn
          title="JualAkun"
          links={[
            { href: '/tentang', label: 'Tentang Kami' },
            { href: '/faq', label: 'Cara Pesan' },
            { href: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
            { href: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
            { href: '/kontak', label: 'Laporan Kendala' },
          ]}
        />

        <FooterColumn
          title="Produk"
          links={[
            { href: '/streaming', label: 'Streaming' },
            { href: '/gaming', label: 'Gaming' },
            { href: '/ai-produktif', label: 'AI & Produktif' },
            { href: '/vpn', label: 'VPN' },
            { href: '/edukasi', label: 'Edukasi' },
          ]}
        />

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Hubungi Kami</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-[#00B8D9] shrink-0" />
              <span>cs@jualakun.id</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-[#00B8D9] shrink-0" />
              <span>WhatsApp Support</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={14} className="text-[#00B8D9] shrink-0 mt-0.5" />
              <span>Jam Operasional<br />06.00 – 00.00 WIB</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/30">
        © {new Date().getFullYear()} JualAkun. Hak cipta dilindungi.
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
            <Link href={link.href} className="hover:text-[#00B8D9] transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
