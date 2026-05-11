import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminNotificationsService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminNotificationsRoute = new Hono<AppEnv>()

const listSchema = z.object({
  channel: z.enum(['wa', 'email']).optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z.enum(['channel', 'template', 'status', 'created_at']).optional(),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
})

adminNotificationsRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminNotificationsService.list(c.req.valid('query'))
  return c.json({ data })
})

adminNotificationsRoute.post('/:id/retry', async (c) => {
  const data = await AdminNotificationsService.retry(c.req.param('id'))
  return c.json({ data })
})
