# JualAkun

> Marketplace akun digital terpercaya di Indonesia. Admin-managed, bukan P2P.
> Domain: [jualakun.id](https://jualakun.id) · Repo: `jualakun-id/JualAkun_ID`

## Stack

- **Frontend** — Next.js 15 App Router + Tailwind CSS · [`frontend/`](frontend/)
- **Backend** — Hono + Cloudflare Workers · [`backend/`](backend/)
- **Database** — Supabase (PostgreSQL + Auth + Storage) · [`supabase/migrations/`](supabase/migrations/)
- **Payment** — Manual QRIS via GoPay Saya (QRIS Dinamis auto-generated + admin verify manual)
- **WA Notif** — WAHA (self-hosted WhatsApp HTTP API)
- **Email** — Resend

## Quick start

```bash
# Database
supabase db push                          # apply migrasi 001–013
psql "$SUPABASE_URL" -f supabase/seed.sql # 5 kategori + 10 produk + 2 kupon

# Backend (Cloudflare Workers — local)
cd backend
cp .dev.vars.example .dev.vars            # isi semua secret
npm install
npm run dev                               # http://localhost:8787

# Frontend (Next.js — local)
cd frontend
cp .env.example .env.local                # isi Supabase + API URL
npm install
npm run dev                               # http://localhost:3000
```

## Dokumentasi

| File | Isi |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Konvensi kode, naming, aturan penting untuk AI/developer |
| [`docs/prd.md`](docs/prd.md) | PRD V1.0 Final — source of truth |
| [`docs/srd.md`](docs/srd.md) | System requirements & target metrik |
| [`docs/api-spec.md`](docs/api-spec.md) | 46 endpoint spec lengkap |
| [`docs/sitemap.md`](docs/sitemap.md) | Route list frontend + backend, file structure |
| [`docs/admin-design.md`](docs/admin-design.md) | Spec 13 halaman admin panel |
| [`docs/brand-guide.md`](docs/brand-guide.md) | Warna, font, komponen, Tailwind config |
| [`docs/problem-framing.md`](docs/problem-framing.md) | Problem statement & target user |

## Status

MVP scaffold lengkap — 46 endpoint backend, 39 halaman frontend, 13 migrasi DB, 6 notif templates. Backend & frontend typecheck + production build hijau.

Belum: deployment ke production, dan polish UI/UX setelah dapat real user feedback.

## License

Proprietary — © Zeo Studio / SiapBot.id 2026.
