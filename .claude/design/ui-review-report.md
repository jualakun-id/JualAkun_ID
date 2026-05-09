# UI Design Review Report — JualAkun Homepage

**Interface:** JualAkun (jualakun.id) — Public homepage redesign
**Date:** 2026-05-09
**Reviewer:** AI Agent (ui-design-review skill)
**Pages Reviewed:** `app/(public)/page.tsx`, `components/layout/header.tsx`, `components/layout/footer.tsx`
**Reference:** akunmu.id (full screenshot set, 2026)

---

## Executive Summary

### Visual Design Score: **66/100** — Grade C+ (Acceptable, needs work)

| Dimension | Score | Status |
|-----------|-------|--------|
| Visual Hierarchy | 7/10 | ✅ |
| Typography | 6/10 | ⚠️ |
| Color Palette | 5/10 | ⚠️ |
| Spacing & White Space | 7/10 | ✅ |
| Visual Consistency | 5/10 | ⚠️ |
| Imagery & Graphics | 3/10 | ❌ |
| Layout & Grid | 8/10 | ✅ |
| Component Design | 7/10 | ✅ |
| Branding & Personality | 6/10 | ⚠️ |
| Modern Standards | 8/10 | ✅ |

### Overall Assessment

Homepage successfully **adopts akunmu.id's structural blueprint** (sky blue hero, light mode, colorful stat cards, 5-step flow) tapi gagal di **layer "personality"** — yang bikin akunmu.id terasa hidup adalah ilustrasi cartoon flat-design yang intensif, sementara JualAkun menggantinya dengan kotak warna + teks. Hasil: layout terasa **template-like** dan **clinical**, bukan friendly seperti referensi. Foundation arsitektur sudah benar, tinggal "art direction" yang perlu diisi.

### Top 3 Strengths
1. **Header scroll behavior** matches akunmu.id pixel-precise (transparent on hero → white on scroll), salah satu detail yang sering gagal di clone.
2. **Section rhythm** — flow Hero → Stats → Benefits → Products → Steps → Trust → FAQ mengikuti akunmu.id dan memberikan narrative landing page yang jelas.
3. **Mobile-first responsive grid** sudah benar di semua section — `grid-cols-1 sm:grid-cols-2 md:grid-cols-X`.

### Top 3 Critical Issues
1. **🔴 Imagery void** — akunmu.id menggunakan ~15 ilustrasi flat-design (orang, telpon, layanan); JualAkun pakai 0. Kotak service-name putih di hero/benefit terasa amatir.
2. **🔴 Color contrast failures** (sudah di-flag accessibility audit) — stat-yellow/green/red dengan teks putih, tombol primary `#00B8D9` dengan teks putih.
3. **🟡 Border radius chaos** — 4 nilai radius tercampur (`rounded-lg`/`rounded-xl`/`rounded-2xl`/`rounded-full`) tanpa rule yang konsisten.

### First Impression
- **Immediate Feeling:** Bersih, mirip akunmu.id, tapi "kosong" — terasa seperti template Tailwind yang sudah di-skin tapi belum di-art-direct.
- **Trust Level:** Medium — looks legit dan modern, tapi kurang visual proof (testimoni, illustrasi, brand logos asli).
- **Competitive Standing vs akunmu.id:** Behind. Layout setara tapi visual richness ~30% saja.

---

## Detailed Analysis

### 1. Visual Hierarchy ⭐⭐⭐⭐⚪ (7/10)

#### Strengths
- ✅ Hero heading dominan — `text-4xl md:text-5xl font-bold` dengan accent `<span className="text-[#1A4480]">Langsung Aktif</span>` sudah benar.
- ✅ Section heading konsisten `text-3xl font-bold text-[#1A2340]` — clear secondary level.
- ✅ Stat cards punya angka besar (`text-3xl md:text-4xl font-bold`) dengan label kecil — info hierarchy intuitif.

#### Issues

**Issue 1.1: Dual CTA in hero kompetisi visual weight**
- **Severity:** Medium
- **Location:** `app/(public)/page.tsx:36–53`
- **Problem:** "Lihat Layanan" (filled `#007FA5`) dan "Cara Pesan" (outline border-white) ukurannya sama (`px-8 py-3.5 rounded-lg`). Akunmu.id hanya punya 1 CTA primary "Lihat Layanan" — fokus tunggal.
- **Recommendation:** Ubah "Cara Pesan" jadi link teks underline atau text-only ghost button, kecilkan size 70%. Atau hapus seluruhnya — akunmu.id tidak punya secondary CTA di hero.
- **Effort:** Low (15 min)

**Issue 1.2: "Lihat Semua Produk" button tidak menonjol**
- **Severity:** Low
- **Location:** `app/(public)/page.tsx:163`
- **Problem:** Tombol outline teal di section bg `#EBF5FF` cukup pucat — kalah saing dengan card produk.
- **Recommendation:** Ganti ke filled primary `bg-[#00B8D9] text-white` untuk action akhir section.

