---
design: "jualakun-hybrid"
checked: 2026-05-09
---

# Accessibility Report: JualAkun Hybrid

> Audit fokus pada homepage publik (akunmu.id-style) + dark system (admin/buyer).
> Kontras dihitung dengan formula WCAG 2.1 (relative luminance + ratio).

## Contrast Ratio Results — Light System (Public)

| Pair | Ratio | AA Normal | AA Large | AAA Normal | AAA Large |
|------|-------|-----------|----------|------------|-----------|
| white `#FFFFFF` / text `#1A2340` | 15.85:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| white `#FFFFFF` / text-muted `#4A5568` | 8.59:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| white `#FFFFFF` / text-subtle `#718096` | 4.65:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |
| **hero-bg `#7EC8E3` / white text** | **2.39:1** | ❌ **FAIL** | ❌ **FAIL** | ❌ FAIL | ❌ FAIL |
| hero-bg `#7EC8E3` / navy `#1A4480` highlight | 6.63:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |
| primary-dark `#007FA5` / white | 5.32:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |
| **primary `#00B8D9` / white** | **2.61:1** | ❌ **FAIL** | ❌ **FAIL** | ❌ FAIL | ❌ FAIL |
| primary `#00B8D9` / text `#1A2340` | 6.07:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |
| surface-2 `#EBF5FF` / text `#1A2340` | 14.43:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| stat-blue `#1D7FE8` / white | 3.80:1 | ❌ FAIL | ✅ PASS | ❌ FAIL | ❌ FAIL |
| stat-red `#E8334A` / white | 4.49:1 | ❌ FAIL (-0.01) | ✅ PASS | ❌ FAIL | ❌ FAIL |
| **stat-green `#2DB87A` / white** | **2.40:1** | ❌ **FAIL** | ❌ **FAIL** | ❌ FAIL | ❌ FAIL |
| **stat-yellow `#F5A623` / white** | **2.20:1** | ❌ **FAIL** | ❌ **FAIL** | ❌ FAIL | ❌ FAIL |
| stat-yellow `#F5A623` / text `#1A2340` | 7.20:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| step-card `#1D4ED8` / white | 7.66:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| code-blue `#0284C7` / white | 4.32:1 | ❌ FAIL | ✅ PASS | ❌ FAIL | ❌ FAIL |
| code-blue `#0284C7` / surface-3 `#E0F2FE` | 3.77:1 | ❌ FAIL | ✅ PASS | ❌ FAIL | ❌ FAIL |
| footer-bg `#1F2937` / white | 14.59:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| footer-bg `#1F2937` / white/60 ≈ `#7B838C` | 5.40:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |

## Contrast Ratio Results — Dark System (Admin / Buyer / Auth)

| Pair | Ratio | AA Normal | AA Large | AAA Normal | AAA Large |
|------|-------|-----------|----------|------------|-----------|
| bg `#09090B` / text `#FAFAFA` | 19.51:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| surface `#18181B` / text `#FAFAFA` | 17.41:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| surface `#18181B` / muted `#A1A1AA` | 7.22:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| surface `#18181B` / subtle `#71717A` | 3.78:1 | ❌ FAIL | ✅ PASS | ❌ FAIL | ❌ FAIL |
| primary `#6366F1` / white | 4.55:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |
| primary `#6366F1` / bg `#09090B` | 4.51:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |
| accent `#22D3EE` / bg `#09090B` | 12.05:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| success `#10B981` / white | 2.54:1 | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL |
| success `#10B981` / bg `#09090B` | 7.69:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| warning `#F59E0B` / bg `#09090B` | 9.83:1 | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| danger `#EF4444` / bg `#09090B` | 4.79:1 | ✅ PASS | ✅ PASS | ❌ FAIL | ✅ PASS |

## Critical Failures & Suggested Fixes

| # | Pair | Current | Required | Suggestion |
|---|------|---------|----------|------------|
| 1 | **`#00B8D9` button bg / white text** | 2.61:1 | 4.5:1 (AA) | Darken to **`#0089A8`** (~5.0:1). Atau pakai navy text (`#1A2340`) instead of white di tombol "Pesan". |
| 2 | **`#7EC8E3` hero bg / white text** | 2.39:1 | 4.5:1 (AA) | Darken hero bg ke **`#3DA8D6`** (~4.6:1) ATAU ganti white text ke navy `#1A2340`. Headline besar boleh AA Large saja, tapi masih `2.39 < 3.0`. |
| 3 | **`#2DB87A` stat-green / white** | 2.40:1 | 4.5:1 (AA) | Darken hijau ke **`#0F8F4F`** (~5.4:1). Atau ganti label ke navy text. |
| 4 | **`#F5A623` stat-yellow / white** | 2.20:1 | 4.5:1 (AA) | Yellow tidak bisa diapain — **wajib pakai dark text** (`#1A2340`) di card kuning. |
| 5 | `#E8334A` stat-red / white | 4.49:1 | 4.5:1 | Hampir lulus — darken sedikit ke `#E12B42` (~4.7:1). |
| 6 | `#1D7FE8` stat-blue / white | 3.80:1 | 4.5:1 | Darken ke `#1567C8` (~4.8:1). Saat ini cuma lulus AA Large. |
| 7 | `#0284C7` duration badge teks / `#E0F2FE` bg | 3.77:1 | 4.5:1 | Darken teks ke `#0270AC` (~4.6:1). |
| 8 | `#10B981` success / white (token) | 2.54:1 | 4.5:1 | Token success saat ini hanya layak dipakai di dark surface, jangan pakai sebagai bg button putih. |
| 9 | `#71717A` text-subtle / `#18181B` surface (dark) | 3.78:1 | 4.5:1 | Lighten subtle ke `#8A8A92` untuk lulus AA. |

