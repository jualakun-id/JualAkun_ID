# JualAkun — Backend (Hono + Cloudflare Workers)

## Setup

```bash
cd backend
npm install
cp .dev.vars.example .dev.vars   # isi semua secret
npm run dev                       # wrangler dev → http://localhost:8787
```

## Stack

- Hono v4 di Cloudflare Workers
- `@hono/zod-validator` untuk request validation
- `@supabase/supabase-js` — dual client pattern (user RLS + admin bypass)
- AES-256-GCM untuk credential encryption (Web Crypto API)
- Notifikasi: WAHA (WhatsApp HTTP API, self-hosted) + Resend (email)

## Struktur

- `src/index.ts` — entry, middleware stack, route mount, scheduled() handler
- `src/middleware/` — env (Bindings → process.env), cors, rate-limit, auth, admin, cron
- `src/routes/` — endpoint groups (publik + auth-required + admin)
- `src/services/` — business logic (payment, notification, crypto, delivery)
- `src/lib/` — Supabase client, Midtrans SDK wrapper
- `src/types/` — `Bindings`, `Variables`, `ApiError`

## Konvensi

- Semua env via `c.env` di-bridge ke `process.env` lewat `envMiddleware` (Appendix E.3)
- Response sukses: `c.json({ data: ... })` — error: `c.json({ ok: false, code, message }, status)` via `ApiError`
- Buyer endpoints pakai `createUserClient(jwt)` (RLS aktif)
- Admin / cron / webhook pakai `createAdminClient()` (bypass RLS)
- Stok akun WAJIB lewat RPC `deliver_order_account` — jangan UPDATE langsung
- Webhook Midtrans wajib verifikasi SHA-512 signature dulu, selalu return 200

## Cron triggers

`wrangler.toml` mendaftarkan 3 cron, di-dispatch oleh `scheduled()` ke endpoint internal `/api/cron/*` dengan header `x-cron-secret`:

- `*/5 * * * *` → expire orders 24h
- `*/30 * * * *` → stock alerts
- `*/10 * * * *` → retry failed notifications

## Set secrets (production)

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put ENCRYPTION_KEY
wrangler secret put MIDTRANS_SERVER_KEY
wrangler secret put MIDTRANS_CLIENT_KEY
wrangler secret put WAHA_BASE_URL
wrangler secret put WAHA_API_KEY
wrangler secret put WAHA_SESSION
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM_EMAIL
wrangler secret put ADMIN_WHATSAPP_NUMBER
wrangler secret put CRON_SECRET
```
