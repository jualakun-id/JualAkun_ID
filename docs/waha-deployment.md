# WAHA Production Deployment — JualAkun

Panduan deploy WAHA (WhatsApp HTTP API) untuk JualAkun production di **sumopod.com**.

## Overview

WAHA = self-hosted WhatsApp HTTP API. JualAkun pakai WAHA untuk:
- Notif buyer: konfirmasi bayar, akun delivered, balasan tiket
- Notif admin: order masuk yang butuh fulfillment, stok kritis, error backend, notif buyer gagal permanen

Architecture:
```
Backend (Cloudflare Workers) ──POST /api/sendText──> WAHA (sumopod.com) ──> WhatsApp Web
```

## Spec Sumopod

- **Image**: `devlikeapro/waha:latest` (Core, gratis)
- **Port**: 3000 (default, expose ke public via HTTPS reverse proxy sumopod)
- **Storage**: minimal 500 MB untuk session files (Chromium profile)
- **Memory**: minimal 1 GB RAM (Chromium butuh ini saat scan + idle)

> **Catatan WAHA Plus**: kalau butuh multi-session atau receive incoming (chatbot), upgrade ke WAHA Plus. JualAkun cuma butuh **send** + **1 session**, jadi Core sudah cukup.

## Step 1 — Deploy Container di Sumopod

Login ke sumopod.com → Create New Project → Docker Image.

Setting:

| Field | Value |
|-------|-------|
| Image | `devlikeapro/waha:latest` |
| Port | `3000` |
| HTTPS | ✅ Enable (auto Let's Encrypt) |
| Persistent storage | ✅ Mount `/app/.sessions` |
| Restart policy | `unless-stopped` |

### Environment Variables di Sumopod

```env
# Wajib — API security
WAHA_API_KEY=<generate-32-char-random>
WHATSAPP_DEFAULT_ENGINE=WEBJS

# Optional — kalau pakai webhook (JualAkun belum pakai)
# WHATSAPP_HOOK_URL=https://jualakun-backend.workers.dev/api/waha/webhook
# WHATSAPP_HOOK_EVENTS=message,session.status

# Optional — kalau mau dashboard pakai password
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=<strong-password>
```

Generate `WAHA_API_KEY` random:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([Guid]::NewGuid().ToString()))
```

> Simpan `WAHA_API_KEY` ini — akan dipakai juga di backend Cloudflare Workers.

## Step 2 — Verify WAHA Running

Setelah deploy, sumopod akan kasih URL seperti `https://jualakun-waha.sumopod.app`. Test:

```powershell
curl https://jualakun-waha.sumopod.app/api/server/version `
  -H "X-Api-Key: <WAHA_API_KEY>"
```

Expected response:
```json
{ "version": "2024.x.x", "engine": "WEBJS" }
```

Kalau 401 → API key salah. Kalau timeout → container belum running, cek log sumopod.

## Step 3 — Buat Session "jualakun"

WAHA mengelola session per nomor WA. Buat session bernama `jualakun`:

```powershell
curl -X POST https://jualakun-waha.sumopod.app/api/sessions/jualakun/start `
  -H "X-Api-Key: <WAHA_API_KEY>" `
  -H "Content-Type: application/json"
```

Response: `{ "name": "jualakun", "status": "STARTING" }`

Polling 5 detik kemudian, status akan jadi `SCAN_QR_CODE`. Ambil QR:

```powershell
curl https://jualakun-waha.sumopod.app/api/jualakun/auth/qr `
  -H "X-Api-Key: <WAHA_API_KEY>" `
  -o qr.png
```

**Lebih gampang via Dashboard:**

Buka `https://jualakun-waha.sumopod.app/dashboard` di browser → login dengan `WAHA_DASHBOARD_USERNAME` & `WAHA_DASHBOARD_PASSWORD` → klik session `jualakun` → tab "QR Code" → scan via WhatsApp di HP nomor admin.

Setelah scan berhasil, status berubah jadi `WORKING`.

