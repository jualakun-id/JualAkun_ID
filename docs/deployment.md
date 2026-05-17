# Deployment Guide — JualAkun

> Urutan: **Backend (Cloudflare Workers) → Frontend (Vercel)**.
> Frontend butuh URL backend yang sudah hidup untuk `NEXT_PUBLIC_API_URL`.

---

## 0. Prasyarat

| Layanan | Akun & Setup |
|---|---|
| **Supabase** | Project sudah dibuat, semua migration di `supabase/migrations/` sudah `supabase db push` |
| **Cloudflare** | Akun aktif, **Workers Paid plan ($5/bulan)** — wajib karena cron triggers tidak jalan di Free plan |
| **GoPay Saya** | Admin punya akun GoPay Saya merchant aktif, QRIS Statis sudah di-print/decode payload (raw text untuk `QRIS_STATIC_PAYLOAD`) |
| **Resend** | Domain sudah verified, API key sudah dibuat |
| **WAHA** | Instance self-hosted sudah jalan (VPS/Docker), session WhatsApp sudah scan QR & connected |
| **Vercel** | Akun aktif, repo sudah di-push ke GitHub/GitLab/Bitbucket |
| **Domain** | `jualakun.id` di-point ke Vercel; `api.jualakun.id` di-point ke Cloudflare Workers |

---

## 1. Verifikasi Pre-Deploy

Jalankan dari root repo:

```powershell
# Backend
cd backend
npm install
npm run typecheck
npx wrangler whoami    # pastikan login Cloudflare benar

# Frontend
cd ../frontend
npm install
npm run typecheck
npm run build          # pastikan build sukses
```

Semua harus exit 0. Jangan lanjut kalau ada error.

---

## 2. Deploy Backend (Cloudflare Workers)

### 2.1 Set Secrets

Secret wajib di-set sebelum deploy. Jalankan satu per satu — wrangler akan minta value via prompt:

```powershell
cd backend

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ENCRYPTION_KEY            # 32 karakter random, JANGAN rotate
npx wrangler secret put QRIS_STATIC_PAYLOAD       # raw payload QRIS Statis admin (decode via zxing.org)
npx wrangler secret put WAHA_BASE_URL
npx wrangler secret put WAHA_API_KEY
npx wrangler secret put WAHA_SESSION              # default biasanya "default"
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
npx wrangler secret put ADMIN_WHATSAPP_NUMBER     # format 62xxx@c.us
npx wrangler secret put ADMIN_EMAIL               # email admin untuk fallback alert
npx wrangler secret put SUPPLIER_CANBOSO_API_KEY  # untuk auto-purchase supplier
npx wrangler secret put CRON_SECRET               # random string buat gate /api/cron/*
```

**Generate `ENCRYPTION_KEY` dan `CRON_SECRET`** (PowerShell):

```powershell
# 32-char random hex
-join ((1..32) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
```

