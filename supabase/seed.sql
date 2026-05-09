-- JualAkun seed data — kategori + sample produk
-- Run setelah migrasi: via Supabase SQL editor atau supabase db query.

-- Kategori (migration 002 sudah seed, ini update sort_order saja kalau konflik)
INSERT INTO categories (name, slug, icon_url, sort_order, is_active) VALUES
  ('Streaming',    'streaming',   NULL, 1, true),
  ('Gaming',       'gaming',      NULL, 2, true),
  ('AI Produktif', 'ai-produktif',NULL, 3, true),
  ('VPN',          'vpn',         NULL, 4, true),
  ('Edukasi',      'edukasi',     NULL, 5, true)
ON CONFLICT (slug) DO UPDATE SET sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

-- Sample produk (10 produk lintas kategori, category_id di-lookup via slug)
INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Netflix Premium 1 Bulan',  'netflix-premium-1-bulan',  'Akses 4K UHD, 4 device bersamaan, semua region.', NULL, 30,  47500, 30, true FROM categories WHERE slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Spotify Premium 1 Bulan',  'spotify-premium-1-bulan',  'Iklan hilang, download offline, kualitas tinggi.', NULL, 30,  25000, 30, true FROM categories WHERE slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Spotify Premium 3 Bulan',  'spotify-premium-3-bulan',  'Paket 3 bulan, lebih hemat.',                      NULL, 90,  65000, 30, true FROM categories WHERE slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Disney+ Hotstar 1 Bulan',  'disney-hotstar-1-bulan',   'Akses semua konten Disney, Marvel, Star Wars.',    NULL, 30,  35000, 30, true FROM categories WHERE slug = 'streaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'ChatGPT Plus 1 Bulan',     'chatgpt-plus-1-bulan',     'GPT-4 unlimited, prioritas akses, plugin.',        NULL, 30, 155000, 14, true FROM categories WHERE slug = 'ai-produktif'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Canva Pro 1 Bulan',        'canva-pro-1-bulan',        'Akses semua template & elemen premium.',           NULL, 30,  35000, 30, true FROM categories WHERE slug = 'ai-produktif'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Notion AI 1 Bulan',        'notion-ai-1-bulan',        'AI assistant terintegrasi di workspace Notion.',   NULL, 30,  85000, 14, true FROM categories WHERE slug = 'ai-produktif'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'NordVPN 1 Bulan',          'nordvpn-1-bulan',          'Akses semua server, no-log, kill switch.',         NULL, 30,  45000, 30, true FROM categories WHERE slug = 'vpn'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'YouTube Premium 1 Bulan',  'youtube-premium-1-bulan',  'No-ads, background play, YouTube Music.',          NULL, 30,  29000, 30, true FROM categories WHERE slug = 'gaming'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Duolingo Plus 1 Bulan',    'duolingo-plus-1-bulan',    'No-ads, unlimited hearts, offline lesson.',        NULL, 30,  42000, 30, true FROM categories WHERE slug = 'edukasi'
ON CONFLICT (slug) DO NOTHING;

-- Sample kupon
INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at, is_active) VALUES
  ('HEMAT10',  'percent', 10,   100, NOW() + INTERVAL '90 days',  true),
  ('NEWUSER',  'fixed',   5000, 500, NOW() + INTERVAL '180 days', true)
ON CONFLICT (code) DO NOTHING;
