import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import type { AppEnv } from '@/types/bindings'

export const expireOrdersCron = new Hono<AppEnv>()

expireOrdersCron.use('*', cronMiddleware)

expireOrdersCron.post('/', async (c) => {
  const supabase = createAdminClient()
  const { error } = await supabase.rpc('expire_old_orders')
  if (error) return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)
  return c.json({ data: { ok: true } })
})