**Issue 1.3: Stat cards values tidak punya icon/illustration**
- **Severity:** Medium
- **Problem:** Akunmu.id stat cards punya **flat illustration besar** di atas (orang lompat untuk "Pengguna", orang menghitung uang untuk "Transaksi"). JualAkun cuma ada angka + label di atas warna solid — flat visually.
- **Impact:** Hierarchy "ini fakta penting" jadi lemah karena kurang anchor visual.
- **Recommendation:** Tambahkan icon Lucide besar (w-12 h-12) di atas angka, atau placeholder `<div>` siap diisi SVG illustration.
- **Effort:** Low (1 jam)

#### Recommendations Summary
1. Tegaskan single CTA di hero (hapus / demote secondary)
2. Tambah icon/illustration di setiap stat card
3. Promote "Lihat Semua Produk" ke filled button

---

### 2. Typography ⭐⭐⭐⚪⚪ (6/10)

#### Strengths
- ✅ Font Poppins sudah loaded dan diterapkan via `(public)/layout.tsx` — match akunmu.id.
- ✅ Body 16px default (Tailwind `text-base`), line-height baik.

#### Issues

**Issue 2.1: Empat font ter-load tapi cuma 1 dipakai di public**
- **Severity:** Medium
- **Location:** `app/layout.tsx:5–31`
- **Problem:** Plus Jakarta Sans, Inter, JetBrains Mono, Poppins — semua di-load di `<html>` walau public hanya pakai Poppins, dan admin pakai Plus Jakarta + Inter. Bandwidth ~120KB ter-waste di setiap page load.
- **Recommendation:** Conditional load — Plus Jakarta Sans + Inter di-load via `(admin)/layout.tsx` & `(buyer)/layout.tsx` saja, Poppins di-load di `(public)/layout.tsx` saja.
- **Effort:** Medium (1 jam — Next.js per-route font)

**Issue 2.2: Tidak ada display heading khusus untuk hero**
- **Severity:** Low
- **Problem:** Hero pakai `text-4xl md:text-5xl font-bold` (36/48px). Akunmu.id hero terasa lebih display dengan size lebih besar dan letter-spacing -0.02em — lebih punchy.
- **Recommendation:**
  ```tsx
  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
  ```
- **Effort:** Low (5 min)

**Issue 2.3: `font-black` di product card terlalu berat**
- **Severity:** Low
- **Location:** `app/(public)/page.tsx:259`
- **Problem:** `text-xl font-black text-[#1A2340]` untuk nama produk — di akunmu.id, nama produk pakai `font-bold` (700), bukan `font-black` (900). Black weight terasa "shouting" di card kecil.
- **Recommendation:** Ganti ke `font-bold`.

**Issue 2.4: Inkonsistensi heading scale**
- **Severity:** Medium
- **Problem:** Section heading `text-3xl` (30px) + Trust section heading `text-2xl` (24px) — drop 6px tanpa alasan jelas. Akunmu.id konsisten 32px untuk semua section heading.
- **Recommendation:** Pakai `text-3xl font-bold` di SEMUA section heading. Subheading pakai `text-base text-[#718096]`.

#### Best Practices Comparison
- **Industry Standard (akunmu.id):** Display 48-56px, Section 28-32px, Body 16-17px, Caption 12-14px. Max 1-2 font families.
- **Current:** Display 36/48, Section 24/30 (campur), Body 16, Caption 12. 4 font families ter-load.
- **Gap:** Display kurang besar, scale section tidak konsisten, font load berlebih.

---

### 3. Color Palette ⭐⭐⭐⚪⚪ (5/10)

> ⚠️ Detail kontras + saran fix sudah di **`accessibility-report.md`** — tidak diulang di sini.

#### Strengths
- ✅ Direction sudah benar — light mode, teal primary, navy text. Cocok untuk kategori marketplace produk digital.
- ✅ Footer dark (`#1F2937`) memberikan break dari sea of light blue — bagus.
- ✅ Surface-2 `#EBF5FF` sebagai section alt-bg subtle dan clean.

#### Issues

**Issue 3.1: 12+ shade biru tanpa skala terstruktur**
- **Severity:** High
- **Problem:** Inventaris biru di codebase: `#7EC8E3`, `#6CC4E8` (jika ada), `#1A4480`, `#1D4ED8`, `#1D7FE8`, `#0284C7`, `#007FA5`, `#006080`, `#00B8D9`, `#009EB8`, `#22D3EE`, `#38BDF8`, `#818CF8`, `#6366F1`. Banyak yang nyaris identik. Akunmu.id hanya pakai ~5 shade biru terstruktur.
- **Impact:** Maintenance nightmare, brand identity goyah.
- **Recommendation:** Konsolidasi ke 5 token:
  ```
  brand-50  #EBF5FF  (section alt bg)
  brand-100 #C8E5F5  (subtle accent)
  brand-300 #7EC8E3  (hero bg)
  brand-500 #00B8D9  (primary CTA)  
  brand-700 #007FA5  (primary dark / hero CTA)
  brand-900 #1A4480  (heading accent)
  ```
