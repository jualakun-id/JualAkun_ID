import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '@/types/bindings'
import { ApiError } from '@/types/errors'

type Bucket = { count: number; resetAt: number }

const userBuckets = new Map<string, Bucket>()
const ipBuckets = new Map<string, Bucket>()

function take(buckets: Map<string, Bucket>, key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (existing.count >= limit) return false
  existing.count += 1
  return true
}

/** 60 req/min per authenticated user (or IP if not yet authenticated) */
export const rateLimitMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get('userId')
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
  const key = userId ?? `ip:${ip}`
  if (!take(userBuckets, key, 60, 60_000)) {
    throw new ApiError('RATE_LIMIT_EXCEEDED', 'Terlalu banyak permintaan, coba lagi sebentar', 429)
  }
  await next()
}

/** 10 req/min per IP for /auth/* endpoints */
export const authRateLimitMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
  if (!take(ipBuckets, `auth:${ip}`, 10, 60_000)) {
    throw new ApiError('RATE_LIMIT_EXCEEDED', 'Terlalu banyak percobaan login, coba lagi sebentar', 429)
  }
  await next()
}
