import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminUsersService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminUsersRoute = new Hono<AppEnv>()

const listSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

adminUsersRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminUsersService.list(c.req.valid('query'))
  return c.json({ data })
})

const statusSchema = z.object({ status: z.enum(['active', 'suspended', 'banned']) })

adminUsersRoute.patch('/:id/status', zValidator('json', statusSchema), async (c) => {
  const data = await AdminUsersService.setStatus(c.req.param('id'), c.req.valid('json').status)
  return c.json({ data })
})
