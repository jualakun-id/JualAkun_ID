# JualAkun — CLAUDE.md

Platform marketplace akun digital Indonesia, admin-managed, domain `jualakun.id`.

## Stack

- **Frontend:** Next.js 15 App Router + Tailwind CSS + Shadcn/ui — deploy Vercel
- **Backend:** Hono + Cloudflare Workers — `wrangler dev` untuk local
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payment:** Midtrans (Snap)
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
- `MIDTRANS_SERVER_KEY` — HANYA di backend

## Hal yang Perlu Diingat

- Stok akun menggunakan FIFO + row lock — jangan pernah update `account_stock` langsung, selalu lewat RPC `deliver_order_account`
- Order expire otomatis 24 jam via cron — jangan manual expire kecuali urgent
- Semua notif (WA + email) di-log ke `notifications_log` — cek tabel ini jika buyer lapor tidak dapat notif
- Admin akses database via `service_role` key (bypass RLS) — backend sudah handle ini
- Review hanya bisa dibuat setelah order status `confirmed` (bukan `delivered`)
- Checkout **wajib login** — tidak ada guest checkout (keputusan final di PRD V1.0)
- Gunakan `envMiddleware` (Cloudflare bindings → process.env) agar service code bisa pakai `process.env` standar
- Webhook Midtrans: validasi SHA-512 signature dulu sebelum proses apapun, selalu return HTTP 200

## Skills Tersedia

Gunakan slash commands untuk generate kode yang konsisten dengan project:

| Command | Kegunaan |
|---------|---------|
| `/ui-builder [komponen/halaman]` | Generate React/Next.js komponen mengikuti brand-guide.md |
| `/api-builder [fitur/endpoint]` | Generate Hono route + service + Zod schema (ZEO pattern) |
| `/db-helper [kebutuhan]` | SQL debug queries, migration baru, RLS policies |
| `/scaffold [frontend\|backend]` | Inisialisasi struktur folder proyek |
| `/requirement-writer` | Generate dokumen PRD, SRD, problem framing |

Semua skill ada di `.claude/skills/[nama]/SKILL.md`.
