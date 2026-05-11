import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import { ActivityLogService } from '@/services/activity-log.service'
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

  // Cari notif yang sudah > MAX_AGE_HOURS dan masih failed (exhausted retry)
  // → log activity supaya admin tahu ada notif yang gagal permanen.
  const exhaustedSince = new Date(Date.now() - MAX_AGE_HOURS * 3_600_000).toISOString()
  const { data: exhausted } = await supabase
    .from('notifications_log')
    .select('id, channel, template, error, order_id, user_id')
    .eq('status', 'failed')
    .lt('created_at', exhaustedSince)
    .order('created_at', { ascending: false })
    .limit(20)
  for (const log of (exhausted ?? []) as { id: string; channel: string; template: string; error: string | null; order_id: string | null }[]) {
    // Dedup: skip kalau sudah ada activity log untuk notif ini
    const { count } = await supabase
      .from('admin_activity_log')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'notification_failed')
      .eq('ref_id', log.id)
    if ((count ?? 0) > 0) continue
    await ActivityLogService.log({
      event_type: 'notification_failed',
      ref_id: log.id,
      ref_table: 'notifications_log',
      title: `Notif ${log.channel.toUpperCase()} gagal: ${log.template}`,
      description: log.error?.slice(0, 200) ?? 'Retry exhausted setelah 6 jam',
      metadata: { channel: log.channel, template: log.template, order_id: log.order_id, error: log.error },
    })
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
