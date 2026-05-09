export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STOCK_EMPTY: 'STOCK_EMPTY',
  ORDER_EXPIRED: 'ORDER_EXPIRED',
  COUPON_INVALID: 'COUPON_INVALID',
  PAYMENT_INVALID: 'PAYMENT_INVALID',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = keyof typeof ERROR_CODES

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status: number = 400,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
