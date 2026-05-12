-- Migration: track supplier orphan state secara persistent
--
-- Konteks: kalau supplier (Canboso) menghapus produk yang sudah di-link ke
-- produk JualAkun, sync akan terus warning di setiap run — admin bingung
-- "kok orphan terus padahal saya tidak ubah apa-apa?".
--
-- Solusi: persist state orphan di kolom timestamp supaya:
--   1. UI bisa surface "Supplier Hilang sejak X" tanpa wait sync
--   2. Activity log emit `supplier_orphan_detected` event SEKALI saat
--      pertama terdeteksi (bukan tiap sync — hindari spam)
--   3. Admin bisa bulk unmap dengan 1 klik via banner di stok-monitor
--
-- Behavior:
--   - NULL  = produk healthy (mapped + supplier_product_id valid)
--             ATAU produk unmapped (supplier_product_id IS NULL)
--   - Timestamp = supplier_product_id valid tapi tidak ada di supplier API
--                 saat sync terakhir. Set sekali, clear kalau:
--                   (a) produk muncul lagi di supplier (recovered) atau
--                   (b) admin manually unmap

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_orphan_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN products.supplier_orphan_at IS
  'Timestamp saat sync pertama deteksi supplier_product_id tidak ada di supplier API. NULL = healthy / unmapped.';

-- Index untuk cepat query orphan products di stok-monitor page
CREATE INDEX IF NOT EXISTS idx_products_supplier_orphan
  ON products (supplier_orphan_at)
  WHERE supplier_orphan_at IS NOT NULL;
