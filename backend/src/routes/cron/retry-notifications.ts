import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import { ActivityLogService } from '@/services/activity-log.service'
import type { AppEnv } from '@/types/bindings'

// NotificationService masih dipakai di bawah untuk sendAdminAlert exhausted

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

  // Track newly-logged exhausted untuk admin WA alert
  const newlyExhausted: Array<{ channel: string; template: string; order_id: string | null }> = []
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
    newlyExhausted.push({ channel: log.channel, template: log.template, order_id: log.order_id })
  }

  // Admin alert untuk newly-exhausted batch (kalau ada >0) — auto-fallback email kalau WA gagal.
  // Single alert per cron run dengan summary list, hindari spam.
  if (newlyExhausted.length > 0) {
    const lines = newlyExhausted
      .slice(0, 10)
      .map((n) => `- ${n.channel.toUpperCase()} ${n.template}${n.order_id ? ` (order ${n.order_id.slice(0, 8)})` : ''}`)
    const more = newlyExhausted.length > 10 ? `\n+${newlyExhausted.length - 10} notif lain` : ''
    await NotificationService.sendAdminAlert({
      template: 'admin_notif_exhausted',
      title: `${newlyExhausted.length} Notif Gagal Permanen`,
      message: `Notif buyer gagal permanen (retry >6 jam):\n\n${lines.join('\n')}${more}\n\nCek admin: jualakun.id/admin/notifikasi?event_type=notification_failed`,
    })
  }

  // DELETED: auto-retry placeholder loop yang sebelumnya kirim text gibberish
  // "[Retry] Notifikasi pesanan <UUID> (template X)" ke buyer setiap 10 menit.
  // Bug parah: original notif row status='failed' tidak di-update setelah
  // retry, jadi same row di-pickup berulang ~36x dalam 6 jam = spam buyer.
  //
  // Plus content placeholder useless untuk buyer (UUID + template name, no
  // actionable info). Original message content (full template-rendered text)
  // tidak tersimpan di DB.
  //
  // Strategi baru: cuma detect + log activity (sudah di-handle di bagian
  // `exhausted` di atas). Admin lihat di /admin/notifikasi → manual resend
  // via order detail page dengan content yang correct.

  return c.json({ data: { ok: true, retried: 0, exhausted_logged: newlyExhausted.length } })
})
