# Skill: db-helper

## Deskripsi
Bantu operasi Supabase: generate SQL migration, debug queries, buat/verifikasi RLS policies, dan panggil RPC functions untuk JualAkun. Semua mengikuti schema yang sudah ada di `supabase/migrations/`.

## Dipanggil dengan
`/db-helper [deskripsi kebutuhan]`

Contoh:
- `/db-helper debug pesanan pending > 30 menit`
- `/db-helper tambah kolom phone_wa ke profiles`
- `/db-helper RLS policy untuk tabel coupons`
- `/db-helper cek stok semua produk`
- `/db-helper migration tambah tabel wishlists`

---

## Instruksi Eksekusi

### 1. Baca Schema yang Ada
Sebelum menghasilkan apapun, selalu cek `supabase/migrations/` untuk memahami schema saat ini:
- `001` — profiles (users, referral_code, credits, role)
- `002` — categories
- `003` — products (stock_count trigger-maintained)
- `004` — account_stock (FIFO pool, credentials_enc)
- `005` — orders + coupons (Midtrans fields, expires_at)
- `006` — referrals
- `007` — support_tickets
- `008` — notifications_log
- `009` — product_reviews
- `010` — indexes
- `011` — RLS policies
- `012` — RPC functions

### 2. Pola SQL yang Benar

#### Migration File Baru
Selalu ikuti naming convention: `013_[deskripsi].sql`, `014_[deskripsi].sql`, dst.

```sql
-- supabase/migrations/013_add_wishlists.sql

-- Buat tabel
CREATE TABLE IF NOT EXISTS wishlists (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)  -- satu user, satu kali per produk
);

-- Index untuk query by user
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- RLS: user hanya lihat wishlist sendiri
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Tambah Kolom
```sql
-- Safe: cek existence dulu, pakai IF NOT EXISTS
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_wa TEXT,
  ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- Index jika kolom sering di-query
CREATE INDEX IF NOT EXISTS idx_profiles_phone_wa ON profiles(phone_wa) WHERE phone_wa IS NOT NULL;
```

#### RPC Function Pattern (SECURITY DEFINER)
```sql
-- Selalu: SECURITY DEFINER, SET search_path = public
-- Parameter: p_ prefix, variable: v_ prefix
-- Return: JSONB untuk fleksibilitas

CREATE OR REPLACE FUNCTION add_to_wishlist(
  p_user_id    UUID,
  p_product_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM wishlists WHERE user_id = p_user_id AND product_id = p_product_id
  ) INTO v_exists;

  IF v_exists THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ALREADY_IN_WISHLIST');
  END IF;

  INSERT INTO wishlists(user_id, product_id) VALUES (p_user_id, p_product_id);

  RETURN jsonb_build_object('ok', true);
END;
$$;
```

### 3. Debugging Queries (Siap Pakai di Supabase SQL Editor)

```sql
-- ============================================
-- STOK & PRODUK
-- ============================================

-- Semua produk dengan stok kritis (< 5)
SELECT id, name, stock_count, is_active
FROM products
WHERE is_active = true AND stock_count <= 5
ORDER BY stock_count ASC;

-- Produk out-of-stock tapi masih aktif
SELECT id, name, sold_count, updated_at
FROM products
WHERE is_active = true AND stock_count = 0;

-- Verifikasi sync: stock_count harus = jumlah account_stock available
SELECT p.name, p.stock_count AS cached_count,
       COUNT(a.id) FILTER (WHERE a.is_used = false) AS actual_count
FROM products p
LEFT JOIN account_stock a ON a.product_id = p.id
GROUP BY p.id, p.name, p.stock_count
HAVING p.stock_count != COUNT(a.id) FILTER (WHERE a.is_used = false);
-- Jika ada row, berarti trigger sync bermasalah → re-run sync trigger


-- ============================================
-- PESANAN & PAYMENT
-- ============================================

-- Order pending > 30 menit (kemungkinan webhook Midtrans macet)
SELECT id, order_number, total_idr, created_at,
       EXTRACT(EPOCH FROM (NOW() - created_at))/60 AS minutes_waiting
FROM orders
WHERE status = 'pending_payment'
  AND created_at < NOW() - INTERVAL '30 minutes'
ORDER BY created_at ASC;

