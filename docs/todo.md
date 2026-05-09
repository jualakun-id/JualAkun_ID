# JualAkun — Catatan & TODO Post-Deployment

> Last updated: 2026-05-09
> Status: MVP live di jualakun.id

---

## Pending Tasks (Prioritas)

### 1. Midtrans — Payment Gateway
**Status:** Belum dikonfigurasi (sandbox)

Yang harus dilakukan:
- Daftar akun Midtrans Sandbox di [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com)
- Ambil **Server Key** dan **Client Key** dari Settings → Access Keys
- Set secrets di backend:
  ```powershell
  cd d:\JualAkun_ID\backend
  npx wrangler secret put MIDTRANS_SERVER_KEY
  npx wrangler secret put MIDTRANS_CLIENT_KEY
  ```
- Tambahkan di Vercel env vars:
  - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` = Client Key sandbox
  - `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` = `false` *(sudah ada)*
- Set Webhook Notification URL di Midtrans dashboard:
  ```
  https://jualakun-backend.jualakun.workers.dev/payment/webhook
  ```
- Redeploy frontend Vercel setelah env vars ditambah

---

### 2. Stok Produk — Upload Credentials
**Status:** Semua produk stok habis (stock_count = 0)

Yang harus dilakukan:
- Login ke [jualakun.id/admin](https://jualakun.id/admin)
- Buka **Stok Monitor** atau **Produk → [nama produk] → Upload Stok**
- Upload credentials akun (format: `username|password` atau via CSV bulk)
- Minimal 1 stok per produk untuk bisa ditest end-to-end
- Untuk test: upload 1 akun dummy dulu (misal `test@test.com|password123`)

---

### 3. Email & WhatsApp Notifikasi
**Status:** Belum dikonfigurasi

#### Email (Resend)
- Daftar di [resend.com](https://resend.com)
- Verifikasi domain `jualakun.id` (tambah DNS TXT record di Hostinger)
- Buat API Key
- Set secrets:
  ```powershell
  npx wrangler secret put RESEND_API_KEY
  npx wrangler secret put RESEND_FROM_EMAIL   # misal: noreply@jualakun.id
  ```

#### WhatsApp (WAHA)
- Deploy WAHA di VPS/Docker (self-hosted)
- Scan QR code untuk koneksi WhatsApp session
- Set secrets:
  ```powershell
  npx wrangler secret put WAHA_BASE_URL       # misal: https://waha.jualakun.id
  npx wrangler secret put WAHA_API_KEY
  npx wrangler secret put WAHA_SESSION        # default: "default"
  npx wrangler secret put ADMIN_WHATSAPP_NUMBER  # format: 628xxx@c.us
  ```

---

### 4. Push ke GitHub
**Status:** Belum dipush setelah perubahan terakhir

Perubahan yang belum di-commit:
- `backend/wrangler.toml` — CORS origins diupdate
- `backend/package.json` — wrangler upgrade ke v4
- File baru ini (`docs/todo.md`)
- Fix `generate_referral_code` (perlu disimpan sebagai migration baru)

```powershell
cd d:\JualAkun_ID
git add backend/wrangler.toml backend/package.json backend/package-lock.json docs/
git commit -m "chore: update cors origins, upgrade wrangler v4, add todo notes"
git push origin main
```

**Tambahkan juga migration fix untuk generate_referral_code:**
```sql
-- supabase/migrations/013_fix_referral_code_search_path.sql
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code VARCHAR;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := upper(substring(md5(random()::text) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;
```

---

## Post-MVP (Tidak Wajib untuk Launch)

- [ ] Google OAuth (Supabase Auth → Providers → Google) — butuh Google Cloud project
- [ ] `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION = true` + ganti ke Midtrans Production key
- [ ] `vercel.json` dengan security headers (HSTS, CSP, X-Frame-Options)
- [ ] Sentry / PostHog error monitoring
- [ ] Cloudflare WAF rules untuk `/payment/webhook`
- [ ] Load test 100 concurrent checkout
- [ ] Sitemap.xml dan robots.txt
- [ ] Akun media sosial (Instagram, TikTok)

---

## Deployment Info

| Layanan | URL / Info |
|---------|-----------|
| Frontend | https://jualakun.id (Vercel) |
| Frontend (Vercel) | https://jual-akun-id.vercel.app |
| Backend | https://jualakun-backend.jualakun.workers.dev |
| Supabase | Project ID: `clfewheqatyaefohmdpn` (ap-southeast-1) |
| Admin | https://jualakun.id/admin |
| Admin Email | zayyan@jualakun.id |
| Cloudflare Account | Jualanakunindonesia@gmail.com |

## Secrets yang Sudah Set di Backend

| Secret | Status |
|--------|--------|
| SUPABASE_URL | ✅ |
| SUPABASE_ANON_KEY | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ |
| ENCRYPTION_KEY | ✅ |
| CRON_SECRET | ✅ |
| MIDTRANS_SERVER_KEY | ❌ Belum |
| MIDTRANS_CLIENT_KEY | ❌ Belum |
| WAHA_BASE_URL | ❌ Belum |
| WAHA_API_KEY | ❌ Belum |
| WAHA_SESSION | ❌ Belum |
| RESEND_API_KEY | ❌ Belum |
| RESEND_FROM_EMAIL | ❌ Belum |
| ADMIN_WHATSAPP_NUMBER | ❌ Belum |
