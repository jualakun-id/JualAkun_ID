-- ============================================================
-- RPC 1: deliver_order_account
-- Ambil 1 stok akun (FIFO) dan assign ke order secara atomic
-- Dipanggil oleh backend setelah webhook Midtrans settlement
-- ============================================================
CREATE OR REPLACE FUNCTION deliver_order_account(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order        RECORD;
  v_stock        RECORD;
  v_guarantee_at TIMESTAMPTZ;
BEGIN
  -- 1. Validasi order
  SELECT * INTO v_order FROM orders
  WHERE id = p_order_id AND status = 'paid'
  FOR UPDATE;  -- lock order row

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_FOUND_OR_NOT_PAID');
  END IF;

  -- 2. Ambil stok FIFO dengan row-level lock (cegah concurrent duplicate)
  SELECT * INTO v_stock FROM account_stock
  WHERE product_id = v_order.product_id
    AND is_used = false
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    -- Stok habis mendadak — tandai delivery_failed
    UPDATE orders SET status = 'delivery_failed', updated_at = NOW()
    WHERE id = p_order_id;
    RETURN jsonb_build_object('ok', false, 'code', 'OUT_OF_STOCK');
  END IF;

  -- 3. Mark stok sebagai terpakai
  UPDATE account_stock
  SET is_used = true, used_at = NOW(), order_id = p_order_id
  WHERE id = v_stock.id;

  -- 4. Hitung tanggal garansi
  v_guarantee_at := NOW() + (
    SELECT guarantee_days || ' days' FROM products WHERE id = v_order.product_id
  )::interval;

  -- 5. Update order → delivered
  UPDATE orders SET
    status               = 'delivered',
    account_stock_id     = v_stock.id,
    delivered_at         = NOW(),
    guarantee_expires_at = v_guarantee_at,
    updated_at           = NOW()
  WHERE id = p_order_id;

  -- 6. Increment sold_count produk
  UPDATE products SET sold_count = sold_count + 1
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

-- ============================================================
-- RPC 2: confirm_order_received
-- Buyer konfirmasi akun diterima → garansi aktif resmi
-- ============================================================
CREATE OR REPLACE FUNCTION confirm_order_received(p_order_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders SET
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

-- ============================================================
-- RPC 3: validate_coupon
-- Validasi kode kupon dan hitung diskon
-- ============================================================
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code       VARCHAR,
  p_product_id UUID,
  p_amount_idr INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon     RECORD;
  v_discount   INT := 0;
BEGIN
  SELECT * INTO v_coupon FROM coupons
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

-- ============================================================
-- RPC 4: increment_coupon_usage (atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = upper(p_code)
    AND (max_uses IS NULL OR used_count < max_uses);
END;
$$;

-- ============================================================
-- RPC 5: credit_referral
-- Beri kredit ke referrer setelah referred user transaksi pertama
-- ============================================================
CREATE OR REPLACE FUNCTION credit_referral(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order    RECORD;
  v_referral RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id AND status = 'delivered';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ORDER_NOT_ELIGIBLE');
  END IF;

  -- Cek apakah ini transaksi pertama referred user
  IF (SELECT COUNT(*) FROM orders WHERE user_id = v_order.user_id AND status IN ('delivered','confirmed')) > 1 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FIRST_ORDER');
  END IF;

  -- Cari referral record
  SELECT * INTO v_referral FROM referrals
  WHERE referred_user_id = v_order.user_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NO_REFERRAL');
  END IF;

  -- Update referral
  UPDATE referrals SET
    order_id    = p_order_id,
    status      = 'credited',
    credited_at = NOW()
  WHERE id = v_referral.id;

  -- Tambah kredit ke referrer
  UPDATE profiles SET
    credits = credits + v_referral.credit_amount
  WHERE id = v_referral.referrer_user_id;

  RETURN jsonb_build_object(
    'ok',            true,
    'referrer_id',   v_referral.referrer_user_id,
    'credit_amount', v_referral.credit_amount
  );
END;
$$;

-- ============================================================
-- RPC 6: get_buyer_dashboard
-- Data dashboard pembeli dalam satu query
-- ============================================================
CREATE OR REPLACE FUNCTION get_buyer_dashboard(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
      FROM profiles p
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
      FROM orders o
      JOIN products pr ON pr.id = o.product_id
      WHERE o.user_id = p_user_id
    ),
    'referral_stats', (
      SELECT jsonb_build_object(
        'total_referrals', COUNT(*),
        'credited',        COUNT(*) FILTER (WHERE status = 'credited'),
        'pending',         COUNT(*) FILTER (WHERE status = 'pending'),
        'total_earned',    COALESCE(SUM(credit_amount) FILTER (WHERE status = 'credited'), 0)
      )
      FROM referrals WHERE referrer_user_id = p_user_id
    )
  );
END;
$$;

-- ============================================================
-- RPC 7: get_order_credentials
-- Ambil credentials akun untuk order milik user (dengan verifikasi kepemilikan)
-- ============================================================
CREATE OR REPLACE FUNCTION get_order_credentials(p_order_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_stock RECORD;
BEGIN
  SELECT o.*, a.credentials_enc, a.note
  INTO v_order
  FROM orders o
  JOIN account_stock a ON a.id = o.account_stock_id
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

-- ============================================================
-- RPC 8: get_admin_kpis
-- KPI dashboard admin
-- ============================================================
CREATE OR REPLACE FUNCTION get_admin_kpis()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'revenue', jsonb_build_object(
      'today',      (SELECT COALESCE(SUM(total_idr),0) FROM orders WHERE status IN ('delivered','confirmed') AND paid_at >= CURRENT_DATE),
      'this_month', (SELECT COALESCE(SUM(total_idr),0) FROM orders WHERE status IN ('delivered','confirmed') AND paid_at >= DATE_TRUNC('month', NOW())),
      'last_month', (SELECT COALESCE(SUM(total_idr),0) FROM orders WHERE status IN ('delivered','confirmed') AND paid_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND paid_at < DATE_TRUNC('month', NOW()))
    ),
    'orders', jsonb_build_object(
      'pending_payment',  (SELECT COUNT(*) FROM orders WHERE status = 'pending_payment'),
      'paid',             (SELECT COUNT(*) FROM orders WHERE status = 'paid'),
      'delivery_failed',  (SELECT COUNT(*) FROM orders WHERE status = 'delivery_failed'),
      'today_total',      (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE)
    ),
    'users', jsonb_build_object(
      'total',        (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
      'new_today',    (SELECT COUNT(*) FROM profiles WHERE role = 'user' AND joined_at >= CURRENT_DATE),
      'new_this_week',(SELECT COUNT(*) FROM profiles WHERE role = 'user' AND joined_at >= NOW() - INTERVAL '7 days')
    ),
    'stock', jsonb_build_object(
      'critical', (SELECT COUNT(*) FROM products WHERE is_active = true AND stock_count <= 5),
      'out',      (SELECT COUNT(*) FROM products WHERE is_active = true AND stock_count = 0)
    ),
    'tickets', jsonb_build_object(
      'open', (SELECT COUNT(*) FROM support_tickets WHERE status = 'open')
    )
  );
END;
$$;

-- ============================================================
-- RPC 9: expire_old_orders (dipanggil oleh cron job)
-- Cancel order yang sudah melewati batas waktu 24 jam
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE orders SET
    status     = 'expired',
    updated_at = NOW()
  WHERE status = 'pending_payment'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object('ok', true, 'expired_count', v_count);
END;
$$;
