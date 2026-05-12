import { createClient } from '@supabase/supabase-js'
import { ApiError } from '@/types/errors'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from './notification.service'
import { templates } from '@/templates/messages'

function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type RegisterInput = {
  email: string
  password: string
  full_name: string
  phone_wa?: string
  referral_code?: string
}

type LoginInput = { email: string; password: string }

type SessionPayload = {
  access_token: string
  refresh_token: string
  expires_in: number
  user: { id: string; email: string; role: string }
}

function normalizePhoneWa(input?: string): string | null {
  if (!input) return null
  const digits = input.replace(/\D/g, '')
  // Already normalized E.164 (62 = Indonesia, 60 = Malaysia, etc.)
  if (digits.startsWith('62') || digits.startsWith('60')) return digits
  // Fallback Indonesia local format (untuk backward compat)
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return null
}

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user_id: string; email: string; message: string }> {
    if (input.password.length < 8) {
      throw new ApiError('VALIDATION_ERROR', 'Password minimal 8 karakter', 422)
    }

    const admin = createAdminClient()

    let referrerId: string | null = null
    if (input.referral_code) {
      const { data: ref } = await admin
        .from('profiles')
        .select('id')
        .eq('referral_code', input.referral_code.toUpperCase())
        .maybeSingle()
      if (!ref) throw new ApiError('VALIDATION_ERROR', 'Kode referral tidak valid', 400)
      referrerId = ref.id
    }

    const { data, error } = await publicClient().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          phone_wa: normalizePhoneWa(input.phone_wa),
        },
      },
    })

    if (error || !data.user) {
      const code = error?.message?.toLowerCase().includes('already') ? 'EMAIL_TAKEN' : 'VALIDATION_ERROR'
      throw new ApiError(code === 'EMAIL_TAKEN' ? 'VALIDATION_ERROR' : 'VALIDATION_ERROR', error?.message ?? 'Gagal mendaftar', 400, { reason: code })
    }

    const phoneNorm = normalizePhoneWa(input.phone_wa)
    if (phoneNorm) {
      await admin.from('profiles').update({ phone_wa: phoneNorm }).eq('id', data.user.id)
    }

    if (referrerId) {
      await admin.from('referrals').insert({
        referrer_user_id: referrerId,
        referred_user_id: data.user.id,
        credit_amount: 5000,
        status: 'pending',
      })
    }

    // Welcome email branded — dikirim setelah Supabase email verification.
    // Tidak menggantikan email verifikasi (yang masih default Supabase) —
    // ini email kedua untuk onboarding yang lebih branded.
    try {
      const tpl = templates.welcome({
        fullName: input.full_name,
        email: data.user.email!,
      })
      await NotificationService.sendEmail({
        to: data.user.email!,
        subject: tpl.emailSubject,
        html: tpl.emailHtml,
        template: tpl.template,
        userId: data.user.id,
      })
    } catch (err) {
      console.warn('[auth/register] welcome email failed (non-blocking):', err)
    }

    return {
      user_id: data.user.id,
      email: data.user.email!,
      message: 'Cek email untuk verifikasi',
    }
  }

  static async login(input: LoginInput): Promise<SessionPayload> {
    const { data, error } = await publicClient().auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })
    if (error || !data.session || !data.user) {
      const isVerify = error?.message?.toLowerCase().includes('confirm')
      throw new ApiError(
        isVerify ? 'AUTH_FORBIDDEN' : 'AUTH_REQUIRED',
        isVerify ? 'Email belum diverifikasi' : 'Email atau password salah',
        401,
      )
    }
    const role = await this.lookupRole(data.user.id)
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email!, role },
    }
  }

  static async refresh(refreshToken: string): Promise<SessionPayload> {
    const { data, error } = await publicClient().auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session || !data.user) {
      throw new ApiError('AUTH_REQUIRED', 'Refresh token tidak valid', 401)
    }
    const role = await this.lookupRole(data.user.id)
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email!, role },
    }
  }

  static async logout(jwt: string): Promise<void> {
    const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
    await client.auth.signOut()
  }

  static async forgotPassword(email: string): Promise<void> {
    await publicClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SUPABASE_URL}/auth/v1/verify`,
    })
  }

  private static async lookupRole(userId: string): Promise<string> {
    const admin = createAdminClient()
    const { data } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle()
    return data?.role ?? 'user'
  }
}