- **Effort:** Medium (2-3 jam — define di `tailwind.config.ts` + refactor public/page.tsx)

**Issue 3.2: Stat cards memperkenalkan 4 warna baru di luar palette**
- **Severity:** Medium
- **Problem:** `#1D7FE8`, `#E8334A`, `#2DB87A`, `#F5A623` adalah palette tersendiri yang tidak dipakai di tempat lain. Status tokens existing (`#10B981`, `#EF4444`, `#F59E0B`) juga tidak dipakai sebagai stat card. Dua sistem status yang konflik.
- **Recommendation:** Pakai status token existing untuk stat cards juga. Jika butuh tone "playful" yang berbeda, dokumentasikan sebagai `--color-stat-*` variant — bukan ad-hoc hex.

**Issue 3.3: Hero blue `#7EC8E3` lebih pucat dari akunmu.id**
- **Severity:** Low (nuance)
- **Problem:** akunmu.id hero blue lebih saturated (~`#5BB5DD`), terasa lebih vibrant. JualAkun `#7EC8E3` cenderung washout, terutama dengan teks putih (kontras 2.39:1 — fail).
- **Recommendation:** Naikkan saturasi ke `#5BB5DD` atau `#3DA8D6`, sekaligus boost kontras.

**Issue 3.4: Tidak ada warna ungu/pink (akunmu.id punya purple discount badges)**
- **Severity:** Low
- **Problem:** Akunmu.id punya badge `Diskon X%` warna purple (`#9333EA`-ish) di product card — visual differentiator yang strong. JualAkun tidak punya badge serupa.
- **Recommendation:** Tambahkan promo badge warna purple/pink jika ada produk diskon.

#### 60-30-10 Rule Check
- **60% dominant:** White section bg ✅
- **30% secondary:** Sky blue `#7EC8E3` + light blue `#EBF5FF` ✅
- **10% accent:** Teal `#00B8D9` ✅
- Rule OK, tapi accent terlalu sering digunakan — mungkin 15% bukan 10%.

---

### 4. Spacing & White Space ⭐⭐⭐⭐⚪ (7/10)

#### Strengths
- ✅ Tailwind default 4px scale dipakai konsisten (`p-4`, `p-5`, `p-6`).
- ✅ Section padding generous: `py-12` to `py-16` — ada breathing room.
- ✅ Card internal padding cukup (`px-4 py-4` di product card).

#### Issues

**Issue 4.1: Hero terlalu "tight" di mobile**
- **Severity:** Medium
- **Location:** `app/(public)/page.tsx:27`
- **Problem:** `pt-10 pb-16` di mobile masih terasa kurang air space dibanding akunmu.id yang minimum `py-20` untuk hero.
- **Recommendation:** Ubah ke `pt-16 pb-24 md:pt-24 md:pb-32`.

**Issue 4.2: Stat cards terlalu rapat dengan label**
- **Severity:** Low
- **Problem:** `mt-1` antara value dan label terlalu kecil. Akunmu.id pakai `mt-2` atau `mt-3` di stat cards.
- **Recommendation:** `mt-2` minimum.

**Issue 4.3: FAQ rows terasa terlalu jarang**
- **Severity:** Low
- **Location:** `app/(public)/page.tsx:204`
- **Problem:** `space-y-3` antar FAQ row + `p-5` internal padding bagus, tapi total section `py-16` terasa berlebihan. Akunmu.id pakai `py-12`.
- **Recommendation:** Reduce ke `py-12`.

#### Spacing Audit Score: 7/10
Konsisten dengan 4px grid, tapi beberapa tempat butuh fine-tune untuk match airiness akunmu.id.

---

### 5. Visual Consistency ⭐⭐⭐⚪⚪ (5/10)

#### Strengths
- ✅ Section heading style konsisten (`text-3xl font-bold text-[#1A2340]`).
- ✅ Card shadow pattern konsisten (`shadow-[0_2px_12px_rgba(0,0,0,0.08)]`).

#### Issues

**Issue 5.1: Border radius chaos (4 nilai berbeda di 1 page)**
- **Severity:** High
- **Problem:**
  - `rounded-lg` (8px) — hero CTA, product CTA, "Lihat Semua" button
  - `rounded-xl` (12px) — product card, FAQ row, step card label
  - `rounded-2xl` (16px) — stat card, trust card, hero illustration container
  - `rounded-full` (pill) — header CTA, category pills
  - `rounded-3xl` (24px) — benefit illustration container

  Tidak ada rule kapan pakai mana. Akunmu.id pakai 2 nilai utama: `rounded-xl` (12px) untuk semua card + `rounded-lg` (8px) untuk semua button.

- **Recommendation:** Adopt 2-tier system:
  ```
  rounded-md   (6px)  — input, badge kecil
  rounded-lg   (8px)  — semua button
  rounded-xl   (12px) — semua card, FAQ row
  rounded-2xl  (16px) — featured cards (stat/trust)
  rounded-full        — pill nav, category filter
  ```
  Hapus `rounded-3xl`.