Catatan:
- `ENCRYPTION_KEY` dipakai untuk encrypt `account_stock.credentials_enc`. **Jangan pernah rotate** tanpa migrate ulang semua data — credential lama bakal corrupt.
- `QRIS_STATIC_PAYLOAD` adalah raw payload dari QRIS Statis admin (cek dengan decode QR fisik via [zxing.org/w/decode.jspx](https://zxing.org/w/decode.jspx)). Backend inject amount + suffix → generate QRIS Dinamis per order.
- `CORS_ORIGINS` ada di `wrangler.toml` (bukan secret). Edit langsung kalau perlu ubah.

### 2.2 Verifikasi Secrets

```powershell
npx wrangler secret list
```

Harus muncul semua secret di atas.

### 2.3 Deploy

```powershell
npx wrangler deploy
```

Output akan menampilkan URL Workers, contoh `https://jualakun-backend.<account>.workers.dev`.

### 2.4 Bind Custom Domain

Lewat Cloudflare dashboard → Workers & Pages → `jualakun-backend` → Settings → Triggers → Custom Domains → Add `api.jualakun.id`.

### 2.5 Smoke Test

```powershell
# Health check
curl https://api.jualakun.id/health

# Catalog (public, harus return data)
curl https://api.jualakun.id/catalog

# Cron endpoint (harus 401 tanpa CRON_SECRET)
curl -X POST https://api.jualakun.id/api/cron/expire-orders
```

---

## 3. Deploy Frontend (Vercel)

### 3.1 Import Project ke Vercel

1. Login ke [vercel.com](https://vercel.com)
2. **Add New → Project** → import repo `JualAkun_ID`
3. **Root Directory**: `frontend` (PENTING — bukan root repo)
4. **Framework Preset**: Next.js (auto-detect)
5. **Build Command**: `next build` (default)
6. **Output Directory**: `.next` (default)

### 3.2 Set Environment Variables

Di tab **Environment Variables** sebelum first deploy, tambahkan 4 var ini untuk **semua environment** (Production, Preview, Development):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (dari Supabase → Settings → API → anon key) |
| `NEXT_PUBLIC_API_URL` | `https://api.jualakun.id` |
| `NEXT_PUBLIC_SITE_URL` | `https://jualakun.id` |

Catatan: **JANGAN** masukkan `SUPABASE_SERVICE_ROLE_KEY`, `QRIS_STATIC_PAYLOAD`, atau `ENCRYPTION_KEY` di Vercel — semua server-secret HANYA di backend Cloudflare.

### 3.3 Deploy

Klik **Deploy**. Build pertama ~2 menit. Vercel kasih URL `*.vercel.app`.

### 3.4 Bind Custom Domain

Project → Settings → Domains → Add `jualakun.id` dan `www.jualakun.id`. Ikuti instruksi DNS (CNAME/A record).

### 3.5 Update CORS Backend

Setelah Vercel domain final, update `backend/wrangler.toml`:

```toml
[vars]
CORS_ORIGINS = "https://jualakun.id,https://www.jualakun.id"
```

Re-deploy: `npx wrangler deploy`.

### 3.6 Smoke Test

- Buka `https://jualakun.id` — homepage harus load, kategori muncul
- Buka `/produk/<slug-apapun>` — detail produk muncul
- Coba register di `/daftar` — email verifikasi terkirim
- Login di `/masuk` → redirect ke `/dashboard`
- Klik produk → tombol "Beli Sekarang" → checkout → QRIS Dinamis muncul + timer 12 jam aktif

---

## 4. Konfigurasi Supabase Auth

Di Supabase dashboard → Authentication → URL Configuration:

| Field | Value |
|---|---|
| Site URL | `https://jualakun.id` |
| Redirect URLs | `https://jualakun.id/**`, `https://*.vercel.app/**` (preview) |

Authentication → Providers → Email: **Enable email confirmations**.

Authentication → Email Templates: edit ke bahasa Indonesia + branding JualAkun (lihat `docs/brand-guide.md`).

---

## 5. Set Admin User

Setelah register lewat UI, manual upgrade role di Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@jualakun.id';
```

Login ulang — `/admin` sekarang accessible.

---

## 6. Post-Deploy Checklist

- [ ] Backend `/health` return 200
- [ ] Frontend homepage load + kategori muncul
- [ ] Register + email verifikasi sampai inbox
- [ ] Login → dashboard accessible
- [ ] Admin panel accessible setelah role di-upgrade
- [ ] Checkout end-to-end: pilih produk → QRIS Dinamis muncul → buyer klik "Saya Sudah Bayar" → status `verifying` di admin
- [ ] Admin confirm payment: status `paid` → auto-trigger `deliver_order_account` → status `delivered`
- [ ] Credentials muncul di buyer dashboard setelah delivered
- [ ] WA notif ke buyer (cek `notifications_log` channel `whatsapp`)
- [ ] Email notif ke buyer (cek `notifications_log` channel `email`)
- [ ] Cron `expire-orders` jalan (cek di Cloudflare dashboard → Workers → Triggers → Logs setelah ~5 menit)

---

## 7. Rollback

### Backend
```powershell
npx wrangler rollback              # rollback ke versi sebelumnya
# atau
npx wrangler deployments list      # cari deployment-id
npx wrangler rollback <deployment-id>
```

### Frontend
Vercel dashboard → Deployments → cari deploy lama yang sehat → **⋯ → Promote to Production**.

### Database
**Tidak ada auto-rollback** untuk migrations. Sebelum apply migration baru ke production, selalu test di Supabase staging project. Jika perlu rollback schema, tulis migration `down` manual.

---

## 8. Troubleshooting

| Gejala | Cek |
|---|---|
| Homepage error "Failed to fetch" | `NEXT_PUBLIC_API_URL` di Vercel + CORS origin di backend |
| Login redirect loop | Supabase **Site URL** + **Redirect URLs** |
| QRIS Dinamis tidak muncul / payload kosong | `QRIS_STATIC_PAYLOAD` belum di-set atau format invalid (cek CRC16 trailing 4-char) |
| Amount mismatch di QRIS | Bug di `lib/qris.ts` (TLV inject / CRC recalc) — re-decode payload via zxing.org untuk konfirmasi |
| Cron tidak jalan | Workers Paid plan belum aktif |
| WA tidak terkirim | WAHA session disconnected → buka WAHA dashboard, scan ulang QR |
| Email tidak masuk | Resend domain belum verified, atau `RESEND_FROM_EMAIL` bukan domain yang verified |
| Credential corrupt setelah decrypt | `ENCRYPTION_KEY` di backend berubah dari saat encrypt — **jangan rotate** |

---

## 9. Production Hardening (Post-MVP)

Tidak wajib untuk deploy pertama, tapi catat untuk iterasi berikutnya:

- [ ] `vercel.json` dengan security headers (HSTS, CSP, X-Frame-Options)
- [ ] Sentry / PostHog integration (env var sudah ada di `.env.example`)
- [ ] Cloudflare WAF rules untuk endpoint admin (rate limit per IP)
- [ ] Backup Supabase otomatis (Supabase Pro plan)
- [ ] Workers Analytics + Logpush ke storage
- [ ] Status page (StatusPage / BetterStack)
