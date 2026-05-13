import { createAdminClient } from '@/lib/supabase'

type NotifChannel = 'wa' | 'email'
type NotifStatus = 'pending' | 'sent' | 'failed'

type LogEntry = {
  user_id: string | null
  order_id: string | null
  channel: NotifChannel
  template: string
  status: NotifStatus
  error: string | null
}

/**
 * Strip BOM (U+FEFF), zero-width chars (U+200B-U+200D, U+2060), dan whitespace
 * dari env var value. PowerShell pipe ke `wrangler secret put` kadang prepend
 * BOM ke value yang bikin `new URL()` throw "Invalid URL". Defensive cleanup
 * untuk semua env vars yang dipakai untuk URL/header value.
 */
function sanitizeEnv(val: string | undefined): string {
  if (!val) return ''
  return val.replace(/[﻿​‌‍⁠]/g, '').trim()
}

async function logNotification(entry: LogEntry): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('notifications_log').insert(entry)
  if (error) {
    // Supabase JS client TIDAK throw error pada insert — return { error } object.
    // Tanpa explicit check, INSERT silent fail (e.g. schema mismatch, constraint
    // violation). Log ke console supaya admin bisa diagnose dari Cloudflare logs.
    console.error('[notif-log] INSERT failed:', {
      error_message: error.message,
      error_code: error.code,
      error_details: error.details,
      entry_channel: entry.channel,
      entry_template: entry.template,
      entry_order_id: entry.order_id,
    })
  }
}

/**
 * Normalize a phone number to a WAHA chatId.
 *   628xxx       → 628xxx@c.us
 *   08xxx        → 628xxx@c.us
 *   628xxx@c.us  → 628xxx@c.us  (passthrough)
 *   group@g.us   → group@g.us   (passthrough)
 */
function toChatId(target: string): string {
  if (target.includes('@')) return target
  const digits = target.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `${intl}@c.us`
}

export type WahaSessionStatus =
  | 'WORKING'
  | 'SCAN_QR_CODE'
  | 'STARTING'
  | 'STOPPED'
  | 'FAILED'
  | 'UNKNOWN'

