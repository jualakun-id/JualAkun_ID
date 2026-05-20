-- =============================================================
-- Migration 034 — Harden search_path semua fungsi SECURITY DEFINER
-- =============================================================
-- Konteks: insiden "Database error saving new user" (lihat 032 & 033)
-- terjadi karena handle_new_user() diberi `SET search_path = ''` (via
-- Supabase advisor auto-fix "Function Search Path Mutable") sementara
-- fungsi/trigger bersarang masih memakai nama tabel tanpa prefix schema.
--
-- 14 fungsi SECURITY DEFINER lain SAAT INI masih jalan karena dipanggil
-- backend dengan koneksi yang search_path-nya termasuk `public`. Tapi
-- mereka rapuh: begitu salah satunya diberi `SET search_path = ''` (atau
-- dipanggil dari konteks ber-search_path kosong), semua referensi tabel
-- tanpa prefix langsung gagal resolve.
--
-- Fix permanen: untuk SETIAP fungsi —
--   1. Pin `SET search_path = ''` (memenuhi advisor, deterministik).
--   2. Schema-qualify SEMUA referensi tabel public jadi `public.<tabel>`.
-- Built-in (jsonb_*, COALESCE, NOW, COUNT, dst.) tetap resolve via
-- pg_catalog yang selalu implicit. CTE & alias tidak diubah.
--
-- Logika fungsi TIDAK diubah sama sekali — murni hardening.
-- =============================================================

-- ── RPC 1: deliver_order_account (FIFO delivery — KRITIS) ─────
CREATE OR REPLACE FUNCTION deliver_order_account(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order        RECORD;
  v_stock        RECORD;
  v_guarantee_at TIMESTAMPTZ;
BEGIN
  -- 1. Validasi order
  SELECT * INTO v_order FROM public.orders
  WHERE id = p_order_id AND status = 'paid'
  FOR UPDATE;  -- lock order row

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND_OR_NOT_PAID');
  END IF;

  -- 2. Ambil stok FIFO dengan row-level lock (cegah concurrent duplicate)
  SELECT * INTO v_stock FROM public.account_stock
  WHERE product_id = v_order.product_id
    AND is_used = false
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    -- Stok habis mendadak — tandai delivery_failed
    UPDATE public.orders SET status = 'delivery_failed', updated_at = NOW()
    WHERE id = p_order_id;
    RETURN jsonb_build_object('ok', false, 'code', 'OUT_OF_STOCK');
  END IF;

  -- 3. Mark stok sebagai terpakai
  UPDATE public.account_stock
  SET is_used = true, used_at = NOW(), order_id = p_order_id
  WHERE id = v_stock.id;

  -- 4. Hitung tanggal garansi
  v_guarantee_at := NOW() + (
    SELECT guarantee_days || ' days' FROM public.products WHERE id = v_order.product_id
  )::interval;

  -- 5. Update order → delivered
  UPDATE public.orders SET
    status               = 'delivered',
    account_stock_id     = v_stock.id,
    delivered_at         = NOW(),
    guarantee_expires_at = v_guarantee_at,
    updated_at           = NOW()
  WHERE id = p_order_id;

  -- 6. Increment sold_count produk
  UPDATE public.products SET sold_count = sold_count + 1
  WHERE id = v_order.product_id;

  RETURN jsonb_build_object(
    'ok',                  true,
    'order_id',            p_order_id,
    'account_stock_id',    v_stock.id,
    'credentials_enc',     v_stock.credentials_enc,
    'note',                v_stock.note,
    'guarantee_expires_at', v_guarantee_at
  );
END;
$$;

-- ── RPC 2: confirm_order_received ─────────────────────────────
CREATE OR REPLACE FUNCTION confirm_order_received(p_order_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.orders SET
    status             = 'confirmed',
    buyer_confirmed_at = NOW(),
    updated_at         = NOW()
  WHERE id = p_order_id
    AND user_id = p_user_id
    AND status = 'delivered';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND_OR_INVALID_STATUS');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ── RPC 3: validate_coupon ────────────────────────────────────
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code       VARCHAR,
  p_product_id UUID,
  p_amount_idr INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_coupon     RECORD;
  v_discount   INT := 0;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons
  WHERE code = upper(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR used_count < max_uses);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'COUPON_INVALID');
  END IF;

  -- Cek apakah produk masuk scope kupon
  IF v_coupon.valid_for_products IS NOT NULL
    AND NOT (p_product_id = ANY(v_coupon.valid_for_products)) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'COUPON_NOT_VALID_FOR_PRODUCT');
  END IF;

  -- Hitung diskon
  IF v_coupon.discount_type = 'percent' THEN
    v_discount := (p_amount_idr * v_coupon.discount_value / 100)::int;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;

  v_discount := LEAST(v_discount, p_amount_idr);  -- tidak melebihi harga

  RETURN jsonb_build_object(
    'ok',             true,
    'coupon_id',      v_coupon.id,
    'discount_type',  v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'discount_idr',   v_discount,
    'final_idr',      p_amount_idr - v_discount
  );
