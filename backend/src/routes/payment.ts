import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { PaymentService, type DuitkuCallback } from '@/services/payment.service'
import type { AppEnv } from '@/types/bindings'

export const paymentRoute = new Hono<AppEnv>()

/**
 * Duitku callback — public endpoint, signature-verified inside the service.
 * Always returns HTTP 200 so Duitku doesn't retry on internal failures
 * (we self-recover via cron retry-notifications + admin alerts).
 *
 * Body is application/x-www-form-urlencoded — see docs/api-spec.md.
 */
const duitkuCallbackSchema = z.object({
  merchantCode: z.string(),
  amount: z.string(),
  merchantOrderId: z.string(),
  signature: z.string(),
  reference: z.string(),
  resultCode: z.string(),
  paymentCode: z.string().optional(),
  productDetail: z.string().optional(),
  additionalParam: z.string().optional(),
  merchantUserId: z.string().optional(),
  publisherOrderId: z.string().optional(),
  spUserHash: z.string().optional(),
  settlementDate: z.string().optional(),
  issuerCode: z.string().optional(),
})

paymentRoute.post('/callback', zValidator('form', duitkuCallbackSchema), async (c) => {
  const notif = c.req.valid('form') as DuitkuCallback
  try {
    const outcome = await PaymentService.processCallback(notif)
    if (!outcome.ok) {
      console.warn('[payment/callback] rejected', {
        reason: outcome.reason,
        merchantOrderId: notif.merchantOrderId,
      })
    }
  } catch (err) {
    console.error('[payment/callback] unhandled', err)
  }
  return c.json({ ok: true }, 200)
})
