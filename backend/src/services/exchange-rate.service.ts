import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

const DEFAULT_FALLBACK_RATE = 18000 // safety net kalau DB tidak ada record

export type ExchangeRate = {
  pair: string
  rate: number
  updated_at: string
  updated_by: string | null
  notes: string | null
}

/**
 * Manage kurs currency. Sekarang hanya support USD_IDR.
 * Snapshot historis aman: orders.cost_idr sudah fix integer per order,
 * jadi update kurs di sini gak akan affect laporan profit historis.
 */
export class ExchangeRateService {
  private static cached: { rate: number; expires: number } | null = null

  /** Get kurs USD → IDR dengan cache 60 detik (hindari DB hit per fulfill). */
  static async getUsdIdr(): Promise<number> {
    const now = Date.now()
    if (this.cached && now < this.cached.expires) return this.cached.rate

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('pair', 'USD_IDR')
      .maybeSingle()
    if (error) {
      console.warn('[ExchangeRateService] DB error, fallback to default:', error.message)
      return DEFAULT_FALLBACK_RATE
    }
    const rate = Number(data?.rate) || DEFAULT_FALLBACK_RATE
    this.cached = { rate, expires: now + 60_000 }
    return rate
  }

  static async getAll(): Promise<ExchangeRate[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('pair, rate, updated_at, updated_by, notes')
      .order('pair', { ascending: true })
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return (data ?? []) as ExchangeRate[]
  }

  static async getOne(pair: string): Promise<ExchangeRate | null> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('pair, rate, updated_at, updated_by, notes')
      .eq('pair', pair)
      .maybeSingle()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    return data as ExchangeRate | null
  }

  /** Update kurs. Invalidate cache supaya fulfill berikutnya pakai value baru. */
  static async update(pair: string, rate: number, userId: string | null, notes?: string) {
    if (rate <= 0) throw new ApiError('VALIDATION_ERROR', 'Kurs harus > 0', 400)
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert(
        {
          pair,
          rate,
          updated_at: new Date().toISOString(),
          updated_by: userId,
          notes: notes ?? null,
        },
        { onConflict: 'pair' },
      )
      .select()
      .single()
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)
    // Invalidate cache — fulfill berikutnya akan pakai value baru
    this.cached = null
    return data as ExchangeRate
  }
}