END;
$$;

-- ── RPC 4: increment_coupon_usage ─────────────────────────────
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = upper(p_code)
    AND (max_uses IS NULL OR used_count < max_uses);
END;
$$;

-- ── RPC 5: credit_referral ────────────────────────────────────
CREATE OR REPLACE FUNCTION credit_referral(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order    RECORD;
  v_referral RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id AND status = 'delivered';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_ELIGIBLE');
  END IF;

  -- Cek apakah ini transaksi pertama referred user
  IF (SELECT COUNT(*) FROM public.orders WHERE user_id = v_order.user_id AND status IN ('delivered','confirmed')) > 1 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FIRST_ORDER');
  END IF;

  -- Cari referral record
  SELECT * INTO v_referral FROM public.referrals
  WHERE referred_user_id = v_order.user_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NO_REFERRAL');
  END IF;

  -- Update referral
  UPDATE public.referrals SET
    order_id    = p_order_id,
    status      = 'credited',
    credited_at = NOW()
  WHERE id = v_referral.id;

  -- Tambah kredit ke referrer
  UPDATE public.profiles SET
    credits = credits + v_referral.credit_amount
  WHERE id = v_referral.referrer_user_id;

  RETURN jsonb_build_object(
    'ok',            true,
    'referrer_id',   v_referral.referrer_user_id,
    'credit_amount', v_referral.credit_amount
  );
END;
$$;

-- ── RPC 6: get_buyer_dashboard ────────────────────────────────
CREATE OR REPLACE FUNCTION get_buyer_dashboard(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'full_name',     p.full_name,
        'email',         u.email,
        'phone_wa',      p.phone_wa,
        'referral_code', p.referral_code,
        'credits',       p.credits,
        'joined_at',     p.joined_at
      )
      FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
      WHERE p.id = p_user_id
    ),
    'orders', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id',                  o.id,
          'order_number',        o.order_number,
          'product_name',        pr.name,
          'product_thumbnail',   pr.thumbnail_url,
          'total_idr',           o.total_idr,
          'status',              o.status,
          'delivered_at',        o.delivered_at,
          'guarantee_expires_at', o.guarantee_expires_at,
          'buyer_confirmed_at',  o.buyer_confirmed_at,
          'created_at',          o.created_at
        ) ORDER BY o.created_at DESC
      ), '[]'::jsonb)
      FROM public.orders o
      JOIN public.products pr ON pr.id = o.product_id
      WHERE o.user_id = p_user_id
    ),
    'referral_stats', (
      SELECT jsonb_build_object(
        'total_referrals', COUNT(*),
        'credited',        COUNT(*) FILTER (WHERE status = 'credited'),
        'pending',         COUNT(*) FILTER (WHERE status = 'pending'),
        'total_earned',    COALESCE(SUM(credit_amount) FILTER (WHERE status = 'credited'), 0)
      )
      FROM public.referrals WHERE referrer_user_id = p_user_id
    )
  );
