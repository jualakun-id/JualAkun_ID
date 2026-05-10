import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { AuthService } from '@/services/auth.service'
import type { AppEnv } from '@/types/bindings'

export const authRoute = new Hono<AppEnv>()

authRoute.get('/health', (c) => c.json({ data: { ok: true } }))

// Phone WA E.164 tanpa "+": 62xxx (Indonesia) atau 60xxx (Malaysia)
// Total digit 10-15 (mengikuti standar E.164). Frontend kirim format normalized.
const PHONE_WA_REGEX = /^(62|60)\d{8,13}$/

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  full_name: z.string().trim().min(2).max(100),
  phone_wa: z.string().regex(PHONE_WA_REGEX, 'Format nomor WA tidak valid (gunakan 62/60 + nomor)'),
  referral_code: z.string().trim().min(4).max(10).optional(),
})

authRoute.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await AuthService.register(body)
  return c.json({ data: result }, 201)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await AuthService.login(body)
  return c.json({ data: result })
})

const refreshSchema = z.object({ refresh_token: z.string().min(10) })

authRoute.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await AuthService.refresh(body.refresh_token)
  return c.json({ data: result })
})

authRoute.post('/logout', authMiddleware, async (c) => {
  const jwt = c.get('jwt')
  await AuthService.logout(jwt)
  return c.json({ data: { ok: true } })
})

const forgotSchema = z.object({ email: z.string().email() })

authRoute.post('/forgot-password', zValidator('json', forgotSchema), async (c) => {
  const body = c.req.valid('json')
  await AuthService.forgotPassword(body.email)
  return c.json({ data: { message: 'Email reset dikirim' } })
})
