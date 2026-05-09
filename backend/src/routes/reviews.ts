import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { ReviewsService } from '@/services/reviews.service'
import type { AppEnv } from '@/types/bindings'

export const reviewsRoute = new Hono<AppEnv>()

reviewsRoute.use('*', authMiddleware)

const createSchema = z.object({
  order_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

reviewsRoute.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const data = await ReviewsService.create(userId, body)
  return c.json({ data }, 201)
})
