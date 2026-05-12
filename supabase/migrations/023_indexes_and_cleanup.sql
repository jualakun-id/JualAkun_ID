-- =============================================================
-- Migration 023 — Performance indexes + cleanup utilities
-- =============================================================
-- Dari audit:
--  - Action Center query (paid order > X jam) butuh composite index
--  - admin_activity_log & notifications_log akan grow forever — perlu
--    retention cleanup (90 hari) via cron
-- =============================================================

-- ── Composite indexes untuk operational query ─────────────────
CREATE INDEX IF NOT EXISTS idx_orders_status_paid_at
  ON orders(status, paid_at DESC)
  WHERE paid_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created_at
  ON support_tickets(status, created_at DESC);

-- ── Cleanup helper functions (called by cron) ─────────────────
-- Retention 90 hari supaya tabel gak grow unbounded.
-- DELETE bisa lambat di Postgres kalau row banyak — pakai batching via LIMIT
-- supaya gak block transaction lama. Cron call ini per 30 menit, akan
-- cleanup max 1000 row per panggilan.

CREATE OR REPLACE FUNCTION public.cleanup_old_activity_log(
  p_retention_days INT DEFAULT 90,
  p_batch_size INT DEFAULT 1000
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_deleted INT;
BEGIN
  v_cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;
  WITH old_rows AS (
    SELECT id FROM admin_activity_log
    WHERE created_at < v_cutoff
    ORDER BY created_at
    LIMIT p_batch_size
  )
  DELETE FROM admin_activity_log
  WHERE id IN (SELECT id FROM old_rows);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications_log(
  p_retention_days INT DEFAULT 90,
  p_batch_size INT DEFAULT 1000
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_deleted INT;
BEGIN
  v_cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;
  WITH old_rows AS (
    SELECT id FROM notifications_log
    WHERE created_at < v_cutoff
    ORDER BY created_at
    LIMIT p_batch_size
  )
  DELETE FROM notifications_log
  WHERE id IN (SELECT id FROM old_rows);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_old_activity_log(INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications_log(INT, INT) TO service_role;
