import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { TicketsService } from '@/services/tickets.service'
import type { AppEnv } from '@/types/bindings'

export const ticketsRoute = new Hono<AppEnv>()

ticketsRoute.use('*', authMiddleware)

const createSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.enum(['account_invalid', 'already_used', 'cant_login', 'wrong_product', 'other']),
  description: z.string().max(2000).optional(),
  screenshot_url: z.string().url().optional(),
})

ticketsRoute.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const data = await TicketsService.create(userId, body)
  return c.json({ data }, 201)
})

ticketsRoute.get('/', async (c) => {
  const data = await TicketsService.listForUser(c.get('userId'))
  return c.json({ data })
})

ticketsRoute.get('/:id', async (c) => {
  const data = await TicketsService.getOne(c.get('userId'), c.req.param('id'))
  return c.json({ data })
})
