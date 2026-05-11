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

const revenueSchema = z.object({ days: z.coerce.number().int().positive().max(365).default(30) })

adminAnalyticsRoute.get('/revenue', zValidator('query', revenueSchema), async (c) => {
  const data = await AdminDashboardService.revenueTrend(c.req.valid('query').days)
  return c.json({ data })
})

const topSchema = z.object({ limit: z.coerce.number().int().positive().max(50).default(10) })

adminAnalyticsRoute.get('/top-products', zValidator('query', topSchema), async (c) => {
  const data = await AdminDashboardService.topProducts(c.req.valid('query').limit)
  return c.json({ data })
})
