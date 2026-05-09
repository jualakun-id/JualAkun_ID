import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono, Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
})

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
  preload: false,
})

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
  preload: false,
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jualakun.id'),
  title: {
    default: 'JualAkun — Akun Digital. Murah. Langsung Aktif.',
    template: '%s | JualAkun',
  },
  description:
    'Marketplace akun digital terpercaya di Indonesia. Netflix, Spotify, ChatGPT, Canva, dan lainnya — harga murah, garansi resmi, langsung aktif.',
  keywords: ['akun digital', 'jual akun', 'netflix murah', 'spotify premium', 'chatgpt', 'canva pro'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'JualAkun',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`dark ${heading.variable} ${body.variable} ${mono.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen bg-bg text-text antialiased">{children}</body>
    </html>
  )
}
