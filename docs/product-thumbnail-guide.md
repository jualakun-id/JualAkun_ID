# Product Thumbnail Generation Guide

> **Tujuan:** memastikan setiap thumbnail produk Jualakun.id punya **gaya visual yang 100% konsisten** dengan koleksi yang sudah ada (Vexx-style doodle monster art, cream background, friendly cartoon characters).
>
> **Pakai dokumen ini setiap kali menambah produk baru.**

---

## 🎨 Gaya Visual

| Properti | Value |
|---|---|
| **Style** | 2D flat doodle illustration, Vexx / Mr. Doodle aesthetic |
| **Aspect ratio** | **3:4 portrait** (e.g., 768×1024 atau 1024×1366) |
| **Background** | Cream off-white `#FAF7F2`, no decorative frame |
| **Outlines** | Heavy variable-weight black brush outlines |
| **Density** | Maximalist (packed, ~5% margin dari edge) |
| **Centerpiece** | Brand logo, ~22% of canvas, slightly tilted |
| **Vibe** | Friendly fictional cartoon creatures (NOT horror/devil) |

---

## 📋 Template Prompt

### 1️⃣ Centerpiece Block (UBAH per produk)

```
Vibrant alcohol marker doodle illustration in Vexx-style graffiti monster art aesthetic. Centered focal point: large bold flat 2D [BRAND_NAME] logo ([BRAND_COLORS_HEX]), occupying ~22% of canvas, slightly tilted for dynamic feel. [OPTIONAL: small accent badge/element relevant to product, mis. shield checkmark untuk full garansi, gold crown untuk premium tier].
```

### 2️⃣ Universal Style Block (TIDAK PERNAH BERUBAH)

> Copy-paste persis sama untuk semua produk.

```
Surrounding the centerpiece in dense crammed composition: friendly fictional cartoon creatures and quirky doodle characters with EXPRESSIVE features — big round eyes (some single-eye cyclops style), playful sticking-out tongues, surprised "woah" mouths, wide goofy grins, asymmetric features, unique alien-like blob shapes, wavy noodle limbs, antennas instead of horns. Mix in tropical jungle: tiki masks (smiling not scary), hibiscus flowers, palm fronds, pineapples (with smiley faces); urban graffiti elements: cassette tapes with melting drips, skateboards, dripping ice cream cones, exploding pizza slices, sneakers, lightning bolts, sparkle stars, dollar signs, brick patterns.

Character design rules: characters should feel like FRIENDLY FICTIONAL CARTOON CREATURES, not horror monsters. NO devil horns, NO sharp aggressive fangs, NO menacing/evil expressions, NO satanic imagery, NO blood, NO skulls. Pixar-meets-graffiti, quirky-cute-edgy hybrid like Adventure Time meets street art.

Style rules: hand-drawn doodle illustration with HEAVY variable-weight black ink outlines, rich saturated marker-like colors with subtle color bleed at edges, slight grain texture for organic feel. Hand-drawn imperfect feel but DIGITAL artwork ready for web use.

Color palette (RICH and SATURATED, not pastel): deep magenta #DB2777, electric purple #7C3AED, jungle green #16A34A, blood orange #EA580C, electric blue #2563EB, sunshine yellow #EAB308, hot pink #EC4899, mint #10B981, burgundy red #B91C1C. Heavy use of pure black for outlines and shadows.

Background: clean warm off-white solid color #FAF7F2 with very subtle paper grain texture filling the entire canvas to all 4 edges uniformly. Composition fills the canvas completely.

CRITICAL — DO NOT INCLUDE: NO photograph, NO sketchbook, NO notebook spine, NO book binding, NO pencils, NO markers, NO art supplies, NO desk surface, NO drawing tools, NO photo of a page, NO paper edges, NO curl, NO shadow from book, NO signature, NO artist watermark, NO "VEXX" text, NO any text or letters except the brand logo.

Composition: PACKED maximalism, characters touching/overlapping, minimal negative space, all 4 canvas edges full but with consistent ~3% safe margin. Portrait 3:4 aspect ratio. Standalone digital illustration, ready for use as marketplace product thumbnail.

Reference style: Vexx art aesthetic, Mr. Doodle, graffiti monster collage, BUT as a clean standalone digital illustration — NOT a photograph of a sketchbook.
```

---

