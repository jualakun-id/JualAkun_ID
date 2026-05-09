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

app.notFound((c) => c.json({ ok: false, code: 'NOT_FOUND', message: 'Route tidak ditemukan' }, 404))

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      { ok: false, code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
      err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502,
    )
  }
  console.error('Unhandled:', err)
  return c.json({ ok: false, code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500)
})

const CRON_MAP: Record<string, string> = {
  '*/5 * * * *': '/api/cron/expire-orders',
  '*/30 * * * *': '/api/cron/stock-alerts',
  '*/10 * * * *': '/api/cron/retry-notifications',
}

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext): Promise<void> {
    const path = CRON_MAP[event.cron]
    if (!path) return
    const req = new Request(`http://localhost${path}`, {
      method: 'POST',
      headers: { 'x-cron-secret': env.CRON_SECRET },
    })
    ctx.waitUntil(Promise.resolve(app.fetch(req, env)))
  },
}
