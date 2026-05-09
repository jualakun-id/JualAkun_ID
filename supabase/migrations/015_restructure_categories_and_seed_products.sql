-- =============================================================
-- Migration 015 — Restructure categories + seed 16 products
-- =============================================================
-- Run via Supabase SQL Editor.
--
-- Changes:
-- 1. Deactivate old categories (streaming, gaming, vpn, edukasi, ai-produktif)
-- 2. Add 2 new categories: 'ai' and 'kreator'
-- 3. Insert 16 products with thumbnail URLs from Supabase Storage
--
-- Prerequisite:
--   Bucket 'product-thumbnails' must exist (public) with all 16 .webp files uploaded.
-- =============================================================

-- ── Step 1: Deactivate old categories ─────────────────────────
UPDATE categories
SET is_active = false
WHERE slug IN ('streaming', 'gaming', 'ai-produktif', 'vpn', 'edukasi');

-- ── Step 2: Insert/upsert new categories ──────────────────────
INSERT INTO categories (name, slug, icon_url, sort_order, is_active) VALUES
  ('AI & Asisten',         'ai',      NULL, 1, true),
  ('Kreator & Multimedia', 'kreator', NULL, 2, true)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      sort_order = EXCLUDED.sort_order,
      is_active = true;

-- ── Step 3: Insert 16 products ────────────────────────────────
-- All thumbnails reference Supabase Storage public bucket.
-- Replace <PROJECT> with actual Supabase project ref if needed,
-- or use NEXT_PUBLIC_SUPABASE_URL value.

-- ── AI category (8 products) ──────────────────────────────────

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Google Ultra 30D (Garansi 1D)', 'google-ultra-30d-1',
  'Google AI Ultra subscription 30 hari dengan garansi minimal 1 hari. Akses Gemini Advanced + 2TB storage + AI Pro features.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/google-ultra-30d-1.webp',
  30, 180000, 1, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Google Ultra 30D (Full Garansi)', 'google-ultra-30d-full',
  'Google AI Ultra subscription 30 hari dengan garansi penuh sampai akhir periode. Premium tier dengan jaminan replacement.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/google-ultra-30d-full.webp',
  30, 350000, 30, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'ChatGPT Plus 1 Bulan', 'chatgpt-plus-1m',
  'ChatGPT Plus 30 hari — akses GPT-5, image generation, advanced reasoning, prioritas akses. No garansi (langka).',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/chatgpt-plus-1m.webp',
  30, 150000, 0, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Claude Pro (Full Garansi)', 'claude-pro',
  'Anthropic Claude Pro 30 hari — akses Claude Sonnet 4.6 & Opus, projects, longer context. Garansi penuh.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/claude-pro.webp',
  30, 265000, 30, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Claude X5 (Full Garansi)', 'claude-x5',
  'Anthropic Claude X5 premium tier — akses tertinggi Claude dengan limit 5x lipat dari Pro. Garansi penuh.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/claude-x5.webp',
  30, 1500000, 30, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Grok Super 30D (Garansi 15D)', 'grok-super-30d',
  'X (Twitter) Grok Super 30 hari — akses Grok 4 & deep research. Garansi 15 hari pertama.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/grok-super-30d.webp',
  30, 140000, 15, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Gemini AI Pro 18 Bulan', 'gemini-ai-pro-18m',
  'Google Gemini Pro tier 18 bulan — akses Gemini 2.5 Pro, deep research, NotebookLM Plus. No garansi (paket panjang).',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/gemini-ai-pro-18m.webp',
  540, 170000, 0, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Adobe CC + Firefly 3 Bulan', 'adobe-cc-firefly-3m',
  'Adobe Creative Cloud + Firefly AI 90 hari — Photoshop, Illustrator, Premiere, dll + AI generative. No garansi.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/adobe-cc-firefly-3m.webp',
  90, 180000, 0, true FROM categories WHERE slug = 'ai'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

-- ── Kreator category (8 products) ─────────────────────────────

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'ElevenLabs Creator', 'eleven-labs-creator',
  'ElevenLabs Creator tier — AI voice generation 100K characters/bulan, voice cloning, 10 custom voices. No garansi.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/eleven-labs-creator.webp',
  30, 180000, 0, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Krea Business (Garansi 10D)', 'krea-business',
  'Krea AI Business tier — image, video & enhancement AI. Real-time generation. Garansi 10 hari.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/krea-business.webp',
  30, 680000, 10, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'CapCut Pro 35 Hari (Full Garansi)', 'capcut-pro-35d',
  'CapCut Pro 35 hari — semua premium effects, AI tools, no watermark, cloud storage. Garansi penuh.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/capcut-pro-35d.webp',
  35, 50000, 35, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'CapCut Pro 6 Bulan (Full Garansi)', 'capcut-pro-6m',
  'CapCut Pro 6 bulan paket hemat — semua premium features. Cocok untuk content creator long-term. Garansi penuh.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/capcut-pro-6m.webp',
  180, 200000, 180, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Canva Pro 1 Tahun (Full Garansi)', 'canva-pro-1y',
  'Canva Pro 1 tahun — akses semua template, brand kit, 1TB storage, magic resize, background remover. Garansi penuh.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/canva-pro-1y.webp',
  365, 270000, 365, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Suno Premium 30 Hari', 'suno-premium-30d',
  'Suno AI Premium 30 hari — generate musik AI 2500 credits/bulan, commercial use, prioritas queue. No garansi.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/suno-premium-30d.webp',
  30, 120000, 0, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Adobe Stock Contributor', 'adobe-contributor',
  'Adobe Stock Contributor account — upload & jual photos/videos/illustrations di Adobe Stock marketplace. No garansi.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/adobe-contributor.webp',
  365, 250000, 0, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id, 'Kling AI 1100 Credit (Garansi 30D)', 'kling-ai-1100',
  'Kling AI 1100 credits — generate AI video premium quality. Cocok untuk content video viral. Garansi 30 hari.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/kling-ai-1100.webp',
  30, 228000, 30, true FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;

-- ── Verify ────────────────────────────────────────────────────
-- Cek hasil:
--   SELECT slug, name FROM categories WHERE is_active = true ORDER BY sort_order;
--   SELECT slug, name, price FROM products WHERE is_active = true ORDER BY category_id, slug;
