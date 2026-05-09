import type { Context, Next } from 'hono'
import type { Bindings } from '@/types/bindings'

const KEYS: (keyof Bindings)[] = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ENCRYPTION_KEY',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'MIDTRANS_IS_PRODUCTION',
  'WAHA_BASE_URL',
  'WAHA_API_KEY',
  'WAHA_SESSION',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'ADMIN_WHATSAPP_NUMBER',
  'CORS_ORIGINS',
  'CRON_SECRET',
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
