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
  // Digest pagi: list produk yang link ke supplier DAN masih ada stok.
  // Produk full manual (no supplier link) di-skip — admin sudah punya
  // /admin/stok-monitor untuk monitoring manual. Produk supplier yang stok 0
  // di-skip — kalau auto-manage ON sudah dihandle (hide ke draft), kalau OFF
  // admin yang chose untuk hold draft sendiri.
  //
  // Total count diambil terpisah (head: true) supaya WA bisa tampilkan
  // ringkasan "X produk tersedia" walau display di-cap 20 row teratas.
  const baseFilter = supabase
    .from('products')
    .select('id, name, display_stock', { count: 'exact' })
    .eq('is_active', true)
    .not('supplier_product_id', 'is', null)
    .neq('supplier_product_id', '')
    .gt('display_stock', 0)

  const { data: available, error, count } = await baseFilter
    .order('display_stock', { ascending: true }) // stok paling sedikit dulu — paling perlu attention re-stock
    .limit(20)

  if (error) {
    return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)
  }
  if (!available || available.length === 0) {
    return c.json({ data: { ok: true, alerted: 0, reason: 'no-available-supplier-stock' } })
  }

  const tpl = templates.adminSupplierStockDigest({
    products: available.map((p) => ({ name: p.name as string, stock_count: p.display_stock as number })),
    totalAvailable: count ?? available.length,
  })
  const result = await NotificationService.sendAdminAlert({
    template: tpl.template,
    title: 'Stok Supplier Tersedia (Digest Pagi)',
    message: tpl.waText.replace(/^\[[^\]]+\]\s*/, ''),
  })

  return c.json({ data: { ok: true, alerted: available.length, total_available: count, wa_sent: result.wa, group_sent: result.group, email_fallback: result.email } })
})
