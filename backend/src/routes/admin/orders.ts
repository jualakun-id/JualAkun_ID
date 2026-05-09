import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminOrdersService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminOrdersRoute = new Hono<AppEnv>()

const listSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

adminOrdersRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminOrdersService.list(c.req.valid('query'))
  return c.json({ data })
})

adminOrdersRoute.get('/:id', async (c) => {
  const data = await AdminOrdersService.getOne(c.req.param('id'))
  return c.json({ data })
})

adminOrdersRoute.post('/:id/deliver', async (c) => {
  const data = await AdminOrdersService.manualDeliver(c.req.param('id'))
  return c.json({ data })
})

const statusSchema = z.object({
  status: z.enum(['pending_payment', 'paid', 'delivering', 'delivered', 'confirmed', 'expired', 'delivery_failed', 'refunded']),
})

adminOrdersRoute.patch('/:id/status', zValidator('json', statusSchema), async (c) => {
  const data = await AdminOrdersService.updateStatus(c.req.param('id'), c.req.valid('json').status)
  return c.json({ data })
})
