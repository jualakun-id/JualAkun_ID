import { Hono } from 'hono'
import { cronMiddleware } from '@/middleware/cron'
import { createAdminClient } from '@/lib/supabase'
import { NotificationService } from '@/services/notification.service'
import { templates } from '@/templates/messages'
import type { AppEnv } from '@/types/bindings'

export const stockAlertsCron = new Hono<AppEnv>()

stockAlertsCron.use('*', cronMiddleware)

stockAlertsCron.post('/', async (c) => {
  const supabase = createAdminClient()
  const { data: lowStock, error } = await supabase
    .from('products')
    .select('id, name, stock_count')
    .eq('is_active', true)
    .lte('stock_count', 5)
    .order('stock_count', { ascending: true })
    .limit(20)

  if (error) {
    return c.json({ ok: false, code: 'INTERNAL_ERROR', message: error.message }, 500)
  }
  if (!lowStock || lowStock.length === 0) {
    return c.json({ data: { ok: true, alerted: 0 } })
  }

  const adminWa = process.env.ADMIN_WHATSAPP_NUMBER
  if (!adminWa) return c.json({ data: { ok: true, alerted: 0, reason: 'no_admin_wa' } })

  const tpl = templates.adminLowStock({ products: lowStock as { name: string; stock_count: number }[] })
  await NotificationService.sendWhatsApp({
    target: adminWa,
    message: tpl.waText,
    template: tpl.template,
  })

  return c.json({ data: { ok: true, alerted: lowStock.length } })
})
