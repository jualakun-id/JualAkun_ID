import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-heading text-h3">
            <span className="font-bold text-text">Jual</span>
            <span className="font-extrabold text-primary">Akun</span>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Akun digital terpercaya. Murah. Langsung aktif.
          </p>
        </div>
        <FooterColumn
          title="Produk"
          links={[
            { href: '/streaming', label: 'Streaming' },
            { href: '/gaming', label: 'Gaming' },
            { href: '/ai-produktif', label: 'AI & Produktif' },
            { href: '/vpn', label: 'VPN' },
          ]}
        />
        <FooterColumn
          title="Bantuan"
          links={[
            { href: '/faq', label: 'FAQ' },
            { href: '/kontak', label: 'Kontak' },
            { href: '/kebijakan-garansi', label: 'Garansi & Refund' },
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            { href: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
            { href: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
            { href: '/tentang', label: 'Tentang Kami' },
          ]}
        />
      </div>
      <div className="border-t border-border-subtle py-4 text-center text-xs text-text-subtle">
        © {new Date().getFullYear()} JualAkun. Hak cipta dilindungi.
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-h4 text-text">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-text-muted">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-text">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
