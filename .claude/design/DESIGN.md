---
name: "jualakun-hybrid"
source: "project audit"
extracted: 2026-05-09
tags:
  - design-system
  - hybrid
  - inconsistent
---

# JualAkun Hybrid Design System

## 1. Visual Theme & Atmosphere

JualAkun saat ini berjalan dengan **dua sistem desain yang konflik dalam satu codebase**:

- **System A — Dark Premium (token-based, defined in `tailwind.config.ts`)**: aesthetic gelap profesional dengan indigo `#6366F1` sebagai primary dan accent cyan `#22D3EE`. Dipakai oleh route group `(admin)`, `(buyer)`, dan `(auth)`. Body global di `globals.css` menerapkan `bg-bg text-text` yang merujuk ke palette dark ini.
- **System B — Light Friendly (hardcoded hex, akunmu.id-inspired)**: aesthetic terang-ramah dengan teal `#00B8D9` dan sky blue `#7EC8E3`, ditulis langsung sebagai `bg-[#xxxxxx]` di file homepage dan komponen layout publik. Hanya dipakai di route group `(public)`.

Karena `<html>` selalu memiliki `class="dark"` (lihat `app/layout.tsx:57`) dan `darkMode: 'class'` di Tailwind config, System A adalah default global. Public layout meng-override secara lokal dengan `bg-white text-[#1A2340]`. Tidak ada toggle dark/light yang sesungguhnya — pengguna selalu mendapat warna hardcoded sesuai context route.

## 2. Color Palette

### Primary (DUA versi — KONFLIK)
| Name | Hex | Role | Source File |
|------|-----|------|-------------|
| `primary` (System A) | `#6366F1` | Buttons admin, dashboard, auth (indigo) | `tailwind.config.ts:14` |
| `primary-hover` | `#4F46E5` | Hover state admin buttons | `tailwind.config.ts:15` |
| `primary-light` | `#818CF8` | Lighter accent | `tailwind.config.ts:16` |
| **Teal (System B)** | `#00B8D9` | Public CTA, link, highlight | `app/(public)/page.tsx:90+`, `header.tsx`, `footer.tsx` |
| **Teal hover** | `#009EB8` | Public CTA hover | `app/(public)/page.tsx:298` |
| **Teal dark** | `#007FA5` | Hero CTA filled | `app/(public)/page.tsx:41` |
| **Teal darker** | `#006080` | Hero CTA hover | `app/(public)/page.tsx:41` |

### Secondary
| Name | Hex | Role | Source File |
|------|-----|------|-------------|
| `secondary` (System A) | `#8B5CF6` | Gradient stop (purple) | `tailwind.config.ts:18` |
| Navy text/heading (System B) | `#1A2340` | Body heading public | `app/(public)/page.tsx:84+` |
| Navy hero accent | `#1A4480` | Highlight di hero text | `app/(public)/page.tsx:33` |
| Step card bg | `#1D4ED8` | Background step "Cara Berlangganan" | `app/(public)/page.tsx:314` |
| Stat card biru | `#1D7FE8` | Stat card pengguna | `app/(public)/page.tsx:89` |

### Accent
| Name | Hex | Role | Source File |
|------|-----|------|-------------|
| `accent` (System A) | `#22D3EE` | Cyan accent dark mode | `tailwind.config.ts:19` |

### Neutral / Text
| Name | Hex | Role | Source File |
|------|-----|------|-------------|
| `text` (dark) | `#FAFAFA` | Body text dark mode | `tailwind.config.ts:30` |
| `text-muted` (dark) | `#A1A1AA` | Muted dark | `tailwind.config.ts:31` |
| `text-subtle` (dark) | `#71717A` | Subtle dark | `tailwind.config.ts:32` |
| Heading public | `#1A2340` | Heading public navy | `app/(public)/page.tsx:84+` |
| Body public | `#4A5568` | Body teks public | `app/(public)/page.tsx:143` |
| Muted public | `#718096` | Muted public | `app/(public)/page.tsx:85+` |
| Code blue | `#0284C7` | Duration badge teks | `app/(public)/page.tsx:273` |

### Status
| Name | Hex | Role | Source File |
|------|-----|------|-------------|
| `success` | `#10B981` | Success status (token) | `tailwind.config.ts:34` |
| `warning` | `#F59E0B` | Warning status (token) | `tailwind.config.ts:35` |
| `danger` | `#EF4444` | Error status (token) | `tailwind.config.ts:36` |
| `info` | `#38BDF8` | Info status (token) | `tailwind.config.ts:37` |
| Stat card hijau | `#2DB87A` | Stat card support 24/7 | `app/(public)/page.tsx:91` |
| Stat card merah | `#E8334A` | Stat card transaksi | `app/(public)/page.tsx:90` |
| Stat card kuning | `#F5A623` | Stat card kepuasan | `app/(public)/page.tsx:92` |
| Garansi dot | `#2DB87A` | Icon garansi product card | `app/(public)/page.tsx:283` |

