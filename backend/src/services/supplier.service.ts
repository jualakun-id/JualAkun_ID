import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import { ExchangeRateService } from './exchange-rate.service'
import { ActivityLogService } from './activity-log.service'

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
    balance_idr: number
    exchange_rate: number
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
      const rate = await ExchangeRateService.getUsdIdr()
      return {
        balance_usd: json.balanceUsd,
        balance_text: json.balanceText,
        balance_idr: Math.round(json.balanceUsd * rate),
        exchange_rate: rate,
        updated_at: json.updatedAt,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * List semua produk supplier — return subset untuk admin UI.
   * Tambah field `taken_by_product_id` per produk: kalau supplier product
   * sudah di-link ke produk JualAkun, tampilkan id-nya supaya frontend
   * bisa filter (kecuali untuk produk yang sedang di-edit).
   */
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

    // Fetch mapping supplier_product_id → jualakun product.id supaya frontend
    // tahu mana yang sudah di-claim. 1 supplier product = 1 jualakun product
    // (no double-link) — supaya admin tidak bingung "kok stok di-mirror ke 2".
    // Filter exclude both NULL AND empty string '' (legacy data dari sebelum
    // Zod schema transform "" → null).
    const supabase = createAdminClient()
    const { data: mapped } = await supabase
      .from('products')
      .select('id, supplier_product_id')
      .not('supplier_product_id', 'is', null)
      .neq('supplier_product_id', '')
    const takenMap = new Map<string, string>()
    for (const p of (mapped ?? []) as { id: string; supplier_product_id: string }[]) {
      takenMap.set(p.supplier_product_id, p.id)
    }

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
        taken_by_product_id: takenMap.get(p._id) ?? null,
      })),
    }
  }

  /**
   * Sync display_stock = supplier.stats.available untuk semua produk JualAkun
   * yang sudah punya `supplier_product_id`. Run by admin button atau cron.
   *
   * Return:
   *   - total_mapped: jumlah produk JualAkun yang di-link ke supplier
   *   - updated:      jumlah yang display_stock-nya berubah
   *   - orphans:      list mapping yang supplier_product_id-nya tidak ketemu
   *                   di list produk supplier (mungkin produk supplier
   *                   sudah delisted / id berubah). Include nama + id supaya
   *                   admin tau persis produk mana yang harus dicek.
   */
  static async syncStock() {
    const { products: supplierList } = await this.listProducts()
    const supplierMap = new Map(supplierList.map((p) => [p.id, p.available]))

    // 2-stage orphan detection (migration 026):
    //   Stage 1 (detected):   miss pertama → set supplier_orphan_at = now
    //   Stage 2 (confirmed):  miss persistent ≥30 menit → set
    //                         supplier_orphan_confirmed_at = now
    // Banner & Auto-fix hanya proses CONFIRMED. Young orphan (detected
    // tapi belum confirmed) di-hide untuk avoid false positive dari
    // supplier API glitch sementara.
    const supabase = createAdminClient()
    const { data: jualakunProducts, error } = await supabase
      .from('products')
      .select('id, name, supplier_product_id, display_stock, supplier_orphan_at, supplier_orphan_confirmed_at')
      .not('supplier_product_id', 'is', null)
      .neq('supplier_product_id', '')
    if (error) throw new ApiError('INTERNAL_ERROR', error.message, 500)

    type OrphanInfo = {
      product_id: string
      product_name: string
      supplier_product_id: string
      first_orphan_at: string
      confirmed_at: string | null
    }
    const orphans: OrphanInfo[] = []
    const newlyConfirmedIds: { id: string; name: string; supId: string }[] = []
    const now = new Date().toISOString()
    const CONFIRMATION_THRESHOLD_MS = 30 * 60 * 1000 // 30 menit

    // Parallel update — jauh lebih cepat dari sequential await loop.
    const updatePromises = (jualakunProducts ?? []).map(async (p) => {
      const supId = p.supplier_product_id as string
      const available = supplierMap.get(supId)
      const orphanAt = p.supplier_orphan_at as string | null
      const confirmedAt = p.supplier_orphan_confirmed_at as string | null
      const wasOrphan = orphanAt !== null

      if (available === undefined) {
        // === Tidak ketemu di supplier API ===
        const firstOrphanAt = orphanAt ?? now
        const fields: Record<string, unknown> = { supplier_synced_at: now }

        if (!wasOrphan) {
          // Stage 1: first miss — set detection timestamp, observation window
          fields.supplier_orphan_at = now
        } else if (!confirmedAt) {
          // Already detected, check if observation window passed
          const detectedAge = Date.now() - new Date(firstOrphanAt).getTime()
          if (detectedAge >= CONFIRMATION_THRESHOLD_MS) {
            // Stage 2: confirm orphan
            fields.supplier_orphan_confirmed_at = now
            newlyConfirmedIds.push({ id: p.id as string, name: p.name as string, supId })
          }
        }

        const { error: orphErr } = await supabase
          .from('products')
          .update(fields)
          .eq('id', p.id)
        if (orphErr) console.warn('[supplier.syncStock] set orphan fail', p.id, orphErr.message)

        // Include di response orphans (untuk debugging API consumer). Banner
        // di stok-monitor pakai listOrphans() yang filter confirmed.
        orphans.push({
          product_id: p.id as string,
          product_name: p.name as string,
          supplier_product_id: supId,
          first_orphan_at: firstOrphanAt,
          confirmed_at: (fields.supplier_orphan_confirmed_at as string | undefined) ?? confirmedAt,
        })
        return { updated: false }
      }

      // === Found di supplier — healthy ===
      // Clear orphan flag kalau sebelumnya orphan (recovery).
      const fields: Record<string, unknown> = { supplier_synced_at: now }
      if (p.display_stock !== available) fields.display_stock = available
      if (wasOrphan) {
        fields.supplier_orphan_at = null
        fields.supplier_orphan_confirmed_at = null
      }
      const { error: updErr } = await supabase.from('products').update(fields).eq('id', p.id)
      if (updErr) {
        console.warn('[supplier.syncStock] update fail', p.id, updErr.message)
        return { updated: false }
      }
      return { updated: p.display_stock !== available }
    })
    const results = await Promise.all(updatePromises)
    const updated = results.filter((r) => r.updated).length

    // Emit activity log SEKALI per CONFIRMED orphan (transisi detected→confirmed).
    // Detected-only (young) tidak emit log — silent observation window untuk
    // hindari spam kalau supplier API cuma glitch sementara.
    for (const o of newlyConfirmedIds) {
      await ActivityLogService.log({
        event_type: 'supplier_orphan_detected',
        ref_id: o.id,
        ref_table: 'products',
        title: `Supplier link rusak: ${o.name}`,
        description: `Confirmed setelah 30 menit observation. supplier_product_id ${o.supId.slice(0, 8)}... tidak ada di Canboso. Auto-fix tersedia di /admin/stok-monitor`,
        metadata: { product_id: o.id, supplier_product_id: o.supId },
      })
    }

    const confirmedCount = orphans.filter((o) => o.confirmed_at !== null).length
    const youngCount = orphans.length - confirmedCount

    return {
      total_mapped: (jualakunProducts ?? []).length,
      updated,
      orphans, // include semua (confirmed + young) untuk transparansi API
      confirmed_orphans: confirmedCount,
      young_orphans: youngCount, // dalam observation window, belum confirmed
      newly_confirmed: newlyConfirmedIds.length,
      synced_at: now,
    }
  }

  /**
   * Bulk-unmap orphan products. Set supplier_product_id = NULL + clear
   * supplier_orphan_at + supplier_orphan_confirmed_at. Per produk emit
   * activity log `supplier_unmapped`.
   *
   * Defense: cuma proses produk yang CONFIRMED orphan (confirmed_at NOT
   * NULL). Young orphan (masih dalam 30-menit observation window) tidak
   * boleh di-unmap supaya tidak premature kalau supplier cuma glitch.
   */
  static async unmapOrphans(productIds: string[]): Promise<{
    unmapped: { id: string; name: string }[]
    skipped: string[]
  }> {
    if (productIds.length === 0) return { unmapped: [], skipped: [] }

    const supabase = createAdminClient()
    const { data: candidates } = await supabase
      .from('products')
      .select('id, name, supplier_product_id, supplier_orphan_at, supplier_orphan_confirmed_at')
      .in('id', productIds)
      .not('supplier_orphan_confirmed_at', 'is', null)

    const unmapped: { id: string; name: string }[] = []
    const skippedSet = new Set(productIds)

    for (const p of (candidates ?? []) as {
      id: string; name: string; supplier_product_id: string; supplier_orphan_at: string; supplier_orphan_confirmed_at: string
    }[]) {
      const { error: updErr } = await supabase
        .from('products')
        .update({
          supplier_product_id: null,
          supplier_orphan_at: null,
          supplier_orphan_confirmed_at: null,
        })
        .eq('id', p.id)
      if (updErr) {
        console.warn('[supplier.unmapOrphans] update fail', p.id, updErr.message)
        continue
      }
      unmapped.push({ id: p.id, name: p.name })
      skippedSet.delete(p.id)

      await ActivityLogService.log({
        event_type: 'supplier_unmapped',
        ref_id: p.id,
        ref_table: 'products',
        title: `Supplier di-unmap: ${p.name}`,
        description: `Auto-fix dari admin. supplier_product_id lama: ${p.supplier_product_id.slice(0, 8)}...`,
        metadata: { product_id: p.id, old_supplier_product_id: p.supplier_product_id },
      })
    }

    return { unmapped, skipped: Array.from(skippedSet) }
  }

  /**
   * List produk yang CONFIRMED orphan (sudah melewati 30-menit observation
   * window). Dipakai stok-monitor page untuk surface banner alert. Young
   * orphan (masih dalam observation) tidak ditampilkan supaya admin tidak
   * panic karena supplier API glitch sementara.
   */
  static async listOrphans(): Promise<{
    product_id: string
    product_name: string
    supplier_product_id: string
    first_orphan_at: string
    confirmed_at: string
  }[]> {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, supplier_product_id, supplier_orphan_at, supplier_orphan_confirmed_at')
      .not('supplier_orphan_confirmed_at', 'is', null)
      .order('supplier_orphan_confirmed_at', { ascending: true })
    return (data ?? []).map((p) => ({
      product_id: p.id as string,
      product_name: p.name as string,
      supplier_product_id: p.supplier_product_id as string,
      first_orphan_at: p.supplier_orphan_at as string,
      confirmed_at: p.supplier_orphan_confirmed_at as string,
    }))
  }

  /**
   * Trigger pembelian on-demand untuk 1 order. Admin click "Beli dari Supplier"
   * dari Fulfill form. Response Canboso berupa JSON kompleks dengan field
   * teknis (productItemId, discountAmount, dll) — kita parse + extract
   * user-facing fields saja jadi `formatted_credentials` yang siap paste
   * ke Fulfill form. Raw JSON tetap include untuk debugging admin.
   *
   * Schema POST canboso /purchase: `{ productId, quantity: 1 }`. Response
   * shape:
   *   {
   *     deliveredAccounts: [{ user, password, expiryText, otherInfo, ... }],
   *     amount, amountUsd, balance, balanceUsd, ...
   *   }
   */
  static async purchase(supplierProductId: string): Promise<{
    raw: string
    formatted_credentials: string
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
      // Raw text fallback — admin manual format
      return { raw: text, formatted_credentials: text, cost_usd: null, cost_idr: null }
    }
    const obj = parsed as Record<string, unknown>

    // Extract cost (try multiple field names Canboso pakai)
    const costUsd =
      (typeof obj.amountUsd === 'number' ? obj.amountUsd : undefined) ??
      (typeof obj.originalAmountUsd === 'number' ? obj.originalAmountUsd : undefined) ??
      (typeof obj.price === 'number' ? obj.price : undefined) ??
      (typeof obj.usdPricing === 'number' ? obj.usdPricing : undefined) ??
      (typeof obj.totalUsd === 'number' ? obj.totalUsd : undefined) ??
      (typeof obj.cost === 'number' ? obj.cost : undefined) ??
      null
    const rate = await ExchangeRateService.getUsdIdr()
    const costIdr = costUsd !== null ? Math.round(costUsd * rate) : null

    // Extract user-facing credentials dari deliveredAccounts array.
    // Format buyer-ready: "Email/User: xxx\nPassword: xxx\n(catatan opsional)"
    const formatted = formatCredentialsFromCanboso(obj)

    return {
      raw: JSON.stringify(parsed, null, 2),
      formatted_credentials: formatted,
      cost_usd: costUsd,
      cost_idr: costIdr,
    }
  }
}

