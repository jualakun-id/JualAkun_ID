-- Coupons / kode diskon
CREATE TABLE coupons (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(30) UNIQUE NOT NULL,
  discount_type  VARCHAR(10) NOT NULL,          -- percent, fixed
  discount_value INT         NOT NULL,
  max_uses       INT,                           -- NULL = unlimited
  used_count     INT         NOT NULL DEFAULT 0,
  valid_for_products UUID[],                   -- NULL = semua produk
  expires_at     TIMESTAMPTZ,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders / pesanan
CREATE TABLE orders (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id           UUID        NOT NULL REFERENCES products(id),
  order_number         VARCHAR(30) UNIQUE NOT NULL,  -- misal: JA-20260509-00001
  amount_idr           INT         NOT NULL,          -- harga sebelum diskon
  discount_idr         INT         NOT NULL DEFAULT 0,
  credit_used_idr      INT         NOT NULL DEFAULT 0,
  total_idr            INT         NOT NULL,          -- yang dibayar buyer
  coupon_code          VARCHAR(30),
  referral_code_used   VARCHAR(10),

  -- Payment Midtrans
  payment_provider     VARCHAR(20) NOT NULL DEFAULT 'midtrans',
  payment_external_id  VARCHAR(100),
  payment_transaction_id VARCHAR(100) UNIQUE,
  payment_method       VARCHAR(30),
  payment_status       VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, settlement, deny, cancel, expire
  payment_snap_token   VARCHAR(200),
  payment_snap_url     TEXT,
  payment_metadata     JSONB       NOT NULL DEFAULT '{}',
  paid_at              TIMESTAMPTZ,

  -- Status order
  status               VARCHAR(20) NOT NULL DEFAULT 'pending_payment',
  -- pending_payment, paid, delivering, delivered, confirmed, refunded, expired, delivery_failed

  -- Delivery
  account_stock_id     UUID REFERENCES account_stock(id),
  delivered_at         TIMESTAMPTZ,
  buyer_confirmed_at   TIMESTAMPTZ,
  guarantee_expires_at TIMESTAMPTZ,

  expires_at           TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
