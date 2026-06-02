import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import { PaymentService } from '@/services/payment.service'
import { ActivityLogService } from '@/services/activity-log.service'
import type { AppEnv } from '@/types/bindings'

/**
 * Cron: WAHA Session Healthcheck + Recovery
 *
 * Konteks insiden 2026-06-02: WAHA session `jualakun` STOPPED dari ~06:00
 * sampai ~10:14 WIB (4+ jam). 24 notif WA gagal — buyer di-cover oleh email
 * fallback, tapi outage 4 jam terlalu lama untuk dibiarkan. Cron sebelumnya
 * tidak monitor status session.
 *
 * Cron ini:
 *   1. GET /api/sessions/{session} — cek status sekarang.
 *   2. Kalau status ≠ WORKING: POST /api/sessions/{session}/start untuk
 *      auto-restart, verify status setelah 2 detik, kirim admin alert
 *      (email fallback kalau WA masih down), log activity dengan dedup.
 *   3. Kalau status WORKING (atau berhasil di-recover ke WORKING):
 *      replay notifications_log entries yang status='failed' dalam window
 *      RETRY_WINDOW_MINUTES untuk template buyer-facing critical
 *      (payment_received, account_delivered) — saat session down sebentar
 *      lalu pulih, retry-ulang notif buyer yang ke-blok.
 *
 * Trigger: piggyback 5-menit slot (dengan expire-orders).
 *   - Outage detection ≤ 5 menit
 *   - Recovery auto kalau cuma butuh restart (tanpa re-scan QR)
 *
 * Dedup admin alert: ActivityLogService.log row dengan
 * event_type='waha_session_down' dalam COOLDOWN_MINUTES terakhir — kalau
 * ada, skip alert (admin sudah ke-notif belum lama, hindari spam tiap 5
 * menit selama outage panjang).
 */

export const wahaHealthcheckCron = new Hono<AppEnv>()
wahaHealthcheckCron.use('*', cronMiddleware)

const COOLDOWN_MINUTES = 30
const RETRY_WINDOW_MINUTES = 30
const RETRY_TEMPLATES = ['payment_received', 'account_delivered'] as const

type FailedRow = {
  id: string
  template: string
  order_id: string
  created_at: string
}

type OrderRow = {
  id: string
  user_id: string
  product_id: string
  order_number: string
  total_idr: number
  status: string
}

async function fetchSessionStatus(baseUrl: string, apiKey: string, session: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/sessions/${session}`, {
      headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
    })
    if (!res.ok) return 'UNREACHABLE'
    const body = (await res.json()) as { status?: string }
    return body.status ?? 'UNKNOWN'
  } catch {
    return 'UNREACHABLE'
  }
}

async function startSession(baseUrl: string, apiKey: string, session: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/sessions/${session}/start`, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Replay buyer-facing notif yang failed dalam RETRY_WINDOW_MINUTES.
 * Dedup via cek apakah sudah ada row 'sent' newer untuk (order, template)
 * yang sama — tanpa butuh schema change. Self-cleaning.
 */
async function retryRecentFailures(): Promise<{ attempted: number; succeeded: number }> {
  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - RETRY_WINDOW_MINUTES * 60_000).toISOString()

  const { data: failed, error } = await supabase
    .from('notifications_log')
    .select('id, template, order_id, created_at')
    .eq('status', 'failed')
    .eq('channel', 'wa')
    .in('template', RETRY_TEMPLATES as unknown as string[])
    .not('order_id', 'is', null)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(20)

  if (error || !failed || failed.length === 0) return { attempted: 0, succeeded: 0 }

  let attempted = 0
  let succeeded = 0

  for (const row of failed as FailedRow[]) {
    // Skip kalau sudah ada row 'sent' newer untuk (order_id, template) yang sama
    // — artinya sudah berhasil di-resend (mungkin di cron run sebelumnya).
    const { data: newerSent } = await supabase
      .from('notifications_log')
      .select('id')
      .eq('order_id', row.order_id)
      .eq('template', row.template)
      .eq('channel', 'wa')
      .eq('status', 'sent')
      .gt('created_at', row.created_at)
      .limit(1)
      .maybeSingle()
    if (newerSent) continue

    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, product_id, order_number, total_idr, status')
      .eq('id', row.order_id)
      .maybeSingle()
    if (!order) continue

    const orderTyped = order as OrderRow
    attempted += 1
    try {
      if (row.template === 'payment_received') {
        await PaymentService.notifyBuyerPaymentReceived(orderTyped)
      } else if (row.template === 'account_delivered') {
        await PaymentService.notifyBuyerDelivered(orderTyped)
      }
      // NotificationService.sendWhatsApp inserts log row dengan status sent/failed.
      // Cek apakah row baru bernilai 'sent' — itu indikator retry sukses.
      const { data: confirm } = await supabase
        .from('notifications_log')
        .select('id')
        .eq('order_id', row.order_id)
        .eq('template', row.template)
        .eq('channel', 'wa')
        .eq('status', 'sent')
        .gt('created_at', row.created_at)
        .limit(1)
        .maybeSingle()
      if (confirm) succeeded += 1
    } catch (err) {
      console.warn('[waha-healthcheck/retry] gagal resend:', err)
    }
  }

  return { attempted, succeeded }
}

