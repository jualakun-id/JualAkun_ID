import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { OrdersService } from '@/services/orders.service'
import type { AppEnv } from '@/types/bindings'

export const ordersRoute = new Hono<AppEnv>()

ordersRoute.use('*', authMiddleware)

const listSchema = z.object({
  status: z.enum([
    'pending_payment', 'paid', 'delivering', 'delivered',
    'confirmed', 'expired', 'delivery_failed', 'refunded',
  ]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
})

ordersRoute.get('/', zValidator('query', listSchema), async (c) => {
  const userId = c.get('userId')
  const q = c.req.valid('query')
  const data = await OrdersService.listForUser(userId, q)
  return c.json({ data })
})

ordersRoute.get('/:id', async (c) => {
  const data = await OrdersService.getOne(c.get('userId'), c.req.param('id'))
  return c.json({ data })
})

ordersRoute.get('/:id/credentials', async (c) => {
  const data = await OrdersService.getCredentials(c.get('userId'), c.req.param('id'))
  return c.json({ data })
})

ordersRoute.post('/:id/confirm', async (c) => {
  const data = await OrdersService.confirmReceived(c.get('userId'), c.req.param('id'))
  return c.json({ data })
})
