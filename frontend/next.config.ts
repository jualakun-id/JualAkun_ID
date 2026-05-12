import type { NextConfig } from 'next'

// Security headers diterapkan ke semua route. Dipakai untuk hardening
// XSS / clickjacking / content type sniffing. Beberapa direktif sengaja
// permissive supaya tidak break Next.js inline scripts + Vercel dev.
const securityHeaders = [
  // Block embed di iframe luar (anti clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Disable MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info ke origin saja
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Permissions Policy — disable hardware/sensors yang gak relevan e-commerce
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // CSP — permissive supaya gak block Next.js inline script, Supabase, Duitku,
  // Resend, dan Canboso. Adjust kalau ada third-party tracker tambahan.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.duitku.com https://app.duitku.com https://*.vercel.app",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: ",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.jualakun.id https://*.duitku.com https://canboso.com",
      "frame-src https://sandbox.duitku.com https://app.duitku.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
