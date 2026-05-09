import { createBrowserClient } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; details?: Record<string, unknown> }

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const supabase = createBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<ApiResult<T>> {
  const { body, auth = true, headers, ...rest } = options
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  }

  if (auth) {
    const token = await getAuthToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const json = (await res.json()) as Record<string, unknown>

    if (!res.ok || json.ok === false) {
      return {
        ok: false,
        code: (json.code as string) ?? 'UNKNOWN_ERROR',
        message: (json.message as string) ?? 'Terjadi kesalahan',
        details: json.details as Record<string, unknown> | undefined,
      }
    }

    return { ok: true, data: (json.data ?? json) as T }
  } catch (err) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: err instanceof Error ? err.message : 'Gagal terhubung ke server',
    }
  }
}

export const api = {
  get: <T>(path: string, opts?: FetchOptions) => apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'DELETE' }),
}
