# API Endpoint Spec — JualAkun Backend

> Base URL (production): `https://api.jualakun.id`  
> Base URL (dev): `http://localhost:8787`  
> Runtime: Hono + Cloudflare Workers  
> Auth: Supabase JWT (`Authorization: Bearer <token>`)  
> Format: semua request/response `Content-Type: application/json`

---

## Konvensi

- `✅ Public` — tidak perlu auth
- `🔐 Auth` — perlu JWT buyer
- `🛡️ Admin` — perlu JWT + role `admin`
- Semua response error: `{ "error": "KODE_ERROR", "message": "..." }`
- Semua response sukses: `{ "data": {...} }` atau `{ "data": [...] }`
- Timestamp: ISO 8601 (`2026-05-09T10:00:00Z`)
- Harga: integer Rupiah (`47500` = Rp 47.500)

---

## 1. Auth

### `POST /auth/register`
✅ Public

Daftar akun baru via email & password.

**Body:**
```json
{
  "email": "user@email.com",
  "password": "min8chars",
  "full_name": "Budi Santoso",
  "phone_wa": "08123456789",
  "referral_code": "ABC12345"
}
```

**Response 201:**
```json
{
  "data": {
    "user_id": "uuid",
    "email": "user@email.com",
    "message": "Cek email untuk verifikasi"
  }
}
```

**Errors:** `EMAIL_TAKEN`, `INVALID_REFERRAL_CODE`, `WEAK_PASSWORD`

---

### `POST /auth/login`
✅ Public

**Body:**
```json
{ "email": "user@email.com", "password": "password" }
```

**Response 200:**
```json
{
  "data": {
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "expires_in": 3600,
    "user": { "id": "uuid", "email": "...", "role": "user" }
  }
}
```

**Errors:** `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`

---

### `POST /auth/refresh`
✅ Public

**Body:** `{ "refresh_token": "..." }`

**Response 200:** sama dengan login

---

### `POST /auth/logout`
🔐 Auth

Invalidate session.

**Response 200:** `{ "data": { "ok": true } }`

---

### `POST /auth/forgot-password`
✅ Public

**Body:** `{ "email": "user@email.com" }`

**Response 200:** `{ "data": { "message": "Email reset dikirim" } }`

---

## 2. Katalog & Produk

### `GET /catalog`
✅ Public

Daftar produk dengan filter & sort.

**Query params:**
```
category_slug  string   filter kategori (misal: streaming)
min_price      int      filter harga minimum
max_price      int      filter harga maximum
duration_days  int      filter durasi (30, 90, 365)
sort           string   sold_count|price_asc|price_desc|newest (default: sold_count)
page           int      (default: 1)
limit          int      (default: 20, max: 50)
```

**Response 200:**
```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Netflix Premium 1 Bulan",
        "slug": "netflix-premium-1-bulan",
        "thumbnail_url": "https://...",
        "price": 47500,
        "duration_days": 30,
        "guarantee_days": 30,
        "stock_count": 25,
        "sold_count": 1240,
        "rating_avg": 4.8,
        "rating_count": 320,
        "category": { "name": "Streaming", "slug": "streaming" }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 84, "total_pages": 5 }
  }
}
```

---

### `GET /catalog/categories`
✅ Public

**Response 200:**
```json
{
  "data": [
    { "id": "uuid", "name": "Streaming", "slug": "streaming", "icon_url": "...", "product_count": 12 }
  ]
}
```

---

### `GET /catalog/:slug`
✅ Public

