import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

type CreateReviewInput = { order_id: string; rating: number; comment?: string }

export class ReviewsService {
  static async create(userId: string, input: CreateReviewInput) {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, product_id, status')
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
    return { ok: true }
  }
}
