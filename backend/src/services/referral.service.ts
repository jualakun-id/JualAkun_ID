import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, 1)
  return `${visible}${'*'.repeat(Math.max(local.length - 1, 1))}@${domain}`
}

export class ReferralService {
  static async getInfo(userId: string) {
    const supabase = createAdminClient()

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('referral_code, credits')
      .eq('id', userId)
      .maybeSingle()
    if (profileErr || !profile) throw new ApiError('NOT_FOUND', 'Profil tidak ditemukan', 404)

    // FK referrals.referred_user_id ke auth.users (bukan profiles), jadi
    // gak bisa embed via FK. Ambil user_id langsung lalu fetch email per id.
    const { data: refs } = await supabase
      .from('referrals')
      .select('referred_user_id, status, credit_amount, credited_at, created_at')
      .eq('referrer_user_id', userId)
      .order('created_at', { ascending: false })

    const list = (refs ?? []) as Array<{
      referred_user_id: string
      status: string
      credit_amount: number
      credited_at: string | null
      created_at: string
    }>
    const stats = {
      total_referrals: list.length,
      credited: list.filter((r) => r.status === 'credited').length,
      pending: list.filter((r) => r.status === 'pending').length,
      total_earned: list
        .filter((r) => r.status === 'credited')
        .reduce((sum, r) => sum + (r.credit_amount ?? 0), 0),
    }

    const history = await Promise.all(
      list.slice(0, 20).map(async (r) => {
        let email = ''
        if (r.referred_user_id) {
          const { data: user } = await supabase.auth.admin.getUserById(r.referred_user_id)
          email = user.user?.email ?? ''
        }
        return {
          referred_email: email ? maskEmail(email) : '—',
          status: r.status,
          credit_amount: r.credit_amount,
          credited_at: r.credited_at,
        }
      }),
    )

    const siteUrl = process.env.SUPABASE_URL?.replace(/\.supabase\.co.*$/, '') ?? 'https://jualakun.id'
    return {
      referral_code: profile.referral_code,
      referral_link: `${siteUrl.includes('jualakun') ? siteUrl : 'https://jualakun.id'}/daftar?ref=${profile.referral_code}`,
      credits: profile.credits ?? 0,
      stats,
      history,
    }
  }
}
