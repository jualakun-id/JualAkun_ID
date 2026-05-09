import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '@/types/bindings'
import { ApiError } from '@/types/errors'
import { createUserClient, createAdminClient } from '@/lib/supabase'

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError('AUTH_REQUIRED', 'Token akses dibutuhkan', 401)
  }

  const jwt = header.slice('Bearer '.length).trim()
  const supabase = createUserClient(jwt)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new ApiError('AUTH_REQUIRED', 'Token tidak valid', 401)
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  c.set('userId', data.user.id)
  c.set('userRole', (profile?.role as 'buyer' | 'admin' | undefined) ?? 'buyer')
  c.set('jwt', jwt)
  await next()
}
