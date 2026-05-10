import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jualakun.id'

/**
 * robots.txt with explicit rules for:
 *  - Standard crawlers (Googlebot, Bingbot, etc.)
 *  - AI search crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
 *  - Block private routes (admin, dashboard, checkout, api)
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/dashboard', '/checkout', '/api', '/masuk', '/daftar', '/lupa-password', '/reset-password', '/verifikasi-email']

  return {
    rules: [
      // Default: allow all
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      // AI search crawlers — explicit allow (so brand muncul di ChatGPT/Perplexity/Claude/Gemini citations)
      { userAgent: 'GPTBot',          allow: '/', disallow },
      { userAgent: 'ChatGPT-User',    allow: '/', disallow },
      { userAgent: 'OAI-SearchBot',   allow: '/', disallow },
      { userAgent: 'ClaudeBot',       allow: '/', disallow },
      { userAgent: 'Claude-Web',      allow: '/', disallow },
      { userAgent: 'anthropic-ai',    allow: '/', disallow },
      { userAgent: 'PerplexityBot',   allow: '/', disallow },
      { userAgent: 'Perplexity-User', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow },
      { userAgent: 'cohere-ai',       allow: '/', disallow },
      { userAgent: 'meta-externalagent', allow: '/', disallow },
      { userAgent: 'YouBot',          allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
