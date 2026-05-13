-- Migration: manual payment flow via QRIS GoPay Saya
--
-- Konteks: Duitku reject akun, OkeConnect H2H access butuh CS approval.
-- Pivot ke manual confirmation: buyer transfer pakai QRIS Statis Anda
-- (GoPay Saya), admin verify dari app mutasi.
--
-- Identifikasi otomatis via unique 3-digit suffix di total amount:
--   product_price=75000 → final_amount=75123 (suffix=123)
--   admin liat mutasi Rp 75.123 → cocokkan ke order dengan suffix 123
--
-- Order status flow baru:
--   pending_payment → verifying (buyer klaim) → paid → delivered → confirmed
--                           ↓
--                       cancelled (admin reject)

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_unique_suffix SMALLINT NULL,
  ADD COLUMN IF NOT EXISTS payment_claimed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS payment_rejected_reason TEXT NULL;

COMMENT ON COLUMN orders.payment_unique_suffix IS
  '3-digit suffix (0-999) added to total_idr untuk unique identification di manual QRIS flow';
COMMENT ON COLUMN orders.payment_claimed_at IS
  'Set saat buyer klik "Saya sudah bayar" — status transition pending_payment → verifying';
COMMENT ON COLUMN orders.payment_verified_at IS
  'Set saat admin konfirmasi mutasi cocok — status transition verifying → paid';
COMMENT ON COLUMN orders.payment_rejected_reason IS
  'Alasan kalau admin reject (e.g. "amount tidak ditemukan di mutasi"). Order ke status cancelled.';

-- Unique partial index: tidak boleh 2 pending/verifying order dengan total_idr
-- sama. Defense supaya unique suffix generation tidak collision di runtime.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pending_unique_amount
  ON orders(total_idr)
  WHERE status IN ('pending_payment', 'verifying');

-- Index untuk admin filter status=verifying (sorted by claim time)
CREATE INDEX IF NOT EXISTS idx_orders_verifying
  ON orders(payment_claimed_at)
  WHERE status = 'verifying';
