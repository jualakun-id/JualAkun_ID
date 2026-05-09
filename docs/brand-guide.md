# Brand Guide — JualAkun

> Version: V1.0 | Date: 2026-05-09 | Status: Final

---

## 1. Brand Identity

**Nama:** JualAkun  
**Domain:** jualakun.id  
**Tagline:** *Akun Digital. Murah. Langsung Aktif.*  
**Tone of voice:** Percaya diri, ringkas, tidak berlebihan. Bicara seperti teman yang tahu — bukan sales.

**Brand personality:**
- Terpercaya — garansi nyata, bukan janji kosong
- Cepat — instan, tidak menunggu
- Modern — UI bersih, tidak ramai
- Terjangkau — harga jelas, tanpa biaya tersembunyi

---

## 2. Color System

### Primary Palette

| Token | Hex | RGB | Penggunaan |
|-------|-----|-----|-----------|
| `--color-primary` | `#6366F1` | 99, 102, 241 | CTA utama, link aktif, highlight |
| `--color-primary-hover` | `#4F46E5` | 79, 70, 229 | Hover state tombol primary |
| `--color-primary-light` | `#818CF8` | 129, 140, 248 | Badge, label ringan |
| `--color-secondary` | `#8B5CF6` | 139, 92, 246 | Gradient pair, aksen visual |
| `--color-accent` | `#22D3EE` | 34, 211, 238 | Badge "Instan", ikon kecepatan, pulse indicator |

### Background & Surface (Dark Mode — Default)

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `--color-bg` | `#09090B` | Background halaman utama |
| `--color-surface` | `#18181B` | Card produk, modal, sidebar |
| `--color-surface-2` | `#27272A` | Input field background, divider area |
| `--color-border` | `#3F3F46` | Border card, input border |
| `--color-border-subtle` | `#27272A` | Divider, separator |

### Text

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `--color-text` | `#FAFAFA` | Teks utama |
| `--color-text-muted` | `#A1A1AA` | Teks sekunder, placeholder, label |
| `--color-text-subtle` | `#71717A` | Timestamp, metadata |

### Semantic Colors

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `--color-success` | `#10B981` | Status "Terkirim", badge "Aktif", konfirmasi |
| `--color-warning` | `#F59E0B` | Harga coret, badge diskon, stok hampir habis |
| `--color-danger` | `#EF4444` | Error, stok habis, status gagal |
| `--color-info` | `#38BDF8` | Info tooltip, status pending |

### Gradient Utama

```css
/* Hero section, CTA button premium */
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);

/* Card highlight / featured product */
background: linear-gradient(135deg, #4F46E5 0%, #22D3EE 100%);

/* Subtle glow effect di card */
box-shadow: 0 0 24px rgba(99, 102, 241, 0.15);
```

### Light Mode (Fallback)

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `--color-bg` | `#F9FAFB` | Background |
| `--color-surface` | `#FFFFFF` | Card |
| `--color-surface-2` | `#F3F4F6` | Input background |
| `--color-border` | `#E5E7EB` | Border |
| `--color-text` | `#111827` | Teks utama |
| `--color-text-muted` | `#6B7280` | Teks sekunder |

---

## 3. Typography

### Font Family

**Heading:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)  
— Dibuat oleh desainer Indonesia (Tokotype). Terasa lokal tapi modern & clean.

**Body / UI:** [Inter](https://fonts.google.com/specimen/Inter)  
— Industry standard untuk SaaS dan marketplace. Readability sempurna di screen.

**Monospace (credential display):** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)  
— Dipakai untuk menampilkan username/password akun. Jelas dan tidak ambigu.

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type Scale

| Token | Size | Weight | Line Height | Penggunaan |
|-------|------|--------|-------------|-----------|
| `text-hero` | 48px / 3rem | 800 | 1.15 | Hero headline |
| `text-h1` | 36px / 2.25rem | 700 | 1.2 | Page title |
| `text-h2` | 28px / 1.75rem | 700 | 1.25 | Section header |
| `text-h3` | 22px / 1.375rem | 600 | 1.3 | Card title, subsection |
| `text-h4` | 18px / 1.125rem | 600 | 1.4 | Label besar |
| `text-body-lg` | 16px / 1rem | 400 | 1.6 | Body teks utama |
| `text-body` | 14px / 0.875rem | 400 | 1.6 | Body teks standar |
| `text-sm` | 13px / 0.8125rem | 400 | 1.5 | Label, caption |
| `text-xs` | 12px / 0.75rem | 400 | 1.5 | Badge, timestamp |
| `text-mono` | 14px / 0.875rem | 500 | 1.5 | Credential display |

---

## 4. Spacing & Sizing

Menggunakan 4px base grid (konsisten dengan Tailwind default).

```
4px   → space-1  (tight gap, icon margin)
8px   → space-2  (inner padding kecil)
12px  → space-3  (padding kompak)
16px  → space-4  (padding standar)
20px  → space-5
24px  → space-6  (section gap kecil)
32px  → space-8  (section gap standar)
48px  → space-12 (section gap besar)
64px  → space-16 (antar section halaman)
```

**Border radius:**
```
4px  → rounded-sm  (input, badge kecil)
8px  → rounded     (tombol, input standar)
12px → rounded-lg  (card produk)
16px → rounded-xl  (modal, panel besar)
```

