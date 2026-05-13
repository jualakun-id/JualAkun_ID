-- Migration: backfill orders.account_stock_id untuk order yang sudah delivered
-- tapi belum di-link ke account_stock row (akibat bug di fulfillManual yang
-- tidak set account_stock_id saat update).
--
-- Effect bug:
--   - RPC get_order_credentials JOIN via o.account_stock_id → NULL → buyer
--     dapat "Akses ditolak atau order belum dikirim" walaupun order sudah
--     status delivered/confirmed
--   - notifyBuyerDelivered embed account_stock return null → silent skip
--     kirim notif credentials via WA + email
--
-- Backfill: untuk setiap order delivered/confirmed yang account_stock_id-nya
-- NULL, cari row di account_stock dengan order_id matching, lalu set
-- orders.account_stock_id = account_stock.id.

UPDATE orders o
SET account_stock_id = a.id
FROM account_stock a
WHERE a.order_id = o.id
  AND o.status IN ('delivered', 'confirmed')
  AND o.account_stock_id IS NULL;

-- Verify count of orders yang berhasil di-backfill
SELECT
  COUNT(*) FILTER (WHERE account_stock_id IS NOT NULL) AS linked_orders,
  COUNT(*) FILTER (WHERE account_stock_id IS NULL) AS still_unlinked,
  COUNT(*) AS total_delivered_or_confirmed
FROM orders
WHERE status IN ('delivered', 'confirmed');
