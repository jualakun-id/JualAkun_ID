-- Fix lanjutan: registrasi user baru MASIH gagal "Database error saving new
-- user" setelah migration 032.
--
-- Akar masalah (penyebab kedua, pola sama dengan 032):
--   handle_new_user() [SET search_path = ''] meng-INSERT ke public.profiles.
--   INSERT itu memicu trigger AFTER INSERT `profiles_log_user_registered`
--   yang menjalankan log_user_registered(). Fungsi log_user_registered()
--   TIDAK punya `SET search_path` sendiri, jadi mewarisi search_path kosong
--   dari konteks handle_new_user yang sedang berjalan.
--
--   Di dalamnya `INSERT INTO admin_activity_log` ditulis TANPA prefix schema
--   -> dengan search_path kosong nama tabel tidak ter-resolve -> trigger
--   gagal -> seluruh INSERT auth.users di-rollback -> Supabase Auth balikan
--   "Database error saving new user".
--
-- Fix: schema-qualify `public.admin_activity_log` + pin `SET search_path = ''`
-- eksplisit (COALESCE / jsonb_build_object adalah built-in pg_catalog, tetap
-- resolve walau search_path kosong).

CREATE OR REPLACE FUNCTION public.log_user_registered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.admin_activity_log (event_type, ref_id, ref_table, title, description, metadata)
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
