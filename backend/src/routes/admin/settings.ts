import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { ExchangeRateService } from '@/services/exchange-rate.service'
import type { AppEnv } from '@/types/bindings'

export const adminSettingsRoute = new Hono<AppEnv>()

adminSettingsRoute.get('/exchange-rates', async (c) => {
  const data = await ExchangeRateService.getAll()
  return c.json({ data })
})

const updateRateSchema = z.object({
  rate: z.coerce.number().positive('Kurs harus > 0'),
  notes: z.string().trim().max(500).optional(),
})

adminSettingsRoute.patch('/exchange-rates/:pair', zValidator('json', updateRateSchema), async (c) => {
  const pair = c.req.param('pair').toUpperCase()
  const userId = c.get('userId')
  const { rate, notes } = c.req.valid('json')
  const data = await ExchangeRateService.update(pair, rate, userId, notes)
  return c.json({ data })
})
