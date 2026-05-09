import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'

export const corsMiddleware: MiddlewareHandler = (c, next) => {
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  return cors({
    origin: (origin) => (origins.includes(origin) ? origin : origins[0] ?? '*'),
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-cron-secret'],
    credentials: true,
    maxAge: 600,
  })(c, next)
}
