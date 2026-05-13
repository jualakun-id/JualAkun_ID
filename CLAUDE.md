# JualAkun — CLAUDE.md

Platform marketplace akun digital Indonesia, admin-managed, domain `jualakun.id`.

## Stack

- **Frontend:** Next.js 15 App Router + Tailwind CSS + Shadcn/ui — deploy Vercel
- **Backend:** Hono + Cloudflare Workers — `wrangler dev` untuk local
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payment:** Manual QRIS via GoPay Saya — buyer scan QRIS Dinamis (auto-generated dari Statis payload, amount + unique 3-digit suffix), admin verify mutasi manual dari app GoPay. History: Midtrans rejected (2026-05-09), Duitku rejected (2026-05-13), OkeConnect H2H butuh CS approval — pivot ke manual 2026-05-14
- **Email:** Resend
- **WA Notif:** WAHA (self-hosted WhatsApp HTTP API)
- **Language:** TypeScript throughout

## Struktur Repo

```
/                        → root monorepo
├── frontend/            → Next.js 15
├── backend/             → Hono Cloudflare Workers
├── supabase/
│   └── migrations/      → SQL migrations (001–012)
├── docs/
│   ├── prd.md           → PRD V1.0 Final (source of truth)
│   ├── brand-guide.md   → Warna, font, komponen, Tailwind config
│   ├── api-spec.md      → Semua endpoint spec (40+ endpoints)
│   ├── sitemap.md       → Route list frontend + backend, file structure
│   ├── admin-design.md  → Spec 13 halaman admin panel
│   ├── srd.md           → System requirements & benchmark
│   └── problem-framing.md → Problem statement & target user
├── .env.example         → Template env vars lengkap
└── .claude/skills/      → Slash commands untuk code generation
    ├── ui-builder/      → /ui-builder
    ├── api-builder/     → /api-builder
    ├── db-helper/       → /db-helper
    ├── scaffold/        → /scaffold
    └── requirement-writer/ → /requirement-writer
```

## Konvensi Kode

### TypeScript
- Strict mode aktif
- Selalu define return type untuk function public
- Gunakan `type` bukan `interface` kecuali perlu extend
- Error handling: selalu return `{ ok: false, code: 'KODE_ERROR' }` bukan throw di layer API

### Naming
- File: `kebab-case.ts`
- Component: `PascalCase.tsx`
- Function/variable: `camelCase`
- Constant: `SCREAMING_SNAKE_CASE`
- Database table/column: `snake_case`
- API routes: `/kebab-case`

### Hono Backend
- Semua route di `src/routes/`
- Semua business logic di `src/services/`
- Middleware di `src/middleware/`
- Gunakan `c.env` untuk env vars (bukan `process.env`)
- Auth middleware inject `c.get('userId')` dan `c.get('userRole')`
- Response selalu: `c.json({ data: ... })` atau `c.json({ error: 'CODE', message: '...' }, status)`

### Supabase
- Gunakan `service_role` key HANYA di backend Workers
- Frontend hanya pakai `anon` key
- Semua operasi yang butuh bypass RLS → gunakan RPC (SECURITY DEFINER) atau service_role
- Credentials akun di `account_stock.credentials_enc` → selalu encrypt sebelum INSERT, decrypt setelah SELECT

### Next.js Frontend
- App Router — gunakan Server Components by default, Client Component hanya jika perlu interaktivitas
- Data fetching di Server Components untuk halaman publik (SEO)
- `use client` hanya untuk: form, state, event handler
- Semua call ke backend API via `src/lib/api.ts` helper
- Auth state via Supabase SSR (`@supabase/ssr`)

## Brand & UI

Lihat `docs/brand-guide.md` untuk lengkapnya. Ringkasan:

- **Dark mode default** — `<html class="dark">`
- **Primary color:** `#6366F1` (Indigo)
- **Accent:** `#22D3EE` (Cyan)
- **Font heading:** Plus Jakarta Sans
- **Font body:** Inter
- **Font mono** (credential display): JetBrains Mono
- Tailwind config sudah ada di `docs/brand-guide.md` § 8

