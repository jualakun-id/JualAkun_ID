-- Kategori produk
CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(50) NOT NULL,
  slug       VARCHAR(50) UNIQUE NOT NULL,
  icon_url   TEXT,
  sort_order INT         NOT NULL DEFAULT 0,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed kategori awal
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Streaming',          'streaming',     1),
  ('AI & Produktivitas', 'ai-produktif',  2),
  ('Gaming',             'gaming',        3),
  ('VPN & Security',     'vpn',           4),
  ('Edukasi',            'edukasi',       5),
  ('Lainnya',            'lainnya',       99);
