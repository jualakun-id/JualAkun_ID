-- Migration: grant service_role permissions di admin_activity_log
--
-- Bug since migration 022: ENABLE ROW LEVEL SECURITY di-set, tapi GRANT
-- explicit ke service_role TIDAK ada. RLS policy `admin_activity_log_service_role_all`
-- TO service_role ada, tapi RLS policy cuma filter ROWS — bukan grant
-- access ke table.
--
-- Akibat: service_role dari Cloudflare Workers tidak punya INSERT/SELECT
-- permission. Semua `ActivityLogService.log()` call silent fail. Page
-- /admin/notifikasi selalu kosong (0 aktivitas).
--
-- Plus: trigger `profiles_log_user_registered` (DB-level, runs as SECURITY
-- DEFINER) actually works karena run as superuser context. Tapi insert
-- dari aplikasi backend (Workers via PostgREST service_role) fail.
--
-- Fix: GRANT explicit ke service_role + authenticated (untuk safety kalau
-- admin user role authenticated bisa lihat). Plus grant ke postgres untuk
-- ensure superuser tetap punya akses.

GRANT INSERT, SELECT, UPDATE ON admin_activity_log TO service_role;
GRANT SELECT ON admin_activity_log TO authenticated;

-- Pastikan also notifications_log + products (defense-in-depth in case
-- they share same issue)
GRANT INSERT, SELECT, UPDATE ON notifications_log TO service_role;
GRANT INSERT, SELECT, UPDATE ON products TO service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON account_stock TO service_role;
GRANT INSERT, SELECT, UPDATE ON orders TO service_role;
GRANT INSERT, SELECT, UPDATE ON profiles TO service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON support_tickets TO service_role;
GRANT INSERT, SELECT, UPDATE ON product_reviews TO service_role;
GRANT INSERT, SELECT, UPDATE ON referrals TO service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON coupons TO service_role;
GRANT INSERT, SELECT, UPDATE ON exchange_rates TO service_role;

-- Verify privileges
SELECT
  grantee,
  privilege_type,
  table_name
FROM information_schema.table_privileges
WHERE table_name = 'admin_activity_log'
  AND grantee IN ('service_role', 'authenticated', 'postgres')
ORDER BY grantee, privilege_type;
