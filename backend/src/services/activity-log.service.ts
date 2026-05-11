import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

export type ActivityEventType =
  | 'user_registered'
  | 'order_created'
  | 'order_paid'
  | 'order_delivered'
  | 'order_refunded'
  | 'ticket_created'
  | 'ticket_resolved'

export type ActivityLog = {
  id: string
  event_type: ActivityEventType
  ref_id: string | null
  ref_table: string | null
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

/**
 * Activity feed log untuk admin. Distinct dari notifications_log (outgoing
 * email/WA). Service emit events dari payment callback, fulfillment, ticket
 * lifecycle, dst. user_registered di-handle DB trigger di profiles INSERT.
 */
export class ActivityLogService {
  /**
   * Insert event ke log. Fire-and-forget pattern di caller — kalau log
   * gagal, jangan crash flow utama. Log warning ke console.
   */
  static async log(input: {
    event_type: ActivityEventType
    ref_id?: string | null
    ref_table?: string | null
    title: string
    description?: string | null
    metadata?: Record<string, unknown> | null
  }): Promise<void> {
    try {
      const supabase = createAdminClient()
      const { error } = await supabase.from('admin_activity_log').insert({
        event_type: input.event_type,
        ref_id: input.ref_id ?? null,
        ref_table: input.ref_table ?? null,
        title: input.title,
        description: input.description ?? null,
        metadata: input.metadata ?? null,
      })
      if (error) console.warn('[ActivityLog]', input.event_type, 'insert failed:', error.message)
    } catch (err) {
      console.warn('[ActivityLog]', input.event_type, 'exception:', err)
    }
  }

  static async list(q: {
    event_type?: ActivityEventType
    is_read?: boolean
    page: number
    limit: number
  }) {
    const supabase = createAdminClient()
    const offset = (q.page - 1) * q.limit
    let query = supabase
      .from('admin_activity_log')
      .select('id, event_type, ref_id, ref_table, title, description, metadata, is_read, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + q.limit - 1)
    if (q.event_type) query = query.eq('event_type', q.event_type)
    if (q.is_read !== undefined) query = query.eq('is_read', q.is_read)
    const { data, error, count } = await query
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    // Hitung unread count (untuk badge counter, optional dipakai frontend)
    const { count: unreadCount } = await supabase
      .from('admin_activity_log')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)

    return {
      logs: (data ?? []) as ActivityLog[],
      pagination: { page: q.page, limit: q.limit, total: count ?? 0 },
      unread_count: unreadCount ?? 0,
    }
  }

  /**
   * Get satu entry plus enrich data referensi (order, profile, ticket)
   * supaya modal detail bisa render konteks lengkap tanpa fetch tambahan.
   */
  static async getOne(id: string) {
    const supabase = createAdminClient()
    const { data: log, error } = await supabase
      .from('admin_activity_log')
      .select('id, event_type, ref_id, ref_table, title, description, metadata, is_read, created_at')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    if (!log) throw new ApiError('NOT_FOUND', 'Activity log tidak ditemukan', 404)

    // Enrich data referensi
    let ref_data: Record<string, unknown> | null = null
    const typed = log as ActivityLog
    if (typed.ref_id && typed.ref_table) {
      if (typed.ref_table === 'orders') {
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, total_idr, status, paid_at, delivered_at, created_at, products!inner(name, slug)')
          .eq('id', typed.ref_id)
          .maybeSingle()
        ref_data = data
      } else if (typed.ref_table === 'profiles') {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, phone_wa, role, created_at')
          .eq('id', typed.ref_id)
          .maybeSingle()
        ref_data = data
      } else if (typed.ref_table === 'support_tickets') {
        const { data } = await supabase
          .from('support_tickets')
          .select('id, reason, status, description, resolution, created_at, order_id')
          .eq('id', typed.ref_id)
          .maybeSingle()
        ref_data = data
      }
    }

    return { ...typed, ref_data }
  }

  static async markAsRead(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('admin_activity_log')
      .update({ is_read: true })
      .eq('id', id)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }

  static async markAllRead() {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('admin_activity_log')
      .update({ is_read: true })
      .eq('is_read', false)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }
}
