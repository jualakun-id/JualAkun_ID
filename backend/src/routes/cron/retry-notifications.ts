import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import type { AppEnv } from '@/types/bindings'

export const retryNotificationsCron = new Hono<AppEnv>()

retryNotificationsCron.use('*', cronMiddleware)

const MAX_AGE_HOURS = 6

retryNotificationsCron.post('/', async (c) => {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - MAX_AGE_HOURS * 3_600_000).toISOString()

  const { data: failed, error } = await supabase
    .from('notifications_log')
    .select('id, user_id, order_id, channel, template, created_at')
    .eq('status', 'failed')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(20)

  if (error) {
    return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)
  }
  if (!failed || failed.length === 0) {
    return c.json({ data: { ok: true, retried: 0 } })
  }

  let retried = 0
  for (const log of failed) {
    if (!log.user_id) continue
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone_wa, full_name')
      .eq('id', log.user_id)
      .maybeSingle()
    if (!profile) continue

    const placeholder = `[Retry] Notifikasi pesanan ${log.order_id ?? ''} (template ${log.template})`
    if (log.channel === 'wa' && profile.phone_wa) {
      await NotificationService.sendWhatsApp({
        target: profile.phone_wa,
        message: placeholder,
        template: log.template,
        userId: log.user_id,
        orderId: log.order_id,
      })
      retried += 1
    }
  }

  return c.json({ data: { ok: true, retried } })
})
