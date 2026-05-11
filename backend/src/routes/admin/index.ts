import { Hono } from 'hono'
import { authMiddleware } from '@/middleware/auth'
import { adminMiddleware } from '@/middleware/admin'
import { adminProductsRoute } from './products'
import { adminOrdersRoute } from './orders'
import { adminTicketsRoute } from './tickets'
import { adminCouponsRoute } from './coupons'
import { adminUsersRoute } from './users'
import { adminAnalyticsRoute } from './analytics'
import { adminNotificationsRoute } from './notifications'
import { adminStockMonitorRoute } from './stock-monitor'
import { adminSupplierRoute } from './supplier'
import { adminUploadRoute } from './upload'
import type { AppEnv } from '@/types/bindings'

export const adminRoute = new Hono<AppEnv>()

adminRoute.use('*', authMiddleware, adminMiddleware)

adminRoute.route('/products', adminProductsRoute)
adminRoute.route('/orders', adminOrdersRoute)
adminRoute.route('/tickets', adminTicketsRoute)
adminRoute.route('/coupons', adminCouponsRoute)
adminRoute.route('/users', adminUsersRoute)
adminRoute.route('/analytics', adminAnalyticsRoute)
adminRoute.route('/notifications', adminNotificationsRoute)
adminRoute.route('/stock-monitor', adminStockMonitorRoute)
adminRoute.route('/supplier', adminSupplierRoute)
adminRoute.route('/upload', adminUploadRoute)