## Database

Migrations di `supabase/migrations/`. Run via:
```bash
supabase db push           # push ke remote Supabase
supabase db reset          # reset local + re-run semua migrations
```

RPC penting (jangan bypass dengan raw SQL kecuali debugging):
- `deliver_order_account(order_id)` — FIFO delivery, WAJIB pakai ini
- `get_order_credentials(order_id, user_id)` — dengan ownership check
- `expire_old_orders()` — dipanggil cron, jangan manual kecuali urgent

## Environment

Template lengkap di `.env.example`. Variabel kritis:
- `ENCRYPTION_KEY` — harus sama di semua deployment, jangan pernah rotate tanpa migrate data
- `SUPABASE_SERVICE_ROLE_KEY` — HANYA di backend, jangan pernah di frontend atau commit ke git
- `QRIS_STATIC_PAYLOAD` — raw QRIS Statis payload dari GoPay Saya (decode via zxing.org), di-inject amount + suffix saat checkout
- `WAHA_BASE_URL` / `WAHA_API_KEY` / `WAHA_SESSION` — koneksi ke WAHA Plus di sumopod
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — email transactional (domain `jualakun.id` verified)
- `ADMIN_WHATSAPP_NUMBER` / `ADMIN_EMAIL` — alert admin (WA via WAHA, email fallback kalau WA gagal)
- `SUPPLIER_CANBOSO_API_KEY` — supplier integration untuk auto-purchase
- `PUBLIC_API_URL` & `PUBLIC_SITE_URL` — base URLs

## Hal yang Perlu Diingat

- Stok akun menggunakan FIFO + row lock — jangan pernah update `account_stock` langsung, selalu lewat RPC `deliver_order_account`
- Order expire otomatis 12 jam via cron untuk status `pending_payment`
- Semua notif (WA + email) di-log ke `notifications_log` — cek tabel ini jika buyer lapor tidak dapat notif (schema column: `template`, `error` — bukan legacy `type`, `error_msg`)
- Admin akses database via `service_role` key (bypass RLS) — backend sudah handle ini
- Review hanya bisa dibuat setelah order status `confirmed` (bukan `delivered`)
- Checkout **wajib login** — tidak ada guest checkout
- Gunakan `envMiddleware` (Cloudflare bindings → process.env) agar service code bisa pakai `process.env` standar
- Manual payment flow: ManualPaymentService.setupManualPayment generate unique 3-digit suffix + QRIS Dinamis dari Statis payload (TLV inject + CRC16 recalc di `lib/qris.ts`). DB unique partial index pada `(total_idr, status IN pending|verifying)` sebagai collision defense
- Order status flow: pending_payment → verifying → paid → delivered → confirmed (sisanya: cancelled, expired, delivery_failed, refunded)
- saat fulfill manual: WAJIB set `orders.account_stock_id = stockRow.id` supaya RPC `get_order_credentials` JOIN bisa work + notifyBuyerDelivered tidak silent skip

## Skills Tersedia

Gunakan slash commands untuk generate kode yang konsisten dengan project:

| Command | Kegunaan |
|---------|---------|
| `/ui-builder [komponen/halaman]` | Generate React/Next.js komponen mengikuti brand-guide.md |
| `/ui-cloner [komponen/halaman]` | Clone UI style akunmu.id — light mode, colorful, pill buttons |
| `/api-builder [fitur/endpoint]` | Generate Hono route + service + Zod schema (ZEO pattern) |
| `/db-helper [kebutuhan]` | SQL debug queries, migration baru, RLS policies |
| `/scaffold [frontend\|backend]` | Inisialisasi struktur folder proyek |
| `/requirement-writer` | Generate dokumen PRD, SRD, problem framing |

Semua skill ada di `.claude/skills/[nama]/SKILL.md`.

## Sub-Agents Tersedia

| Agent | File | Kegunaan |
|-------|------|---------|
| `ui-cloner` | `.claude/agents/ui-cloner.md` | Analisis referensi UI eksternal dan generate komponen matching |
