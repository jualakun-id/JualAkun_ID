import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

const CANBOSO_BASE = 'https://canboso.com/api/telegram-buyer'

// Kurs USD → IDR untuk konversi modal supplier ke rupiah. Pakai 18000
// (top-up Binance USDT 2026-05) sebagai konservatif buffer — modal yang
// di-record sedikit overestimate, lebih aman untuk margin calculation.
// Admin tetap bisa adjust manual di FulfillForm sebelum kirim.
const USD_IDR_RATE = 18000

type SupplierStats = { total: number; sold: number; available: number }

type SupplierProduct = {
  _id: string
  product_name: string
  pricing: number
  usdPricing: number
  walletPricingText: string
  slotProductType: string
  warrantyType: string
  warrantyDays: number
  description: string
  usageGuide: string
  hiddenInBotMenu: boolean
  stats: SupplierStats
}

type ProductsResponse = {
  success: boolean
  walletCurrency: string
  products: SupplierProduct[]
}

/**
 * Canboso supplier API integration (https://canboso.com/api/swagger).
 * - GET products: untuk dropdown form produk + batch stock sync
 * - POST purchase: trigger pembelian on-demand (admin manual)
 *
 * Auth: header X-API-Key. Key disimpan di Cloudflare Worker secret
 * (env.SUPPLIER_CANBOSO_API_KEY) — JANGAN log full key.
 */
export class SupplierCanbosoService {
  private static getKey(): string {
    // Trim — PowerShell pipe ke `wrangler secret put` kadang append \r\n
    // ke value, bikin auth gagal di supplier walaupun key benar.
    const key = process.env.SUPPLIER_CANBOSO_API_KEY?.trim()
    if (!key) {
      throw new ApiError(
        'INTERNAL_ERROR',
        'Supplier API key tidak di-config (set SUPPLIER_CANBOSO_API_KEY via wrangler secret)',
        500,
      )
    }
    return key
  }

  /**
   * Get saldo wallet Canboso. Dipakai admin untuk monitor saldo & top-up
   * manual sebelum stock habis. Return null kalau timeout/error (admin
   * tetap bisa lihat halaman, tidak block).
   */
  static async getBalance(): Promise<{
    balance_usd: number
    balance_text: string
    updated_at: string
  } | null> {
    const ctrl = new AbortController()
    const timeoutId = setTimeout(() => ctrl.abort(), 8_000)
    try {
      const res = await fetch(`${CANBOSO_BASE}/balance`, {
        headers: { 'X-API-Key': this.getKey() },
        signal: ctrl.signal,
      })
      if (!res.ok) return null
      const json = (await res.json()) as {
        balanceUsd: number
        balanceText: string
        updatedAt: string
      }
      return {
        balance_usd: json.balanceUsd,
        balance_text: json.balanceText,
        updated_at: json.updatedAt,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /** List semua produk supplier — return minimal subset untuk admin UI. */
  static async listProducts() {
    // Timeout 10s — Canboso server di VN kadang lambat, tapi jangan biarkan
    // Workers hang sampai 30s (Cloudflare CPU limit). Kalau timeout, throw
    // error yang bisa di-retry user.
    const ctrl = new AbortController()
    const timeoutId = setTimeout(() => ctrl.abort(), 10_000)
    let res: Response
    try {
      res = await fetch(`${CANBOSO_BASE}/products`, {
        headers: { 'X-API-Key': this.getKey() },
        signal: ctrl.signal,
      })
    } catch (err) {
      const msg = err instanceof Error && err.name === 'AbortError'
        ? 'Supplier lambat balas (>10s) — coba lagi sebentar'
        : `Supplier unreachable: ${err instanceof Error ? err.message : String(err)}`
      throw new ApiError('INTERNAL_ERROR', msg, 502)
    } finally {
      clearTimeout(timeoutId)
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new ApiError('INTERNAL_ERROR', `Supplier GET /products gagal (${res.status}): ${body.slice(0, 200)}`, 502)
    }
    const json = (await res.json()) as ProductsResponse
    return {
      walletCurrency: json.walletCurrency,
      products: json.products.map((p) => ({
        id: p._id,
        name: p.product_name,
        price_usd: p.usdPricing,
        wallet_price_text: p.walletPricingText,
        available: p.stats?.available ?? 0,
        sold: p.stats?.sold ?? 0,
        warranty_type: p.warrantyType,
        warranty_days: p.warrantyDays,
        hidden: p.hiddenInBotMenu,
      })),
    }
  }

  /**
   * Sync display_stock = supplier.stats.available untuk semua produk JualAkun
   * yang sudah punya `supplier_product_id`. Run by admin button atau cron.
   * Return: jumlah produk yang di-update + list mapping yang tidak ketemu.
   */
  static async syncStock() {
    const { products: supplierList } = await this.listProducts()
    const supplierMap = new Map(supplierList.map((p) => [p.id, p.available]))

    const supabase = createAdminClient()
    const { data: jualakunProducts, error } = await supabase
      .from('products')
      .select('id, supplier_product_id, display_stock')
      .not('supplier_product_id', 'is', null)
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    const orphans: string[] = []
    const now = new Date().toISOString()

    // Parallel update — jauh lebih cepat dari sequential await loop.
    const updatePromises = (jualakunProducts ?? []).map(async (p) => {
      const supId = p.supplier_product_id as string
      const available = supplierMap.get(supId)
      if (available === undefined) {
        orphans.push(supId)
        return { updated: false }
      }
      const fields: Record<string, unknown> = { supplier_synced_at: now }
      if (p.display_stock !== available) fields.display_stock = available
      const { error: updErr } = await supabase.from('products').update(fields).eq('id', p.id)
      if (updErr) {
        console.warn('[supplier.syncStock] update fail', p.id, updErr.message)
        return { updated: false }
      }
      return { updated: p.display_stock !== available }
    })
    const results = await Promise.all(updatePromises)
    const updated = results.filter((r) => r.updated).length

    return {
      total_mapped: (jualakunProducts ?? []).length,
      updated,
      orphans,
      synced_at: now,
    }
  }

  /**
   * Trigger pembelian on-demand untuk 1 order. Admin click "Beli dari Supplier"
   * dari Fulfill form. Response berupa raw text yang akan masuk ke note buyer.
   * Schema POST canboso /purchase: belum confirmed via swagger. Implementasi
   * default: body `{ productId, quantity: 1 }`. Adjust kalau supplier balas
   * error schema mismatch.
   */
  static async purchase(supplierProductId: string): Promise<{
    raw: string
    cost_usd: number | null
    cost_idr: number | null
  }> {
    const res = await fetch(`${CANBOSO_BASE}/purchase`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.getKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId: supplierProductId, quantity: 1 }),
    })
    const text = await res.text()
    if (!res.ok) {
      throw new ApiError('INTERNAL_ERROR', `Supplier purchase gagal (${res.status}): ${text.slice(0, 500)}`, 502)
    }
    // Try parse JSON, fallback ke raw text
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return { raw: text, cost_usd: null, cost_idr: null }
    }
    const obj = parsed as Record<string, unknown>
    const costUsd =
      (typeof obj.price === 'number' ? obj.price : undefined) ??
      (typeof obj.usdPricing === 'number' ? obj.usdPricing : undefined) ??
      (typeof obj.totalUsd === 'number' ? obj.totalUsd : undefined) ??
      (typeof obj.cost === 'number' ? obj.cost : undefined) ??
      null
    const costIdr = costUsd !== null ? Math.round(costUsd * USD_IDR_RATE) : null
    return {
      raw: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2),
      cost_usd: costUsd,
      cost_idr: costIdr,
    }
  }
}
