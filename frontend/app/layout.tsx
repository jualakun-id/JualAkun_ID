import type { Metadata } from 'next'
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { StructuredData } from '@/components/seo/structured-data'
import { ToastProvider } from '@/components/toast'

const heading = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
})

const body = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
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
    default: 'Jualakun.id — Marketplace Akun Digital Langka & Premium',
    template: '%s | Jualakun.id',
  },
  description:
    'Anti Mainstream, Tetap Asli. Marketplace akun digital premium langka — Cursor, Claude Pro, ChatGPT Plus, Adobe CC, Canva Pro, dan ratusan layanan eksklusif. Asli, bergaransi, kirim instan.',
  keywords: [
    'jualakun', 'jualakun.id',
    'akun digital', 'akun premium', 'akun langka',
    'chatgpt plus murah', 'claude pro indonesia', 'cursor pro',
    'adobe cc murah', 'canva pro indonesia', 'capcut pro',
    'gemini ai pro', 'grok super', 'suno premium', 'kling ai',
    'eleven labs', 'midjourney',
    'marketplace akun', 'jual akun ai',
  ],
  authors: [{ name: 'Jualakun.id', url: 'https://jualakun.id' }],
  creator: 'Jualakun.id',
  publisher: 'Jualakun.id',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Jualakun.id',
    title: 'Jualakun.id — Marketplace Akun Digital Langka & Premium',
    description:
      'Anti Mainstream, Tetap Asli. Marketplace akun digital premium langka — Cursor, Claude Pro, ChatGPT Plus, Adobe, Canva, dan ratusan layanan eksklusif.',
    url: 'https://jualakun.id',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Jualakun.id — Anti Mainstream, Tetap Asli.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jualakun.id — Anti Mainstream, Tetap Asli.',
    description:
      'Marketplace akun digital langka & sulit dicari di tempat lain. Premium, asli, bergaransi.',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'vD7M_7UO3-5Oiv7ogL2Fs8pBfVL3WUhTypA8XU5SL4k',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`dark ${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <StructuredData />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
