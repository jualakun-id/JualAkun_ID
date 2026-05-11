import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminStockMonitorService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminStockMonitorRoute = new Hono<AppEnv>()

const listSchema = z.object({
  filter: z.enum(['all', 'critical', 'out']).default('all'),
  category_slug: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sort_by: z.enum(['name', 'slug', 'stock_count', 'sold_count', 'price', 'duration_days']).optional(),
  sort_dir: z.enum(['asc', 'desc']).optional(),
})

adminStockMonitorRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminStockMonitorService.list(c.req.valid('query'))
  return c.json({ data })
})

const countsSchema = z.object({ category_slug: z.string().optional() })

adminStockMonitorRoute.get('/counts', zValidator('query', countsSchema), async (c) => {
  const data = await AdminStockMonitorService.counts(c.req.valid('query').category_slug)
  return c.json({ data })
})