## 🛠 Workflow Untuk Produk Baru

### Step 1 — Tulis Centerpiece

Misal produk baru: **"Midjourney Pro 1 Bulan"**

Centerpiece block:
```
Vibrant alcohol marker doodle illustration in Vexx-style graffiti monster art aesthetic. Centered focal point: large bold flat 2D Midjourney logo (sailboat-like emblem in black), occupying ~22% of canvas, slightly tilted for dynamic feel. Small AI sparkle stars accent around the logo.
```

Concatenate dengan **Universal Style Block** di atas → jadi prompt lengkap.

### Step 2 — Generate Image

**Midjourney:**
```
[full prompt] --ar 3:4 --s 250 --v 6 --seed 12345
```
- `--ar 3:4` = aspect ratio 3:4 (portrait)
- `--s 250` = high stylize untuk doodle vibe
- `--seed 12345` = pakai seed sama untuk konsistensi (optional)

**Flux / Ideogram / DALL-E:**
- Set aspect ratio: **3:4 portrait**
- Negative prompt:
  ```
  text, watermark, signature, photorealistic, 3D render, sketchbook photo, pencils, markers, art supplies, devil horns, sharp fangs, horror, blood, skulls, simple background
  ```

### Step 3 — Convert ke WebP

File hasil generate biasanya `.png` atau `.jpeg` (~1 MB). Convert ke WebP supaya hemat bandwidth ~77%.

```bash
# Dari folder thumbnail
node convert-to-webp.js
```

Script `convert-to-webp.js` (sudah pernah dibuat, bisa simpan permanen):

```javascript
const path = require('path')
const fs = require('fs')
const sharp = require(path.resolve('d:/JualAkun_ID/frontend/node_modules/sharp'))

const dir = __dirname
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))

;(async () => {
  for (const file of files) {
    const input = path.join(dir, file)
    const output = path.join(dir, file.replace(/\.(jpe?g|png)$/i, '.webp'))
    await sharp(input).webp({ quality: 85, effort: 6 }).toFile(output)
    console.log(`✓ ${file} → ${path.basename(output)}`)
  }
})()
```

### Step 4 — Naming Convention

Filename format: `<product-slug>.webp`

| Aturan | Contoh |
|---|---|
| Lowercase saja | `midjourney-pro-1m.webp` ✅ |
| Dash sebagai separator | NOT `midjourney_pro_1m.webp` ❌ |
| Sertakan duration kalau perlu | `chatgpt-plus-1m.webp` |
| Sertakan tier kalau ada | `claude-x5.webp`, `claude-pro.webp` |

### Step 5 — Upload ke Supabase Storage

1. Buka **supabase.com** → project Jualakun-id → **Storage**
2. Bucket: `product-thumbnails` (sudah ada, public)
3. Drag file `.webp`
4. Copy URL public:
   ```
   https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/<filename>.webp
   ```

### Step 6 — Insert ke Database

**Via SQL Editor** (paling cepat untuk batch):

```sql
INSERT INTO products (category_id, name, slug, description, thumbnail_url, duration_days, price, guarantee_days, is_active)
SELECT id,
  'Midjourney Pro 1 Bulan',
  'midjourney-pro-1m',
  'Midjourney Pro 30 hari — generate AI image kualitas premium, fast mode, 200 generations/bulan.',
  'https://clfewheqatyaefohmdpn.supabase.co/storage/v1/object/public/product-thumbnails/midjourney-pro-1m.webp',
  30, 250000, 0, true
FROM categories WHERE slug = 'kreator'
ON CONFLICT (slug) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  price = EXCLUDED.price,
  guarantee_days = EXCLUDED.guarantee_days,
  category_id = EXCLUDED.category_id,
  is_active = true;
```

**Atau via admin panel** (`jualakun.id/admin/produk/baru`) — fill form manually.

---

## 🎯 Brand Logo Reference (untuk Centerpiece)

### Format prompt: `[BRAND_NAME] logo ([COLORS])`

