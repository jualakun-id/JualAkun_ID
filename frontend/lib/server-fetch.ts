const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

type FetchInit = Omit<RequestInit, 'body'> & { body?: unknown; jwt?: string; revalidate?: number }

/**
 * Server-side fetch helper (use in Server Components).
 * No cookies required — pass `jwt` for authenticated calls.
 */
export async function serverFetch<T>(path: string, init: FetchInit = {}): Promise<T | null> {
  const { body, jwt, revalidate, headers, ...rest } = init
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  }
  if (jwt) finalHeaders['Authorization'] = `Bearer ${jwt}`

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      next: revalidate !== undefined ? { revalidate } : undefined,
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: T }
    return json.data ?? null
  } catch {
    return null
  }
}