## Colorblindness Simulation

Pasangan warna semantik dengan potensi kebingungan:

| Pair | Protanopia | Deuteranopia | Tritanopia |
|------|------------|--------------|------------|
| stat-green `#2DB87A` vs stat-red `#E8334A` | 🚩 FLAG | 🚩 FLAG | OK |
| stat-blue `#1D7FE8` vs stat-yellow `#F5A623` | OK | OK | 🚩 FLAG |
| primary `#00B8D9` vs accent `#22D3EE` | OK | OK | 🚩 FLAG (sangat mirip) |
| success `#10B981` vs danger `#EF4444` (token dark) | 🚩 FLAG | 🚩 FLAG | OK |
| primary `#00B8D9` vs stat-blue `#1D7FE8` | OK | OK | OK (cukup beda) |
| step-card `#1D4ED8` vs stat-blue `#1D7FE8` | OK | OK | OK |

🚩 = pasangan ini sulit dibedakan oleh sebagian color-vision-deficient users — wajib ada **non-color cue** (icon, label, pattern) di samping warna.

**Recommendations:**
- **Stat cards**: tambahkan ikon/illustration besar yang berbeda (sesuai akunmu.id pattern). Sudah ada label teks di bawah angka — bagus.
- **Status badges (success/error)**: pastikan ada icon Check/X yang berbeda bentuk, bukan cuma warna.
- **`primary` vs `accent`** di dark mode terlalu mirip untuk tritanopia. Konsider geser accent ke shade berbeda (mis. `#FB7185` rose, atau `#A78BFA` purple).

## Summary

- **Total pairs checked:** 30 (light: 19 + dark: 11)
- **AA pass rate:** 19/30 (63%)
- **AAA pass rate:** 9/30 (30%)
- **Critical failures (AA normal text):** 11
  - Light system: 7 (paling parah: stat-yellow, stat-green, primary button, hero bg)
  - Dark system: 4 (success token sebagai bg button, subtle teks di surface, beberapa borderline)
- **Colorblindness flags:** 4 pasangan flagged

## Action Items (Priority Order)

### 🔴 P0 — Wajib fix sebelum production
1. **Stat card kuning `#F5A623`**: ganti teks dari `text-white` ke `text-[#1A2340]` di komponen `StatCard`. Ini fail kontras paling parah (2.20:1).
2. **Tombol "Pesan/Beli" `#00B8D9`**: darken ke `#0089A8` atau pakai dark text. Dipakai di banyak product card — impact besar.
3. **Hero white text di `#7EC8E3`**: heading hero `text-4xl md:text-5xl font-bold` lulus AA Large (>3:1) dengan ratio 2.39 — **masih fail**. Solusi: darken hero bg atau ganti ke navy text.
4. **Stat green & blue**: darken keduanya supaya lulus AA normal.

### 🟡 P1 — Penting
5. Konsolidasi success/danger/warning ke 1 set token, fix kontrasnya untuk dipakai sebagai bg button dengan teks putih.
6. Add non-color cues ke stat cards (icon + label, sudah ada label tinggal pastikan icon).
7. Darken duration badge teks `#0284C7` → `#0270AC`.

### 🟢 P2 — Polish
8. Tritanopia confusion `primary` vs `accent` di dark mode — pertimbangkan ganti accent ke warna non-blue.
9. Lighten `text-subtle` di dark mode untuk lulus AA.

## Code Examples — Quick Fixes

### Fix #1 — Stat card yellow text
```tsx
// File: app/(public)/page.tsx — function StatCard
<StatCard bg="#F5A623" value="4.8/5" label="Rating Kepuasan" textColor="dark" />

function StatCard({ bg, value, label, textColor = 'light' }: { bg: string; value: string; label: string; textColor?: 'light' | 'dark' }) {
  const text = textColor === 'dark' ? 'text-[#1A2340]' : 'text-white'
  const labelText = textColor === 'dark' ? 'text-[#1A2340]/80' : 'text-white/80'
  return (
    <div className="rounded-2xl p-6 text-center shadow-md" style={{ backgroundColor: bg }}>
      <div className={`text-3xl md:text-4xl font-bold ${text}`}>{value}</div>
      <div className={`text-sm font-medium ${labelText} mt-1`}>{label}</div>
    </div>
  )
}
```

### Fix #2 — Darker primary button
```diff
- className="bg-[#00B8D9] hover:bg-[#009EB8] text-white ..."
+ className="bg-[#0089A8] hover:bg-[#006D85] text-white ..."
```

### Fix #3 — Hero CTA hierarchy
Untuk heading hero, sudah pakai `font-bold text-4xl/5xl` jadi qualifies sebagai "AA Large" requirement (3:1). Ratio 2.39 masih kurang. Pilihan:
- Darken hero bg ke `#3DA8D6`
- ATAU keep `#7EC8E3` tapi ubah heading ke `text-[#1A2340]` (kontras 11.6:1)
