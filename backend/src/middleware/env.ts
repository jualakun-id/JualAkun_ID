import type { Context, Next } from 'hono'
import type { Bindings } from '@/types/bindings'

const KEYS: (keyof Bindings)[] = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ENCRYPTION_KEY',
  'PUBLIC_API_URL',
  'PUBLIC_SITE_URL',
  'WAHA_BASE_URL',
  'WAHA_API_KEY',
  'WAHA_SESSION',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'ADMIN_WHATSAPP_NUMBER',
  'ADMIN_WA_GROUP_ID',
  'WAHA_STOCK_DIGEST_GROUP_ID',
  'ADMIN_EMAIL',
  'QRIS_STATIC_PAYLOAD',
  'CORS_ORIGINS',
  'CRON_SECRET',
  'SUPPLIER_CANBOSO_API_KEY',
]

export async function envMiddleware(c: Context, next: Next): Promise<void> {
  const env = c.env as Partial<Bindings>
  for (const key of KEYS) {
    const value = env[key]
    if (typeof value === 'string') {
      process.env[key] = value
    }
  }
  await next()
}
