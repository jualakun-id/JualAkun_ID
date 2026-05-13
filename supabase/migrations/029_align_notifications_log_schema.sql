-- Migration: align notifications_log schema dengan backend code
--
-- Bug awal: schema (migration 008) pakai column `type` + `error_msg`, tapi
-- backend NotificationService.logNotification insert pakai `template` +
-- `error`. Mismatch → INSERT silent fail (await tanpa error throw karena
-- Supabase client return error object yang tidak di-handle).
--
-- Effect: semua log notifikasi sejak awal tidak tersimpan di DB. Tidak bisa
-- diagnose WA/email failure dari /admin/notifikasi feed. Cron retry-
-- notifications juga tidak punya data untuk retry.
--
-- Fix: rename column supaya match dengan kode (rather than ubah kode,
-- karena kode sudah deployed di banyak tempat). Plus drop NOT NULL untuk
-- recipient + payload supaya minimal log entry boleh tersimpan.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications_log' AND column_name = 'type'
  ) THEN
    ALTER TABLE notifications_log RENAME COLUMN type TO template;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications_log' AND column_name = 'error_msg'
  ) THEN
    ALTER TABLE notifications_log RENAME COLUMN error_msg TO error;
  END IF;
END $$;

-- Recipient + payload opsional supaya minimal insert (cuma user_id, order_id,
-- channel, template, status, error) bisa lewat. Backend tidak isi recipient/
-- payload — itu legacy field yang sebenarnya tidak dipakai.
ALTER TABLE notifications_log ALTER COLUMN recipient DROP NOT NULL;
ALTER TABLE notifications_log ALTER COLUMN payload DROP NOT NULL;

-- Verify schema sekarang punya kolom yang benar
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications_log'
ORDER BY ordinal_position;