-- Order gagal delivery
SELECT o.id, o.order_number, o.total_idr, o.paid_at,
       p.name AS product_name
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.status = 'delivery_failed'
ORDER BY o.paid_at DESC;

-- GMV hari ini (hanya status delivered/confirmed)
SELECT
  COUNT(*) AS total_orders,
  COALESCE(SUM(total_idr), 0) AS gmv_today
FROM orders
WHERE status IN ('delivered', 'confirmed')
  AND paid_at >= CURRENT_DATE;

-- GMV 7 hari terakhir per hari
SELECT DATE(paid_at) AS tanggal, COUNT(*) AS orders, SUM(total_idr) AS gmv
FROM orders
WHERE status IN ('delivered', 'confirmed')
  AND paid_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(paid_at)
ORDER BY tanggal DESC;

-- Order yang sudah delivered > 48 jam tapi belum dikonfirmasi buyer (perlu auto-confirm)
SELECT id, order_number, delivered_at,
       EXTRACT(EPOCH FROM (NOW() - delivered_at))/3600 AS hours_since_delivery
FROM orders
WHERE status = 'delivered'
  AND delivered_at < NOW() - INTERVAL '48 hours';


-- ============================================
-- TIKET & GARANSI
-- ============================================

-- Tiket open yang belum direspons > 24 jam (breach SLA)
SELECT t.id, t.reason, t.created_at,
       u.email AS buyer_email,
       p.name AS product_name,
       EXTRACT(EPOCH FROM (NOW() - t.created_at))/3600 AS hours_open
FROM support_tickets t
JOIN profiles u ON t.user_id = u.id
JOIN orders o ON t.order_id = o.id
JOIN products p ON o.product_id = p.id
WHERE t.status = 'open'
  AND t.created_at < NOW() - INTERVAL '24 hours'
ORDER BY t.created_at ASC;


-- ============================================
-- NOTIFIKASI
-- ============================================

-- Notifikasi gagal dalam 24 jam terakhir
SELECT type, channel, recipient, error_msg, created_at
FROM notifications_log
WHERE status = 'failed'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Stats notifikasi per channel hari ini
SELECT channel, status, COUNT(*) AS total
FROM notifications_log
WHERE created_at >= CURRENT_DATE
GROUP BY channel, status
ORDER BY channel, status;


-- ============================================
-- REFERRAL & USER
-- ============================================

-- Top 10 referrer
SELECT p.email, p.referral_code, COUNT(r.id) AS total_referred, 
       SUM(r.credit_amount) AS total_kredit
FROM referrals r
JOIN profiles p ON r.referrer_user_id = p.id
GROUP BY p.id, p.email, p.referral_code
ORDER BY total_referred DESC
LIMIT 10;

-- User dengan kredit tinggi (> 50rb)
SELECT email, credits, created_at
FROM profiles
WHERE credits > 50000
ORDER BY credits DESC;
```

### 4. RLS Cheatsheet

```sql
-- Buyer bisa lihat/edit data sendiri
CREATE POLICY "Buyer self access"
  ON [table_name] FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin bypass RLS (via service_role key di backend)
-- Tidak perlu policy khusus — service_role otomatis bypass semua RLS

-- Public read (misal: products, categories)
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (is_active = true);

-- Insert only (misal: reviews — user bisa create tapi tidak edit)
CREATE POLICY "Buyer can create review"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Buyer read own reviews"
  ON product_reviews FOR SELECT
  USING (auth.uid() = user_id);
```

### 5. Aturan Penting

- **JANGAN** update `account_stock` langsung → selalu via RPC `deliver_order_account`
- **JANGAN** update `products.stock_count` langsung → di-maintain otomatis oleh trigger di `004`
- **JANGAN** jalankan `expire_old_orders()` manual kecuali urgent — ini tugas cron
- **SELALU** gunakan `IF NOT EXISTS` / `IF EXISTS` di migration untuk idempotency
- **SELALU** tambah index untuk kolom yang sering di-WHERE atau JOIN
- File migration baru → nomor urut setelah `012`, prefix `0XX_`

---

## Referensi Dokumen
- Schema lengkap: `supabase/migrations/001` s/d `012`
- RPC guide: `docs/prd.md` Appendix D
- Debugging queries: `docs/prd.md` Appendix D (Pola Debugging SQL Editor)