| Brand | Logo Description | Brand Colors |
|---|---|---|
| Google | "Google G logo" | red #EA4335, yellow #FBBC05, green #34A853, blue #4285F4 |
| ChatGPT | "OpenAI ChatGPT spiral knot logo, six-petal flower-like" | teal-green #10A37F |
| Claude | "Anthropic Claude orange-coral abstract sun-burst/starburst" | orange #D97757 |
| Grok / X | "X logo, bold black uppercase X with sharp angular strokes" | black + electric purple lightning #7C3AED |
| Gemini | "Gemini four-pointed star/diamond logo" | rainbow blue → purple → pink gradient |
| Adobe | "Adobe red 'A' logo with WHITE TRIANGLE CUTOUT" | red #FA0F00 |
| Canva | "Canva 'C' logo, circular C-shape with gradient" | turquoise #00C4CC → mint #14B8A6 |
| CapCut | "CapCut logo, stylized red 'T' with curved bottom hook" | red #FF3B5C |
| ElevenLabs | "ElevenLabs 'II' double-bar monogram logo" | black + sound waves |
| Krea | "Krea AI K logo, abstract geometric K shape" | purple #7C3AED + paint splash |
| Suno | "Suno AI music wave logo" | blue #2563EB → purple #7C3AED gradient |
| Kling | "Kling AI logo, abstract geometric K-emblem" | pink #EC4899 → purple → blue gradient |
| Midjourney | "Midjourney logo, sailboat-like emblem" | black |
| Notion | "Notion logo, white N on black square" | black + white |

### Optional Accents (per varian produk)

| Variant | Accent untuk Centerpiece |
|---|---|
| Full garansi | "small golden shield checkmark badge accent" |
| Premium / X5 / Plus | "small gold crown accent on top" |
| Long duration (1 tahun+) | "calendar badge with duration in corner" |
| Promo / discount | "starburst banner accent reading 'PROMO'" |

---

## 📝 Contoh Lengkap (Prompt Siap Pakai)

### Untuk produk baru: **"Notion AI Pro 1 Bulan"**

```
Vibrant alcohol marker doodle illustration in Vexx-style graffiti monster art aesthetic. Centered focal point: large bold flat 2D Notion logo (white capital "N" inside black rounded square), occupying ~22% of canvas, slightly tilted for dynamic feel. AI sparkle stars accent around the logo representing the AI Pro tier.

Surrounding the centerpiece in dense crammed composition: friendly fictional cartoon creatures and quirky doodle characters with EXPRESSIVE features — big round eyes (some single-eye cyclops style), playful sticking-out tongues, surprised "woah" mouths, wide goofy grins, asymmetric features, unique alien-like blob shapes, wavy noodle limbs, antennas instead of horns. Mix in tropical jungle: tiki masks (smiling not scary), hibiscus flowers, palm fronds, pineapples (with smiley faces); urban graffiti elements: cassette tapes with melting drips, skateboards, dripping ice cream cones, exploding pizza slices, sneakers, lightning bolts, sparkle stars, dollar signs, brick patterns.

Character design rules: characters should feel like FRIENDLY FICTIONAL CARTOON CREATURES, not horror monsters. NO devil horns, NO sharp aggressive fangs, NO menacing/evil expressions, NO satanic imagery, NO blood, NO skulls. Pixar-meets-graffiti, quirky-cute-edgy hybrid like Adventure Time meets street art.

Style rules: hand-drawn doodle illustration with HEAVY variable-weight black ink outlines, rich saturated marker-like colors with subtle color bleed at edges, slight grain texture for organic feel. Hand-drawn imperfect feel but DIGITAL artwork ready for web use.

Color palette (RICH and SATURATED, not pastel): deep magenta #DB2777, electric purple #7C3AED, jungle green #16A34A, blood orange #EA580C, electric blue #2563EB, sunshine yellow #EAB308, hot pink #EC4899, mint #10B981, burgundy red #B91C1C. Heavy use of pure black for outlines and shadows.

Background: clean warm off-white solid color #FAF7F2 with very subtle paper grain texture filling the entire canvas to all 4 edges uniformly. Composition fills the canvas completely.

CRITICAL — DO NOT INCLUDE: NO photograph, NO sketchbook, NO notebook spine, NO book binding, NO pencils, NO markers, NO art supplies, NO desk surface, NO drawing tools, NO photo of a page, NO paper edges, NO curl, NO shadow from book, NO signature, NO artist watermark, NO "VEXX" text, NO any text or letters except the brand logo.

Composition: PACKED maximalism, characters touching/overlapping, minimal negative space, all 4 canvas edges full but with consistent ~3% safe margin. Portrait 3:4 aspect ratio. Standalone digital illustration, ready for use as marketplace product thumbnail.

Reference style: Vexx art aesthetic, Mr. Doodle, graffiti monster collage, BUT as a clean standalone digital illustration — NOT a photograph of a sketchbook.
```