wahaHealthcheckCron.post('/', async (c) => {
  const baseUrl = process.env.WAHA_BASE_URL?.replace(/\/$/, '')
  const apiKey = process.env.WAHA_API_KEY
  const session = process.env.WAHA_SESSION || 'default'

  if (!baseUrl || !apiKey) {
    return c.json({ data: { ok: true, skipped: 'waha-env-not-set' } })
  }

  // 1. Cek status sekarang
  const status = await fetchSessionStatus(baseUrl, apiKey, session)

  // Healthy path: opportunistic retry, no alert
  if (status === 'WORKING') {
    const retry = await retryRecentFailures()
    return c.json({ data: { ok: true, status, retry } })
  }

  // Unhealthy path: auto-restart attempt
  const startOk = await startSession(baseUrl, apiKey, session)
  await new Promise((r) => setTimeout(r, 2000))
  const postStatus = await fetchSessionStatus(baseUrl, apiKey, session)
  const recovered = postStatus === 'WORKING'

  // 2. Dedup alert: kalau ada activity log waha_session_down dalam COOLDOWN_MINUTES
  // terakhir, skip alert lagi supaya admin gak ke-spam tiap 5 menit
  // sepanjang outage panjang.
  const supabase = createAdminClient()
  const cooldownCutoff = new Date(Date.now() - COOLDOWN_MINUTES * 60_000).toISOString()
  const { count: recentAlertCount } = await supabase
    .from('admin_activity_log')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', 'waha_session_down')
    .gte('created_at', cooldownCutoff)
  const shouldAlert = (recentAlertCount ?? 0) === 0

  if (shouldAlert) {
    await NotificationService.sendAdminAlert({
      template: 'admin_waha_session_down',
      title: 'WAHA Session Down',
      message:
        `Session "${session}" status: ${status}.\n` +
        `Auto-restart: ${startOk ? 'sukses' : 'gagal'} → status sekarang: ${postStatus}.\n\n` +
        (recovered
          ? '✅ Sudah pulih otomatis. Notif baru akan jalan normal.'
          : `⚠ Belum pulih. Cek WAHA dashboard ${baseUrl}/dashboard — kemungkinan perlu re-scan QR.`),
    })
  }

  await ActivityLogService.log({
    event_type: 'waha_session_down',
    ref_id: null,
    ref_table: null,
    title: `WAHA session ${status}${recovered ? ' → WORKING (auto-recover)' : ''}`,
    description: `Auto-restart ${startOk ? 'sukses' : 'gagal'}. Status setelah: ${postStatus}.`,
    metadata: {
      previous_status: status,
      post_start_status: postStatus,
      start_endpoint_ok: startOk,
      auto_recovered: recovered,
      alert_sent: shouldAlert,
    },
  })

  // 3. Setelah recover ke WORKING, langsung replay notif buyer recent failures
  let retry = { attempted: 0, succeeded: 0 }
  if (recovered) {
    retry = await retryRecentFailures()
  }

  return c.json({
    data: {
      ok: true,
      previous_status: status,
      post_start_status: postStatus,
      auto_recovered: recovered,
      alert_sent: shouldAlert,
      retry,
    },
  })
})
