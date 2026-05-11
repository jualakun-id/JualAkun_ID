-- =============================================================
-- Migration 020 — Cost tracking di orders (modal vs revenue)
-- =============================================================
-- Saat admin fulfill order, capture modal pembelian (cost) supaya bisa hitung
-- profit & margin. Sumber cost: supplier API (Canboso) atau manual input.
-- =============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cost_idr INTEGER NULL CHECK (cost_idr IS NULL OR cost_idr >= 0),
  ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10,4) NULL CHECK (cost_usd IS NULL OR cost_usd >= 0),
  ADD COLUMN IF NOT EXISTS cost_source TEXT NULL;

COMMENT ON COLUMN orders.cost_idr IS
  'Modal pembelian dari supplier/manual saat fulfill (IDR). NULL untuk order pre-migration / belum fulfilled.';
COMMENT ON COLUMN orders.cost_usd IS
  'Modal asli USD kalau dari supplier (untuk trend analysis pricing).';
COMMENT ON COLUMN orders.cost_source IS
  'supplier_canboso | manual | unknown';

-- Index untuk query analytics (profit per periode) — fast scan delivered orders dengan cost
CREATE INDEX IF NOT EXISTS idx_orders_delivered_cost
  ON orders(delivered_at DESC, product_id)
  WHERE delivered_at IS NOT NULL AND cost_idr IS NOT NULL;
