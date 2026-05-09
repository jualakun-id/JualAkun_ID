import { ApiError } from '@/types/errors'

/**
 * Duitku payment gateway client.
 *
 * Docs: https://docs.duitku.com/api/id
 * Flow:
 *  1. createInquiry()  → POST /webapi/api/merchant/v2/inquiry
 *     Returns { reference, paymentUrl, ... } that the frontend POP SDK consumes.
 *  2. Duitku POSTs back to /payment/callback (x-www-form-urlencoded)
 *     with a signature we verify via verifyCallbackSignature().
 *
 * Signature rules (both MD5):
 *   inquiry  : MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
 *   callback : MD5(merchantCode + amount         + merchantOrderId + apiKey)
 *
 * Note the *order swap* in the callback formula — easy bug source.
 */

type InquiryPayload = {
  merchantOrderId: string
  paymentAmount: number
  productDetails: string
  email: string
  customerVaName: string
  callbackUrl: string
  returnUrl: string
  /** Optional. Omit (or pass empty) to let user pick the method in the POP popup. */
  paymentMethod?: string
  phoneNumber?: string
  merchantUserInfo?: string
  /** Order expiry in *minutes*. Default 1440 (24h) to match our cron sweep. */
  expiryPeriod?: number
  itemDetails?: Array<{ name: string; price: number; quantity: number }>
  customerDetail?: {
    firstName: string
    lastName?: string
    email: string
    phoneNumber?: string
  }
}

export type DuitkuInquiryResponse = {
  merchantCode: string
  reference: string
  paymentUrl: string
  vaNumber?: string
  qrString?: string
  amount: string | number
  statusCode: string
  statusMessage: string
}

function inquiryUrl(): string {
  return process.env.DUITKU_IS_PRODUCTION === 'true'
    ? 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry'
    : 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry'
}

async function md5Hex(input: string): Promise<string> {
  // Workers runtime exposes MD5 via crypto.subtle on standard SDKs but spec-wise
  // SubtleCrypto.digest('MD5') is unsupported. We implement MD5 in JS — short
  // hash, hot path is small (~70 bytes), no perf issue.
  return md5(input)
}

export async function createInquiry(payload: InquiryPayload): Promise<DuitkuInquiryResponse> {
  const merchantCode = requireEnv('DUITKU_MERCHANT_CODE')
  const apiKey = requireEnv('DUITKU_API_KEY')

  const signature = await md5Hex(
    merchantCode + payload.merchantOrderId + payload.paymentAmount + apiKey,
  )

  const body = {
    merchantCode,
    paymentAmount: payload.paymentAmount,
    merchantOrderId: payload.merchantOrderId,
    productDetails: payload.productDetails,
    email: payload.email,
    customerVaName: payload.customerVaName,
    callbackUrl: payload.callbackUrl,
    returnUrl: payload.returnUrl,
    signature,
    expiryPeriod: payload.expiryPeriod ?? 1440,
    ...(payload.paymentMethod ? { paymentMethod: payload.paymentMethod } : {}),
    ...(payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : {}),
    ...(payload.merchantUserInfo ? { merchantUserInfo: payload.merchantUserInfo } : {}),
    ...(payload.itemDetails ? { itemDetails: payload.itemDetails } : {}),
    ...(payload.customerDetail ? { customerDetail: payload.customerDetail } : {}),
  }

  const res = await fetch(inquiryUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError('PAYMENT_INVALID', `Duitku inquiry HTTP ${res.status}: ${text}`, 502)
  }

  const json = (await res.json()) as DuitkuInquiryResponse
  if (json.statusCode !== '00' || !json.reference) {
    throw new ApiError(
      'PAYMENT_INVALID',
      `Duitku inquiry failed: ${json.statusCode} ${json.statusMessage ?? ''}`,
      502,
    )
  }
  return json
}

/**
 * Verify the MD5 signature attached to a Duitku callback.
 * Formula: MD5(merchantCode + amount + merchantOrderId + apiKey)
 *
 * `amount` arrives as a string (form field) — pass it through verbatim,
 * Duitku hashes the same string they sent.
 */
export async function verifyCallbackSignature(args: {
  merchantCode: string
  amount: string
  merchantOrderId: string
  signature: string
}): Promise<boolean> {
  const apiKey = requireEnv('DUITKU_API_KEY')
  const computed = await md5Hex(args.merchantCode + args.amount + args.merchantOrderId + apiKey)
  return computed.toLowerCase() === args.signature.toLowerCase()
}

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new ApiError('INTERNAL_ERROR', `Missing env: ${key}`, 500)
  return v
}

// ---- MD5 (RFC 1321) -------------------------------------------------------
// Self-contained MD5 because SubtleCrypto on Workers does not expose it.
// Returns lowercase hex.

function md5(message: string): string {
  const bytes = new TextEncoder().encode(message)
  const hash = md5Bytes(bytes)
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function md5Bytes(input: Uint8Array): Uint8Array {
  const bitLen = input.length * 8
  const padLen = (input.length + 8) % 64
  const padding = 64 - (padLen === 0 ? 0 : padLen)
  const buf = new Uint8Array(input.length + padding + 8)
  buf.set(input)
  buf[input.length] = 0x80
  // Append low 64-bit length (LE). Length fits in 32 bits for our inputs.
  const view = new DataView(buf.buffer)
  view.setUint32(buf.length - 8, bitLen >>> 0, true)
  view.setUint32(buf.length - 4, Math.floor(bitLen / 0x100000000), true)

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  const k = MD5_K
  const r = MD5_R

  for (let i = 0; i < buf.length; i += 64) {
    const m: number[] = new Array(16)
    for (let j = 0; j < 16; j++) {
      m[j] = view.getUint32(i + j * 4, true)
    }
    let A = a
    let B = b
    let C = c
    let D = d
    for (let n = 0; n < 64; n++) {
      let f = 0
      let g = 0
      if (n < 16) {
        f = (B & C) | (~B & D)
        g = n
      } else if (n < 32) {
        f = (D & B) | (~D & C)
        g = (5 * n + 1) % 16
      } else if (n < 48) {
        f = B ^ C ^ D
        g = (3 * n + 5) % 16
      } else {
        f = C ^ (B | ~D)
        g = (7 * n) % 16
      }
      const temp = D
      D = C
      C = B
      const sum = (A + f + k[n] + m[g]) >>> 0
      B = (B + leftRotate(sum, r[n])) >>> 0
      A = temp
    }
    a = (a + A) >>> 0
    b = (b + B) >>> 0
    c = (c + C) >>> 0
    d = (d + D) >>> 0
  }

  const out = new Uint8Array(16)
  const ov = new DataView(out.buffer)
  ov.setUint32(0, a, true)
  ov.setUint32(4, b, true)
  ov.setUint32(8, c, true)
  ov.setUint32(12, d, true)
  return out
}

function leftRotate(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0
}

const MD5_R = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]

const MD5_K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
]
