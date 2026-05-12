import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
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

adminSupplierRoute.get('/orphans', async (c) => {
  const data = await SupplierCanbosoService.listOrphans()
  return c.json({ data })
})

const unmapSchema = z.object({
  product_ids: z.array(z.string().uuid()).min(1).max(100),
})

adminSupplierRoute.post('/unmap-orphans', zValidator('json', unmapSchema), async (c) => {
  const { product_ids } = c.req.valid('json')
  const data = await SupplierCanbosoService.unmapOrphans(product_ids)
  return c.json({ data })
})
