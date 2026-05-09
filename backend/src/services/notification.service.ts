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

async function logNotification(entry: LogEntry): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('notifications_log').insert(entry)
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

export class NotificationService {
  static async sendWhatsApp(args: {
    target: string
    message: string
    template: string
    userId?: string | null
    orderId?: string | null
  }): Promise<void> {
    const baseUrl = process.env.WAHA_BASE_URL!.replace(/\/$/, '')
    const apiKey = process.env.WAHA_API_KEY!
    const session = process.env.WAHA_SESSION || 'default'
    const chatId = toChatId(args.target)

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
        error = await res.text()
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
  }

  static async sendEmail(args: {
    to: string
    subject: string
    html: string
    template: string
    userId?: string | null
    orderId?: string | null
  }): Promise<void> {
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
        error = await res.text()
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
  }
}
