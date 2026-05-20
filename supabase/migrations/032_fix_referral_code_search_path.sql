-- Fix: registrasi user baru gagal dengan "Database error saving new user"
--
-- Akar masalah:
--   auth.users punya trigger on_auth_user_created -> handle_new_user(), yang
--   di-declare `SECURITY DEFINER SET search_path = ''`. handle_new_user()
--   memanggil generate_referral_code(). Fungsi generate_referral_code() TIDAK
--   punya `SET search_path` sendiri, jadi ia mewarisi search_path kosong dari
--   pemanggilnya. Akibatnya `SELECT ... FROM profiles` (tanpa prefix schema)
--   tidak bisa me-resolve nama tabel -> "relation profiles does not exist" ->
--   trigger gagal -> seluruh INSERT auth.users di-rollback -> Supabase Auth
--   mengembalikan "Database error saving new user".
--
-- Fix:
--   1. Schema-qualify tabel jadi `public.profiles`.
--   2. Pin `SET search_path = ''` eksplisit di generate_referral_code() supaya
--      perilakunya deterministik (md5/random/upper/substring tetap resolve via
--      pg_catalog yang selalu implicit di search_path).

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS VARCHAR
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_code VARCHAR;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := upper(substring(md5(random()::text) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;
