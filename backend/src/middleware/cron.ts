import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '@/types/bindings'
import { ApiError } from '@/types/errors'

export const cronMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const secret = c.req.header('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw new ApiError('AUTH_FORBIDDEN', 'Cron secret tidak valid', 403)
  }
  await next()
}
