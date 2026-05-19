export type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ENCRYPTION_KEY: string
  PUBLIC_API_URL: string
  PUBLIC_SITE_URL: string
  WAHA_BASE_URL: string
  WAHA_API_KEY: string
  WAHA_SESSION: string
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  ADMIN_WHATSAPP_NUMBER: string
  ADMIN_WA_GROUP_ID: string
  WAHA_STOCK_DIGEST_GROUP_ID: string
  ADMIN_EMAIL: string
  QRIS_STATIC_PAYLOAD: string
  CORS_ORIGINS: string
  CRON_SECRET: string
  SUPPLIER_CANBOSO_API_KEY: string
}

export type Variables = {
  userId: string
  userRole: 'buyer' | 'admin'
  jwt: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
