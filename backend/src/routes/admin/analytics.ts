import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminDashboardService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminAnalyticsRoute = new Hono<AppEnv>()

adminAnalyticsRoute.get('/dashboard', async (c) => {
  const data = await AdminDashboardService.getKpis()
  return c.json({ data })
})

adminAnalyticsRoute.get('/profit', async (c) => {
  const data = await AdminDashboardService.getProfitKpis()
  return c.json({ data })
})

adminAnalyticsRoute.get('/action-center', async (c) => {
  const data = await AdminDashboardService.getActionCenter()
  return c.json({ data })
})

/**
 * Health check untuk admin verify konfigurasi production:
 *  - cron secret set
 *  - admin WA number set
 *  - supplier API key set
 *  - duitku production mode
 * Tidak return value sensitive, cuma boolean.
 */
adminAnalyticsRoute.get('/system-health', async (c) => {
  return c.json({
    data: {
      cron_secret_set: !!process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16,
      admin_wa_set: !!process.env.ADMIN_WHATSAPP_NUMBER,
      supplier_api_set: !!process.env.SUPPLIER_CANBOSO_API_KEY,
      duitku_production: process.env.DUITKU_IS_PRODUCTION === 'true',
      resend_api_set: !!process.env.RESEND_API_KEY,
      resend_from_email: process.env.RESEND_FROM_EMAIL ?? null,
      waha_base_url_set: !!process.env.WAHA_BASE_URL,
      encryption_key_set: !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32,
    },
  })
})

const periodSchema = z.object({ days: z.coerce.number().int().positive().max(365).default(30) })

adminAnalyticsRoute.get('/revenue', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.revenueTrend(c.req.valid('query').days)
  return c.json({ data })
})

adminAnalyticsRoute.get('/overview', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.getAnalyticsOverview(c.req.valid('query').days)
  return c.json({ data })
})

adminAnalyticsRoute.get('/status-breakdown', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.getStatusBreakdown(c.req.valid('query').days)
  return c.json({ data })
})

adminAnalyticsRoute.get('/profit-trend', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.getProfitTrend(c.req.valid('query').days)
  return c.json({ data })
})

adminAnalyticsRoute.get('/category-breakdown', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.getCategoryBreakdown(c.req.valid('query').days)
  return c.json({ data })
})

const topProfitSchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
  limit: z.coerce.number().int().positive().max(20).default(5),
})

adminAnalyticsRoute.get('/top-products-by-profit', zValidator('query', topProfitSchema), async (c) => {
  const q = c.req.valid('query')
  const data = await AdminDashboardService.getTopProductsByProfit(q.days, q.limit)
  return c.json({ data })
})

adminAnalyticsRoute.get('/sla', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.getSLAMetrics(c.req.valid('query').days)
  return c.json({ data })
})

adminAnalyticsRoute.get('/notification-health', zValidator('query', periodSchema), async (c) => {
  const data = await AdminDashboardService.getNotificationHealth(c.req.valid('query').days)
  return c.json({ data })
})

const topSchema = z.object({ limit: z.coerce.number().int().positive().max(50).default(10) })

adminAnalyticsRoute.get('/top-products', zValidator('query', topSchema), async (c) => {
  const data = await AdminDashboardService.topProducts(c.req.valid('query').limit)
  return c.json({ data })
})
