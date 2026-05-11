import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { ActivityLogService } from '@/services/activity-log.service'
import type { AppEnv } from '@/types/bindings'

export const adminActivityLogRoute = new Hono<AppEnv>()

const listSchema = z.object({
  event_type: z
    .enum(['user_registered', 'order_created', 'order_paid', 'order_delivered', 'order_refunded', 'ticket_created', 'ticket_resolved'])
    .optional(),
  is_read: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

adminActivityLogRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await ActivityLogService.list(c.req.valid('query'))
  return c.json({ data })
})

adminActivityLogRoute.get('/:id', async (c) => {
  const data = await ActivityLogService.getOne(c.req.param('id'))
  return c.json({ data })
})

adminActivityLogRoute.patch('/:id/read', async (c) => {
  const data = await ActivityLogService.markAsRead(c.req.param('id'))
  return c.json({ data })
})

adminActivityLogRoute.post('/mark-all-read', async (c) => {
  const data = await ActivityLogService.markAllRead()
  return c.json({ data })
})
