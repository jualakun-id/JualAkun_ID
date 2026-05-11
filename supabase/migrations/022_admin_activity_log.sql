-- =============================================================
-- Migration 022 — Admin Activity Log (unified feed)
-- =============================================================
-- Tabel events untuk admin activity feed di /admin/notifikasi.
-- Beda dengan notifications_log (outgoing email/WA): admin_activity_log
-- adalah event-log internal untuk admin awareness.
--
-- Event types (extendable):
--   - user_registered     → buyer baru daftar
--   - order_created       → buyer create order baru (pending_payment)
--   - order_paid          → callback Duitku: status=paid
--   - order_delivered     → admin fulfill manual
--   - order_refunded      → admin refund
--   - ticket_created      → buyer buat tiket warranty
--   - ticket_resolved     → admin resolve tiket
-- =============================================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT        NOT NULL,
  ref_id      UUID        NULL,
  ref_table   TEXT        NULL,
  title       TEXT        NOT NULL,
  description TEXT        NULL,
  metadata    JSONB       NULL,
  is_read     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_activity_log IS
  'Event-log internal untuk admin activity feed. Distinct dari notifications_log (outgoing email/WA).';

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at
  ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_unread
  ON admin_activity_log(is_read, created_at DESC)
  WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_event_type
  ON admin_activity_log(event_type, created_at DESC);

-- RLS: admin-only via service_role (backend handle)
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_activity_log_service_role_all
  ON admin_activity_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── DB Trigger: auto-log saat profile baru di-create ──────────
-- Registration via Supabase auth, profiles row dibuat via Hono atau via
-- trigger auth.users → profiles. Pakai trigger di profiles supaya gak
-- bergantung ke service code path.
CREATE OR REPLACE FUNCTION public.log_user_registered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_activity_log (event_type, ref_id, ref_table, title, description, metadata)
  VALUES (
    'user_registered',
    NEW.id,
    'profiles',
    'User baru daftar',
    COALESCE(NEW.full_name, 'Buyer baru') || COALESCE(' · ' || NEW.phone_wa, ''),
    jsonb_build_object(
      'full_name', NEW.full_name,
      'phone_wa', NEW.phone_wa,
      'role', NEW.role
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_log_user_registered ON profiles;
CREATE TRIGGER profiles_log_user_registered
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'user' OR NEW.role IS NULL)
  EXECUTE FUNCTION public.log_user_registered();
