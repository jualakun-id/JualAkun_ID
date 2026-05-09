# Sitemap & Route List — JualAkun

> Frontend: Next.js 15 App Router  
> Backend: Hono Cloudflare Workers (lihat `docs/api-spec.md`)

---

## Frontend Routes (Next.js)

### Public Routes — SEO Priority

| Route | Halaman | SSR/SSG | Priority |
|-------|---------|---------|---------|
| `/` | Homepage | SSG + ISR | Tinggi |
| `/[kategori]` | Halaman kategori (misal: `/streaming`, `/gaming`) | SSG + ISR | Tinggi |
| `/produk/[slug]` | Detail produk | SSR | Tinggi |
| `/tentang` | Tentang JualAkun | SSG | Rendah |
| `/syarat-ketentuan` | Syarat & Ketentuan | SSG | Rendah |
| `/kebijakan-privasi` | Kebijakan Privasi | SSG | Rendah |
| `/kebijakan-garansi` | Kebijakan Garansi & Refund | SSG | Rendah |
| `/faq` | FAQ lengkap | SSG | Sedang |
| `/kontak` | Halaman kontak / support | SSG | Rendah |
| `/sitemap.xml` | Auto-generated sitemap | Server | - |
| `/robots.txt` | robots.txt | Static | - |

### Auth Routes

| Route | Halaman | Notes |
|-------|---------|-------|
| `/masuk` | Login | Redirect ke `/dashboard` jika sudah login |
| `/daftar` | Register | `?ref=KODE` untuk referral auto-fill |
| `/lupa-password` | Forgot password | |
| `/reset-password` | Reset password | Via email link dari Supabase |
| `/verifikasi-email` | Email verified confirmation | |

### Buyer Routes — Auth Required

| Route | Halaman | Notes |
|-------|---------|-------|
| `/checkout` | Halaman checkout | Redirect ke `/masuk` jika belum login |
| `/checkout/selesai` | Order confirmation | Setelah redirect dari Midtrans |
| `/dashboard` | Dashboard buyer | Tab: Pesanan, Referral, Profil |
| `/dashboard/pesanan` | Daftar semua pesanan | |
| `/dashboard/pesanan/[id]` | Detail pesanan + credentials | |
| `/dashboard/referral` | Referral stats & link | |
| `/dashboard/profil` | Edit profil | |

### Admin Routes — Admin Role Required

| Route | Halaman | Notes |
|-------|---------|-------|
| `/admin` | Dashboard admin (KPI) | Redirect ke `/masuk` jika bukan admin |
| `/admin/produk` | Daftar produk | |
| `/admin/produk/baru` | Tambah produk | |
| `/admin/produk/[id]` | Edit produk + kelola stok | |
| `/admin/pesanan` | Daftar semua pesanan | Filter by status |
| `/admin/pesanan/[id]` | Detail pesanan admin | Manual deliver, update status |
| `/admin/tiket` | Daftar tiket garansi | |
| `/admin/tiket/[id]` | Detail tiket + resolusi | |
| `/admin/kupon` | Manajemen kupon | |
| `/admin/pengguna` | Daftar buyer | |
| `/admin/analytics` | Revenue, top produk | |
| `/admin/notifikasi` | Log notif WA + email | Filter channel/status, retry failed |
| `/admin/stok-monitor` | Monitor stok semua produk | Quick upload inline, alert kritis |

---

## Next.js File Structure (App Router)

```
app/
├── (public)/
│   ├── page.tsx                     → /
│   ├── [kategori]/
│   │   └── page.tsx                 → /streaming, /gaming, dll
│   ├── produk/[slug]/
│   │   └── page.tsx                 → /produk/netflix-premium-1-bulan
│   ├── faq/page.tsx
│   ├── tentang/page.tsx
│   ├── kontak/page.tsx
│   └── (legal)/
│       ├── syarat-ketentuan/page.tsx
│       ├── kebijakan-privasi/page.tsx
│       └── kebijakan-garansi/page.tsx
│
├── (auth)/
│   ├── masuk/page.tsx
│   ├── daftar/page.tsx
│   ├── lupa-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verifikasi-email/page.tsx
│
├── (buyer)/
│   ├── layout.tsx                   → auth guard
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── selesai/page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── pesanan/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── referral/page.tsx
│       └── profil/page.tsx
│
├── (admin)/
│   ├── layout.tsx                   → admin role guard
│   └── admin/
│       ├── page.tsx
│       ├── produk/
│       │   ├── page.tsx
│       │   ├── baru/page.tsx
│       │   └── [id]/page.tsx
│       ├── pesanan/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── tiket/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── kupon/page.tsx
│       ├── pengguna/page.tsx
│       └── analytics/page.tsx
│
├── api/
│   └── og/route.ts                  → Open Graph image generator
│
├── sitemap.ts                       → auto-generated sitemap.xml
├── robots.ts                        → robots.txt
└── layout.tsx                       → root layout (font, metadata, providers)
```

---

## Backend Routes (Hono — Cloudflare Workers)

```
src/
├── index.ts                         → app entry, middleware setup
├── middleware/
│   ├── auth.ts                      → JWT verify (Supabase)
│   ├── admin.ts                     → role check
│   ├── cors.ts
│   └── rate-limit.ts
├── routes/
│   ├── auth.ts                      → POST /auth/*
│   ├── catalog.ts                   → GET /catalog, /catalog/categories, /catalog/:slug
│   ├── checkout.ts                  → POST /checkout/*
│   ├── payment.ts                   → POST /payment/webhook
│   ├── orders.ts                    → GET /orders, /orders/:id, /orders/:id/credentials
│   ├── dashboard.ts                 → GET /dashboard, PATCH /dashboard/profile
│   ├── tickets.ts                   → POST/GET /tickets
│   ├── referral.ts                  → GET /referral
│   ├── reviews.ts                   → POST /reviews
│   ├── admin/
│   │   ├── index.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── tickets.ts
│   │   ├── coupons.ts
│   │   ├── users.ts
│   │   └── analytics.ts
│   └── cron/
│       ├── expire-orders.ts
│       ├── stock-alerts.ts
│       └── retry-notifications.ts
├── services/
│   ├── payment.service.ts           → Midtrans integration
│   ├── notification.service.ts      → WA (WAHA) + Email (Resend)
│   ├── crypto.service.ts            → AES-256 encrypt/decrypt credentials
│   └── delivery.service.ts          → Orchestrate deliver_order_account RPC
└── lib/
    ├── supabase.ts
    └── midtrans.ts
```

---

## SEO URL Strategy

Kategori pages menggunakan slug langsung di root domain untuk maximum SEO:

| URL | Target Keyword |
|-----|---------------|
| `/streaming` | beli akun streaming murah |
| `/gaming` | beli akun game murah |
| `/ai-produktif` | beli akun chatgpt canva murah |
| `/vpn` | beli akun vpn murah |
| `/edukasi` | beli akun duolingo coursera murah |
| `/produk/netflix-premium-1-bulan` | beli akun netflix premium murah |
| `/produk/spotify-premium-1-bulan` | beli akun spotify premium murah |
