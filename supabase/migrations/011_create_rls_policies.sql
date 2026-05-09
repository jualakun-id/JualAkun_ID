-- Enable RLS semua tabel
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_stock     ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews   ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES: public read
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT USING (is_active = true);

-- PRODUCTS: public read untuk produk aktif
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT USING (is_active = true);

-- ACCOUNT_STOCK: buyer hanya bisa lihat stok miliknya via order
-- Akses langsung diblokir — selalu via RPC (SECURITY DEFINER)
-- Admin akses via service_role key (bypass RLS)

-- COUPONS: public read untuk validasi
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT USING (is_active = true);

-- ORDERS: user hanya bisa lihat order sendiri
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

-- REFERRALS: user lihat referral yang mereka buat
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT USING (auth.uid() = referrer_user_id);

-- SUPPORT_TICKETS: user lihat tiket sendiri
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets for own orders"
  ON support_tickets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

-- NOTIFICATIONS_LOG: user lihat notif sendiri
CREATE POLICY "Users can view own notifications"
  ON notifications_log FOR SELECT USING (auth.uid() = user_id);

-- PRODUCT_REVIEWS: public read, buyer insert untuk order sendiri
CREATE POLICY "Anyone can view visible reviews"
  ON product_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Buyers can create review for own completed order"
  ON product_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id
        AND user_id = auth.uid()
        AND status = 'confirmed'
    )
  );

-- Catatan: Admin akses seluruh data via service_role key (bypass RLS)
-- RPC functions menggunakan SECURITY DEFINER sehingga jalan dengan hak service_role
