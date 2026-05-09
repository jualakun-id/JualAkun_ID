import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jualakun.id'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/checkout', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