/**
 * Extract user-facing credentials dari response Canboso. Skip semua field
 * teknis (productItemId, discountAmount, balance, dll) yang tidak relevan
 * untuk buyer.
 *
 * Input: parsed JSON object dari /api/telegram-buyer/purchase
 * Output: string clean siap paste ke Fulfill form, e.g.:
 *
 *   Email: user@example.com
 *   Password: abc123
 *
 *   Catatan: Jangan ubah password.
 *
 * Atau kalau ada multiple accounts (jarang):
 *
 *   === Akun 1 ===
 *   Email: ...
 *   Password: ...
 *
 *   === Akun 2 ===
 *   Email: ...
 *   Password: ...
 *
 * Fallback ke raw JSON kalau struktur tidak dikenali — admin manual format.
 */
function formatCredentialsFromCanboso(obj: Record<string, unknown>): string {
  const accounts = obj.deliveredAccounts
  if (!Array.isArray(accounts) || accounts.length === 0) {
    // Tidak ada deliveredAccounts — kembalikan raw JSON, admin manual handle
    return JSON.stringify(obj, null, 2)
  }

  const formatAccount = (acc: Record<string, unknown>): string => {
    const lines: string[] = []
    const user = typeof acc.user === 'string' ? acc.user : null
    const password = typeof acc.password === 'string' ? acc.password : null
    const verifyEmail = typeof acc.verifyEmail === 'string' ? acc.verifyEmail : null
    const expiryText = typeof acc.expiryText === 'string' ? acc.expiryText : null
    const otherInfo = typeof acc.otherInfo === 'string' ? acc.otherInfo : null

    if (user) lines.push(`Email/User: ${user}`)
    if (password) lines.push(`Password: ${password}`)
    if (verifyEmail) lines.push(`Verify Email: ${verifyEmail}`)
    if (expiryText) lines.push(`Berlaku sampai: ${expiryText}`)
    if (otherInfo) lines.push(`\nCatatan dari supplier: ${otherInfo}`)
    return lines.join('\n')
  }

  if (accounts.length === 1) {
    return formatAccount(accounts[0] as Record<string, unknown>)
  }

  // Multiple accounts — separator per akun
  return accounts
    .map((acc, idx) => `=== Akun ${idx + 1} ===\n${formatAccount(acc as Record<string, unknown>)}`)
    .join('\n\n')
}