END;
$$;

-- ── RPC 7: get_order_credentials ──────────────────────────────
CREATE OR REPLACE FUNCTION get_order_credentials(p_order_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_stock RECORD;
BEGIN
  SELECT o.*, a.credentials_enc, a.note
  INTO v_order
  FROM public.orders o
  JOIN public.account_stock a ON a.id = o.account_stock_id
  WHERE o.id = p_order_id
    AND o.user_id = p_user_id
    AND o.status IN ('delivered', 'confirmed');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND_OR_UNAUTHORIZED');
  END IF;

  RETURN jsonb_build_object(
    'ok',              true,
    'credentials_enc', v_order.credentials_enc,  -- dekripsi di backend layer
    'note',            v_order.note,
    'guarantee_expires_at', v_order.guarantee_expires_at
  );
END;
$$;

-- ── RPC 8: get_admin_kpis ─────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_kpis()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'revenue', jsonb_build_object(
      'today',      (SELECT COALESCE(SUM(total_idr),0) FROM public.orders WHERE status IN ('delivered','confirmed') AND paid_at >= CURRENT_DATE),
      'this_month', (SELECT COALESCE(SUM(total_idr),0) FROM public.orders WHERE status IN ('delivered','confirmed') AND paid_at >= DATE_TRUNC('month', NOW())),
      'last_month', (SELECT COALESCE(SUM(total_idr),0) FROM public.orders WHERE status IN ('delivered','confirmed') AND paid_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND paid_at < DATE_TRUNC('month', NOW()))
    ),
    'orders', jsonb_build_object(
      'pending_payment',  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending_payment'),
      'paid',             (SELECT COUNT(*) FROM public.orders WHERE status = 'paid'),
      'delivery_failed',  (SELECT COUNT(*) FROM public.orders WHERE status = 'delivery_failed'),
      'today_total',      (SELECT COUNT(*) FROM public.orders WHERE created_at >= CURRENT_DATE)
    ),
    'users', jsonb_build_object(
      'total',        (SELECT COUNT(*) FROM public.profiles WHERE role = 'user'),
      'new_today',    (SELECT COUNT(*) FROM public.profiles WHERE role = 'user' AND joined_at >= CURRENT_DATE),
      'new_this_week',(SELECT COUNT(*) FROM public.profiles WHERE role = 'user' AND joined_at >= NOW() - INTERVAL '7 days')
    ),
    'stock', jsonb_build_object(
      'critical', (SELECT COUNT(*) FROM public.products WHERE is_active = true AND stock_count <= 5),
      'out',      (SELECT COUNT(*) FROM public.products WHERE is_active = true AND stock_count = 0)
    ),
    'tickets', jsonb_build_object(
      'open', (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open')
    )
  );
END;
$$;

-- ── RPC 9: expire_old_orders (cron) ───────────────────────────
CREATE OR REPLACE FUNCTION expire_old_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.orders SET
    status     = 'expired',
    updated_at = NOW()
  WHERE status = 'pending_payment'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object('ok', true, 'expired_count', v_count);
END;
$$;

-- ── RPC 10: deduct_user_credits ───────────────────────────────
CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id UUID, p_amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current INT;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_AMOUNT');
  END IF;

  SELECT credits INTO v_current FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PROFILE_NOT_FOUND');
  END IF;

  IF v_current < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_CREDITS', 'available', v_current);
  END IF;

  UPDATE public.profiles SET credits = credits - p_amount WHERE id = p_user_id;
  RETURN jsonb_build_object('ok', true, 'remaining', v_current - p_amount);
END;
$$;

-- ── RPC 11: get_catalog_listing ───────────────────────────────
-- Body memakai versi ter-deploy (sudah termasuk field diskon dari 017).
CREATE OR REPLACE FUNCTION get_catalog_listing(
  p_category_slug TEXT DEFAULT NULL,
  p_min_price     INT  DEFAULT NULL,
  p_max_price     INT  DEFAULT NULL,
  p_duration_days INT  DEFAULT NULL,
  p_sort          TEXT DEFAULT 'sold_count',
  p_page          INT  DEFAULT 1,
  p_limit         INT  DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT := (p_page - 1) * p_limit;
  v_total  INT;
  v_rows   JSONB;
BEGIN
  WITH filtered AS (
    SELECT pr.*, c.name AS cat_name, c.slug AS cat_slug
    FROM public.products pr
    JOIN public.categories c ON c.id = pr.category_id
    WHERE pr.is_active = true
      AND (p_category_slug IS NULL OR c.slug = p_category_slug)
      AND (p_min_price IS NULL OR pr.price >= p_min_price)
      AND (p_max_price IS NULL OR pr.price <= p_max_price)
      AND (p_duration_days IS NULL OR pr.duration_days = p_duration_days)
  ),
  counted AS (
    SELECT COUNT(*)::int AS total FROM filtered
  ),
  sorted AS (
    SELECT * FROM filtered
    ORDER BY
      CASE WHEN p_sort = 'sold_count'  THEN sold_count END DESC NULLS LAST,
      CASE WHEN p_sort = 'price_asc'   THEN price      END ASC  NULLS LAST,
      CASE WHEN p_sort = 'price_desc'  THEN price      END DESC NULLS LAST,
      CASE WHEN p_sort = 'newest'      THEN created_at END DESC NULLS LAST,
      sold_count DESC
    LIMIT p_limit OFFSET v_offset
  )
  SELECT (SELECT total FROM counted),
         COALESCE(jsonb_agg(jsonb_build_object(
           'id', id, 'name', name, 'slug', slug,
           'thumbnail_url', thumbnail_url,
           'price', price,
           'original_price', original_price,
           'discount_starts_at', discount_starts_at,
           'discount_ends_at', discount_ends_at,
           'duration_days', duration_days,
           'guarantee_days', guarantee_days,
           'stock_count', stock_count, 'sold_count', sold_count,
           'rating_avg', rating_avg, 'rating_count', rating_count,
           'category', jsonb_build_object('name', cat_name, 'slug', cat_slug)
         )), '[]'::jsonb)
  INTO v_total, v_rows
  FROM sorted;

  RETURN jsonb_build_object(
    'products', v_rows,
    'pagination', jsonb_build_object(
      'page', p_page, 'limit', p_limit,
      'total', v_total,
      'total_pages', CEIL(v_total::numeric / p_limit)::int
    )
  );
END;
$$;

-- ── RPC 12: decrement_display_stock ───────────────────────────
CREATE OR REPLACE FUNCTION public.decrement_display_stock(p_product_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_stock INTEGER;
BEGIN
  UPDATE public.products
  SET display_stock = GREATEST(display_stock - 1, 0)
  WHERE id = p_product_id
  RETURNING display_stock INTO v_new_stock;
  RETURN COALESCE(v_new_stock, 0);
END;
$$;

-- ── RPC 13: cleanup_old_activity_log (cron) ───────────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_log(
  p_retention_days INT DEFAULT 90,
  p_batch_size INT DEFAULT 1000
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_deleted INT;
BEGIN
  v_cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;
  WITH old_rows AS (
    SELECT id FROM public.admin_activity_log
    WHERE created_at < v_cutoff
    ORDER BY created_at
    LIMIT p_batch_size
  )
  DELETE FROM public.admin_activity_log
  WHERE id IN (SELECT id FROM old_rows);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ── RPC 14: cleanup_old_notifications_log (cron) ──────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications_log(
  p_retention_days INT DEFAULT 90,
  p_batch_size INT DEFAULT 1000
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_deleted INT;
BEGIN
  v_cutoff := NOW() - (p_retention_days || ' days')::INTERVAL;
  WITH old_rows AS (
    SELECT id FROM public.notifications_log
    WHERE created_at < v_cutoff
    ORDER BY created_at
    LIMIT p_batch_size
  )
  DELETE FROM public.notifications_log
  WHERE id IN (SELECT id FROM old_rows);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
