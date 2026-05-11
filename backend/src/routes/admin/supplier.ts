import { Hono } from 'hono'
import { SupplierCanbosoService } from '@/services/supplier.service'
import type { AppEnv } from '@/types/bindings'

export const adminSupplierRoute = new Hono<AppEnv>()

adminSupplierRoute.get('/products', async (c) => {
  const data = await SupplierCanbosoService.listProducts()
  return c.json({ data })
})

adminSupplierRoute.get('/balance', async (c) => {
  const data = await SupplierCanbosoService.getBalance()
  return c.json({ data })
})

adminSupplierRoute.post('/sync-stock', async (c) => {
  const data = await SupplierCanbosoService.syncStock()
  return c.json({ data })
})