### Surface & Border
| Name | Hex | Role | Source File |
|------|-----|------|-------------|
| `bg` (dark) | `#09090B` | Page bg dark mode | `tailwind.config.ts:20` |
| `surface` (dark) | `#18181B` | Card surface dark | `tailwind.config.ts:22` |
| `surface-2` (dark) | `#27272A` | Elevated surface dark | `tailwind.config.ts:23` |
| `border` (dark) | `#3F3F46` | Border dark | `tailwind.config.ts:26` |
| `border-subtle` (dark) | `#27272A` | Subtle border dark | `tailwind.config.ts:27` |
| Public bg | `#FFFFFF` | Page bg public | `app/(public)/layout.tsx:8` |
| Hero bg | `#7EC8E3` | Sky blue hero | `app/(public)/page.tsx:26` |
| Section alt bg | `#EBF5FF` | Light blue section | `app/(public)/page.tsx:108+` |
| Code badge bg | `#E0F2FE` | Pill badge bg | `app/(public)/page.tsx:261+` |
| Footer bg | `#1F2937` | Dark footer | `components/layout/footer.tsx:6` |

### Inconsistencies Found

1. **Dua "primary" yang berbeda total**: indigo `#6366F1` (token Tailwind) vs teal `#00B8D9` (hardcoded hex). Komponen admin pakai indigo, homepage pakai teal — user menjelajahi 2 brand identity berbeda dalam 1 site.
2. **9+ shade biru** tanpa skala terstruktur: `#7EC8E3`, `#7EC8E3`, `#1A4480`, `#1D4ED8`, `#1D7FE8`, `#0284C7`, `#007FA5`, `#006080`, `#00B8D9`, `#009EB8`, `#22D3EE`, `#38BDF8`, `#818CF8`, `#6366F1`. Banyak yang nyaris identik — perlu konsolidasi ke 4–5 token.
3. **Dua "success/green"**: `#10B981` (token) vs `#2DB87A` (stat card). Pilih satu.
4. **Dua "danger/red"**: `#EF4444` (token) vs `#E8334A` (stat card). Pilih satu.
5. **Dua "warning/yellow"**: `#F59E0B` (token) vs `#F5A623` (stat card). Pilih satu.
6. **Dua "dark surface"**: `#18181B` (admin) vs `#1F2937` (footer public). Pilih satu untuk konsistensi shade gelap.
7. **`html.dark` selalu aktif** tapi public layout override secara lokal — bukan true dark/light toggle, tapi visual context-switching by route. Pengguna toggling theme tidak akan ada efek.
8. **Komponen reusable** (mis. `ProductCard`) mungkin masih pakai dark tokens jika dipakai di luar homepage — perlu audit per-component.

## 3. Typography

**Font Family Aktif (4 buah):**

| Variable | Font | Loaded by | Used as |
|----------|------|-----------|---------|
| `--font-heading` | Plus Jakarta Sans | `app/layout.tsx:12` | `font-heading` (admin, dashboard) |
| `--font-body` | Inter | `app/layout.tsx:19` | `font-body` (default body) |
| `--font-mono` | JetBrains Mono | `app/layout.tsx:26` | `font-mono` (credentials display) |
| `--font-poppins` | Poppins | `app/layout.tsx:5` | Inline via `style={{fontFamily: 'var(--font-poppins)...'}}` di `(public)/layout.tsx` |

**Inkonsistensi:** Poppins di-inject lewat inline style di public layout, sedangkan font lain via Tailwind class. Tidak ada usage `font-poppins` di file komponen — hanya inherited dari container `<div>` di layout publik.

| Level | Size | Weight | Source |
|-------|------|--------|--------|
| Hero | `3rem` (48px) | 800 | `tailwind.config.ts:46` |
| h1 | `2.25rem` (36px) | 700 | `tailwind.config.ts:47` |
| h2 | `1.75rem` (28px) | 700 | `tailwind.config.ts:48` |
| h3 | `1.375rem` (22px) | 600 | `tailwind.config.ts:49` |
| h4 | `1.125rem` (18px) | 600 | `tailwind.config.ts:50` |
| Hero (public) | `text-4xl md:text-5xl` (36/48px) | bold (700) | `app/(public)/page.tsx:31` |
| Section heading public | `text-3xl` (30px) | bold (700) | `app/(public)/page.tsx:84+` |
| Body | inherited Inter / Poppins | 400 | global |