Detail satu produk.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Netflix Premium 1 Bulan",
    "slug": "netflix-premium-1-bulan",
    "description": "...",
    "thumbnail_url": "...",
    "price": 47500,
    "duration_days": 30,
    "guarantee_days": 30,
    "stock_count": 25,
    "sold_count": 1240,
    "rating_avg": 4.8,
    "rating_count": 320,
    "is_active": true,
    "category": { "name": "Streaming", "slug": "streaming" },
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Mantap, langsung aktif!",
        "created_at": "2026-05-01T10:00:00Z"
      }
    ]
  }
}
```

**Errors:** `PRODUCT_NOT_FOUND`

---

## 3. Checkout & Orders

### `POST /checkout/validate-coupon`
🔐 Auth

**Body:**
```json
{
  "code": "HEMAT10",
  "product_id": "uuid",
  "amount_idr": 47500
}
```

**Response 200:**
```json
{
  "data": {
    "valid": true,
    "discount_type": "percent",
    "discount_value": 10,
    "discount_idr": 4750,
    "final_idr": 42750
  }
}
```

**Errors:** `COUPON_INVALID`, `COUPON_EXPIRED`, `COUPON_NOT_VALID_FOR_PRODUCT`

---

### `POST /checkout/create-order`
🔐 Auth

Buat order dan dapatkan Midtrans Snap token.

**Body:**
```json
{
  "product_id": "uuid",
  "coupon_code": "HEMAT10",
  "use_credits": true,
  "phone_wa": "08123456789"
}
```

**Response 201:**
```json
{
  "data": {
    "order_id": "uuid",
    "order_number": "JA-20260509-00001",
    "amount_idr": 47500,
    "discount_idr": 4750,
    "credit_used_idr": 0,
    "total_idr": 42750,
    "snap_token": "abc123...",
    "snap_url": "https://app.midtrans.com/snap/v2/vtweb/abc123",
    "expires_at": "2026-05-10T10:00:00Z"
  }
}
```

**Errors:** `PRODUCT_NOT_FOUND`, `OUT_OF_STOCK`, `INSUFFICIENT_CREDITS`

---

### `POST /payment/webhook`
✅ Public (validated via Midtrans signature)

Midtrans payment notification webhook.

**Body:** Midtrans notification object (raw)

**Flow backend:**
1. Validasi signature Midtrans
2. Cek `transaction_status` (settlement → paid)
3. Update order status → `paid`
4. Panggil RPC `deliver_order_account(order_id)`
5. Jika delivery sukses → kirim notif WA + email
6. Jika delivery gagal → alert admin, queue refund

**Response 200:** `{ "ok": true }` (selalu 200 agar Midtrans tidak retry)

---

### `GET /orders`
🔐 Auth

Riwayat order buyer.

**Query:** `status`, `page`, `limit`

**Response 200:**
```json
{
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "JA-20260509-00001",
        "product_name": "Netflix Premium 1 Bulan",
        "product_thumbnail": "...",
        "total_idr": 42750,
        "status": "delivered",
        "delivered_at": "2026-05-09T10:05:00Z",
        "guarantee_expires_at": "2026-06-09T10:05:00Z",
        "created_at": "2026-05-09T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5 }
  }
}
```

---

### `GET /orders/:id`
🔐 Auth

Detail satu order.

**Response 200:** order object lengkap (tanpa credentials)

---

### `GET /orders/:id/credentials`
🔐 Auth

Ambil credentials akun. Hanya tersedia jika status `delivered` atau `confirmed`.

**Response 200:**
```json
{
  "data": {
    "credentials": {
      "username": "user@netflix.com",
      "password": "password123",
      "note": "Gunakan profile ke-2. PIN: 1234."
    },
    "guarantee_expires_at": "2026-06-09T10:05:00Z"
  }
}
```

**Errors:** `ORDER_NOT_FOUND`, `NOT_DELIVERED_YET`, `UNAUTHORIZED`

---

### `POST /orders/:id/confirm`
🔐 Auth

Buyer konfirmasi akun diterima & berfungsi.

**Response 200:** `{ "data": { "ok": true, "status": "confirmed" } }`

---

## 4. Dashboard Buyer

### `GET /dashboard`
🔐 Auth

Semua data dashboard dalam satu request.

**Response 200:**
```json
{
  "data": {
    "profile": {
      "full_name": "Budi Santoso",
      "email": "budi@email.com",
      "phone_wa": "08123456789",
      "referral_code": "BUDI1234",
      "credits": 15000,
      "joined_at": "2026-01-01T00:00:00Z"
    },
    "orders": [...],
    "referral_stats": {
      "total_referrals": 5,
      "credited": 3,
      "pending": 2,
      "total_earned": 15000
    }
  }
}
```

---

### `PATCH /dashboard/profile`
🔐 Auth

Update profil buyer.

**Body:** `{ "full_name": "...", "phone_wa": "..." }`

**Response 200:** `{ "data": { "ok": true } }`

---

## 5. Garansi & Support

### `POST /tickets`
🔐 Auth

Buat tiket klaim garansi.

**Body:**
```json
{
  "order_id": "uuid",
  "reason": "cant_login",
  "description": "Akun tidak bisa login sejak tadi pagi",
  "screenshot_url": "https://..."
}
```

**Response 201:**
```json
{
  "data": {
    "ticket_id": "uuid",
    "status": "open",
    "message": "Tiket berhasil dibuat. Admin akan merespons dalam 1x24 jam."
  }
}
```

**Errors:** `ORDER_NOT_FOUND`, `GUARANTEE_EXPIRED`, `TICKET_ALREADY_EXISTS`

---

### `GET /tickets`
🔐 Auth

Daftar tiket milik buyer.

**Response 200:** `{ "data": { "tickets": [...] } }`

---

### `GET /tickets/:id`
🔐 Auth

Detail tiket.

---

## 6. Referral

### `GET /referral`
🔐 Auth

Info referral buyer.

**Response 200:**
```json
{
  "data": {
    "referral_code": "BUDI1234",
    "referral_link": "https://jualakun.id/daftar?ref=BUDI1234",
    "credits": 15000,
    "stats": {
      "total_referrals": 5,
      "credited": 3,
      "pending": 2,
      "total_earned": 15000
    },
    "history": [
      {
        "referred_email": "f***@gmail.com",
        "status": "credited",
        "credit_amount": 5000,
        "credited_at": "2026-03-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 7. Review

### `POST /reviews`
🔐 Auth

Submit review setelah order `confirmed`.

**Body:**
```json
{
  "order_id": "uuid",
  "rating": 5,
  "comment": "Cepat banget, langsung aktif!"
}
```

**Response 201:** `{ "data": { "ok": true } }`

**Errors:** `ORDER_NOT_CONFIRMED`, `REVIEW_ALREADY_EXISTS`

---

## 8. Admin — Produk

### `GET /admin/products`
🛡️ Admin

**Query:** `status`, `category_slug`, `page`, `limit`

---

### `POST /admin/products`
🛡️ Admin

Buat produk baru.

**Body:**
```json
{
  "category_id": "uuid",
  "name": "Netflix Premium 1 Bulan",
  "slug": "netflix-premium-1-bulan",
  "description": "...",
  "thumbnail_url": "...",
  "duration_days": 30,
  "price": 47500,
  "guarantee_days": 30,
  "is_active": false
}
```

---

### `PATCH /admin/products/:id`
🛡️ Admin — Update produk

### `DELETE /admin/products/:id`
🛡️ Admin — Nonaktifkan produk (soft delete via `is_active = false`)

---

### `POST /admin/products/:id/stock`
🛡️ Admin

Upload stok akun (single atau bulk).

**Body:**
```json
{
  "accounts": [
    { "credentials": "email:password", "note": "Gunakan profile ke-2" },
    { "credentials": "email2:password2", "note": null }
  ]
}
```

**Response 201:**
```json
{ "data": { "added": 2, "total_stock": 27 } }
```

---

### `POST /admin/products/:id/stock/bulk`
🛡️ Admin

Upload CSV. `Content-Type: multipart/form-data`

**Field:** `file` (CSV: `credentials,note` per baris)

**Response 201:**
```json
{ "data": { "added": 50, "rejected": 2, "errors": ["Row 5: format invalid"] } }
```

---

## 9. Admin — Orders

### `GET /admin/orders`
🛡️ Admin

**Query:** `status`, `page`, `limit`, `search` (order_number/email)

---

### `POST /admin/orders/:id/deliver`
🛡️ Admin

Manual trigger pengiriman akun (fallback jika auto-deliver gagal).

**Response 200:** `{ "data": { "ok": true, "delivered": true } }`

---

### `PATCH /admin/orders/:id/status`
🛡️ Admin

**Body:** `{ "status": "refunded" }`

---

## 10. Admin — Tiket

### `GET /admin/tickets`
🛡️ Admin

**Query:** `status`, `page`, `limit`

---

### `PATCH /admin/tickets/:id`
🛡️ Admin

Resolve tiket.

**Body:**
```json
{
  "status": "resolved_replaced",
  "resolution": "Akun pengganti sudah dikirim",
  "new_account_stock_id": "uuid"
}
```

---

## 11. Admin — Dashboard & Analytics

### `GET /admin/dashboard`
🛡️ Admin

KPI utama (calls `get_admin_kpis()` RPC).

---

### `GET /admin/analytics/revenue`
🛡️ Admin

**Query:** `days` (default: 30)

**Response:** array `{ date, revenue, orders }` per hari

---

### `GET /admin/analytics/top-products`
🛡️ Admin

**Query:** `limit` (default: 10)

---

## 12. Admin — Coupons

### `GET /admin/coupons`
🛡️ Admin

### `POST /admin/coupons`
🛡️ Admin

**Body:**
```json
{
  "code": "HEMAT10",
  "discount_type": "percent",
  "discount_value": 10,
  "max_uses": 100,
  "expires_at": "2026-12-31T23:59:59Z"
}
```

### `PATCH /admin/coupons/:id`
🛡️ Admin

### `DELETE /admin/coupons/:id`
🛡️ Admin — Deactivate

---

## 13. Cron (Internal — Cloudflare Cron Trigger)

### `GET /cron/expire-orders`
Internal — dipanggil oleh Cloudflare Cron setiap 30 menit.

Calls `expire_old_orders()` RPC.

### `GET /cron/stock-alerts`
Internal — dipanggil setiap 1 jam.

Cek produk dengan `stock_count <= 5`, kirim notif WA ke admin.

### `GET /cron/retry-notifications`
Internal — dipanggil setiap 15 menit.

Retry notif WA/email yang `status = 'failed'`.

---

## Error Code Reference

| Code | HTTP | Keterangan |
|------|------|-----------|
| `UNAUTHORIZED` | 401 | Token tidak ada atau expired |
| `FORBIDDEN` | 403 | Role tidak cukup |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 422 | Input tidak valid |
| `OUT_OF_STOCK` | 409 | Stok habis |
| `COUPON_INVALID` | 400 | Kupon tidak valid |
| `GUARANTEE_EXPIRED` | 400 | Masa garansi sudah habis |
| `TICKET_ALREADY_EXISTS` | 409 | Tiket untuk order ini sudah ada |
| `REVIEW_ALREADY_EXISTS` | 409 | Review sudah pernah dibuat |
| `INVALID_WEBHOOK_SIGNATURE` | 400 | Signature Midtrans tidak valid |
| `INTERNAL_ERROR` | 500 | Server error |
