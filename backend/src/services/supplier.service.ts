import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

const CANBOSO_BASE = 'https://canboso.com/api/telegram-buyer'

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
    const key = process.env.SUPPLIER_CANBOSO_API_KEY
    if (!key) {
      throw new ApiError(
        'INTERNAL_ERROR',
        'Supplier API key tidak di-config (set SUPPLIER_CANBOSO_API_KEY via wrangler secret)',
        500,
      )
    }
    return key
  }

  /** List semua produk supplier — return minimal subset untuk admin UI. */
  static async listProducts() {
    const res = await fetch(`${CANBOSO_BASE}/products`, {
      headers: { 'X-API-Key': this.getKey() },
    })
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

    const updates: { id: string; available: number }[] = []
    const orphans: string[] = [] // supplier_product_id yang udah gak ada di supplier
    const now = new Date().toISOString()

    for (const p of jualakunProducts ?? []) {
      const supId = p.supplier_product_id as string
      const available = supplierMap.get(supId)
      if (available === undefined) {
        orphans.push(supId)
        continue
      }
      // Skip update kalau nilai-nya sama (hemat write)
      if (p.display_stock !== available) {
        const { error: updErr } = await supabase
          .from('products')
          .update({ display_stock: available, supplier_synced_at: now })
          .eq('id', p.id)
        if (updErr) {
          console.warn('[supplier.syncStock] update fail', p.id, updErr.message)
          continue
        }
      } else {
        // Tetap update timestamp supaya admin tahu sudah di-sync
        await supabase.from('products').update({ supplier_synced_at: now }).eq('id', p.id)
      }
      updates.push({ id: p.id, available })
    }
    return {
      total_mapped: (jualakunProducts ?? []).length,
      updated: updates.length,
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
  static async purchase(supplierProductId: string): Promise<{ raw: string; price_usd?: number }> {
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
      return { raw: text }
    }
    return {
      raw: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2),
      price_usd: (parsed as { price?: number; usdPricing?: number })?.price ?? (parsed as { usdPricing?: number })?.usdPricing,
    }
  }
}