export class NotificationService {
  static async sendWhatsApp(args: {
    target: string
    message: string
    template: string
    userId?: string | null
    orderId?: string | null
  }): Promise<boolean> {
    // Validate target di awal — kalau empty/null, log ke DB sebagai 'failed'
    // dengan error message yang clear, hindari panggil WAHA dengan target invalid
    const trimmedTarget = (args.target ?? '').trim()
    if (!trimmedTarget) {
      console.warn('[wa] target kosong — skip send', { template: args.template, orderId: args.orderId })
      await logNotification({
        user_id: args.userId ?? null,
        order_id: args.orderId ?? null,
        channel: 'wa',
        template: args.template,
        status: 'failed',
        error: 'Target phone_wa kosong / null di profile buyer',
      })
      return false
    }

    // Strip BOM (U+FEFF) + zero-width chars + whitespace + trailing slash.
    // PowerShell pipe ke `wrangler secret put` kadang prepend BOM (U+FEFF)
    // ke string, bikin fetch() throw "Invalid URL" karena URL contains
    // invisible char di awal. Defensive: clean semua invisible characters
    // sebelum dipakai.
    const baseUrl = sanitizeEnv(process.env.WAHA_BASE_URL).replace(/\/$/, '')
    const apiKey = sanitizeEnv(process.env.WAHA_API_KEY)
    const session = sanitizeEnv(process.env.WAHA_SESSION) || 'default'
    const chatId = toChatId(trimmedTarget)

    let status: NotifStatus = 'sent'
    let error: string | null = null
    try {
      const res = await fetch(`${baseUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          Accept: 'application/json',
        },
        body: JSON.stringify({ session, chatId, text: args.message }),
      })
      if (!res.ok) {
        status = 'failed'
        error = `${res.status} ${await res.text()}`.slice(0, 500)
      }
    } catch (err) {
      status = 'failed'
      error = err instanceof Error ? err.message : 'unknown'
    }
    await logNotification({
      user_id: args.userId ?? null,
      order_id: args.orderId ?? null,
      channel: 'wa',
      template: args.template,
      status,
      error,
    })
    return status === 'sent'
  }

  static async sendEmail(args: {
    to: string
    subject: string
    html: string
    template: string
    userId?: string | null
    orderId?: string | null
  }): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY!
    const from = process.env.RESEND_FROM_EMAIL!
    let status: NotifStatus = 'sent'
    let error: string | null = null
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: args.to,
          subject: args.subject,
          html: args.html,
        }),
      })
      if (!res.ok) {
        status = 'failed'
        error = `${res.status} ${await res.text()}`.slice(0, 500)
      }
    } catch (err) {
      status = 'failed'
      error = err instanceof Error ? err.message : 'unknown'
    }
    await logNotification({
      user_id: args.userId ?? null,
      order_id: args.orderId ?? null,
      channel: 'email',
      template: args.template,
      status,
      error,
    })
    return status === 'sent'
  }

  /**
   * Kirim alert ke admin via WA. Kalau WA gagal (WAHA down, QR expired, dll),
   * fallback ke email Resend supaya alert critical tidak hilang.
   *
   * Subject email auto-prefix [ALERT JualAkun]. Body WA & email plain text
   * sama supaya konsisten — email di-wrap minimal HTML untuk readability.
   */
  static async sendAdminAlert(args: {
    template: string
    title: string
    message: string
  }): Promise<{ wa: boolean; email: boolean }> {
    const adminWa = process.env.ADMIN_WHATSAPP_NUMBER
    const adminEmail = process.env.ADMIN_EMAIL

    let waOk = false
    if (adminWa) {
      waOk = await this.sendWhatsApp({
        target: adminWa,
        template: args.template,
        message: `[${args.title}]\n\n${args.message}`,
      })
    }

    // Fallback email kalau WA gagal atau admin WA tidak diset
    let emailOk = false
    if (!waOk && adminEmail) {
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">[ALERT] JualAkun</h1>
            <p style="color: #fee2e2; margin: 8px 0 0; font-size: 13px;">${args.title}</p>
          </div>
          <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 8px 8px;">
            <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #374151; font-size: 14px; line-height: 1.6;">${args.message}</pre>
            <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              Email ini dikirim karena WhatsApp admin (${adminWa ? 'configured' : 'tidak diset'}) ${adminWa ? 'tidak menerima alert (WAHA down/QR expired)' : ''}.
            </p>
          </div>
        </div>
      `
      emailOk = await this.sendEmail({
        to: adminEmail,
        subject: `[ALERT JualAkun] ${args.title}`,
        html,
        template: `${args.template}_email_fallback`,
      })
    }

    return { wa: waOk, email: emailOk }
  }

  /**
   * Check status WAHA session via GET /api/sessions/{session}.
   * Return null kalau env vars belum di-set atau WAHA unreachable.
   *
   * Dipakai oleh admin /system-health untuk visibility status WA real-time.
   */
  static async checkWahaHealth(): Promise<{
    status: WahaSessionStatus
    session: string
    base_url_set: boolean
    api_key_set: boolean
    error?: string
  }> {
    const baseUrl = process.env.WAHA_BASE_URL?.replace(/\/$/, '')
    const apiKey = process.env.WAHA_API_KEY
    const session = process.env.WAHA_SESSION || 'default'

    if (!baseUrl || !apiKey) {
      return {
        status: 'UNKNOWN',
        session,
        base_url_set: !!baseUrl,
        api_key_set: !!apiKey,
        error: 'WAHA env vars belum diset',
      }
    }

    try {
      const res = await fetch(`${baseUrl}/api/sessions/${session}`, {
        method: 'GET',
        headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
      })
      if (!res.ok) {
        return {
          status: 'UNKNOWN',
          session,
          base_url_set: true,
          api_key_set: true,
          error: `${res.status} ${(await res.text()).slice(0, 200)}`,
        }
      }
      const body = (await res.json()) as { status?: string }
      const status = (body.status ?? 'UNKNOWN') as WahaSessionStatus
      return {
        status,
        session,
        base_url_set: true,
        api_key_set: true,
      }
    } catch (err) {
      return {
        status: 'UNKNOWN',
        session,
        base_url_set: true,
        api_key_set: true,
        error: err instanceof Error ? err.message : 'unknown',
      }
    }
  }
}
