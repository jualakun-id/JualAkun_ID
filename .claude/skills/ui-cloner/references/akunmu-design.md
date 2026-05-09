# Akunmu.id — Design Reference (Full Screenshot Analysis)

> Analisis lengkap dari 8 screenshot homepage akunmu.id.

---

## 1. Design Aesthetic

**Style:** Friendly, colorful, playful, illustration-heavy, modern
**Mode:** Light mode sepenuhnya
**Font:** Poppins (sans-serif rounded) — untuk heading dan body
**Feel:** Marketplace ramah, terpercaya, tidak intimidating, cocok untuk semua usia

---

## 2. Color Palette (Akurat dari Screenshot)

### Hero Background
```
Sky blue solid:   #87CEEB  (atau Tailwind sky-300 #7dd3fc — mirip)
Button CTA:       #00A5BE  (teal gelap, bukan bright cyan)
Button hover:     #007A96
Button text:      white
Button shape:     rounded-lg (BUKAN pill — sudut melengkung moderate)
```

### Section Backgrounds
```
White sections:       #FFFFFF   (stats, benefits, how-it-works)
Light blue sections:  #EBF5FF   (products, FAQ)
Dark footer:          #1F2937   (hampir hitam gelap)
```

### Stat Cards (4 warna solid)
```
Biru:    #1D7FE8   → Pengguna / Layanan
Merah:   #E8334A   → Transaksi
Hijau:   #2DB87A   → Layanan / Kategori  
Kuning:  #F5A623   → Kepuasan / Rating
```

### Typography Colors
```
Heading dark:    #1A2340  (navy hampir hitam)
Body:            #4A5568  (abu medium)
Muted:           #718096  (abu terang)
Link teal:       #00B8D9  (bright teal untuk links)
White (on hero): #FFFFFF
```

### Product Card
```
Card bg:         #FFFFFF
Card border:     #E2E8F0 atau none (hanya shadow)
Card shadow:     0 2px 12px rgba(0,0,0,0.08)
Card radius:     rounded-xl (12px)
Pesan button:    #00B8D9, full-width, rounded-lg
Duration badge:  bg-[#E0F2FE] text-[#0284C7], rounded-full, text-xs, px-2
```

---

## 3. Layout Sections (Urutan Akunmu.id)

### Section 1 — Hero (sky blue bg)
```
Layout: 2-column (text kiri, illustration kanan)
  - Kiri: heading bold white, subtext white/90, CTA button teal gelap
  - Kanan: flat illustration cartoon (orang dengan service logos melayang)
  - Bawah hero: wave/cloud SVG putih sebagai divider
Navbar: transparent, logo + nav links putih, Login = outline button putih
```

### Section 2 — Stats (white bg)
```
Layout: centered heading + 4 colorful rounded-2xl cards di grid
Cards punya:
  - Background solid berwarna (biru/merah/hijau/kuning)
  - Flat illustration orang di atas card (semi-transparent atau overlap)
  - Angka besar bold putih (68.640+, 990.265+, 29, 9/10)
  - Label kecil putih di bawah angka
```

### Section 3 — Benefits (white bg)
```
Layout: 3-column
  - Kiri: 3 feature rows (icon teal + teks)
  - Tengah: illustration besar (orang pakai laptop, service logos)
  - Kanan: 3 feature rows (icon teal + teks)
Icon style: rounded-lg border teal, teal icon di dalam
Features: Diskon 70%, Privasi Aman, Support Cepat | Legal, Metode Bayar, Notifikasi
```

### Section 4 — Products (light blue #EBF5FF bg)
```
Heading: "Produk Digital", centered
Search bar: rounded-lg, putih, placeholder "Cari Produk", dengan icon search
Category dropdown: kanan (Semua Kategori)
Cards: 4-column grid
Product Card Structure:
  - Logo layanan besar di tengah atas (colored brand logo)
  - Nama produk bold gelap
  - "Bulanan" label kecil abu
  - Daftar harga per tipe: "[Tipe] [Duration badge] \n Rp XX.XXX / bln"
  - "Lihat Skema Harga" link kecil abu dengan icon
  - Tombol "Pesan" full-width, teal, rounded-lg, di paling bawah
Discount badge: di pojok kiri atas card, background ungu/pink "Diskon X%"
```

### Section 5 — Cara Berlangganan (white bg)
```
Layout: 5 langkah horizontal flow
Setiap langkah:
  - Illustration phone di atas
  - Semicircle/trapezoid biru gelap (#1D4ED8) di bawah
  - Nomor + label (1 Pesan Layanan, 2 Pembayaran, 3 Menunggu Proses, 4 Pesanan Diterima, 5 Selesai)
```

### Section 6 — Metode Pembayaran (white, teal wave decoration)
```
Logo-logo bank + e-wallet dalam grid:
PermataBank, BSI, BCA, BNI, Mandiri, OVO, DANA, ShopeePay, Alfamart, Bank BRI, LinkAja
+ ilustrasi orang di pojok kanan
```

