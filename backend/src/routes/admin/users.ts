import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminUsersService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminUsersRoute = new Hono<AppEnv>()

const listSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(['full_name', 'phone_wa', 'credits', 'role', 'status', 'joined_at'])
    .optional(),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
})

adminUsersRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminUsersService.list(c.req.valid('query'))
  return c.json({ data })
})

adminUsersRoute.get('/:id', async (c) => {
  const data = await AdminUsersService.getOne(c.req.param('id'))
  return c.json({ data })
})

const statusSchema = z.object({ status: z.enum(['active', 'suspended', 'banned']) })

adminUsersRoute.patch('/:id/status', zValidator('json', statusSchema), async (c) => {
  const data = await AdminUsersService.setStatus(c.req.param('id'), c.req.valid('json').status)
  return c.json({ data })
})

const creditsSchema = z.object({
  amount: z.coerce.number().int(),
  reason: z.string().trim().max(500).optional(),
})

adminUsersRoute.patch('/:id/credits', zValidator('json', creditsSchema), async (c) => {
  const { amount, reason } = c.req.valid('json')
  const data = await AdminUsersService.adjustCredits(c.req.param('id'), amount, reason)
  return c.json({ data })
})
