import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminCouponsService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminCouponsRoute = new Hono<AppEnv>()

adminCouponsRoute.get('/', async (c) => {
  const data = await AdminCouponsService.list()
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
  max_uses: z.coerce.number().int().positive().optional(),
  expires_at: z.string().datetime().optional(),
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
