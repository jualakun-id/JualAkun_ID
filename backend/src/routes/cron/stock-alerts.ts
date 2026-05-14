import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import { ActivityLogService } from '@/services/activity-log.service'
import { AdminCouponsService } from '@/services/admin.service'
import { templates } from '@/templates/messages'
import type { AppEnv } from '@/types/bindings'

export const stockAlertsCron = new Hono<AppEnv>()

stockAlertsCron.use('*', cronMiddleware)

stockAlertsCron.post('/', async (c) => {
  // Piggyback: auto-deactivate kupon expired (gak butuh slot cron sendiri)
  try {
    const expiredResult = await AdminCouponsService.autoDeactivateExpired()
    for (const item of expiredResult.items) {
      await ActivityLogService.log({
        event_type: 'coupon_deactivated',
        ref_id: item.id,
        ref_table: 'coupons',
        title: `Kupon auto-deactivated: ${item.code}`,
        description: 'Lewat tanggal expires_at — di-deactivate otomatis',
        metadata: { auto: true },
      })
    }
  } catch (err) {
    console.warn('[cron/stock-alerts] coupon auto-deactivate failed:', err)
    // Don't fail the rest of the cron
  }

  // Piggyback: cleanup old activity_log + notifications_log (retention 90d)
  // Batch 1000 per run — kalau ada > 1000 row tua, akan di-cleanup bertahap
  // dalam runs berikutnya.
  try {
    const supabaseCleanup = createAdminClient()
    const [actLogResult, notifLogResult] = await Promise.all([
      supabaseCleanup.rpc('cleanup_old_activity_log', { p_retention_days: 90, p_batch_size: 1000 }),
      supabaseCleanup.rpc('cleanup_old_notifications_log', { p_retention_days: 90, p_batch_size: 1000 }),
    ])
    const actDeleted = (actLogResult.data as number | null) ?? 0
    const notifDeleted = (notifLogResult.data as number | null) ?? 0
    if (actDeleted > 0 || notifDeleted > 0) {
      console.info('[cron/cleanup]', { activity_log_deleted: actDeleted, notif_log_deleted: notifDeleted })
    }
  } catch (err) {
    console.warn('[cron/stock-alerts] cleanup failed:', err)
  }

  // Stock alert WA + activity log HANYA jam 06:00-06:29 WIB (digest harian)
  // supaya grup tidak ke-spam tiap 30 menit. Cron tetap jalan tiap 30 menit
  // untuk kupon expired + cleanup logs, tapi stock alert WA/email gate ke
  // morning slot saja.
  //
  // WIB = UTC+7. Cron */30 trigger di menit :00 dan :30. Slot pagi WIB:
  //   - WIB 06:00 = UTC 23:00 (slot :00 → masuk window)
  //   - WIB 06:30 = UTC 23:30 (slot :30 → skip, hindari dobel kirim)
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcMinute = now.getUTCMinutes()
  const wibHour = (utcHour + 7) % 24
  const isMorningDigestSlot = wibHour === 6 && utcMinute < 30

  if (!isMorningDigestSlot) {
    return c.json({ data: { ok: true, alerted: 0, skipped: 'not-morning-digest-slot' } })
  }

  const supabase = createAdminClient()
  // Pakai display_stock (admin-managed) untuk monitoring publik
  const { data: lowStock, error } = await supabase
    .from('products')
    .select('id, name, display_stock')
    .eq('is_active', true)
    .lte('display_stock', 5)
    .order('display_stock', { ascending: true })
    .limit(20)

  if (error) {
    return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)
  }
  if (!lowStock || lowStock.length === 0) {
    return c.json({ data: { ok: true, alerted: 0 } })
  }

  // Activity log per produk — bedakan critical vs out supaya admin bisa filter
  for (const p of lowStock as { id: string; name: string; display_stock: number }[]) {
    const isOut = p.display_stock === 0
    await ActivityLogService.log({
      event_type: isOut ? 'stock_out' : 'stock_critical',
      ref_id: p.id,
      ref_table: 'products',
      title: `${isOut ? 'Stok habis' : 'Stok kritis'}: ${p.name}`,
      description: `Tersisa ${p.display_stock} unit${isOut ? ' — perlu refill segera' : ''}`,
      metadata: { product_id: p.id, name: p.name, display_stock: p.display_stock },
    })
  }

  const tpl = templates.adminLowStock({ products: lowStock.map((p) => ({ name: p.name, stock_count: p.display_stock })) })
  const result = await NotificationService.sendAdminAlert({
    template: tpl.template,
    title: 'Stok Kritis (Digest Pagi)',
    message: tpl.waText.replace(/^\[[^\]]+\]\n\n/, ''),
  })

  return c.json({ data: { ok: true, alerted: lowStock.length, wa_sent: result.wa, group_sent: result.group, email_fallback: result.email } })
})
