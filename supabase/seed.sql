-- JualAkun seed data — kategori + sample produk
-- Run setelah migrasi: psql -f supabase/seed.sql atau via Supabase SQL editor.

-- Kategori utama
INSERT INTO categories (id, name, slug, description, icon_url, sort_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Streaming',     'streaming',     'Akun premium Netflix, Spotify, Disney+, dll', NULL, 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Gaming',        'gaming',        'Akun game premium, voucher, gift card',         NULL, 2, true),
  ('33333333-3333-3333-3333-333333333333', 'AI Produktif',  'ai-produktif',  'ChatGPT Plus, Canva Pro, Notion, dll',          NULL, 3, true),
  ('44444444-4444-4444-4444-444444444444', 'VPN',           'vpn',           'NordVPN, ExpressVPN, Surfshark',                NULL, 4, true),
  ('55555555-5555-5555-5555-555555555555', 'Edukasi',       'edukasi',       'Duolingo Plus, Coursera, Skillshare',           NULL, 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Sample produk (10 produk lintas kategori)
INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Netflix Premium 1 Bulan',  'netflix-premium-1-bulan',  'Akses 4K UHD, 4 device bersamaan, semua region.', NULL, 30,  47500,  30, true),
  ('11111111-1111-1111-1111-111111111111', 'Spotify Premium 1 Bulan',  'spotify-premium-1-bulan',  'Iklan hilang, download offline, kualitas tinggi.', NULL, 30,  25000,  30, true),
  ('11111111-1111-1111-1111-111111111111', 'Spotify Premium 3 Bulan',  'spotify-premium-3-bulan',  'Paket 3 bulan, lebih hemat.',                       NULL, 90,  65000,  30, true),
  ('11111111-1111-1111-1111-111111111111', 'Disney+ Hotstar 1 Bulan',  'disney-hotstar-1-bulan',   'Akses semua konten Disney, Marvel, Star Wars.',     NULL, 30,  35000,  30, true),
  ('33333333-3333-3333-3333-333333333333', 'ChatGPT Plus 1 Bulan',     'chatgpt-plus-1-bulan',     'GPT-4 unlimited, prioritas akses, plugin.',         NULL, 30, 155000,  14, true),
  ('33333333-3333-3333-3333-333333333333', 'Canva Pro 1 Bulan',        'canva-pro-1-bulan',        'Akses semua template & elemen premium.',            NULL, 30,  35000,  30, true),
  ('33333333-3333-3333-3333-333333333333', 'Notion AI 1 Bulan',        'notion-ai-1-bulan',        'AI assistant terintegrasi di workspace Notion.',    NULL, 30,  85000,  14, true),
  ('44444444-4444-4444-4444-444444444444', 'NordVPN 1 Bulan',          'nordvpn-1-bulan',          'Akses semua server, no-log, kill switch.',          NULL, 30,  45000,  30, true),
  ('22222222-2222-2222-2222-222222222222', 'YouTube Premium 1 Bulan',  'youtube-premium-1-bulan',  'No-ads, background play, YouTube Music.',           NULL, 30,  29000,  30, true),
  ('55555555-5555-5555-5555-555555555555', 'Duolingo Plus 1 Bulan',    'duolingo-plus-1-bulan',    'No-ads, unlimited hearts, offline lesson.',         NULL, 30,  42000,  30, true)
ON CONFLICT (slug) DO NOTHING;

-- Sample kupon
INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at, is_active) VALUES
  ('HEMAT10',   'percent', 10,    100, NOW() + INTERVAL '90 days', true),
  ('NEWUSER',   'fixed',   5000,  500, NOW() + INTERVAL '180 days', true)
ON CONFLICT (code) DO NOTHING;
