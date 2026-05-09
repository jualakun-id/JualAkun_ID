import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { AdminProductsService } from '@/services/admin.service'
import type { AppEnv } from '@/types/bindings'

export const adminProductsRoute = new Hono<AppEnv>()

const listQuerySchema = z.object({
  status: z.enum(['active', 'draft', 'out_of_stock']).optional(),
  category_slug: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

adminProductsRoute.get('/', zValidator('query', listQuerySchema), async (c) => {
  const data = await AdminProductsService.list(c.req.valid('query'))
  return c.json({ data })
})

adminProductsRoute.get('/:id', async (c) => {
  const data = await AdminProductsService.getOne(c.req.param('id'))
  return c.json({ data })
})

const createSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  duration_days: z.coerce.number().int().positive(),
  price: z.coerce.number().int().positive(),
  guarantee_days: z.coerce.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
})

adminProductsRoute.post('/', zValidator('json', createSchema), async (c) => {
  const data = await AdminProductsService.create(c.req.valid('json'))
  return c.json({ data }, 201)
})

const updateSchema = createSchema.partial().omit({ category_id: true, slug: true }).extend({
  category_id: z.string().uuid().optional(),
})

adminProductsRoute.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const data = await AdminProductsService.update(c.req.param('id'), c.req.valid('json'))
  return c.json({ data })
})

adminProductsRoute.delete('/:id', async (c) => {
  const data = await AdminProductsService.deactivate(c.req.param('id'))
  return c.json({ data })
})

const stockSchema = z.object({
  accounts: z
    .array(z.object({ credentials: z.string().min(3), note: z.string().max(500).optional() }))
    .min(1)
    .max(500),
})

adminProductsRoute.post('/:id/stock', zValidator('json', stockSchema), async (c) => {
  const data = await AdminProductsService.addStock(c.req.param('id'), c.req.valid('json').accounts)
  return c.json({ data }, 201)
})

adminProductsRoute.post('/:id/stock/bulk', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file') as { text: () => Promise<string> } | null
  if (!file || typeof file.text !== 'function') {
    return c.json({ ok: false, code: 'VALIDATION_ERROR', message: 'File CSV tidak ditemukan' }, 400)
  }
  const text = await file.text()
  const data = await AdminProductsService.addStockBulkCsv(c.req.param('id'), text)
  return c.json({ data }, 201)
})
