-- Migration: normalize supplier_product_id empty string → NULL
--
-- Konteks: form admin dropdown "Tidak pakai supplier (full manual)" punya
-- value="" (empty string). Sebelum patch backend (Zod transform), kalau user
-- pilih opsi itu, kadang data tersimpan sebagai '' (empty string) di DB,
-- bukan NULL — frontend kirim `null` tapi sebagian Supabase client/version
-- malah store '' depending on schema.
--
-- Query syncStock filter dengan `.not('supplier_product_id', 'is', null)` —
-- empty string '' BUKAN null, jadi tetap masuk list sync → muncul orphan
-- saat sync supplier walaupun admin sudah unset.
--
-- Fix: normalize semua empty/whitespace string ke NULL. Schema admin/products
-- route sekarang transform "" → null jadi data baru aman.

UPDATE products
SET supplier_product_id = NULL
WHERE supplier_product_id IS NOT NULL
  AND trim(supplier_product_id) = '';

-- Optional: add CHECK constraint supaya empty string tidak bisa masuk lagi
-- via raw SQL atau direct DB write yang skip Zod validation di backend.
ALTER TABLE products
  ADD CONSTRAINT supplier_product_id_not_empty
  CHECK (supplier_product_id IS NULL OR length(trim(supplier_product_id)) > 0);
