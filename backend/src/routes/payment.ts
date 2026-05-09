import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { PaymentService } from '@/services/payment.service'
import type { AppEnv } from '@/types/bindings'

export const paymentRoute = new Hono<AppEnv>()

/**
 * Midtrans webhook — public endpoint, signature-verified inside the service.
 * Always returns HTTP 200 so Midtrans doesn't retry on internal failures
 * (we self-recover via cron retry-notifications + admin alerts).
 *
 * Spec: docs/api-spec.md § POST /payment/webhook
 */
const midtransNotifSchema = z.object({
  order_id: z.string(),
  transaction_id: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  status_code: z.string(),
  gross_amount: z.string(),
  payment_type: z.string().optional(),
  signature_key: z.string(),
  settlement_time: z.string().optional(),
})

paymentRoute.post('/webhook', zValidator('json', midtransNotifSchema), async (c) => {
  const notif = c.req.valid('json')
  try {
    const outcome = await PaymentService.processWebhook(notif)
    if (!outcome.ok) {
      console.warn('[payment/webhook] rejected', { reason: outcome.reason, order_id: notif.order_id })
    }
  } catch (err) {
    console.error('[payment/webhook] unhandled', err)
  }
  return c.json({ ok: true }, 200)
})