---

## 5. Components

### Button

```
Primary:   bg-primary text-white hover:bg-primary-hover
           px-6 py-2.5 rounded-lg font-semibold text-sm
           transition-colors duration-150

Secondary: bg-surface-2 text-text border border-border
           hover:border-primary hover:text-primary

Ghost:     bg-transparent text-text-muted hover:text-text hover:bg-surface-2

Danger:    bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20

Size SM:   px-4 py-1.5 text-xs
Size MD:   px-6 py-2.5 text-sm  ← default
Size LG:   px-8 py-3 text-base
```

### Badge / Label

```
Terlaris:  bg-warning/15 text-warning         border border-warning/30
Garansi:   bg-success/15 text-success         border border-success/30
Instan:    bg-accent/15  text-accent           border border-accent/30
Habis:     bg-danger/15  text-danger           border border-danger/30
Baru:      bg-primary/15 text-primary-light    border border-primary/30
Diskon:    bg-warning     text-zinc-950        font-bold  (solid)
```

### Card Produk

```
Container: bg-surface border border-border rounded-xl p-4
           hover:border-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]
           transition-all duration-200 cursor-pointer

Thumbnail: rounded-lg aspect-square object-cover w-full
Name:      text-h4 text-text font-semibold line-clamp-2
Price:     text-h3 text-primary font-bold
Original:  text-sm text-text-muted line-through
Rating:    ★ text-warning text-sm
Sold:      text-xs text-text-subtle "X terjual"
```

### Input / Form

```
Label:     text-sm text-text-muted font-medium mb-1.5
Input:     bg-surface-2 border border-border rounded-lg px-4 py-2.5
           text-sm text-text placeholder:text-text-subtle
           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
           transition-colors duration-150
Error:     border-danger focus:ring-danger/50
           + text-xs text-danger mt-1.5
```

### Status Badge (Order)

```
pending_payment: bg-zinc-800 text-zinc-400        "Menunggu Bayar"
paid:            bg-info/15 text-info             "Dibayar"
delivering:      bg-primary/15 text-primary-light "Diproses"
delivered:       bg-success/15 text-success       "Terkirim"
confirmed:       bg-success text-white            "Selesai"
delivery_failed: bg-danger/15 text-danger         "Gagal Kirim"
refunded:        bg-warning/15 text-warning       "Direfund"
expired:         bg-zinc-800 text-zinc-500        "Kedaluwarsa"
```

---

## 6. Iconography

Library: **Lucide React** — konsisten, lightweight, stroke-based.

```bash
npm install lucide-react
```

Icon size standard:
- `16px` — inline dengan teks, badge
- `20px` — tombol, label
- `24px` — menu, card icon
- `32px` — section header icon
- `48px` — empty state, fitur highlight

Stroke width: `1.5px` (default Lucide) — jangan ubah.

---

## 7. Logo Direction

**Konsep:** Wordmark minimalis. Prioritas keterbacaan di ukuran kecil (favicon, WhatsApp preview).

```
Teks "Jual" — weight 700, warna #FAFAFA (putih)
Teks "Akun" — weight 800, warna #6366F1 (indigo primary)
Font: Plus Jakarta Sans
```

**Variasi:**
- `logo-full.svg` — horizontal wordmark (header desktop)
- `logo-icon.svg` — inisial "JA" dalam kotak rounded, gradient primary→secondary (favicon, app icon)
- `logo-white.svg` — seluruhnya putih (untuk background gelap)
- `logo-dark.svg` — seluruhnya zinc-900 (untuk background terang)

**Don'ts:**
- Jangan stretch logo
- Jangan pakai warna lain selain yang ditetapkan
- Minimum size: 80px wide untuk wordmark, 24px untuk icon

---

## 8. Tailwind Config

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover:   '#4F46E5',
          light:   '#818CF8',
        },
        secondary: '#8B5CF6',
        accent:    '#22D3EE',
        surface: {
          DEFAULT: '#18181B',
          2:       '#27272A',
        },
        border: {
          DEFAULT: '#3F3F46',
          subtle:  '#27272A',
        },
        text: {
          DEFAULT: '#FAFAFA',
          muted:   '#A1A1AA',
          subtle:  '#71717A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#38BDF8',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-accent':  'linear-gradient(135deg, #4F46E5 0%, #22D3EE 100%)',
      },
    },
  },
}
```

---

## 9. Dark Mode sebagai Default

JualAkun menggunakan **dark mode sebagai default**. Light mode tersedia sebagai fallback via `prefers-color-scheme`.

```tsx
// app/layout.tsx — set class="dark" di <html>
<html lang="id" className="dark">
```

Semua komponen dibangun dark-first. Light mode di-support tapi bukan prioritas MVP.

---

## 10. Contoh Visual Reference

Referensi UI yang sejalan dengan brand direction:
- **[Linear.app](https://linear.app)** — card style, spacing, dark surface
- **[Vercel.com](https://vercel.com)** — hero section, typography hierarchy
- **[Raycast.com](https://raycast.com)** — gradient usage, glassmorphism subtle
- **[Tokopedia](https://tokopedia.com)** — trust badges, product card pattern (tapi dark version)
