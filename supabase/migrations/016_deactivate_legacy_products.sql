-- =============================================================
-- Migration 016 — Deactivate legacy products from old categories
-- =============================================================
-- Run via Supabase SQL Editor.
--
-- Reason:
--   Migration 015 deactivated OLD CATEGORIES (streaming/gaming/vpn/edukasi/ai-produktif)
--   but did NOT deactivate the products inside them. As a result:
--     - sitemap.xml masih nge-include /produk/netflix-premium-1-bulan dll
--     - Google indexes URL produk yg seharusnya tidak muncul lagi
--     - llms.txt context jadi inkonsisten dgn realitas product list
--
-- Effect:
--   Set is_active = false untuk semua produk yang masih bernaung di
--   kategori-kategori legacy. Setelah migration ini di-apply, sitemap
--   regenerate (revalidate=3600) dan hanya 16 produk baru yang ter-list.
-- =============================================================

UPDATE products
SET is_active = false
WHERE category_id IN (
  SELECT id FROM categories
  WHERE slug IN ('streaming', 'gaming', 'ai-produktif', 'vpn', 'edukasi')
);

-- Verifikasi: hitung berapa yg masih aktif (harus 16)
-- SELECT COUNT(*) FROM products WHERE is_active = true;
