import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { ActivityLogService } from '@/services/activity-log.service'
import type { AppEnv } from '@/types/bindings'

export const expireOrdersCron = new Hono<AppEnv>()

expireOrdersCron.use('*', cronMiddleware)

expireOrdersCron.post('/', async (c) => {
  const supabase = createAdminClient()

  // Snapshot order_id yang sebentar lagi diexpire — supaya bisa log per-order
  // setelah RPC jalan. Pakai 1 jam window untuk safety (cron interval 5 min)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: candidates } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('status', 'pending_payment')
    .lt('expires_at', new Date().toISOString())
    .gte('expires_at', oneHourAgo)

  const { error } = await supabase.rpc('expire_old_orders')
  if (error) return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)

  // Emit log untuk tiap order yang baru di-expire
  for (const o of (candidates ?? []) as { id: string; order_number: string }[]) {
    await ActivityLogService.log({
      event_type: 'order_expired',
      ref_id: o.id,
      ref_table: 'orders',
      title: `Order expired: ${o.order_number}`,
      description: 'Pembayaran tidak diselesaikan dalam 24 jam',
      metadata: { order_id: o.id, order_number: o.order_number },
    })
  }
  return c.json({ data: { ok: true, expired: candidates?.length ?? 0 } })
})
