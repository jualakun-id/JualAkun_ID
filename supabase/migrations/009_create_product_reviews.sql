-- Review produk (hanya buyer yang sudah beli)
CREATE TABLE product_reviews (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        UNIQUE NOT NULL REFERENCES orders(id),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  is_visible BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: update rating_avg & rating_count di products
CREATE OR REPLACE FUNCTION public.sync_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
  SET
    rating_avg   = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = v_product_id AND is_visible = true),
    rating_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = v_product_id AND is_visible = true)
  WHERE id = v_product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER product_reviews_sync_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_rating();