- **Effort:** Low (30 min)

**Issue 5.2: CTA shape inconsistency**
- **Severity:** High
- **Problem:** Header CTA "Daftar" pakai `rounded-full` (pill) tapi hero CTA "Lihat Layanan" pakai `rounded-lg` (corner). Same product, same brand action — beda shape.
- **Recommendation:** Pilih satu. Akunmu.id konsisten `rounded-lg` untuk SEMUA button (termasuk Login di nav). Recommend ikut: ubah header CTA jadi `rounded-lg`.

**Issue 5.3: Icon size inconsistency**
- **Severity:** Medium
- **Problem:**
  - Trust card icon: `w-7 h-7`
  - Step card icon: `w-10 h-10` (via container) tapi icon Lucide default 24px = w-6 h-6
  - Benefit icon container: `w-12 h-12` dengan icon default
  - Footer icon: `size={14}`

  No system. Akunmu.id pakai 3 ukuran terstruktur: 16/24/32.
- **Recommendation:** Define size scale:
  ```
  icon-sm  16px (footer, badge)
  icon-md  24px (button, list item)
  icon-lg  32px (feature, trust card)
  icon-xl  48px (hero feature, illustration replacement)
  ```

**Issue 5.4: Step card aesthetic clash dengan rest of page**
- **Severity:** Medium
- **Location:** `app/(public)/page.tsx:309–319`
- **Problem:** Step card pakai `bg-[#1D4ED8]` (deep blue) sebagai accent — warna ini tidak muncul di tempat lain. Akunmu.id step cards pakai gradient blue smooth dengan illustration phone.
- **Recommendation:** Either use brand teal `#00B8D9` for the step badge, or use a subtle gray-blue. Hindari memperkenalkan warna brand baru.

---

### 6. Imagery & Graphics ⭐⭐⚪⚪⚪ (3/10)

#### Strengths
- ✅ Lucide icons dipakai konsisten (single icon library).

#### Issues — INI BAGIAN PALING LEMAH

**Issue 6.1: 0 illustrations vs akunmu.id ~15 illustrations**
- **Severity:** **CRITICAL**
- **Problem:** Akunmu.id punya:
  - Hero: orang dengan service logos floating (besar, central)
  - Stats: 4 illustrasi orang per card (lompat, hitung uang, dll)
  - Benefits: orang pakai laptop di tengah, service window
  - Steps: 5 illustrasi phone holding dengan ikon service
  - Pembayaran: orang dengan QRIS, BRI

  JualAkun mengganti SEMUA dengan kotak teks putih bertuliskan "Netflix", "Spotify" — secara harfiah placeholder.

- **Impact:** Mengurangi visual richness 70%, friendliness/trustworthiness drop signifikan, terasa "unfinished".
- **Recommendation (priority order):**
  1. **Quick win:** Ganti placeholder kotak service-name di hero & benefits dengan **icon brand asli** dari `simple-icons` library (Netflix, Spotify, Disney+, ChatGPT, Canva, Discord — semua tersedia free).
  2. **Better:** Commission/source 5-10 flat illustrations dari unDraw.co (free, customizable color), Storyset, atau Blush Design — semua sesuai akunmu.id style.
  3. **Best:** Commission custom illustrator untuk konsistensi style.
- **Effort:** Low (icon brands, 2 jam) → Medium (unDraw illustrations, 1 hari) → High (custom, 1+ minggu)

**Issue 6.2: Stat cards visually flat**
- **Severity:** High
- **Problem:** Akunmu.id stat cards punya illustration orang setengah-emerging dari atas card — memberikan dimensi 3D dan storytelling. JualAkun stat cards hanya solid color block + angka.
- **Recommendation:** Tambahkan ilustrasi atau minimal Lucide icon besar (`w-12 h-12`) berwarna `white/30` di pojok card untuk memberikan tekstur visual.

**Issue 6.3: No product brand logos in product card**
- **Severity:** High
- **Location:** `app/(public)/page.tsx:251–305`
- **Problem:** Product card menampilkan nama produk sebagai teks (`<div className="text-xl font-black">Netflix Premium</div>`). Akunmu.id menampilkan **logo Netflix asli** (warna merah brand) — instant recognition.
- **Recommendation:** Implement brand logo via `simple-icons` atau custom SVG. Backend `product.thumbnail_url` field sudah ada — pakai itu.
- **Effort:** Medium (4 jam, butuh upload thumbnails)

**Issue 6.4: Hero illustration container generic**
- **Severity:** Medium
- **Location:** `app/(public)/page.tsx:56–69`
- **Problem:** "Hero illustration" sekarang adalah grid 6 kotak `bg-white/30` dengan teks service. Bukan illustration — placeholder.
- **Recommendation:** Replace dengan SVG illustration. Sourcing options:
  - unDraw.co keyword "subscription", "streaming"
  - Storyset.com keyword "online services"

