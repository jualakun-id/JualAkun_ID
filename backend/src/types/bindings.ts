export type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ENCRYPTION_KEY: string
  MIDTRANS_SERVER_KEY: string
  MIDTRANS_CLIENT_KEY: string
  MIDTRANS_IS_PRODUCTION: string
  WAHA_BASE_URL: string
  WAHA_API_KEY: string
  WAHA_SESSION: string
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  ADMIN_WHATSAPP_NUMBER: string
  CORS_ORIGINS: string
  CRON_SECRET: string
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
