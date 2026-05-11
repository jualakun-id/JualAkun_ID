-- =============================================================
-- Migration 018 — Manual Fulfillment + display_stock column
-- =============================================================
-- Switch from pre-stocked FIFO to manual fulfillment:
-- - Admin tidak lagi pre-load credentials ke account_stock
-- - Buyer paid → status 'paid' (NOT auto-deliver)
-- - Admin manual input credentials saat fulfill via admin panel
-- - account_stock tetap dipakai untuk audit (record per-order)
--
-- display_stock = angka tampilan di halaman publik (admin-controlled).
-- Terpisah dari stock_count (auto-computed dari account_stock).
-- =============================================================

-- ── Step 1: Add display_stock column ──────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS display_stock INTEGER NOT NULL DEFAULT 0
  CHECK (display_stock >= 0);

COMMENT ON COLUMN products.display_stock IS
  'Angka stok tampilan publik (admin-managed). Berbeda dari stock_count yang auto-computed dari account_stock. Decrement -1 otomatis saat admin fulfill order.';

-- ── Step 2: Backfill display_stock untuk produk existing ──────
-- Default 0 (sesuai model on-demand). Admin akan set angka sendiri.
-- Tidak backfill dari stock_count karena dalam model baru, stock_count
-- biasanya 0 (no pre-stock).

-- ── Step 3: RPC untuk atomic decrement saat fulfill ───────────
CREATE OR REPLACE FUNCTION public.decrement_display_stock(p_product_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock INTEGER;
BEGIN
  UPDATE products
  SET display_stock = GREATEST(display_stock - 1, 0)
  WHERE id = p_product_id
  RETURNING display_stock INTO v_new_stock;

  RETURN COALESCE(v_new_stock, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_display_stock(UUID) TO authenticated, service_role;
