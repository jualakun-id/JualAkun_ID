import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { SupplierCanbosoService } from '@/services/supplier.service'
import { ActivityLogService } from '@/services/activity-log.service'
import { createAdminClient } from '@/lib/supabase'
import type { AppEnv } from '@/types/bindings'

export const supplierSyncStockCron = new Hono<AppEnv>()

supplierSyncStockCron.use('*', cronMiddleware)

const LOW_BALANCE_USD_THRESHOLD = 2

/**
 * Periodic sync — di-fire dari Workers scheduled() setiap 10 menit (piggyback
 * ke slot retry-notifications karena free tier max 3 cron). Mirror
 * supplier.stats.available → products.display_stock untuk produk yang punya
 * supplier_product_id. Juga check balance — alert kalau saldo < threshold
 * (sekali per hari, hindari spam).
 */
supplierSyncStockCron.post('/', async (c) => {
  try {
    const result = await SupplierCanbosoService.syncStock()

    // Check balance + alert kalau low (dedup: skip kalau sudah ada
    // supplier_low_balance event dalam 24 jam terakhir)
    const balance = await SupplierCanbosoService.getBalance()
    if (balance && balance.balance_usd < LOW_BALANCE_USD_THRESHOLD) {
      const supabase = createAdminClient()
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('admin_activity_log')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', 'supplier_low_balance')
        .gte('created_at', twentyFourHoursAgo)
      if ((count ?? 0) === 0) {
        await ActivityLogService.log({
          event_type: 'supplier_low_balance',
          title: `Saldo Canboso menipis: ${balance.balance_text}`,
          description: `Saldo di bawah $${LOW_BALANCE_USD_THRESHOLD} — top-up via bot Canboso untuk avoid order stuck`,
          metadata: { balance_usd: balance.balance_usd, balance_idr: balance.balance_idr },
        })
      }
    }

    return c.json({ data: result })
  } catch (err) {
    // Jangan throw — supplier flaky tidak boleh jatuhkan cron worker
    console.error('[cron/supplier-sync-stock] failed:', err)
    return c.json({ ok: false, code: 'SUPPLIER_SYNC_FAILED', message: String(err) }, 200)
  }
})