## 4. Components

### Buttons
| Variant | Background | Text | Radius | Source |
|---------|------------|------|--------|--------|
| `.btn-primary` (admin/auth) | `bg-primary` (#6366F1) | white | rounded-lg | `globals.css:22` |
| `.btn-secondary` | `bg-surface-2` | `text` | rounded-lg | `globals.css:26` |
| `.btn-ghost` | transparent | `text-muted` | rounded-lg | `globals.css:30` |
| Public hero CTA filled | `#007FA5` → `#006080` hover | white | rounded-lg | `(public)/page.tsx:41` |
| Public hero CTA outline | transparent + border-white | white → fill | rounded-lg | `(public)/page.tsx:47` |
| Product card "Beli" | `#00B8D9` → `#009EB8` | white | rounded-lg | `(public)/page.tsx:298` |
| Header "Daftar" (scrolled) | `#00B8D9` | white | rounded-full (pill) | `header.tsx` |
| Header "Daftar" (hero) | transparent + border-white | white → fill | rounded-full (pill) | `header.tsx` |

### Cards
- **Dark surface card** (admin): `bg-surface border border-border-subtle rounded-xl`. Source: implicit, dari globals + tokens.
- **Light product card** (public): `bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)]`. Source: `(public)/page.tsx:251`.
- **Stat card colored**: `rounded-2xl` + warna solid + teks putih. Source: `(public)/page.tsx:225`.
- **Trust card**: `bg-white rounded-2xl shadow-sm border border-gray-100`. Source: `(public)/page.tsx:323`.

### Form Elements
- `.input-base`: `bg-surface-2 border border-border rounded-lg`. Hanya defined untuk dark mode.
- **Tidak ada input style untuk light mode** — login/register di route `(auth)` masih pakai dark.

## 5. Layout

- **Container:** `container mx-auto px-4` (Tailwind default, max-width responsive)
- **Public sections:** padding vertical `py-12` to `py-16`
- **Header height:** `h-16` (64px) sticky top
- **Grid patterns observed:** `grid-cols-2 md:grid-cols-4` (stats), `grid-cols-1 md:grid-cols-3` (benefits), `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (products)

## 6. Spacing

Tailwind default spacing scale (0.25rem step). Tidak ada extension custom.

| Token | Value | Frequency | Notes |
|-------|-------|-----------|-------|
| `p-2` | 0.5rem | Frequent | Mobile menu items |
| `p-4` | 1rem | Very high | Container padding default |
| `p-5` | 1.25rem | High | Card padding |
| `p-6` | 1.5rem | High | Stat cards, larger cards |
| `gap-3` to `gap-8` | 0.75–2rem | High | Grid gaps |
| `py-12`/`py-16` | 3–4rem | Section vertical | Public sections |

## 7. Border Radius

| Token | Value | Context | Source |
|-------|-------|---------|--------|
| `rounded` | 0.25rem | Default Tailwind | implicit |
| `rounded-lg` | 0.5rem | Buttons admin, public CTA filled, inputs | global |
| `rounded-xl` | 0.75rem | Card, FAQ row, product card | global |
| `rounded-2xl` | 1rem | Stat card, trust card | `(public)/page.tsx:225+` |
| `rounded-3xl` | 1.5rem | Illustration container | `(public)/page.tsx:108` |
| `rounded-full` | 9999px | Pill buttons (header CTA, category pills) | `header.tsx`, `(public)/page.tsx:136+` |

**Inkonsistensi:** Public homepage memakai mix `rounded-lg` (CTA), `rounded-xl` (cards), `rounded-2xl` (stat cards), dan `rounded-full` (pills). Akunmu.id-inspired tapi tidak konsisten — pill di header tapi rounded-lg di hero CTA.

## 8. Elevation

| Level | CSS Value | Usage | Source |
|-------|-----------|-------|--------|
| 0 | `shadow-none` | Default flat elements | — |
| 1 (sm) | `shadow-sm` | Subtle card depth | trust cards, FAQ rows |
| 2 | `shadow-md` | Hovered cards, buttons | header scroll, hover states |
| 3 (custom) | `shadow-[0_2px_12px_rgba(0,0,0,0.08)]` | Product cards | `(public)/page.tsx:251` |
| 4 (large) | `shadow-lg` | Hero CTA, stat cards | `(public)/page.tsx:41+` |
| Glow (token) | `shadow-glow` 0 0 24px rgba(99,102,241,0.15) | Indigo glow dark mode | `tailwind.config.ts:56` |
| Glow-sm (token) | `shadow-glow-sm` | Smaller indigo glow | `tailwind.config.ts:57` |

## 9. Responsive Behavior

Tailwind default breakpoints (mobile-first):

| Breakpoint | Width | Source |
|------------|-------|--------|
| `sm` | 640px | Tailwind default |
| `md` | 768px | Tailwind default |
| `lg` | 1024px | Tailwind default |
| `xl` | 1280px | Tailwind default |
| `2xl` | 1536px | Tailwind default |

Pola umum: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` untuk grid produk, `hidden md:flex` untuk desktop nav.

## 10. Dark Mode

**Mechanism:** **Forced dark via class** — `<html className="dark">` di `app/layout.tsx:57`. `darkMode: 'class'` di `tailwind.config.ts:4`. Tidak ada toggle UI.

**Source:** `app/layout.tsx:57`, `tailwind.config.ts:4`, `app/globals.css:13` (body apply `bg-bg text-text`).

### Dark Color Palette (System A — selalu aktif kecuali di-override per-route)
| Token | Light | Dark | Role | Source |
|-------|-------|------|------|--------|
| text | — | `#FAFAFA` | Body text | `tailwind.config.ts:30` |
| background | — | `#09090B` | Page bg | `tailwind.config.ts:20` |
| primary | — | `#6366F1` | Brand, CTA | `tailwind.config.ts:14` |
| secondary | — | `#8B5CF6` | Supporting | `tailwind.config.ts:18` |
| accent | — | `#22D3EE` | Decorative | `tailwind.config.ts:19` |
| muted | — | `#A1A1AA` | Secondary text | `tailwind.config.ts:31` |
| border | — | `#3F3F46` | Borders | `tailwind.config.ts:26` |
| card / surface | — | `#18181B` | Card surface | `tailwind.config.ts:22` |

**Catatan:** Project ini sebenarnya **tidak punya light palette di Tailwind config**. System B (homepage light) ditulis sebagai hardcoded hex di JSX, tidak terdaftar sebagai token. Untuk migrasi proper ke dual-mode (light + dark toggle), token light perlu didefinisikan dan public pages perlu di-refactor untuk gunakan token, bukan hex.

## Migration Notes

### Rekomendasi Konsolidasi (priority order)

1. **Putuskan brand: teal `#00B8D9` atau indigo `#6366F1`** — tidak bisa dua-duanya. Kalau homepage akunmu.id-style ditahan, ubah `tailwind.config.ts:14` jadi `#00B8D9` dan refactor admin/auth ikut.
2. **Konsolidasi shade biru** ke 3 token: `primary` (CTA teal), `primary-dark` (hero CTA), `primary-light` (badges/hover).
3. **Konsolidasi success/danger/warning** — pilih satu set (preferensi: yang sudah didefinisikan di tailwind.config karena konsisten dengan Tailwind palette: `#10B981`, `#EF4444`, `#F59E0B`). Update stat cards untuk pakai token.
4. **Tambahkan light palette** di `tailwind.config.ts` (mis. `bg-light`, `surface-light`, `text-light`) supaya homepage tidak perlu hex inline.
5. **Refactor `app/(public)/page.tsx`** untuk pakai class Tailwind, bukan `bg-[#xxxxxx]` arbitrary values.
6. **Standardisasi font**: pilih Poppins ATAU Plus Jakarta Sans untuk heading. Saat ini ada 4 font loaded — bandwidth waste.
7. **Standardisasi rounded**: gunakan `rounded-lg` untuk CTA across both systems, atau `rounded-full` (pill) — jangan campur.
8. **Footer color**: `#1F2937` (footer) vs `#18181B` (admin surface) — pilih satu shade gelap untuk konsistensi.

### Critical Action Items
- [ ] **a11y**: Stat cards `#2DB87A`, `#F5A623` punya kontras < 4.5:1 dengan teks putih (lihat `accessibility-report.md`).
- [ ] **a11y**: Button bg `#00B8D9` dengan teks putih kontrasnya borderline AA — perlu darker shade.
- [ ] **Cleanup unused**: `gradient-primary`, `gradient-accent`, `shadow-glow*` (dark indigo) tidak dipakai di public pages — kalau homepage adalah brand baru, ini deprecated.
- [ ] **Add toggle** (opsional): kalau ingin true dark/light, perlu `prefers-color-scheme` atau context-based switcher.
