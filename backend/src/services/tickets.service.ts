import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { ActivityLogService } from './activity-log.service'

type CreateTicketInput = {
  order_id: string
  reason: string
  description?: string
  screenshot_url?: string
}

export class TicketsService {
  static async create(userId: string, input: CreateTicketInput) {
    const supabase = createAdminClient()

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, guarantee_expires_at')
      .eq('id', input.order_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!order) throw new ApiError('NOT_FOUND', 'Pesanan tidak ditemukan', 404)
    if (!['delivered', 'confirmed'].includes(order.status)) {
      throw new ApiError('VALIDATION_ERROR', 'Order belum dikirim, tidak bisa klaim garansi', 400)
    }
    if (order.guarantee_expires_at && new Date(order.guarantee_expires_at) < new Date()) {
      throw new ApiError('VALIDATION_ERROR', 'Garansi sudah habis', 400, { code: 'GUARANTEE_EXPIRED' })
    }

    const { data: existing } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('order_id', input.order_id)
      .in('status', ['open', 'in_review'])
      .maybeSingle()
    if (existing) {
      throw new ApiError('VALIDATION_ERROR', 'Tiket aktif sudah ada untuk order ini', 409, {
        code: 'TICKET_ALREADY_EXISTS',
      })
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        order_id: input.order_id,
        user_id: userId,
        reason: input.reason,
        description: input.description ?? null,
        screenshot_url: input.screenshot_url ?? null,
        status: 'open',
      })
      .select('id, status')
      .single()

    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    await ActivityLogService.log({
      event_type: 'ticket_created',
      ref_id: data.id,
      ref_table: 'support_tickets',
      title: `Tiket garansi baru: ${input.reason}`,
      description: input.description?.slice(0, 200) ?? null,
      metadata: { reason: input.reason, order_id: input.order_id, user_id: userId },
    })

    return {
      ticket_id: data.id,
      status: data.status,
      message: 'Tiket berhasil dibuat. Admin akan merespons dalam 1x24 jam.',
    }
  }

  static async listForUser(userId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `id, reason, description, status, resolution, created_at, resolved_at,
         orders!inner ( order_number, products ( name ) )`,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { tickets: data ?? [] }
  }

  static async getOne(userId: string, ticketId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `id, reason, description, screenshot_url, status, resolution, created_at, resolved_at,
         orders!inner ( id, order_number, products ( name, slug, thumbnail_url ) )`,
      )
      .eq('id', ticketId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!data) throw new ApiError('NOT_FOUND', 'Tiket tidak ditemukan', 404)
    return data
  }
}
