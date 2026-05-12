import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import { templates } from '@/templates/messages'
import type { AppEnv } from '@/types/bindings'

/**
 * Customer reminder cron — kirim 2 reminder otomatis:
 *
 * 1. **Guarantee expiring** (H-3): buyer dengan garansi habis 3 hari lagi
 *    dapat reminder buat klaim garansi sebelum kedaluwarsa.
 *
 * 2. **Review reminder** (D+3): buyer yang sudah delivered 3 hari lalu
 *    diingatkan kasih review (gunanya untuk social proof).
 *
 * Dedup pakai notifications_log — sebelum kirim, query apakah template sama
 * untuk order_id ini sudah pernah di-sent. Mencegah dobel kirim kalau cron
 * jalan lebih dari sekali dalam window.
 */
export const customerRemindersCron = new Hono<AppEnv>()

customerRemindersCron.use('*', cronMiddleware)

customerRemindersCron.post('/', async (c) => {
  const supabase = createAdminClient()
  const now = new Date()

  // ─── 1. Guarantee expiring H-3 ─────────────────────────────────────────
  // Cari order dengan guarantee_expires_at antara now+2.5d dan now+3.5d.
  // Window 1 hari untuk safety kalau cron miss schedule.
  const startGuarantee = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000).toISOString()
  const endGuarantee = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: guaranteeCandidates } = await supabase
    .from('orders')
    .select('id, order_number, user_id, guarantee_expires_at, products!inner(name)')
    .in('status', ['delivered', 'confirmed'])
    .gte('guarantee_expires_at', startGuarantee)
    .lte('guarantee_expires_at', endGuarantee)
    .limit(50)

  type Candidate = {
    id: string
    order_number: string
    user_id: string
    guarantee_expires_at: string
    products: { name: string; slug?: string } | { name: string; slug?: string }[]
  }

  let guaranteeSent = 0
  for (const o of (guaranteeCandidates ?? []) as Candidate[]) {
    // Dedup: skip kalau sudah pernah dikirim untuk order ini
    const { data: prev } = await supabase
      .from('notifications_log')
      .select('id')
      .eq('order_id', o.id)
      .eq('template', 'guarantee_expiring_soon')
      .eq('status', 'sent')
      .maybeSingle()
    if (prev) continue

    const product = Array.isArray(o.products) ? o.products[0] : o.products
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa')
      .eq('id', o.user_id)
      .maybeSingle()
    const { data: authUser } = await supabase.auth.admin.getUserById(o.user_id)
    const email = authUser.user?.email

    const daysLeft = Math.max(
      1,
      Math.round((new Date(o.guarantee_expires_at).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    )
    const tpl = templates.guaranteeExpiringSoon({
      fullName: profile?.full_name ?? 'Buyer',
      orderNumber: o.order_number,
      productName: product?.name ?? 'Akun Digital',
      daysLeft,
      expiresAt: o.guarantee_expires_at,
    })

    try {
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
      guaranteeSent += 1
    } catch (err) {
      console.warn('[customer-reminders] guarantee notif failed:', err)
    }
  }

  // ─── 2. Review reminder D+3 ────────────────────────────────────────────
  // Cari order delivered 3 hari lalu yang belum di-review.
  // Window 1 hari (2.5d - 3.5d) untuk safety.
  const startReview = new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000).toISOString()
  const endReview = new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: reviewCandidates } = await supabase
    .from('orders')
    .select('id, order_number, user_id, products!inner(name, slug)')
    .in('status', ['delivered', 'confirmed'])
    .gte('delivered_at', startReview)
    .lte('delivered_at', endReview)
    .limit(50)

  let reviewSent = 0
  for (const o of (reviewCandidates ?? []) as Candidate[]) {
    // Dedup
    const { data: prev } = await supabase
      .from('notifications_log')
      .select('id')
      .eq('order_id', o.id)
      .eq('template', 'review_reminder')
      .eq('status', 'sent')
      .maybeSingle()
    if (prev) continue

    // Skip kalau buyer sudah kasih review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', o.id)
      .maybeSingle()
    if (existingReview) continue

    const product = Array.isArray(o.products) ? o.products[0] : o.products
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_wa')
      .eq('id', o.user_id)
      .maybeSingle()
    const { data: authUser } = await supabase.auth.admin.getUserById(o.user_id)
    const email = authUser.user?.email

    const tpl = templates.reviewReminder({
      fullName: profile?.full_name ?? 'Buyer',
      orderNumber: o.order_number,
      productName: product?.name ?? 'Akun Digital',
      productSlug: product?.slug ?? '',
    })

    try {
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
      reviewSent += 1
    } catch (err) {
      console.warn('[customer-reminders] review notif failed:', err)
    }
  }

  return c.json({
    data: { ok: true, guarantee_sent: guaranteeSent, review_sent: reviewSent },
  })
})
