import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { CatalogService } from '@/services/catalog.service'
import type { AppEnv } from '@/types/bindings'

export const catalogRoute = new Hono<AppEnv>()

const listQuerySchema = z.object({
  category_slug: z.string().optional(),
  min_price: z.coerce.number().int().nonnegative().optional(),
  max_price: z.coerce.number().int().nonnegative().optional(),
  duration_days: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sort: z.enum(['stock', 'sold_count', 'price_asc', 'price_desc', 'newest']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

catalogRoute.get('/', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query')
  const data = await CatalogService.list(q)
  return c.json({ data })
})

catalogRoute.get('/categories', async (c) => {
  const data = await CatalogService.listCategories()
  return c.json({ data })
})

catalogRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const data = await CatalogService.getBySlug(slug)
  return c.json({ data })
})
