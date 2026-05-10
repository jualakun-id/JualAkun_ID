import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

export class DashboardService {
  static async getDashboard(userId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('get_buyer_dashboard', { p_user_id: userId })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data
  }

  static async updateProfile(userId: string, body: { full_name?: string; phone_wa?: string }) {
    const supabase = createAdminClient()
    const update: Record<string, string> = {}
    if (body.full_name) update.full_name = body.full_name
    if (body.phone_wa) update.phone_wa = normalizePhone(body.phone_wa)
    if (Object.keys(update).length === 0) return { ok: true }
    const { error } = await supabase.from('profiles').update(update).eq('id', userId)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return { ok: true }
  }
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  // E.164 normalized (62 = ID, 60 = MY)
  if (digits.startsWith('62') || digits.startsWith('60')) return digits
  // Fallback Indonesia local format
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}
