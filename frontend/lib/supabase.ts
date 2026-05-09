import { createBrowserClient as ssrBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createBrowserClient() {
  return ssrBrowserClient(url, anonKey)
}
