import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminCouponsService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminCouponsRoute = new Hono<AppEnv>()

const listSchema = z.object({
  status: z.enum(['active', 'inactive', 'expired', 'exhausted']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sort_by: z.enum(['code', 'discount_value', 'used_count', 'expires_at', 'is_active', 'created_at']).optional(),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
})

adminCouponsRoute.get('/', zValidator('query', listSchema), async (c) => {
  const data = await AdminCouponsService.list(c.req.valid('query'))
  return c.json({ data })
})

adminCouponsRoute.get('/:id', async (c) => {
  const data = await AdminCouponsService.getOne(c.req.param('id'))
  return c.json({ data })
})

const createSchema = z.object({
  code: z.string().trim().min(3).max(30).regex(/^[A-Z0-9_-]+$/i),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.coerce.number().int().positive(),
  max_uses: z.coerce.number().int().positive().optional(),
  valid_for_products: z.array(z.string().uuid()).optional(),
  expires_at: z.string().datetime().optional(),
})

adminCouponsRoute.post('/', zValidator('json', createSchema), async (c) => {
  const data = await AdminCouponsService.create(c.req.valid('json'))
  return c.json({ data }, 201)
})

const updateSchema = z.object({
  discount_value: z.coerce.number().int().positive().optional(),
  max_uses: z.coerce.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
})

adminCouponsRoute.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const data = await AdminCouponsService.update(c.req.param('id'), c.req.valid('json'))
  return c.json({ data })
})

adminCouponsRoute.delete('/:id', async (c) => {
  const data = await AdminCouponsService.deactivate(c.req.param('id'))
  return c.json({ data })
})