---

## ⚠️ Hal yang HARUS Dihindari

Pernah kejadian dan harus dicegah:

| Issue | Penyebab di prompt | Fix |
|---|---|---|
| Hasil jadi **photo of sketchbook with pencils** | Mention "Copic markers", "sketchbook" sebagai alat fisik | Pakai "doodle illustration" + "digital artwork" |
| Logo punya **devil horns / sharp teeth** | Mention "monster" tanpa kualifier | Tambah "FRIENDLY FICTIONAL CARTOON CREATURES" + NO list |
| Style jadi **kawaii sticker** (terlalu cute) | Pakai "cute" / pastel colors | Specify "edgy graffiti" + "rich saturated colors NOT pastel" |
| Background **bukan cream off-white** | Tidak specify hex code | Specify exact `#FAF7F2` |
| Karakter **terlalu jarang** (banyak white space) | Tidak emphasize density | Specify "PACKED maximalism, minimal negative space" |
| Muncul **signature "VEXX"** atau watermark | Tidak ada negative instruction | Add "NO 'VEXX' text, NO signature, NO watermark" |
| Logo Adobe **tidak ada cutout segitiga** | Generic "Adobe A" | Specify "with WHITE TRIANGLE CUTOUT" |
| Logo Claude **jadi starburst kosong** | Generic "sun-burst" | Specify "abstract sun-burst flower/petal shape" |

---

## 📊 Quality Checklist (Sebelum Upload)

Cek thumbnail baru terhadap koleksi existing:

- [ ] **Aspect ratio 3:4 portrait** ✅
- [ ] **Background cream `#FAF7F2`** match dengan thumbnail lain
- [ ] **Logo brand recognizable** (Google G ada warna asli, Adobe A ada cutout, dll)
- [ ] **Density** match (sama-sama maximalist packed)
- [ ] **Color saturation** match (rich, tidak pastel)
- [ ] **Karakter friendly** — no devil/horror
- [ ] **No signature/watermark** di pojok
- [ ] **No text overlay** kecuali logo brand
- [ ] **File size** <300 KB setelah convert ke WebP
- [ ] **Filename** sesuai naming convention (`<slug>.webp`)

---

## 🎁 Bonus: Centerpiece untuk Brand Belum Pernah Ada

Kalau kamu tambah produk dari brand baru (misal: Suno, Replit, Lovable, Cursor):

1. **Cari logo brand-nya** (Google Image, official site, simple-icons.org)
2. **Identifikasi:**
   - Bentuk dasar (lingkaran, kotak, huruf, abstract)
   - Warna utama (1-3 colors max, pakai hex code)
3. **Template centerpiece:**
   ```
   Centered focal point: large bold flat 2D [BRAND] logo ([SHAPE DESCRIPTION] in [COLOR_NAMES] [HEX_CODES]), occupying ~22% of canvas, slightly tilted for dynamic feel.
   ```

Contoh untuk **Cursor IDE**:
```
Centered focal point: large bold flat 2D Cursor logo (white "C" cursor pointer shape inside black circular background), occupying ~22% of canvas, slightly tilted for dynamic feel.
```

---

## 🔄 Workflow Cepat (TL;DR)

```
1. Tulis centerpiece (ganti brand + colors di template)
2. Append universal style block (copy-paste sama)
3. Generate di Midjourney/Flux dengan --ar 3:4 --s 250
4. Convert: node convert-to-webp.js
5. Upload ke Supabase Storage bucket `product-thumbnails`
6. Insert SQL atau pakai admin panel
7. Done — tunggu 5 min revalidate, thumbnail muncul di /
```

---

## 📁 Referensi File

| File | Fungsi |
|---|---|
| `docs/product-thumbnail-guide.md` | Dokumen ini |
| `docs/brand-guide.md` | Brand colors, typography, components |
| `supabase/migrations/015_*.sql` | Contoh SQL insert 16 produk pertama |

**Update terakhir:** 2026-05-10
**16 thumbnail original** ada di Supabase Storage `product-thumbnails` bucket sebagai referensi gaya.
