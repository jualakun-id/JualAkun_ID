import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { ActivityLogService } from './activity-log.service'

type CreateReviewInput = { order_id: string; rating: number; comment?: string }

export class ReviewsService {
  static async create(userId: string, input: CreateReviewInput) {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, product_id, status, order_number, products!inner(name)')
      .eq('id', input.order_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    if (order.status !== 'confirmed') {
      throw new ApiError('VALIDATION_ERROR', 'Order belum dikonfirmasi', 400, { code: 'ORDER_NOT_CONFIRMED' })
    }

    const { error } = await supabase.from('product_reviews').insert({
      order_id: order.id,
      user_id: userId,
      product_id: order.product_id,
      rating: input.rating,
      comment: input.comment ?? null,
    })
    if (error) {
      if (error.code === '23505') {
        throw new ApiError('VALIDATION_ERROR', 'Review sudah pernah dibuat', 409, { code: 'REVIEW_ALREADY_EXISTS' })
      }
      throw new ApiError('INTERNAL_ERROR', error.message, 500)
    }

    const productRel = (order as { products: { name: string } | { name: string }[] }).products
    const product = Array.isArray(productRel) ? productRel[0] : productRel
    await ActivityLogService.log({
      event_type: 'review_submitted',
      ref_id: order.id,
      ref_table: 'orders',
      title: `Review baru: ${input.rating}⭐ untuk ${product?.name ?? 'produk'}`,
      description: input.comment?.slice(0, 200) ?? null,
      metadata: { order_number: (order as { order_number: string }).order_number, rating: input.rating, product_id: order.product_id, user_id: userId },
    })

    return { ok: true }
  }
}
