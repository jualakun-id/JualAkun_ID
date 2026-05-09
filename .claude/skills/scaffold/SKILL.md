# Skill: scaffold

## Deskripsi
Inisialisasi struktur file dan folder untuk frontend (Next.js 15) atau backend (Hono Cloudflare Workers) JualAkun. Digunakan saat memulai development dari awal atau menambahkan modul baru.

## Dipanggil dengan
`/scaffold [target]`

Contoh:
- `/scaffold frontend` — inisialisasi Next.js 15 App Router
- `/scaffold backend` — inisialisasi Hono Cloudflare Workers
- `/scaffold frontend layout` — buat root layout + sidebar
- `/scaffold backend auth module` — buat auth route + service + schema

---

## Instruksi Eksekusi

### Target: `/scaffold frontend`

Buat struktur folder App Router sesuai `docs/sitemap.md`:

```
frontend/
├── app/
│   ├── (public)/page.tsx              → Homepage
│   ├── (public)/[kategori]/page.tsx   → Kategori
│   ├── (public)/produk/[slug]/page.tsx → Detail produk
│   ├── (auth)/masuk/page.tsx
│   ├── (auth)/daftar/page.tsx
│   ├── (buyer)/layout.tsx             → Auth guard
│   ├── (buyer)/checkout/page.tsx
│   ├── (buyer)/dashboard/page.tsx
│   ├── (admin)/layout.tsx             → Admin role guard
│   └── (admin)/admin/page.tsx
├── components/
│   ├── ui/                            → Shadcn components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── admin-sidebar.tsx
│   ├── product-card.tsx
│   ├── order-status-badge.tsx
│   └── credential-box.tsx
├── lib/
│   ├── api.ts                         → Fetch wrapper ke backend
│   ├── supabase.ts                    → Supabase SSR client
│   └── utils.ts
├── types/
│   └── index.ts                       → Shared TypeScript types
├── tailwind.config.ts                 → Custom tokens dari brand-guide.md
├── next.config.ts
└── package.json
```

**Config wajib:**
1. `tailwind.config.ts` — copy tokens dari `docs/brand-guide.md` § 8
2. `app/layout.tsx` — set `<html lang="id" className="dark">`, import fonts (Plus Jakarta Sans, Inter, JetBrains Mono)
3. `lib/api.ts` — base fetch wrapper dengan auth header injection
4. `types/index.ts` — types dasar: `Product`, `Order`, `OrderStatus`, `Profile`

### Target: `/scaffold backend`

Buat struktur folder sesuai `docs/sitemap.md` (Backend section):

```
backend/
├── src/
│   ├── index.ts                       → Entry point, middleware stack, route mounting
│   ├── middleware/
│   │   ├── env.ts                     → Cloudflare bindings → process.env
│   │   ├── auth.ts                    → JWT verify via Supabase
│   │   ├── admin.ts                   → Role check
│   │   ├── cors.ts
│   │   └── rate-limit.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── catalog.ts
│   │   ├── checkout.ts
│   │   ├── payment.ts                 → Webhook Midtrans
│   │   ├── orders.ts
│   │   ├── dashboard.ts
│   │   ├── tickets.ts
│   │   ├── referral.ts
│   │   ├── reviews.ts
│   │   ├── admin/
│   │   │   ├── index.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── tickets.ts
│   │   │   ├── coupons.ts
│   │   │   ├── users.ts
│   │   │   └── analytics.ts
│   │   └── cron/
│   │       ├── expire-orders.ts
│   │       ├── stock-alerts.ts
│   │       └── retry-notifications.ts
│   ├── services/
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   ├── crypto.service.ts          → AES-256-GCM encrypt/decrypt
│   │   └── delivery.service.ts
│   ├── types/
│   │   └── errors.ts                  → ApiError class + ERROR_CODES
│   └── lib/
│       ├── supabase.ts                → createUserClient + createAdminClient
│       └── midtrans.ts                → Snap + webhook verify
├── wrangler.toml
├── tsconfig.json
└── package.json
```

**Config wajib:**
1. `wrangler.toml` — name, main, compatibility_date, cron triggers (3 jadwal), [vars] non-secret
2. `tsconfig.json` — target ES2022, moduleResolution bundler, strict true
3. `src/types/errors.ts` — ApiError class sesuai PRD Appendix E § E.1
4. `src/lib/supabase.ts` — dual client pattern sesuai PRD Appendix E § E.4
5. `src/index.ts` — middleware order: env → cors → rate-limit, plus global onError handler

### Package.json Dependencies

**Frontend:**
```json
{
  "dependencies": {
    "next": "15.x",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0",
    "lucide-react": "latest",
    "recharts": "^2",
    "zod": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19"
  }
}
```

**Backend:**
```json
{
  "dependencies": {
    "hono": "^4",
    "@hono/zod-validator": "^0",
    "zod": "^3",
    "@supabase/supabase-js": "^2"
  },
  "devDependencies": {
    "wrangler": "^3",
    "typescript": "^5",
    "@cloudflare/workers-types": "^4"
  }
}
```

---

## Referensi Dokumen
- File structure: `docs/sitemap.md`
- Tailwind config: `docs/brand-guide.md` § 8
- Backend patterns: `docs/prd.md` Appendix E
- Konvensi naming: `CLAUDE.md`
