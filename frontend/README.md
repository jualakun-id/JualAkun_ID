# JualAkun — Frontend (Next.js 15 App Router)

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # isi dengan credentials Supabase + API URL
npm run dev
```

Dev server: http://localhost:3000

## Stack

- Next.js 15 App Router (Server Components default)
- Tailwind CSS v3 dengan brand tokens dari `docs/brand-guide.md`
- `@supabase/ssr` untuk auth state SSR-aware
- Lucide React untuk ikon (stroke 1.5px)
- Recharts untuk admin analytics
- Dark mode default (`<html class="dark">`)

## Struktur

- `app/(public)/` — halaman publik dengan SEO priority
- `app/(auth)/` — login, daftar, reset password
- `app/(buyer)/` — dashboard buyer + checkout (auth guard di layout)
- `app/(admin)/` — admin panel (admin role guard di layout)
- `components/ui/` — primitives (Button, Input, Badge)
- `components/layout/` — Header, Footer, AdminSidebar
- `lib/api.ts` — fetch wrapper ke Hono backend
- `lib/supabase.ts` — Supabase SSR client (browser + server)
- `types/index.ts` — shared domain types

## Konvensi

Lihat `CLAUDE.md` di root repo. Singkatnya:

- Server Components by default; `'use client'` hanya untuk interaktivitas
- Semua call ke backend lewat `api.get/post/patch/delete` di `lib/api.ts`
- Auth state via Supabase SSR, jangan pakai `process.env` selain via `NEXT_PUBLIC_*`
