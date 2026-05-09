-- Migrate payment fields from Midtrans → Duitku.
-- We had no production transactions, so a destructive rename is safe.
--
-- Old (Midtrans Snap):              New (provider-neutral):
--   payment_snap_token VARCHAR(200)   payment_reference VARCHAR(100)
--   payment_snap_url   TEXT           payment_url       TEXT
--
-- payment_provider default flips: 'midtrans' → 'duitku'.
-- payment_status semantics also change ('settlement' → '00' result-code, etc.) —
--   we keep the column type/nullability the same; service code maps Duitku
--   resultCode/transactionStatus into the existing status values.

ALTER TABLE orders
  ALTER COLUMN payment_provider SET DEFAULT 'duitku';

ALTER TABLE orders
  RENAME COLUMN payment_snap_token TO payment_reference;

ALTER TABLE orders
  RENAME COLUMN payment_snap_url TO payment_url;

-- Backfill any existing rows so downstream queries don't break on the
-- column-default change. Safe to run repeatedly.
UPDATE orders
   SET payment_provider = 'duitku'
 WHERE payment_provider = 'midtrans';
