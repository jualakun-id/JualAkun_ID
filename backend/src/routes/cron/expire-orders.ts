import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { ActivityLogService } from '@/services/activity-log.service'
import { NotificationService } from '@/services/notification.service'
import { templates } from '@/templates/messages'
import type { AppEnv } from '@/types/bindings'

export const expireOrdersCron = new Hono<AppEnv>()

expireOrdersCron.use('*', cronMiddleware)

expireOrdersCron.post('/', async (c) => {
  const supabase = createAdminClient()

  // Snapshot order yang sebentar lagi diexpire — supaya bisa log + notif buyer
  // setelah RPC jalan. Pakai 1 jam window untuk safety (cron interval 5 min).
  // Ambil juga user_id + product info untuk notif.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: candidates } = await supabase
    .from('orders')
    .select('id, order_number, user_id, products!inner(name)')
    .eq('status', 'pending_payment')
    .lt('expires_at', new Date().toISOString())
    .gte('expires_at', oneHourAgo)

  const { error } = await supabase.rpc('expire_old_orders')
  if (error) return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)

  type ExpiredCandidate = { id: string; order_number: string; user_id: string; products: { name: string } | { name: string }[] }
  let notified = 0

  // Emit log + kirim notif buyer untuk tiap order yang baru di-expire
  for (const o of (candidates ?? []) as ExpiredCandidate[]) {
    await ActivityLogService.log({
      event_type: 'order_expired',
      ref_id: o.id,
      ref_table: 'orders',
      title: `Order expired: ${o.order_number}`,
      description: 'Pembayaran tidak diselesaikan dalam 24 jam',
      metadata: { order_id: o.id, order_number: o.order_number },
    })

    // Notif buyer — recovery konversi: ajak pesan ulang
    try {
      const product = Array.isArray(o.products) ? o.products[0] : o.products
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_wa')
        .eq('id', o.user_id)
        .maybeSingle()
      const { data: authUser } = await supabase.auth.admin.getUserById(o.user_id)
      const email = authUser.user?.email
      const tpl = templates.orderExpired({
        fullName: profile?.full_name ?? 'Buyer',
        orderNumber: o.order_number,
        productName: product?.name ?? 'Akun Digital',
      })
      if (profile?.phone_wa) {
        await NotificationService.sendWhatsApp({
          target: profile.phone_wa,
          message: tpl.waText,
          template: tpl.template,
          userId: o.user_id,
          orderId: o.id,
        })
      }
      if (email) {
        await NotificationService.sendEmail({
          to: email,
          subject: tpl.emailSubject,
          html: tpl.emailHtml,
          template: tpl.template,
          userId: o.user_id,
          orderId: o.id,
        })
      }
      notified += 1
    } catch (err) {
      console.warn('[expire-orders] notify buyer failed (non-blocking):', err)
    }
  }
  return c.json({ data: { ok: true, expired: candidates?.length ?? 0, notified } })
})
