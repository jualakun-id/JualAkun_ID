import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '@/types/bindings'
import { ApiError } from '@/types/errors'

export const adminMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const role = c.get('userRole')
  if (role !== 'admin') {
    throw new ApiError('AUTH_FORBIDDEN', 'Akses hanya untuk admin', 403)
  }
  await next()
}