## Step 4 — Set Secrets di Cloudflare Workers Backend

```powershell
# Set di backend production
cd backend

"https://jualakun-waha.sumopod.app" | npx wrangler secret put WAHA_BASE_URL --name jualakun-backend
"<WAHA_API_KEY>" | npx wrangler secret put WAHA_API_KEY --name jualakun-backend
"jualakun" | npx wrangler secret put WAHA_SESSION --name jualakun-backend

# Set admin contacts (untuk alert auto-fallback email)
"628xxxxxxxxxxxxxxx" | npx wrangler secret put ADMIN_WHATSAPP_NUMBER --name jualakun-backend
"admin@jualakun.id" | npx wrangler secret put ADMIN_EMAIL --name jualakun-backend
```

## Step 5 — Test End-to-End

### Test 1: Health check via admin endpoint

```powershell
curl https://jualakun-backend.jualakun.workers.dev/api/admin/analytics/system-health `
  -H "Authorization: Bearer <admin-jwt>"
```

Expected — section `waha`:
```json
{
  "waha": {
    "base_url_set": true,
    "api_key_set": true,
    "session": "jualakun",
    "status": "WORKING"
  }
}
```

Kalau `status: "SCAN_QR_CODE"` → session belum di-scan (ulangi step 3).
Kalau `status: "STOPPED"` → session crash, restart via dashboard.
Kalau `status: "UNKNOWN"` + `error: ...` → backend tidak bisa reach WAHA, cek `WAHA_BASE_URL` & firewall sumopod.

### Test 2: Kirim WA test ke admin

Cara paling cepat — trigger admin alert via dummy error. Atau langsung curl:

```powershell
curl -X POST https://jualakun-waha.sumopod.app/api/sendText `
  -H "X-Api-Key: <WAHA_API_KEY>" `
  -H "Content-Type: application/json" `
  -d '{\"session\":\"jualakun\",\"chatId\":\"628xxxxxxxxx@c.us\",\"text\":\"Test WAHA production\"}'
```

Pesan harus masuk WA admin dalam < 5 detik.

### Test 3: Test fallback email

Stop session WAHA dulu (`POST /api/sessions/jualakun/stop`) → trigger admin alert → email harus masuk ke `ADMIN_EMAIL`.

## Operational Tips

### Session disconnect (HP logout, baterai habis)
- Status di health check akan jadi `STOPPED` atau `SCAN_QR_CODE`
- Buka dashboard → klik Start → scan ulang QR
- Selama session down, admin alert auto-route ke email (✅ sudah handle)

### Update WAHA image
```
Stop container di sumopod → Pull `devlikeapro/waha:latest` → Restart
```
Session tetap (karena mount persistent `/app/.sessions`).

### Monitor
- Health badge di admin dashboard `/admin` akan show status real-time
- Notif log di `notifications_log` table — query: `SELECT * FROM notifications_log WHERE status = 'failed' ORDER BY created_at DESC LIMIT 20`

## Cost

- **WAHA Core image**: gratis
- **Sumopod container** (1 vCPU + 1 GB RAM): cek pricing sumopod.com (estimasi ~Rp 50-100k/bulan)
- **WhatsApp**: gratis (pakai nomor admin existing)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `401 Unauthorized` saat call WAHA | Cek `X-Api-Key` header — harus sama dengan `WAHA_API_KEY` di env sumopod |
| QR code tidak muncul | Session belum di-start. Call `POST /api/sessions/jualakun/start` dulu |
| Pesan tidak terkirim, status `WORKING` | Cek `chatId` format: `628xxx@c.us` (bukan `+62xxx` atau `08xxx`) |
| Session crash setelah beberapa jam | Naikkan RAM container (default 512 MB sering OOM, pakai 1 GB+) |
| WhatsApp banned nomor admin | Pakai nomor yang sudah lama aktif (bukan baru daftar), jangan kirim spam (rate limit 1 pesan/3 detik) |
