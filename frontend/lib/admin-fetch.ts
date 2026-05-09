import { createServerClient } from './supabase-server'
import { serverFetch } from './server-fetch'

export async function adminFetch<T>(path: string): Promise<T | null> {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return serverFetch<T>(path, { jwt: session?.access_token, cache: 'no-store' })
}
