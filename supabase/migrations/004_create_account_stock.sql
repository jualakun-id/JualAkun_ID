-- Stok akun (pool FIFO per produk)
CREATE TABLE account_stock (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  credentials_enc      TEXT        NOT NULL,   -- terenkripsi AES-256 sebelum disimpan
  note                 TEXT,                   -- instruksi tambahan untuk buyer
  is_used              BOOLEAN     NOT NULL DEFAULT false,
  used_at              TIMESTAMPTZ,
  order_id             UUID,                   -- diisi setelah dipakai
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: update stock_count di products saat stok berubah
CREATE OR REPLACE FUNCTION public.sync_product_stock_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET stock_count = (
    SELECT COUNT(*) FROM account_stock
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND is_used = false
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER account_stock_sync
  AFTER INSERT OR UPDATE OR DELETE ON account_stock
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_stock_count();
