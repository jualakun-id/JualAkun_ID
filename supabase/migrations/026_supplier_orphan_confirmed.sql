-- Migration: 2-stage orphan detection — detected vs confirmed
--
-- Konteks: dari migration 025, kita track `supplier_orphan_at` (first time
-- miss detected). Tapi ini bisa false positive — kalau Canboso API temporary
-- glitch (lambat / partial response), 1 run miss bisa mark produk orphan
-- padahal sebenarnya healthy.
--
-- Solusi 2-stage:
--   - supplier_orphan_at:           set saat first miss (observation window)
--   - supplier_orphan_confirmed_at: set saat miss persistent ≥30 menit
--                                   (≈3 sync runs di cron 10 menit interval)
--
-- Banner stok-monitor + Auto-fix endpoint cuma proses CONFIRMED orphan.
-- Young orphan (sudah miss tapi <30 menit) di-hide dari UI untuk avoid
-- premature panic. Activity log emit `supplier_orphan_detected` SEKALI
-- pada transisi detected → confirmed.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_orphan_confirmed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN products.supplier_orphan_confirmed_at IS
  'Set saat sync confirms supplier_product_id missing untuk >=30 menit (≈3 sync runs). Banner & Auto-fix hanya proses confirmed orphan. NULL = healthy / young orphan / unmapped.';

-- Update partial index untuk include confirmed_at supaya query banner cepat
DROP INDEX IF EXISTS idx_products_supplier_orphan;
CREATE INDEX IF NOT EXISTS idx_products_supplier_orphan_confirmed
  ON products (supplier_orphan_confirmed_at)
  WHERE supplier_orphan_confirmed_at IS NOT NULL;
