import { zValidator as baseZValidator } from '@hono/zod-validator'
import type { ZodSchema } from 'zod'
import type { Context } from 'hono'

/**
 * Wrapper `zValidator` yang convert ZodError → format response standar
 * `{ ok, code, message, details }` — konsisten dengan ApiError.
 *
 * Konteks: tanpa hook ini, `@hono/zod-validator` balikan 400 dengan body
 *   { success: false, error: { issues: [...] } }
 * yang TIDAK punya field `message`. Frontend (lib/api.ts) fallback ke teks
 * generik "Terjadi kesalahan" → admin/buyer tidak tahu field mana yang
 * salah. Tercatat 4 insiden hari ini gara-gara silent Zod fail:
 *   - checkout phone Malaysia (regex Indonesia-only)
 *   - admin ticket resolve (empty new_account_stock_id)
 *   - admin product create dari supplier import (empty slug)
 *   - dst
 *
 * Hook ini ambil issue pertama dari ZodError, format `<field>: <reason>`,
 * lalu return 400 dengan format yang sama dengan ApiError biasa supaya
 * frontend `result.message` langsung tulis penyebab.
 *
 * Pemakaian: import dari sini, bukan dari `@hono/zod-validator`.
 *   import { zValidator } from '@/lib/zv'
 *   route.post('/', zValidator('json', schema), handler)
 */

type ZodIssue = {
  path: (string | number)[]
  message: string
  code?: string
}

function isFailedResult(result: unknown): result is { success: false; error: { issues: ZodIssue[] } } {
  return (
    typeof result === 'object' &&
    result !== null &&
    (result as { success?: boolean }).success === false
  )
}

function formatValidationError(issues: ZodIssue[]): string {
  const first = issues[0]
  if (!first) return 'Invalid input'
  const path = first.path?.length ? first.path.join('.') : '(root)'
  return `${path}: ${first.message}`
}

function defaultHook(result: unknown, c: Context): Response | undefined {
  if (!isFailedResult(result)) return undefined
  const issues = result.error?.issues ?? []
  return c.json(
    {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: formatValidationError(issues),
      details: { issues },
    },
    400,
  )
}

/**
 * Wrapped zValidator dengan default error hook. Drop-in replacement untuk
 * `zValidator` dari `@hono/zod-validator` — external signature identik
 * dengan base (via `typeof baseZValidator`), jadi typing untuk
 * `c.req.valid('json'|'query'|...)` tetap inferred dengan benar dari schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const zValidator: typeof baseZValidator = ((target: any, schema: ZodSchema, hook?: typeof defaultHook) => {
  return baseZValidator(target, schema, hook ?? defaultHook)
}) as typeof baseZValidator
