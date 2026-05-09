import { ApiError } from '@/types/errors'

type SnapPayload = {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  customer_details?: {
    first_name?: string
    email?: string
    phone?: string
  }
  item_details?: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
  callbacks?: { finish?: string }
}

type SnapResponse = {
  token: string
  redirect_url: string
}

function snapBaseUrl(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
}

function authHeader(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const encoded = btoa(`${serverKey}:`)
  return `Basic ${encoded}`
}

export async function createSnapTransaction(payload: SnapPayload): Promise<SnapResponse> {
  const res = await fetch(snapBaseUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new ApiError('PAYMENT_INVALID', `Midtrans Snap error: ${text}`, 502)
  }

  return (await res.json()) as SnapResponse
}

/**
 * Verify Midtrans webhook signature.
 * SHA-512(order_id + status_code + gross_amount + server_key)
 */
export async function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): Promise<boolean> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(raw))
  const computed = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return computed === signatureKey
}
