-- Migration: opt-in auto-toggle is_active berdasarkan stok supplier
--
-- Konteks: admin sering lupa unchecklist `is_active` saat stok habis,
-- buyer jadi lihat produk "habis" yang tetap muncul di katalog. Sebaliknya
-- saat supplier re-stock, admin harus manual re-publish satu-satu.
--
-- Solusi opt-in: kolom baru `auto_manage_publish` (default FALSE supaya
-- backward compatible — produk lama tetap manual). Saat TRUE:
--   - Stok supplier 0 → cron set is_active = FALSE (hide dari publik)
--   - Stok supplier >0 → cron set is_active = TRUE  (publish lagi)
-- Activity log emit setiap toggle supaya admin bisa trace.
--
-- Frontend default ON saat admin link supplier baru (signal: kalau pakai
-- supplier, admin probably mau auto-manage; bisa di-disable manual kalau
-- perlu sengaja hold draft).
--
-- Produk full manual (supplier_product_id NULL) tidak terpengaruh sama
-- sekali — cron syncStock hanya loop produk dengan supplier link.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS auto_manage_publish BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN products.auto_manage_publish IS
  'Opt-in: kalau TRUE, cron supplier-sync-stock auto-toggle is_active berdasarkan supplier.available. Default FALSE untuk backward compat dengan produk lama yang admin sudah set is_active manual.';
