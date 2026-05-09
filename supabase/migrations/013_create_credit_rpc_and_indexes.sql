-- ============================================================
-- RPC 10: deduct_user_credits (atomic)
-- Mengurangi credits buyer secara atomic. Mencegah race condition
-- saat checkout paralel — credits tidak boleh jadi negatif.
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id UUID, p_amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current INT;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_AMOUNT');
  END IF;

  SELECT credits INTO v_current FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PROFILE_NOT_FOUND');
  END IF;

  IF v_current < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_CREDITS', 'available', v_current);
  END IF;

  UPDATE profiles SET credits = credits - p_amount WHERE id = p_user_id;
  RETURN jsonb_build_object('ok', true, 'remaining', v_current - p_amount);
END;
$$;

-- ============================================================
-- RPC 11: get_catalog_listing
-- One-shot catalog query dengan filter + sort + pagination + category join
-- ============================================================
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
AS $$
DECLARE
  v_offset INT := (p_page - 1) * p_limit;
  v_total  INT;
  v_rows   JSONB;
BEGIN
  WITH filtered AS (
    SELECT pr.*, c.name AS cat_name, c.slug AS cat_slug
    FROM products pr
    JOIN categories c ON c.id = pr.category_id
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
           'price', price, 'duration_days', duration_days,
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

-- ============================================================
-- Index untuk catalog filter performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_active_sold
  ON products (is_active, sold_count DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_price
  ON products (is_active, price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_log_status
  ON notifications_log (status, created_at DESC) WHERE status IN ('failed', 'pending');
