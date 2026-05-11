-- =============================================================
-- Migration 019 — Supplier mapping (Canboso Telegram Buyer API)
-- =============================================================
-- Each product di JualAkun bisa di-link ke product Canboso supplier
-- via supplier_product_id. Saat sync stock, display_stock = supplier's
-- stats.available. Saat fulfill, admin bisa klik "Beli dari Supplier"
-- untuk auto-purchase + autofill credentials response.
-- =============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_product_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS supplier_synced_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN products.supplier_product_id IS
  'Canboso _id (ObjectId hex). NULL = produk tidak terhubung ke supplier (display_stock & fulfill full manual).';
COMMENT ON COLUMN products.supplier_synced_at IS
  'Timestamp terakhir display_stock di-sync dari supplier stats.available.';

-- Index untuk batch sync — cepat fetch semua produk yang punya supplier mapping
CREATE INDEX IF NOT EXISTS idx_products_supplier_product_id
  ON products(supplier_product_id)
  WHERE supplier_product_id IS NOT NULL;
