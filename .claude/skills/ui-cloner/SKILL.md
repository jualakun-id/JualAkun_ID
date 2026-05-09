# Skill: ui-cloner

## Deskripsi
Clone atau adaptasi UI JualAkun agar mirip dengan design style akunmu.id — light mode, colorful stat cards, pill buttons, illustration-friendly, font Poppins.

## Dipanggil dengan
`/ui-cloner [nama komponen atau halaman]`

Contoh:
- `/ui-cloner homepage hero`
- `/ui-cloner stat cards`
- `/ui-cloner product card`
- `/ui-cloner navbar`
- `/ui-cloner homepage full`

---

## Instruksi Eksekusi

### 1. Baca Design Reference WAJIB
Sebelum generate apapun, baca: `.claude/skills/ui-cloner/references/akunmu-design.md`
Ini berisi color palette, typography, component patterns, dan perbedaan vs design JualAkun saat ini.

### 2. Tentukan Scope
- **Komponen tunggal** (misal: `stat-cards`, `product-card`, `hero-section`) → generate 1 file komponen
- **Halaman** (misal: `homepage`) → generate page.tsx + komponen yang dibutuhkan
- **Full redesign** → tanyakan dulu apakah dark mode dipertahankan atau switch ke light

### 3. Design Rules (Akunmu Style)

#### Warna — JANGAN gunakan Tailwind custom tokens JualAkun yang dark
```tsx
// ✅ Akunmu style — hardcode atau gunakan hex langsung
<div className="bg-[#EBF5FF]">          // page background
<div className="bg-white shadow-lg">    // card
<button className="bg-[#00B8D9] rounded-full">  // CTA button

// ❌ Jangan pakai dark tokens
<div className="bg-surface text-text">  // ini design JualAkun lama
```

#### Typography
```tsx
// Tambahkan font Poppins jika belum ada di layout.tsx
// Gunakan className pattern:
<h1 className="text-4xl font-bold text-[#1A2340] leading-tight">
<p className="text-[#718096] text-base">
<span className="text-[#00B8D9] font-semibold">   // accent teal
<span className="text-[#E8334A] font-bold">        // accent merah (highlight)
```

#### Cards
```tsx
// Product / Service Card — light mode
<div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] 
                border border-gray-100 hover:shadow-md transition-all">

// Stat Card — colorful solid
<div className="bg-[#1D7FE8] rounded-2xl p-6 text-center">  // biru
<div className="bg-[#E8334A] rounded-2xl p-6 text-center">  // merah
<div className="bg-[#2DB87A] rounded-2xl p-6 text-center">  // hijau
<div className="bg-[#F5A623] rounded-2xl p-6 text-center">  // kuning
```

#### Buttons
```tsx
// Primary — pill shape, teal
<button className="bg-[#00B8D9] hover:bg-[#009EB8] text-white font-semibold 
                   px-8 py-3 rounded-full transition-colors shadow-md">

// Secondary — outline teal
<button className="border-2 border-[#00B8D9] text-[#00B8D9] font-semibold 
                   px-8 py-3 rounded-full hover:bg-[#00B8D9] hover:text-white transition-all">

// Small — untuk card
<button className="bg-[#00B8D9] text-white text-sm px-4 py-1.5 rounded-full">
```

#### Hero Section Pattern
```tsx
<section className="bg-gradient-to-b from-[#BFDEF8] to-white min-h-[80vh] 
                    flex flex-col items-center justify-center text-center px-4">
  {/* Illustration placeholder atau SVG */}
  <div className="w-72 h-72 mb-8">
    {/* <img> atau SVG illustration */}
  </div>
  <h1 className="text-4xl md:text-5xl font-bold text-[#1A2340] max-w-2xl leading-tight">
    Tagline <span className="text-[#E8334A]">Highlight</span> Kata
  </h1>
  <p className="text-[#718096] text-lg mt-4 max-w-md">
    Subheading singkat dan jelas
  </p>
  <button className="mt-8 bg-[#00B8D9] text-white font-semibold px-10 py-4 rounded-full 
                     shadow-lg hover:bg-[#009EB8] transition-colors text-lg">
    CTA Text
  </button>
</section>
```

### 4. Illustration Handling
Akunmu.id pakai flat/cartoon illustrations. Untuk JualAkun:
- Gunakan placeholder `<div className="bg-[#BFDEF8] rounded-3xl w-full aspect-video flex items-center justify-center"><span className="text-[#00B8D9]">Illustration</span></div>`
- Atau gunakan Lucide icons yang dibesar (w-24 h-24) dengan warna teal
- Jangan gunakan emoji sebagai pengganti illustration di production

### 5. Kompabilitas dengan Kode JualAkun yang Ada
- Tetap gunakan Server Components by default
- Tetap pakai `import type { Product, Category } from '@/types'`
- Tetap pakai `serverFetch` untuk data fetching
- Hanya ubah **visual layer** (className), bukan logika/data fetching

### 6. Output Format
Berikan:
1. **File path** — relatif dari root repo
2. **Kode lengkap** — siap replace file existing atau buat baru
3. **Catatan** — apakah perlu update `layout.tsx` untuk Poppins font, dll
4. **Preview deskripsi** — 2-3 kalimat tentang tampilan hasilnya

---

## Referensi
- Design analysis lengkap: `.claude/skills/ui-cloner/references/akunmu-design.md`
- Struktur file existing: `docs/sitemap.md`
- Kode current: `frontend/app/(public)/page.tsx` (homepage)
- Brand guide asli: `docs/brand-guide.md` (untuk perbandingan)
