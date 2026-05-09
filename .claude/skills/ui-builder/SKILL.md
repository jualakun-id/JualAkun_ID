# Skill: ui-builder

## Deskripsi
Generate komponen React/Next.js 15 untuk JualAkun mengikuti brand guide, design system, dan file structure yang sudah ditetapkan.

## Dipanggil dengan
`/ui-builder [nama komponen atau deskripsi halaman]`

Contoh:
- `/ui-builder ProductCard`
- `/ui-builder halaman checkout`
- `/ui-builder admin dashboard KPI cards`
- `/ui-builder form login`

---

## Instruksi Eksekusi

Ketika skill ini dipanggil, ikuti langkah berikut:

### 1. Identifikasi Target
- Tentukan apakah ini **komponen reusable** (misal: `ProductCard`, `Badge`) atau **halaman** (misal: `/checkout`, `/admin`)
- Cek `docs/sitemap.md` untuk route yang sesuai jika halaman
- Cek `docs/admin-design.md` jika komponen/halaman admin

### 2. Baca Referensi Brand
- Selalu baca `docs/brand-guide.md` sebelum generate — pastikan color tokens, typography, dan component patterns sesuai
- Gunakan Tailwind classes dari brand guide (bukan hardcode hex)
- Dark mode adalah default: `bg-surface`, `text-text`, bukan `bg-white`/`text-black`

### 3. Pola Wajib

#### Tailwind Classes yang Benar
```tsx
// ✅ Benar — gunakan custom tokens dari tailwind.config
<div className="bg-surface border border-border rounded-xl p-4">
  <h2 className="text-text font-heading font-semibold">Judul</h2>
  <p className="text-text-muted text-sm">Deskripsi</p>
</div>

// ❌ Salah — jangan hardcode warna
<div className="bg-[#18181B] border-[#3F3F46]">
```

#### Server vs Client Component
```tsx
// Default: Server Component (tidak perlu 'use client')
// Tambah 'use client' HANYA jika: useState, useEffect, event handler, form interaktif

'use client' // tambah ini hanya jika perlu

import { useState } from 'react'
```

#### Import Path
```tsx
// Gunakan alias @/ (sudah dikonfigurasi di tsconfig)
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
```

#### Icon
```tsx
// Gunakan Lucide React, stroke default 1.5 (jangan override)
import { ShoppingCart, Star, Shield } from 'lucide-react'

<ShoppingCart className="w-5 h-5 text-text-muted" />
```

#### Badge/Label
```tsx
// Sesuai brand-guide.md § 5 — Badge / Label
const badgeVariants = {
  terlaris: 'bg-warning/15 text-warning border border-warning/30',
  garansi:  'bg-success/15 text-success border border-success/30',
  instan:   'bg-accent/15 text-accent border border-accent/30',
  habis:    'bg-danger/15 text-danger border border-danger/30',
}
```

#### Status Badge Order
```tsx
// Status pesanan — sesuai brand-guide.md § 5
const statusConfig = {
  pending_payment: { label: 'Menunggu Bayar', className: 'bg-zinc-800 text-zinc-400' },
  paid:            { label: 'Dibayar',         className: 'bg-info/15 text-info' },
  delivering:      { label: 'Diproses',        className: 'bg-primary/15 text-primary-light' },
  delivered:       { label: 'Terkirim',        className: 'bg-success/15 text-success' },
  confirmed:       { label: 'Selesai',         className: 'bg-success text-white' },
  delivery_failed: { label: 'Gagal Kirim',     className: 'bg-danger/15 text-danger' },
  refunded:        { label: 'Direfund',        className: 'bg-warning/15 text-warning' },
  expired:         { label: 'Kedaluwarsa',     className: 'bg-zinc-800 text-zinc-500' },
}
```

### 4. File Placement
Letakkan file di lokasi yang sesuai dengan App Router structure (`docs/sitemap.md`):
- Komponen reusable → `frontend/components/[nama].tsx`
- Halaman publik → `frontend/app/(public)/[route]/page.tsx`
- Halaman auth → `frontend/app/(auth)/[route]/page.tsx`
- Halaman buyer → `frontend/app/(buyer)/[route]/page.tsx`
- Halaman admin → `frontend/app/(admin)/admin/[route]/page.tsx`
- Komponen admin → `frontend/components/admin/[nama].tsx`

### 5. Output Format
Berikan:
1. **File path lengkap** (relatif dari root repo)
2. **Kode lengkap** siap paste — tidak ada placeholder `TODO` kecuali logika yang memang butuh data dari API
3. **Catatan singkat** jika ada dependency yang harus diinstall atau hal penting

---

## Referensi Dokumen
- Brand guide lengkap: `docs/brand-guide.md`
- Route list: `docs/sitemap.md`
- Admin design spec: `docs/admin-design.md`
- Tailwind config: `docs/brand-guide.md` § 8
