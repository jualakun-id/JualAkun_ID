/**
 * JSON-LD structured data untuk Google rich results.
 * Render di root layout supaya muncul di setiap page.
 *
 * Hasil yang di-target di Google search:
 *  - Brand name + tagline di title
 *  - Description rich snippet
 *  - Sitelinks (Login, Produk, FAQ, dll) — generated automatic by Google
 *  - Logo display di knowledge panel
 */

const SITE_URL = 'https://jualakun.id'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Jualakun.id',
  alternateName: ['Jualakun', 'JualAkun', 'Jual Akun'],
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    'Marketplace akun digital langka & sulit dicari di tempat lain — premium, asli, dengan garansi resmi.',
  slogan: 'Anti Mainstream, Tetap Asli.',
  foundingDate: '2026',
  areaServed: {
    '@type': 'Country',
    name: 'Indonesia',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'cs@jualakun.id',
    availableLanguage: ['Indonesian', 'id'],
    areaServed: 'ID',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Jualakun.id',
  alternateName: 'Jualakun',
  url: SITE_URL,
  description:
    'Anti Mainstream, Tetap Asli. Marketplace akun digital premium langka — Cursor, Claude Pro, ChatGPT Plus, Adobe, Canva, dan ratusan layanan eksklusif.',
  inLanguage: 'id-ID',
  publisher: {
    '@type': 'Organization',
    name: 'Jualakun.id',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon`,
    },
  },
}

/**
 * BreadcrumbList — bantu Google identify page hierarchy untuk sitelinks.
 */
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI & Asisten',
      item: `${SITE_URL}/#ai`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Kreator & Multimedia',
      item: `${SITE_URL}/#kreator`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Cara Pesan',
      item: `${SITE_URL}/#cara-pesan`,
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'FAQ',
      item: `${SITE_URL}/#faq`,
    },
  ],
}

export function StructuredData() {
  const allSchemas = [organizationSchema, websiteSchema, breadcrumbSchema]
  return (
    <>
      {allSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
