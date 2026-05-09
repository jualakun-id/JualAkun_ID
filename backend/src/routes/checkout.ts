import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { CheckoutService } from '@/services/checkout.service'
import { createAdminClient } from '@/lib/supabase'
import type { AppEnv } from '@/types/bindings'

export const checkoutRoute = new Hono<AppEnv>()

checkoutRoute.use('*', authMiddleware)

/**
 * POST /checkout/create-order
 * Spec: docs/api-spec.md § Checkout & Orders
 */
const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  coupon_code: z.string().trim().min(1).max(30).optional(),
  use_credits: z.boolean().optional().default(false),
  phone_wa: z
    .string()
    .regex(/^(\+?62|0|8)\d{8,13}$/, 'Format: 08xx atau 628xx')
    .optional(),
})

checkoutRoute.post('/create-order', zValidator('json', createOrderSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const result = await CheckoutService.createOrder(userId, body)
  return c.json({ data: result }, 201)
})

/**
 * POST /checkout/validate-coupon — pre-checkout coupon check
 */
const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(30),
  product_id: z.string().uuid(),
  amount_idr: z.coerce.number().int().positive(),
})

checkoutRoute.post('/validate-coupon', zValidator('json', validateCouponSchema), async (c) => {
  const body = c.req.valid('json')
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: body.code,
    p_product_id: body.product_id,
    p_amount_idr: body.amount_idr,
  })
  if (error) {
    return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)
  }
  const r = data as {
    ok: boolean
    code?: string
    discount_type?: 'percent' | 'fixed'
    discount_value?: number
    discount_idr?: number
    final_idr?: number
  }
  if (!r?.ok) {
    return c.json(
      { ok: false, code: r?.code ?? 'COUPON_INVALID', message: 'Kode kupon tidak valid' },
      400,
    )
  }
  return c.json({
    data: {
      valid: true,
      discount_type: r.discount_type,
      discount_value: r.discount_value,
      discount_idr: r.discount_idr,
      final_idr: r.final_idr,
    },
  })
})
