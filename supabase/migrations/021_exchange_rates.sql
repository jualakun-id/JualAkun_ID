-- =============================================================
-- Migration 021 — Exchange rates (dynamic config)
-- =============================================================
-- Sebelumnya USD_IDR_RATE hardcode const di code. Migrasi ke DB-driven
-- supaya admin bisa update kurs dari UI tanpa redeploy.
--
-- Historis aman: orders.cost_idr sudah snapshot (INTEGER fix value).
-- Perubahan kurs hanya berlaku untuk fulfill BERIKUTNYA, order lama
-- tetap pakai cost_idr yang dulu di-record.
-- =============================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  pair         TEXT        PRIMARY KEY,
  rate         NUMERIC(12,4) NOT NULL CHECK (rate > 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   UUID        NULL,
  notes        TEXT        NULL
);

COMMENT ON TABLE exchange_rates IS
  'Kurs currency pair yang dipakai konversi modal supplier → IDR. Snapshot per-order tersimpan di orders.cost_idr supaya laporan historis tidak terdistorsi oleh perubahan kurs.';

-- Seed initial rate (USD → IDR = 18000, Binance USDT top-up rate 2026-05)
INSERT INTO exchange_rates (pair, rate, notes)
VALUES ('USD_IDR', 18000, 'Initial rate dari const supplier.service.ts (Binance USDT top-up 2026-05)')
ON CONFLICT (pair) DO NOTHING;

-- RLS: admin-only access via service_role (backend handle)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY exchange_rates_service_role_all
  ON exchange_rates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
