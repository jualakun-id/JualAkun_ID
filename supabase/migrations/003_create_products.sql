-- Produk digital
CREATE TABLE products (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    UUID         NOT NULL REFERENCES categories(id),
  name           VARCHAR(100) NOT NULL,
  slug           VARCHAR(100) UNIQUE NOT NULL,
  description    TEXT,
  thumbnail_url  TEXT,
  duration_days  INT          NOT NULL,                  -- 30, 90, 365
  price          INT          NOT NULL,                  -- harga dalam Rupiah
  guarantee_days INT          NOT NULL DEFAULT 30,       -- periode garansi
  stock_count    INT          NOT NULL DEFAULT 0,        -- dihitung otomatis via trigger
  sold_count     INT          NOT NULL DEFAULT 0,
  rating_avg     NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  rating_count   INT          NOT NULL DEFAULT 0,
  is_active      BOOLEAN      NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