### Section 7 — Partner (white bg)
```
"Partner Akunmu" heading
Partner logos dalam oval berputus-putus (dashed oval border)
```

### Section 8 — Testimonials (white bg)
```
"Apa Kata Mereka" heading
Twitter/X card carousel dengan tombol prev/next
White cards dengan X logo, nama user, tweet text
"Baca selengkapnya di X" link
```

### Section 9 — "Pengguna Di Akunmu" (white bg)
```
Kategori scroll horizontal dengan icon produk
Di bawahnya: card-card grup (Group 1, 2, dst) dengan slot tersedia/penuh
→ Ini spesifik untuk model patungan akunmu.id, SKIP untuk JualAkun
```

### Section 10 — FAQ (light blue → white gradient)
```
Accordion rows: white card, border, teks kiri, chevron kanan
Heading centered "Frequently Asked Questions (FAQ)"
```

### Section 11 — Footer (dark #1F2937)
```
5 kolom:
  - Company info (logo + deskripsi + "terdaftar Komdigi")
  - Akunmu links
  - Produk  
  - Sosial media (Instagram, Twitter)
  - Hubungi Kami (email, WA, jam operasional)
```

---

## 4. Component Patterns (Production-Ready)

### Stat Card
```tsx
<div className="bg-[#1D7FE8] rounded-2xl p-6 text-center relative overflow-hidden">
  <div className="text-4xl font-bold text-white">68.640+</div>
  <div className="text-sm font-medium text-white/80 mt-1">Pengguna</div>
</div>
```

### Product Card (akunmu style)
```tsx
<div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] 
                flex flex-col overflow-hidden hover:shadow-md transition-shadow">
  {/* Discount badge */}
  <div className="relative">
    <span className="absolute top-3 left-3 bg-[#9333EA] text-white text-xs font-bold px-2 py-1 rounded-full">
      Diskon 10%
    </span>
    {/* Logo area */}
    <div className="flex items-center justify-center py-6 px-4">
      <div className="h-16 flex items-center justify-center">
        {/* Service logo or name styled */}
        <span className="text-2xl font-black text-red-600">NETFLIX</span>
      </div>
    </div>
  </div>
  {/* Content */}
  <div className="px-4 pb-2 flex-1">
    <h3 className="font-bold text-[#1A2340] text-lg">Netflix Premium</h3>
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[#718096] text-sm">1 Bulan</span>
        <div className="flex items-center gap-1">
          <span className="text-xs bg-[#E0F2FE] text-[#0284C7] px-2 py-0.5 rounded-full">1 bln</span>
        </div>
      </div>
      <span className="text-[#1A2340] font-semibold text-sm">Rp 47.500 / bln</span>
    </div>
    <button className="mt-2 text-xs text-[#718096] flex items-center gap-1 hover:text-[#00B8D9]">
      <span>Lihat Detail</span>
    </button>
  </div>
  {/* CTA */}
  <div className="px-4 pb-4 mt-2">
    <a href="#" className="block w-full bg-[#00B8D9] hover:bg-[#009EB8] text-white font-semibold 
                           py-2.5 rounded-lg text-center text-sm transition-colors">
      Beli Sekarang
    </a>
  </div>
</div>
```

### Benefit Item
```tsx
<div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-xl border-2 border-[#00B8D9] flex items-center justify-center shrink-0">
    <Icon className="w-6 h-6 text-[#00B8D9]" />
  </div>
  <span className="text-[#1A2340] font-medium">Teks manfaat</span>
</div>
```

### Step Card (Cara Berlangganan)
```tsx
<div className="flex flex-col items-center">
  {/* Illustration area */}
  <div className="w-20 h-20 bg-[#EBF5FF] rounded-full flex items-center justify-center mb-3">
    <Icon className="w-10 h-10 text-[#1D7FE8]" />
  </div>
  {/* Step number badge */}
  <div className="bg-[#1D4ED8] rounded-xl px-4 py-2 text-center">
    <span className="text-white text-xs font-bold block">{num}</span>
    <span className="text-white/90 text-xs">{label}</span>
  </div>
</div>
```

### FAQ Row
```tsx
<div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 
                flex justify-between items-center cursor-pointer hover:shadow-md">
  <span className="text-[#1A2340] font-medium">Pertanyaan?</span>
  <ChevronRight className="w-5 h-5 text-[#718096] shrink-0" />
</div>
```

---

## 5. Wave SVG Divider (Hero → White)
```tsx
<div className="absolute bottom-0 left-0 right-0 leading-none">
  <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white"/>
  </svg>
</div>
```

---

## 6. Navbar Style (akunmu.id)
```
Transparent on hero (white text + white outline Login button)
White/solid saat scroll (dark text + teal filled Login button)
Logo: icon kecil + nama brand
Nav links: text biasa, tidak underline
Login: rounded-full button
```