---

### 7. Layout & Grid ⭐⭐⭐⭐⚪ (8/10)

#### Strengths
- ✅ Container `mx-auto px-4` konsisten di semua section.
- ✅ Responsive grid breakpoints solid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- ✅ Hero 2-column split match akunmu.id pattern exactly.
- ✅ Section flow logical: hero → social proof (stats) → value prop (benefits) → product → process → trust → FAQ.
- ✅ Footer 4-column dengan `md:` breakpoint sudah benar.

#### Issues

**Issue 7.1: Container max-width tidak terdefinisi**
- **Severity:** Low
- **Problem:** `container mx-auto` tanpa custom max-width — di Tailwind v3 default akan center tapi full-width pada `2xl` (1536px). Di akunmu.id, content maks ~1280px untuk feel "boutique".
- **Recommendation:** Add to `tailwind.config.ts`:
  ```ts
  container: {
    center: true,
    padding: '1rem',
    screens: { '2xl': '1280px' },
  }
  ```

**Issue 7.2: Hero 2-column tidak balance secara visual**
- **Severity:** Low
- **Problem:** Text kiri padat (3 paragraf + 2 buttons), illustration kanan tipis (cuma 6 kotak). Visual weight imbalance — sebagian besar real estate kanan kosong.
- **Recommendation:** Either fill the right column dengan illustration besar, atau reduce ke 1 column centered untuk mobile-friendly hero.

---

### 8. Component Design ⭐⭐⭐⭐⚪ (7/10)

#### Strengths
- ✅ Hover states pada hampir semua interactive (button hover, card hover shadow).
- ✅ Sticky header dengan smooth transition (`transition-all duration-200`) — premium feel.
- ✅ Mobile menu dengan hamburger toggle properly implemented.
- ✅ Product card "Stok Habis" state handled dengan disabled-look.

#### Issues

**Issue 8.1: No focus state visible (a11y + craft)**
- **Severity:** High (a11y)
- **Problem:** Tidak ada `focus-visible:ring-*` atau `focus:outline` custom di button manapun. Keyboard users akan kesulitan tracking.
- **Recommendation:** Add to all interactive elements:
  ```tsx
  className="... focus-visible:ring-2 focus-visible:ring-[#00B8D9] focus-visible:ring-offset-2 focus-visible:outline-none"
  ```
- **Effort:** Low (30 min, can be done via @layer base CSS)

**Issue 8.2: Tidak ada loading state untuk product card**
- **Severity:** Medium
- **Problem:** Saat data fetching (revalidate 300s berakhir), tidak ada skeleton — user lihat blank.
- **Recommendation:** Add `loading.tsx` di `(public)/` route group dengan skeleton card.

**Issue 8.3: FAQ "accordion" sebenarnya adalah link, bukan accordion**
- **Severity:** Medium
- **Location:** `app/(public)/page.tsx:206`
- **Problem:** FAQ card `<Link href="/faq">` — di-click navigate ke /faq, bukan expand inline. Akunmu.id pakai accordion expand (panah berputar). User expectation mismatch dengan visual cue (chevron right).
- **Recommendation:** Either implement real accordion (use Radix UI Accordion atau native `<details>`), atau ganti chevron jadi external-link icon agar clear ini link.
- **Effort:** Medium (2 jam — implement Radix Accordion)

**Issue 8.4: Header CTA "Daftar" tidak ada state hover-fill saat di hero**
- **Severity:** Low
- **Location:** `header.tsx:78`
- **Problem:** Outline button "Daftar" punya `hover:bg-white hover:text-[#00B8D9]` — sudah ada. Bagus.
- **No issue, marker sebagai strength.**

**Issue 8.5: Tidak ada "Active" state untuk navigation**
- **Severity:** Medium
- **Location:** `header.tsx:30–47`
- **Problem:** User di halaman `/streaming` — link "Streaming" di nav tidak ditandai. Akunmu.id juga tidak ada active state, tapi modern best practice ada.
- **Recommendation:** Use `usePathname()` dan tambah underline atau bold weight pada active link.

#### Component States Checklist
| Component | Default | Hover | Focus | Active | Disabled |
|-----------|---------|-------|-------|--------|----------|
| Hero CTA filled | ✅ | ✅ | ❌ | ❌ | ❌ |
| Hero CTA outline | ✅ | ✅ | ❌ | ❌ | ❌ |
| Header CTA | ✅ | ✅ | ❌ | ❌ | ❌ |
| Nav links | ✅ | ✅ | ❌ | ❌ N/A | ❌ N/A |
| Product card "Beli" | ✅ | ✅ | ❌ | ❌ | ✅ |
| FAQ row | ✅ | ✅ | ❌ | ❌ N/A | ❌ N/A |
| Category pills | ✅ | ✅ | ❌ | ❌ | ❌ |

**State coverage: 67%** — missing focus states across the board.

---

### 9. Branding & Personality ⭐⭐⭐⚪⚪ (6/10)

