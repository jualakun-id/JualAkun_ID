import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { SupplierCanbosoService } from '@/services/supplier.service'
import type { AppEnv } from '@/types/bindings'

export const supplierSyncStockCron = new Hono<AppEnv>()

supplierSyncStockCron.use('*', cronMiddleware)

/**
 * Periodic sync — di-fire dari Workers scheduled() setiap 10 menit (piggyback
 * ke slot retry-notifications karena free tier max 3 cron). Mirror
 * supplier.stats.available → products.display_stock untuk produk yang punya
 * supplier_product_id.
 */
supplierSyncStockCron.post('/', async (c) => {
  try {
    const result = await SupplierCanbosoService.syncStock()
    return c.json({ data: result })
  } catch (err) {
    // Jangan throw — supplier flaky tidak boleh jatuhkan cron worker
    console.error('[cron/supplier-sync-stock] failed:', err)
    return c.json({ ok: false, code: 'SUPPLIER_SYNC_FAILED', message: String(err) }, 200)
  }
})
