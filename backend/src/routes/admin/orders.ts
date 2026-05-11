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
  sort_by: z
    .enum(['order_number', 'status', 'payment_method', 'total_idr', 'created_at'])
    .optional(),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
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

const fulfillSchema = z.object({
  credentials: z.string().trim().min(3, 'Credentials minimal 3 karakter').max(2000),
  note: z.string().trim().max(500).optional(),
})

adminOrdersRoute.post('/:id/fulfill', zValidator('json', fulfillSchema), async (c) => {
  const data = await AdminOrdersService.fulfillManual(c.req.param('id'), c.req.valid('json'))
  return c.json({ data })
})

const statusSchema = z.object({
  status: z.enum(['pending_payment', 'paid', 'delivering', 'delivered', 'confirmed', 'expired', 'delivery_failed', 'refunded']),
})

adminOrdersRoute.patch('/:id/status', zValidator('json', statusSchema), async (c) => {
  const data = await AdminOrdersService.updateStatus(c.req.param('id'), c.req.valid('json').status)
  return c.json({ data })
})
