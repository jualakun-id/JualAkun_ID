-- Performance indexes
CREATE INDEX idx_products_category    ON products(category_id) WHERE is_active = true;
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_sold        ON products(sold_count DESC) WHERE is_active = true;

CREATE INDEX idx_account_stock_pool   ON account_stock(product_id, is_used, created_at)
  WHERE is_used = false;  -- partial index, hanya stok tersedia

CREATE INDEX idx_orders_user          ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status        ON orders(status, created_at DESC);
CREATE INDEX idx_orders_payment_ext   ON orders(payment_transaction_id);
CREATE INDEX idx_orders_expires       ON orders(expires_at) WHERE status = 'pending_payment';

CREATE INDEX idx_referrals_referrer   ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred   ON referrals(referred_user_id);

CREATE INDEX idx_tickets_user         ON support_tickets(user_id, created_at DESC);
CREATE INDEX idx_tickets_status       ON support_tickets(status) WHERE status = 'open';

CREATE INDEX idx_notif_user           ON notifications_log(user_id, created_at DESC);
CREATE INDEX idx_notif_status         ON notifications_log(status) WHERE status = 'pending';

CREATE INDEX idx_reviews_product      ON product_reviews(product_id, is_visible) WHERE is_visible = true;
CREATE INDEX idx_reviews_user         ON product_reviews(user_id);

CREATE INDEX idx_profiles_role        ON profiles(role) WHERE role = 'admin';
CREATE INDEX idx_profiles_referral    ON profiles(referral_code);