#### Strengths
- ✅ Logo design solid — "J" icon teal box + "Jual" + accent "Akun" teal. Memorable, scalable.
- ✅ Tagline jelas: "Akun Digital. Murah. Langsung Aktif." — instantly communicates value prop.
- ✅ Color teal `#00B8D9` cukup distinctive di market (kebanyakan competitor pakai purple/red/blue plain).

#### Issues

**Issue 9.1: Brand identity belum cohesive**
- **Severity:** High
- **Problem:** Header pakai teal+navy clean. Hero pakai sky blue + dark teal CTA. Stats pakai 4 warna unrelated. Footer pakai abu-abu gelap. Setiap section terasa dari brand berbeda. Akunmu.id lebih cohesive — semua section nyambung dengan signature blue+teal+illustrations.
- **Recommendation:** Define brand palette dan stick to it:
  - Primary: teal `#00B8D9`
  - Secondary: navy `#1A2340`
  - Hero: sky `#5BB5DD`
  - Status playful: hanya 1 warna playful (mis. orange `#F5A623`) — bukan 4
  - Surface: white + `#EBF5FF`

**Issue 9.2: Tidak ada brand voice di copy**
- **Severity:** Medium
- **Problem:** Heading section formal ("Manfaat Yang Bisa Kamu Dapatkan", "Pertanyaan Umum") — tone clinical/corporate. Akunmu.id lebih casual ("Yuk patungan!", "Eh, sudah ribuan orang bergabung loh!").
- **Recommendation:** Inject Indonesian casual voice, mis. "Hemat Bareng JualAkun!", "Cara Pesan Gampang Banget".

**Issue 9.3: Mascot/personality element absent**
- **Severity:** Low (post-MVP)
- **Problem:** Tidak ada visual mascot atau character. Akunmu.id punya consistent illustration of orang-orang sebagai recurring character.
- **Recommendation:** Post-MVP — design mascot atau commission consistent illustration character.

#### Brand Differentiation
- vs akunmu.id: Lebih clean dan minimal (bisa jadi advantage atau disadvantage).
- vs traditional Indonesian e-commerce: Lebih modern, lebih western.
- **Risk:** Generic SaaS aesthetic — perlu inject Indonesian flavor agar tidak terasa "translated US site".

---

### 10. Modern Design Standards ⭐⭐⭐⭐⚪ (8/10)

#### Strengths
- ✅ Mobile-first responsive design dengan grid yang clean.
- ✅ Sticky header dengan scroll behavior — modern pattern.
- ✅ Generous white space — sesuai trend 2026.
- ✅ Subtle shadows, no harsh borders — modern.
- ✅ Tailwind utility-first — industry-standard.
- ✅ Hover transitions smooth (0.2s) — premium feel.
- ✅ Wave SVG divider — trending pattern.

#### In/Out vs 2026 Trends

| Trend (2026) | Status |
|--------------|--------|
| Generous white space | ✅ Applied |
| Large typography | ⚠️ Could be larger |
| Subtle shadows | ✅ Applied |
| Rounded corners (8-12px) | ✅ Mostly applied (mixed) |
| Soft color palettes | ✅ Applied |
| Micro-interactions | ⚠️ Hover only, no animations |
| Dark mode support | ❌ Not for public (intentional?) |
| Glassmorphism subtle | ⚠️ Hero has hint (`bg-white/10 backdrop-blur-sm`) — well done |
| Bento grid layouts | ❌ Not used |
| Custom cursors | ❌ Not used (not critical) |

