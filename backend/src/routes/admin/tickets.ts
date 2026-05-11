import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminTicketsService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminTicketsRoute = new Hono<AppEnv>()

const listSchema = z.object({
  status: z.enum(['open', 'in_review', 'resolved_replaced', 'resolved_refunded', 'rejected', 'closed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z.enum(['reason', 'status', 'created_at']).optional(),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
})

adminTicketsRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminTicketsService.list(c.req.valid('query'))
  return c.json({ data })
})

adminTicketsRoute.get('/:id', async (c) => {
  const data = await AdminTicketsService.getOne(c.req.param('id'))
  return c.json({ data })
})

const resolveSchema = z.object({
  status: z.enum(['in_review', 'resolved_replaced', 'resolved_refunded', 'rejected', 'closed']),
  resolution: z.string().min(3).max(2000),
  new_account_stock_id: z.string().uuid().optional(),
})

adminTicketsRoute.patch('/:id', zValidator('json', resolveSchema), async (c) => {
  const adminId = c.get('userId')
  const data = await AdminTicketsService.resolve(adminId, c.req.param('id'), c.req.valid('json'))
  return c.json({ data })
})
