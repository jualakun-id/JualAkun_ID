import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminStockMonitorService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminStockMonitorRoute = new Hono<AppEnv>()

const listSchema = z.object({ filter: z.enum(['all', 'critical', 'out']).default('all') })

adminStockMonitorRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminStockMonitorService.list(c.req.valid('query').filter)
  return c.json({ data })
})
