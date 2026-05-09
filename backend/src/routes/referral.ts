import { Hono } from 'hono'
import { authMiddleware } from '@/middleware/auth'
import { ReferralService } from '@/services/referral.service'
import type { AppEnv } from '@/types/bindings'

export const referralRoute = new Hono<AppEnv>()

referralRoute.use('*', authMiddleware)

referralRoute.get('/', async (c) => {
  const data = await ReferralService.getInfo(c.get('userId'))
  return c.json({ data })
})