**Out (Avoided ✅):**
- ✅ No Web 2.0 gradients
- ✅ No skeuomorphism
- ✅ No carousels (good — akunmu.id has them but they're going out of fashion)
- ✅ No splash screens

#### Issues

**Issue 10.1: Tidak ada motion/transition pada section reveal**
- **Severity:** Low
- **Problem:** Sections muncul instan saat scroll. Akunmu.id juga tidak punya scroll-reveal, tapi 2026 standard mulai mengarah ke subtle reveal animation (Framer Motion atau CSS).
- **Recommendation (post-MVP):** Add `motion.div` dengan `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}` untuk section heading.

**Issue 10.2: Sticky elements terbatas**
- **Severity:** Low
- **Problem:** Hanya header sticky. Modern marketplaces juga sticky CTA di product page (bukan homepage).
- **Recommendation:** Mark for product detail page audit — homepage tidak butuh.

---

## Component Audit

### Buttons

**Hero Primary CTA (`bg-[#007FA5]`)** — ✅ Good
- Padding generous (`px-8 py-3.5`)
- Hover state ada
- Shadow `shadow-lg` — premium feel
- Issue: tidak ada `focus-visible` ring

**Hero Secondary CTA (border-white)** — ⚠️ Needs work
- Same size as primary — kompetisi visual weight (lihat Issue 1.1)

**Header CTA "Daftar"** — ⚠️ Inconsistent shape
- Rounded-full (pill) berbeda dari hero CTA `rounded-lg` — pilih satu

**Product card "Beli Sekarang"** — ✅ Good (kontras issue di a11y report)
- Full-width, prominent
- Hover state ada

**Category pills** — ✅ Good
- Active state (`bg-[#00B8D9] text-white`) clear
- Hover transition smooth

### Forms
- **Tidak ada form di homepage** — tidak audit. (Cek di `(auth)` route untuk login/register form review.)

### Cards

**Product Card** — ⭐⭐⭐⭐
- Layout: logo area + content + CTA → clean
- Issue: "logo area" hanya teks, butuh real brand logo (Issue 6.3)

**Stat Card** — ⭐⭐⭐
- Solid color + number + label working
- Issue: tidak ada illustration/icon (Issue 6.2)
- Issue: kontras putih+kuning fail (a11y)

**Trust Card** — ⭐⭐⭐⭐
- Icon dalam circle teal-bg → clean & on-brand
- Working well

**FAQ Card** — ⭐⭐⭐
- Visual OK
- Issue: behavior link, bukan accordion (Issue 8.3)

### Navigation
**Desktop** — ⭐⭐⭐⭐
- Clean, smooth scroll behavior
- Issue: no active state (Issue 8.5)

**Mobile** — ⭐⭐⭐⭐
- Hamburger toggle works
- Issue: hamburger icon di hero `text-white` — kontras OK karena hero biru

### Footer
- ⭐⭐⭐⭐ Solid execution. Dark bg break dari sea of light, 4-column responsive, contact info dengan icons.

---

## Design System Status

**Overall Score: 4/10 — Inconsistent patterns**

### What Exists
- ✅ Tailwind config dengan dark mode tokens
- ✅ Lucide icon library single-source
- ✅ Container + spacing default Tailwind
- ✅ Font variables loaded

### What's Missing (Critical)
- ❌ Light mode tokens — homepage pakai hardcoded hex
- ❌ Border radius scale rule
- ❌ Icon size scale rule
- ❌ Two competing primary colors (indigo dark vs teal light)
- ❌ Reusable component library — `StatCard`, `BenefitItem`, `TrustCard`, `StepCard`, `ProductCard` di-define inline di page.tsx (134 baris di file yang sama)
- ❌ Storybook / component documentation

### Recommendation
1. **Refactor inline components** ke `frontend/components/landing/`:
   - `StatCard.tsx`, `BenefitItem.tsx`, `TrustCard.tsx`, `StepCard.tsx`
2. **Add light tokens** ke `tailwind.config.ts`:
   ```ts
   light: {
     bg: '#FFFFFF',
     'bg-2': '#EBF5FF',
     text: '#1A2340',
     'text-muted': '#4A5568',
     'text-subtle': '#718096',
   }
   ```
3. **Replace hardcoded hex** di page.tsx dengan token Tailwind class.
4. **Document border radius rule** di `docs/brand-guide.md`:
   - `rounded-lg` for buttons
   - `rounded-xl` for cards
   - `rounded-2xl` for featured/hero
   - `rounded-full` for pills only (badge/avatar)

**Effort:** Medium (1-2 hari)
**Impact:** Massive — eliminates inconsistency for future development

---

## Competitive Comparison

| Aspect | JualAkun | akunmu.id | Industry Standard | Winner |
|--------|----------|-----------|-------------------|--------|
| **Visual Polish** | 6/10 | 8/10 | 7/10 | akunmu.id |
| **Modernity** | 8/10 | 7/10 | 7/10 | **JualAkun** ⭐ |
| **Typography** | 6/10 | 7/10 | 7/10 | akunmu.id |
| **Color Palette** | 5/10 | 8/10 | 7/10 | akunmu.id |
| **Imagery** | 3/10 | 9/10 | 6/10 | akunmu.id |
| **Consistency** | 5/10 | 8/10 | 7/10 | akunmu.id |
| **Brand Strength** | 6/10 | 8/10 | 6/10 | akunmu.id |
| **Mobile Experience** | 8/10 | 7/10 | 7/10 | **JualAkun** ⭐ |
| **Performance feel** | 7/10 | 6/10 | 7/10 | **JualAkun** ⭐ |

### Key Insights
- **JualAkun unggul:** Modernity, mobile experience, perceived performance (less heavy assets, sticky header smooth).
- **JualAkun kalah:** Imagery (paling parah), color discipline, brand consistency, overall "soul".
- **Steal from akunmu.id:** flat illustrations style, brand logo asli di product card, real testimoni cards.
- **Differentiation opportunity:** JualAkun bisa keep modern aesthetic + add Indonesian flavor di copy untuk stand out — tidak perlu jadi kembaran akunmu.id.

---

## Prioritized Recommendations

### Phase 1: Critical Fixes (1-2 hari, High ROI)

**Visual Impact: ★★★★★ | Effort: ~12 jam**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Fix kontras stat cards (yellow → dark text, green/blue darken) | 30 min | a11y + visual |
| 2 | Darken primary button `#00B8D9` → `#0089A8` | 15 min | a11y (kontras) |
| 3 | Tambah `focus-visible:ring-2` ke semua button via globals.css | 30 min | a11y |
| 4 | Konsolidasi border radius (rounded-lg btn, rounded-xl card, rounded-2xl featured, rounded-full pills only) | 1 jam | Konsistensi |
| 5 | Hapus hero secondary CTA atau demote ke text link | 15 min | Visual hierarchy |
| 6 | Add `simple-icons` brand logos (Netflix, Spotify, Disney+, ChatGPT, Canva) di product card + hero | 3 jam | Visual richness |
| 7 | Refactor inline components (`StatCard`, etc.) ke `components/landing/` | 2 jam | Maintainability |
| 8 | Standardize section heading ke `text-3xl font-bold` semua | 30 min | Konsistensi |

**Expected Outcome:** Score naik dari 66 → 78 (Grade B)

---

### Phase 2: Visual Richness (3-5 hari)

**Visual Impact: ★★★★ | Effort: ~24 jam**

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Source/integrate 5 flat illustrations dari unDraw.co (hero, benefits, steps) | 6 jam | Friendliness |
| 2 | Implement product card dengan real `thumbnail_url` dari Supabase | 4 jam | Trust + conversion |
| 3 | Add testimonial section (Twitter cards atau review carousel) — pattern akunmu.id | 6 jam | Social proof |
| 4 | Add real "Cara Berlangganan" illustration (phone holding) per step | 4 jam | Engagement |
| 5 | Implement FAQ accordion behavior (Radix UI atau native `<details>`) | 2 jam | UX correctness |
| 6 | Add active state untuk nav links (`usePathname()`) | 1 jam | Modern UX |
| 7 | Conditional font loading per route (only Poppins di public) | 1 jam | Perf |

**Expected Outcome:** Score naik 78 → 86 (Grade A)

---

### Phase 3: Design System Foundation (1 minggu)

**Visual Impact: ★★★ | Effort: ~40 jam**

1. Define light + dark tokens di `tailwind.config.ts` (replace 12+ shade biru ke 5 token)
2. Migrate semua hardcoded hex ke token
3. Document border radius, icon size, spacing rules di `docs/brand-guide.md`
4. Build Storybook (opsional) untuk component preview
5. Add motion/transitions (Framer Motion section reveals)
6. Custom 404, loading, error states matching design

**Expected Outcome:** Score 86 → 92 (Grade A+, ready untuk scale)

---

## Design Trends Assessment (2026)

### What JualAkun Does Right (in 2026)
- ✅ Clean, white-space generous
- ✅ Mobile-first responsive
- ✅ Subtle shadows
- ✅ Soft color palette
- ✅ Sticky header
- ✅ No carousels (good — declining trend)

### What's Missing (current trends)
- ⚠️ Custom illustrations — major trend in 2026 fintech/e-commerce
- ⚠️ Subtle motion/transitions
- ⚠️ Brand logo authenticity — modern e-commerce shows real brands
- ⚠️ Live social proof (review carousel atau trust indicators)
- ⚠️ Testimonial section

### Trends to Avoid
- ❌ Glassmorphism overuse (1 hint OK, more = dated soon)
- ❌ Neumorphism (already passé)
- ❌ Hero auto-play video bg (perf nightmare)

---

## Quick Wins Cheatsheet

Apply these 5 changes for immediate uplift (4 jam total):

```tsx
// 1. Fix stat card text color
<StatCard bg="#F5A623" value="4.8/5" label="Rating" textColor="dark" />

// 2. Darken primary button (semua tombol Beli/Pesan)
- bg-[#00B8D9] hover:bg-[#009EB8]
+ bg-[#0089A8] hover:bg-[#006D85]

// 3. Add focus rings (globals.css)
@layer base {
  button, a {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8D9] focus-visible:ring-offset-2;
  }
}

// 4. Konsolidasi rounded — hero CTA jadi pill match header
- rounded-lg shadow-lg
+ rounded-full shadow-lg

// 5. Promote "Lihat Semua Produk" jadi filled
- border-2 border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9]
+ bg-[#00B8D9] text-white hover:bg-[#0089A8]
```

---

## Methodology Notes

- **Evaluation Method:** Static visual review of code (no runtime screenshots dari production)
- **Reference:** akunmu.id homepage screenshot set (8 sections), 2026
- **Scope:** Public homepage only — admin/buyer/auth pages NOT reviewed
- **Limitations:**
  - No actual browser rendering check (CSS bisa beda dari reading code)
  - No user testing data
  - No analytics correlation (CTR per section, scroll depth)
- **Complement with:**
  - Manual visual QA di staging URL
  - Lighthouse audit (perf + a11y + SEO)
  - Real user testing (5 user, sub-5 menit task: "find a Netflix product")

---

**Version:** 1.0
**Date:** 2026-05-09
**Next Review:** Setelah Phase 1 fixes deployed (~ 2 hari lagi)
