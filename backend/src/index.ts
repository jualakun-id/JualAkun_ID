import { Hono } from 'hono'
import type { ScheduledEvent, ExecutionContext } from '@cloudflare/workers-types'
import { ApiError } from '@/types/errors'
import type { AppEnv, Bindings } from '@/types/bindings'

import { envMiddleware } from '@/middleware/env'
import { corsMiddleware } from '@/middleware/cors'
import { rateLimitMiddleware, authRateLimitMiddleware } from '@/middleware/rate-limit'

import { authRoute } from '@/routes/auth'
import { catalogRoute } from '@/routes/catalog'
import { checkoutRoute } from '@/routes/checkout'
import { paymentRoute } from '@/routes/payment'
import { ordersRoute } from '@/routes/orders'
import { dashboardRoute } from '@/routes/dashboard'
import { ticketsRoute } from '@/routes/tickets'
import { referralRoute } from '@/routes/referral'
import { reviewsRoute } from '@/routes/reviews'
import { adminRoute } from '@/routes/admin'
import { expireOrdersCron } from '@/routes/cron/expire-orders'
import { stockAlertsCron } from '@/routes/cron/stock-alerts'
import { retryNotificationsCron } from '@/routes/cron/retry-notifications'
import { supplierSyncStockCron } from '@/routes/cron/supplier-sync-stock'
import { customerRemindersCron } from '@/routes/cron/customer-reminders'

const app = new Hono<AppEnv>()

// Middleware order (PRD Appendix E.2)
app.use('*', envMiddleware)
app.use('*', corsMiddleware)
app.use('/api/*', rateLimitMiddleware)
app.use('/auth/*', authRateLimitMiddleware)

// Public health check
app.get('/', (c) => c.json({ data: { service: 'jualakun-backend', status: 'ok' } }))

// Public auth + catalog + payment webhook
app.route('/auth', authRoute)
app.route('/catalog', catalogRoute)
app.route('/payment', paymentRoute)

// User-scoped (auth middleware applied inside each route)
app.route('/checkout', checkoutRoute)
app.route('/orders', ordersRoute)
app.route('/dashboard', dashboardRoute)
app.route('/tickets', ticketsRoute)
app.route('/referral', referralRoute)
app.route('/reviews', reviewsRoute)

// Admin (auth + admin middleware in adminRoute itself)
app.route('/admin', adminRoute)

// Cron internal endpoints (mounted under /api so rate-limit applies; gated by x-cron-secret)
app.route('/api/cron/expire-orders', expireOrdersCron)
app.route('/api/cron/stock-alerts', stockAlertsCron)
app.route('/api/cron/retry-notifications', retryNotificationsCron)
app.route('/api/cron/supplier-sync-stock', supplierSyncStockCron)
app.route('/api/cron/customer-reminders', customerRemindersCron)

app.notFound((c) => c.json({ ok: false, code: 'NOT_FOUND', message: 'Route tidak ditemukan' }, 404))

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      { ok: false, code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
      err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502,
    )
  }
  // Unhandled error: log + fire-and-forget admin WA alert (async, don't block response)
  const errorInfo = {
    path: c.req.path,
    method: c.req.method,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined,
  }
  console.error('[unhandled]', errorInfo)
  c.executionCtx.waitUntil(notifyAdminCriticalError(errorInfo))
  return c.json({ ok: false, code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500)
})

/**
 * Fire-and-forget WA alert ke admin untuk unhandled error. Dedup per
 * (path + message) dengan window 15 menit supaya gak spam saat satu bug
 * trigger berulang.
 */
const recentErrorCache = new Map<string, number>()
async function notifyAdminCriticalError(info: { path: string; method: string; message: string; stack?: string }) {
  try {
    const key = `${info.path}|${info.message.slice(0, 80)}`
    const lastSent = recentErrorCache.get(key) ?? 0
    if (Date.now() - lastSent < 15 * 60 * 1000) return // dedup 15 menit
    recentErrorCache.set(key, Date.now())
    // Cleanup cache kalau > 50 entry biar tidak unbounded
    if (recentErrorCache.size > 50) {
      const oldest = Array.from(recentErrorCache.entries()).sort((a, b) => a[1] - b[1])[0]
      if (oldest) recentErrorCache.delete(oldest[0])
    }
    const { NotificationService } = await import('@/services/notification.service')
    await NotificationService.sendAdminAlert({
      template: 'admin_critical_error',
      title: 'CRITICAL Unhandled Error',
      message: `${info.method} ${info.path}\n${info.message}\n\nDedup 15 menit untuk error sama.`,
    })
  } catch (e) {
    // Diam — jangan crash request handler kalau alert gagal
    console.warn('[notify-admin-error] failed:', e)
  }
}

// 1 cron schedule bisa trigger multiple endpoint — disusun array untuk
// piggyback supplier-sync ke slot retry-notifications (Workers free tier
// limit 3 cron triggers, jadi gak bisa add slot baru).
const CRON_MAP: Record<string, string[]> = {
  '*/5 * * * *': ['/api/cron/expire-orders'],
  // 30 menit slot piggyback: stock alerts + customer reminders (guarantee H-3 + review D+3)
  '*/30 * * * *': ['/api/cron/stock-alerts', '/api/cron/customer-reminders'],
  '*/10 * * * *': ['/api/cron/retry-notifications', '/api/cron/supplier-sync-stock'],
}

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext): Promise<void> {
    const paths = CRON_MAP[event.cron] ?? []
    for (const path of paths) {
      const req = new Request(`http://localhost${path}`, {
        method: 'POST',
        headers: { 'x-cron-secret': env.CRON_SECRET },
      })
      ctx.waitUntil(Promise.resolve(app.fetch(req, env)))
    }
  },
}
