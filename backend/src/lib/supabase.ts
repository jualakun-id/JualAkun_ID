import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createUserClient(jwt: string): SupabaseClient {
  const url = process.env.SUPABASE_URL!
  const anonKey = process.env.SUPABASE_ANON_KEY!
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
