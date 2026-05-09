import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { DashboardService } from '@/services/dashboard.service'
import type { AppEnv } from '@/types/bindings'

export const dashboardRoute = new Hono<AppEnv>()

dashboardRoute.use('*', authMiddleware)

dashboardRoute.get('/', async (c) => {
  const data = await DashboardService.getDashboard(c.get('userId'))
  return c.json({ data })
})

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100).optional(),
  phone_wa: z.string().regex(/^(\+?62|0|8)\d{8,13}$/).optional(),
})

dashboardRoute.patch('/profile', zValidator('json', profileSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await DashboardService.updateProfile(c.get('userId'), body)
  return c.json({ data })
})
