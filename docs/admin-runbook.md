# Admin Runbook — JualAkun.id

Operational guide untuk admin platform. Cover daily ops, edge cases, dan disaster recovery.

---

## 1. First-Time Setup

### A. Buat akun admin pertama

1. Daftar akun via `/daftar` dengan email & nomor WA admin
2. Login Supabase Dashboard → SQL Editor → run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = (
     SELECT id FROM auth.users WHERE email = 'EMAIL_ADMIN'
   );
   ```
3. Logout & login ulang → akses `/admin` aktif

### B. Verify konfigurasi production

Buka `/admin/analytics/system-health` (atau cek via API: `GET /admin/analytics/system-health`):

```json
{
  "cron_secret_set": true,           ← harus true
  "admin_wa_set": true,              ← harus true (terima alert kritis)
  "supplier_api_set": true,          ← harus true (kalau pakai Canboso)
  "duitku_production": true,         ← MUST true sebelum go-live
  "resend_api_set": true,            ← harus true
  "resend_from_email": "noreply@jualakun.id", ← domain harus verified
  "waha_base_url_set": true,         ← harus true
  "encryption_key_set": true         ← harus true (32+ char)
}
```

Kalau ada `false`, set via:
```bash
echo "VALUE" | npx --prefix backend wrangler secret put NAMA_KEY --name jualakun-backend
```

---

## 2. Daily Operations

### Pagi (15-30 menit)

1. **Buka `/admin`** — cek Action Center
   - Item Kritis (merah) → resolve segera (paid > 24h, ticket > 48h, stock 0, saldo Canboso < $2)
   - Item Warning (kuning) → schedule resolve hari ini
2. **`/admin/pesanan?status=paid`** — fulfill semua paid orders
   - Klik order → "Beli dari Supplier" (kalau ada mapping) atau input manual
   - Input modal pembelian → klik Kirim
3. **`/admin/tiket?status=open`** — respond tiket warranty
   - Klaim valid? Resolve dengan replacement credentials
   - Klaim invalid? Reject dengan alasan jelas

### Siang/Sore

4. **Cek aktivitas `/admin/notifikasi`** — filter "Notif Gagal" → manual retry kalau buyer belum terima
5. **Stock check `/admin/stok-monitor`** — refresh sync supplier, top-up Canboso kalau saldo menipis

### Mingguan

6. **`/admin/analytics?days=7`** — review SLA, profit margin, top product, conversion rate
7. **`/admin/pengguna`** — cek user baru, suspend yang fraud kalau ada
8. **Backup verification** — login Supabase Dashboard, cek "Database → Backups" — daily backup ter-create

---

## 3. Standard Operating Procedures (SOP)

### 3.1. Fulfill Order

**Trigger:** Order status = `paid` (callback Duitku sukses)

**Steps:**
1. Buka `/admin/pesanan?status=paid`
2. Klik row order yang mau di-fulfill
3. Section "Fulfill Manual":
   - **Kalau produk ter-link supplier:** klik "Beli dari Supplier" → wallet Canboso terpotong → response auto-fill ke textarea
   - **Kalau manual source:** input credentials di textarea (format bebas: email, password, instruksi)
4. Field "Modal Pembelian (Rp)" → masukkan biaya beli (auto-fill kalau dari supplier)
5. Klik "Kirim ke Buyer"
6. Buyer dapat email + WA dengan credentials encrypted
7. Status order → `delivered`, profit auto-calc

**Edge case:** Supplier API down
- Klik "Beli dari Supplier" return error 502
- Cari credentials di sumber alternatif (marketplace lain, dll)
- Paste manual ke textarea + input modal manual
- Tetap kirim ke buyer

---

### 3.2. Refund Order

**Trigger:** Buyer minta refund, atau supplier gagal fulfill

**Steps:**
1. Buka `/admin/pesanan/<order-id>` (detail page)
2. Klik tombol "Proses Refund" di action panel
3. Confirm — status → `refunded`
4. **Manual transfer balik ke buyer** via:
   - Bank transfer manual (lihat metode pembayaran original di order detail)
   - Atau pakai Duitku Refund API kalau aktif (cek dashboard Duitku)
5. WhatsApp buyer untuk konfirmasi refund process + estimasi waktu
6. Activity log otomatis emit `order_refunded`

**Penting:** Refund Duitku **tidak auto** — perlu manual transfer balik.

---

### 3.3. Resolve Tiket Garansi

**Trigger:** Buyer buat tiket warranty (`/admin/tiket?status=open`)

**Steps:**
1. Klik tiket → review deskripsi + screenshot
2. Cek validitas:
   - Garansi masih aktif? (cek `guarantee_expires_at` di order)
   - Alasan valid? (akun mati, password berubah, dll)
3. Kalau valid:
   - Klik "Mark In Review" (signal sedang ditangani)
   - Beli credentials replacement dari supplier / sumber lain
   - Input di Resolve form → status `resolved_replaced`
   - Buyer dapat email/WA replacement credentials
4. Kalau invalid:
   - Reject dengan alasan di resolution field → status `rejected`
   - Buyer dapat notif penjelasan

---

### 3.4. Update Display Stock

**Trigger:** Supplier punya stok baru, atau pre-stock manual

**Steps:**
1. `/admin/produk` → klik produk → tab Detail
2. Field "Stok Tampilan" → set angka
3. Saat order fulfilled, auto-decrement -1

**Atau via Supplier:**
- `/admin/stok-monitor` → klik "Sync Sekarang" (manual)
- Atau auto-sync setiap 10 menit kalau produk ter-link supplier

---

### 3.5. Adjust Kredit User

**Trigger:** Bonus referral, kompensasi tiket, koreksi error

**Steps:**
1. `/admin/pengguna` → klik user → modal detail
2. Section "Adjust Kredit":
   - Pilih Tambah / Kurangi
   - Input jumlah (Rp)
   - Reason (opsional, untuk audit di Cloudflare logs)
3. Confirm → saldo terupdate

---

### 3.6. Update Kurs USD-IDR

**Trigger:** Kurs Binance USDT bergerak signifikan

**Steps:**
1. `/admin/stok-monitor` → klik card "Kurs Aktif"
2. Modal popup → input kurs baru
3. Tambah catatan (mis. "Naik karena USDT 18.500")
4. Simpan — **kurs baru hanya berlaku untuk fulfill ke depan**, order historis tetap pakai snapshot

---

## 4. Disaster Recovery

### 4.1. Backup `ENCRYPTION_KEY` (CRITICAL)

`ENCRYPTION_KEY` di Cloudflare secret pakai AES-256 untuk encrypt credentials di `account_stock.credentials_enc`. **Kalau hilang, semua credentials buyer hilang permanen — gak bisa di-decrypt.**

**Procedure:**
1. Copy value ENCRYPTION_KEY (32+ char) ke **password manager** (1Password / Bitwarden / KeePassXC)
2. Backup ke **2 lokasi independent** (mis. cloud password manager + offline)
3. **Jangan pernah** commit ke git
4. **Jangan pernah** rotate kecuali ada data migration plan

### 4.2. Supabase Backup

Free tier: daily backup, retention 7 hari.

**Verifikasi mingguan:**
1. Supabase Dashboard → Database → Backups
2. Pastikan backup terbaru terjadi (timestamp < 24 jam)
3. Test restore (optional, di project staging — jangan production)

**Upgrade pertimbangan:** Paid plan ($25/bulan) = Point-in-Time Recovery (PITR), retention 7 hari granular per detik.

### 4.3. Cloudflare Workers Down

Symptom: `api.jualakun.id` return error / timeout

**Actions:**
1. Cek Cloudflare Workers Dashboard → Logs (Real-time)
2. Cek deployment status — kalau ada deploy buruk, rollback ke version sebelumnya
3. Verify env vars set: `/admin/analytics/system-health`
4. Worst case: redeploy dari local: `npm --prefix backend run deploy`

### 4.4. Supabase Down

Cloudflare Workers gak bisa connect ke Supabase = semua API fail.

**Actions:**
1. Cek status.supabase.com
2. Notif buyer via WA bulk (manual) bahwa system maintenance
3. Pause iklan / Google Ads kalau ada
4. Tunggu Supabase restore — biasanya < 1 jam

### 4.5. WAHA / WhatsApp Number Banned

Symptom: WA notif gagal semua, success rate drops di /admin/analytics

**Actions:**
1. Cek WAHA session status — apakah masih connected?
2. Kalau number ban: ganti ADMIN_WHATSAPP_NUMBER + WAHA session ke nomor baru
3. Update buyer existing dengan email saja (sementara)
4. **Preventive:** pakai number business verified, bukan personal

### 4.6. Duitku Issue

Symptom: callback tidak masuk, order paid stuck di pending_payment

**Actions:**
1. Cek dashboard Duitku merchant: apakah ada notifikasi maintenance?
2. Cek `notifications_log` untuk error message
3. Kalau buyer claim sudah bayar tapi status masih pending: verifikasi manual di Duitku dashboard, lalu admin manual update status:
   ```sql
   UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = '<order_id>';
   ```
4. Lalu trigger admin fulfill via UI normal

---

## 5. Troubleshooting

### A. Buyer komplain "tidak terima credentials" padahal status delivered

1. Cek `/admin/pesanan/<order-id>` → log Notifikasi
2. Kalau Email status `sent`: minta buyer cek spam folder
3. Kalau Email `failed`: klik Resend di log entry
4. Verify WA status — kalau `failed`, retry via `/admin/notifikasi?event_type=notification_failed` + admin Resend

### B. Sync supplier stuck / error 502

1. Cek balance Canboso: kalau < $2, top-up via [bot Telegram](https://t.me/CanbosoBot)
2. Cek API key still valid: `/admin/analytics/system-health` → `supplier_api_set: true`
3. Kalau Canboso server down (status 502): tunggu 10-30 menit, cron retry auto

### C. Activity log table tumbuh terlalu besar

Auto-cleanup retention 90 hari berjalan tiap 30 menit. Kalau perlu adjust:
- Edit `cleanup_old_activity_log(p_retention_days, p_batch_size)` di Supabase SQL Editor
- Atau panggil manual: `SELECT cleanup_old_activity_log(30, 5000);` untuk aggressive cleanup

---

## 6. Contact / Escalation

- **Developer (technical):** [contact via project owner]
- **Duitku Support:** support@duitku.com
- **WAHA Issues:** cek dokumentasi WAHA selfhosted
- **Supabase:** support@supabase.com (paid plan) / Discord community (free)
- **Vercel:** dashboard.vercel.com → Help

---

**Last Updated:** 2026-05-12
