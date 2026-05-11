-- =============================================================
-- Migration 017 — Add discount fields to products
-- =============================================================
-- Run via Supabase SQL Editor.
--
-- Added fields:
--   original_price       INT NULL    — harga sebelum diskon (null = no discount)
--   discount_starts_at   TIMESTAMPTZ NULL — kapan diskon mulai aktif (null = sekarang)
--   discount_ends_at     TIMESTAMPTZ NULL — kapan diskon berakhir (null = no expire)
--
-- Logic display di frontend:
--   Discount aktif kalau: original_price > price
--                         AND (discount_starts_at IS NULL OR NOW() >= discount_starts_at)
--                         AND (discount_ends_at IS NULL OR NOW() <= discount_ends_at)
-- =============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS original_price     INT         NULL,
  ADD COLUMN IF NOT EXISTS discount_starts_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS discount_ends_at   TIMESTAMPTZ NULL;

-- Constraint: kalau original_price di-set, harus > price (otherwise nggak masuk akal)
ALTER TABLE products
  ADD CONSTRAINT IF NOT EXISTS products_original_price_check
    CHECK (original_price IS NULL OR original_price > price);

-- Constraint: kalau discount_ends_at di-set, harus > discount_starts_at (kalau keduanya di-set)
-- Note: kalau salah satu null, OK (no constraint)
ALTER TABLE products
  ADD CONSTRAINT IF NOT EXISTS products_discount_dates_check
    CHECK (
      discount_starts_at IS NULL
      OR discount_ends_at IS NULL
      OR discount_ends_at > discount_starts_at
    );

-- ============================================================
-- Update RPC get_catalog_listing — include discount fields di output
-- (harus rebuild full function karena CREATE OR REPLACE)
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
