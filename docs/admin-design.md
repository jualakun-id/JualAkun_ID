# Admin Panel Design — JualAkun

> Dokumen ini mendefinisikan struktur, komponen, dan UX setiap halaman admin.  
> Stack: Next.js 15 App Router, Tailwind CSS, shadcn/ui, Recharts, Lucide React.  
> Pattern referensi: ZEO Studio Platform (production-proven).

---

## Layout Global Admin

### Sidebar (fixed, 240px wide)
```
┌─────────────────────────────┐
│  [JA]  JualAkun             │  ← Logo + wordmark
│        Admin Panel          │  ← label kecil, text-muted
├─────────────────────────────┤
│  ◉  Dashboard               │  ← Active state: bg-primary/10 + border-l-2 border-primary
│  ▣  Produk                  │
│  📋 Pesanan          [3]    │  ← Badge merah jika ada pesanan delivery_failed
│  🎫 Tiket            [2]    │  ← Badge merah jika ada open ticket
│  👥 Pengguna                │
│  🏷️  Kupon                  │
│  📊 Analytics               │
│  🔔 Notifikasi       [5]    │  ← Badge jika ada notif failed
│  📦 Stok Monitor            │
├─────────────────────────────┤
│  [Avatar] Zeo Studio        │  ← Admin profile
│           zeostudio.id@..   │
│  [Logout]                   │
└─────────────────────────────┘
```

**Warna sidebar:** `bg-[#09090B]`, border-right `border-zinc-800`  
**Active item:** `bg-primary/10 text-primary border-l-2 border-primary`  
**Hover item:** `bg-zinc-800/50 text-zinc-300`

### Header (top bar, 64px)
```
┌────────────────────────────────────────────────────┐
│ [≡ Menu]  Halaman Title           [🔔] [Refresh ↺] │
└────────────────────────────────────────────────────┘
```
- Kiri: hamburger (mobile) + page title + breadcrumb
- Kanan: notif bell + manual refresh button + "updated HH:MM:SS"

### Main Content Area
- Background: `bg-zinc-950`
- Padding: `p-6`
- Max width: full (no constraint)

---

## Halaman 1: Dashboard (`/admin`)

### Tujuan
Satu halaman untuk melihat kesehatan platform dan action items yang perlu segera ditangani.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                    [↺ Refresh]  updated 10:32 │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  HEALTH SCORE        │  ACTION ITEMS                    │
│  ┌──────────────┐    │  ┌───────────────────────────┐  │
│  │   SVG Ring   │    │  │ ⚠️  3 pesanan gagal kirim  │  │
│  │    87/100    │    │  │ ⚠️  2 tiket >24 jam         │  │
│  │   Sehat ✓    │    │  │ ⚠️  5 produk stok habis    │  │
│  └──────────────┘    │  │ ⚠️  4 notif WA gagal       │  │
│                      │  └───────────────────────────┘  │
├──────────────────────┴──────────────────────────────────┤
│  KPI CARDS (6 kolom)                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│  │ GMV │ │Order│ │Buyer│ │Kirim│ │Tiket│ │ Ref │     │
│  │ Hari│ │ /hr │ │Baru │ │ <5m │ │Open │ │Pend │     │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
├─────────────────────────────────────────────────────────┤
│  CHARTS (2 kolom)                                        │
│  ┌──────────────────────┐ ┌──────────────────────────┐ │
│  │ Revenue 14 hari      │ │ Transaksi per Kategori   │ │
│  │ (AreaChart, indigo)  │ │ (PieChart, 5 warna)      │ │
│  └──────────────────────┘ └──────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  LATEST ORDERS (5 terbaru)    [Lihat Semua →]           │
│  + STOK KRITIS (produk ≤5 unit) [Kelola Stok →]        │
└─────────────────────────────────────────────────────────┘
```

### KPI Cards (6 total)

| Card | Nilai | Sub-label |
|------|-------|-----------|
| GMV Hari Ini | Rp X.XXX.XXX | vs kemarin ±% |
| Total Pesanan | X | hari ini |
| Buyer Baru | X | 7 hari terakhir |
| Delivery <5 menit | XX% | rate pengiriman otomatis |
| Tiket Open | X | perlu direspons |
| Referral Aktif | X | pending kredit |

### Health Score Komponen
- SVG circular progress ring (stroke: primary)
- Score: 0–100, dihitung dari:
  - Delivery success rate (40 poin): delivered / paid orders hari ini
  - Stok availability (30 poin): produk aktif yang stok > 0 / total produk aktif
  - Ticket resolution (30 poin): 100 – (open tickets >24h × 10)
- Tier: **Sehat** (80-100, hijau) / **Cukup** (60-79, kuning) / **Kritis** (<60, merah)

### Action Items
Setiap item adalah link ke halaman relevan:
- "X pesanan gagal deliver" → `/admin/pesanan?status=delivery_failed`
- "X tiket belum direspons >24 jam" → `/admin/tiket?status=open`
- "X produk stok habis" → `/admin/stok-monitor?filter=out`
- "X notifikasi WA gagal" → `/admin/notifikasi?status=failed`

---

## Halaman 2: Manajemen Produk (`/admin/produk`)

### Header
```
Produk                              [+ Tambah Produk]
X produk aktif · Y produk draft
```

### Filter Bar
```
[Semua] [Aktif] [Draft] [Stok Habis]     [Cari nama...]  [Kategori ▼]
```

### Tabel Produk

| # | Thumbnail + Nama | Kategori | Harga | Durasi | Stok | Terjual | Status | Aksi |
|---|-----------------|----------|-------|--------|------|---------|--------|------|
| 1 | 🖼 Netflix Premium 1 Bln | Streaming | Rp 47.500 | 30 hari | **2** ⚠️ | 1.240 | Aktif | ⋯ |
| 2 | 🖼 Spotify Premium 3 Bln | Streaming | Rp 89.000 | 90 hari | **0** 🔴 | 860 | Aktif | ⋯ |

- Stok **≤5**: badge kuning `⚠️ X unit`
- Stok **0**: badge merah `🔴 Habis`
- Stok **>5**: angka biasa + warna hijau

**Context Menu (⋯):**
- Edit Produk
- Kelola Stok (→ `/admin/produk/[id]#stok`)
- Nonaktifkan / Aktifkan
- Hapus (destructive, konfirmasi)

---

## Halaman 3: Detail Produk (`/admin/produk/[id]`)

### Layout: 2 Panel

```
┌────────────────────────┬────────────────────────────────┐
│  INFO PRODUK           │  KELOLA STOK                   │
│                        │                                │
│  [Form edit produk]    │  Total stok: 25 unit           │
│  - Nama               │  Terpakai: 1.215 unit          │
│  - Kategori           │                                │
│  - Deskripsi          │  [Upload Single]               │
│  - Harga              │  Credentials: ___________      │
│  - Durasi             │  Note: ___________             │
│  - Garansi            │  [Tambah]                      │
│  - Thumbnail          │                                │
│  - Status aktif/draft │  [Upload Bulk CSV]             │
│                        │  📎 Pilih file CSV...          │
│  [Simpan Perubahan]   │  Format: credentials,note      │
│                        │  [Download Template CSV]       │
│                        │                                │
│                        │  STOK TERSEDIA (FIFO preview): │
│                        │  ┌─────────────────────────┐  │
│                        │  │ #1 user@netflix.com:pw1 │  │
│                        │  │ #2 user@netflix.com:pw2 │  │
│                        │  │ #3 ... (masked)         │  │
│                        │  └─────────────────────────┘  │
└────────────────────────┴────────────────────────────────┘
```

**Notes:**
- Credentials ditampilkan masked di tabel stok (hanya email, password di-replace dengan `***`)
- Admin bisa delete stok individual jika ada yang invalid sebelum dipakai
- CSV template bisa di-download agar format konsisten

---

## Halaman 4: Manajemen Pesanan (`/admin/pesanan`)

### Header
```
Pesanan                   [↺ Auto-refresh ON/OFF]  updated 10:32:15
X total · Y pending · Z delivery_failed
                          [Export CSV]
```

**Auto-refresh 10 detik** saat ada order `paid` atau `delivery_failed`.

### Filter Pills + Search
```
[Semua] [Pending Bayar] [Dibayar] [Terkirim] [Selesai] [Gagal Kirim] [Expired]
[Cari order# atau email...]    [Tanggal ▼]
```

### Tabel Pesanan

| # | Order # | Buyer | Produk | Total | Payment | Status | Waktu | Aksi |
|---|---------|-------|--------|-------|---------|--------|-------|------|
| 1 | JA-001 | budi@gmail.com | Netflix Premium | Rp 47.500 | GoPay ✓ | 🟢 Terkirim | 2 mnt lalu | ⋯ |
| 2 | JA-002 | siti@gmail.com | Spotify 3 Bln | Rp 89.000 | QRIS ⏳ | 🟡 Pending | 35 mnt lalu | ⋯ |
| 3 | JA-003 | andi@gmail.com | ChatGPT Plus | Rp 155.000 | BCA ✓ | 🔴 Gagal Kirim | 12 mnt lalu | ⋯ |

**Highlight otomatis:**
- Row merah jika `delivery_failed`
- Row kuning jika `pending_payment` > 30 menit
- Row hijau tipis jika baru delivered (< 5 menit)

**Context Menu (⋯):**
- Lihat Detail
- Kirim Manual (jika `paid` atau `delivery_failed`)
- Konfirmasi Pembayaran (jika webhook macet)
- Refund
- Copy Order #

---

## Halaman 5: Detail Pesanan (`/admin/pesanan/[id]`)

```
┌──────────────────────────────────────────────────────────┐
│ ← Kembali    Pesanan JA-20260509-00003                   │
│              Status: 🔴 Gagal Kirim                      │
├────────────────────────────┬─────────────────────────────┤
│  INFO PESANAN              │  AKSI CEPAT                 │
│  Buyer: andi@gmail.com     │  [Kirim Manual →]           │
│  WA: 0812-xxxx-xxxx        │  [Konfirmasi Bayar]         │
│  Produk: ChatGPT Plus 1bln │  [Proses Refund]            │
│  Harga: Rp 155.000         │  [Hubungi Buyer via WA]     │
│  Kupon: -                  │                             │
│  Kredit: -                 │  LOG NOTIFIKASI             │
│                            │  ✅ WA order_created        │
│  PAYMENT DETAIL            │  ✅ Email order_created      │
│  Provider: Midtrans        │  ❌ WA account_delivered    │
│  Method: BCA Virtual Acct  │  ❌ Email account_delivered │
│  Transaction ID: MID-xxx   │                             │
│  Paid at: 10:15:32         │                             │
├────────────────────────────┴─────────────────────────────┤
│  TIMELINE                                                │
│  10:15 ● Pembayaran dikonfirmasi (BCA, Rp 155.000)      │
│  10:15 ● Sistem coba deliver akun → GAGAL (stok habis)  │
│  10:16 ● Notif WA ke buyer: ❌ failed (timeout)          │
│  09:50 ● Order dibuat                                    │
└──────────────────────────────────────────────────────────┘
```

---

## Halaman 6: Manajemen Tiket (`/admin/tiket`)

### Filter
```
[Open] [In Review] [Resolved] [Rejected] [Semua]
[Cari order# atau email...]
```

### Tabel

| # | Tiket ID | Buyer | Order | Alasan | Status | Dibuat | SLA |
|---|----------|-------|-------|--------|--------|--------|-----|
| 1 | TK-001 | budi@.. | JA-001 | cant_login | 🔴 Open | 2 jam lalu | ⚠️ 22 jam |
| 2 | TK-002 | siti@.. | JA-005 | already_used | 🟡 In Review | 5 jam lalu | ✅ 19 jam |

**SLA indicator:** countdown 24 jam dari `created_at`. Merah jika < 6 jam tersisa.

---

## Halaman 7: Detail Tiket (`/admin/tiket/[id]`)

```
┌──────────────────────────────────────────────────────────┐
│ Tiket TK-001     Status: Open     [Mark In Review]       │
├────────────────────────────┬─────────────────────────────┤
│  INFO TIKET                │  RESOLUSI                   │
│  Buyer: budi@gmail.com     │                             │
│  Pesanan: JA-001           │  Pilih Resolusi:            │
│  Produk: Netflix Premium   │  ○ Kirim Akun Pengganti     │
│  Alasan: cant_login        │  ○ Refund                   │
│  Deskripsi:                │  ○ Tolak (dengan alasan)    │
│  "Akun tidak bisa login    │                             │
│   sejak tadi pagi..."      │  Catatan Admin:             │
│                            │  [___________________]      │
│  Screenshot:               │                             │
│  [🖼 Lihat Screenshot]     │  Jika kirim pengganti:      │
│                            │  Stok tersedia: 12 unit     │
│  AKUN YANG DITERIMA:       │  [Pilih & Kirim Akun]      │
│  user@netflix.com:pass     │                             │
│  (credential lama)         │  [Proses Resolusi →]        │
└────────────────────────────┴─────────────────────────────┘
```

---

## Halaman 8: Manajemen Pengguna (`/admin/pengguna`)

### Filter
```
[Cari nama/email/WA...]   [Status ▼]   [Sort: Terbaru ▼]   [Export CSV]
```

### Tabel

| # | User | WA | Pesanan | Total Belanja | Status | Bergabung | Aksi |
|---|------|-----|---------|--------------|--------|-----------|------|
| 1 | Budi Santoso | 0812xx | 5 | Rp 237.500 | Aktif | 2 bln lalu | ⋯ |

**Context Menu:**
- Lihat Riwayat (Timeline modal)
- Suspend / Aktifkan
- Ban (destructive)

### Timeline Modal (dari ZEO)
```
┌─────────────────────────────────┐
│ Riwayat: Budi Santoso           │
├─────────────────────────────────┤
│ 🟣 Pesanan JA-005 — Rp 89.000  │  ← 2 hari lalu
│    Spotify 3 Bln — delivered    │
│                                 │
│ 🟢 Tiket TK-001 — resolved     │  ← 3 hari lalu
│    cant_login → akun diganti    │
│                                 │
│ 🔵 Daftar via Google OAuth      │  ← 2 bln lalu
└─────────────────────────────────┘
```

---

## Halaman 9: Manajemen Kupon (`/admin/kupon`)

### Header + Tambah
```
Kupon                     [+ Buat Kupon]
X kupon aktif · Y expired
```

### Tabel

| Kode | Tipe | Nilai | Pakai | Maks | Produk | Berlaku Hingga | Status | Aksi |
|------|------|-------|-------|------|--------|--------------|--------|------|
| HEMAT10 | Persen | 10% | 45 | 100 | Semua | 31 Des 2026 | Aktif | ⋯ |
| NETFLIX50K | Fixed | Rp 50.000 | 3 | 10 | Netflix | 15 Jun 2026 | Aktif | ⋯ |

### Modal Buat/Edit Kupon
```
┌─────────────────────────────────┐
│ Buat Kupon Baru                 │
│                                 │
│ Kode:        [HEMAT10     ]     │
│ Tipe:        ○ Persen  ● Fixed  │
│ Nilai:       [50000          ]  │
│ Maks pakai:  [100    ] (kosong=∞)│
│ Berlaku:     [Semua produk ▼]   │
│ Kedaluwarsa: [2026-12-31   ]    │
│                                 │
│              [Batal] [Simpan]   │
└─────────────────────────────────┘
```

---

## Halaman 10: Analytics (`/admin/analytics`)

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Analytics                        [7 hari ▼] [Export CSV] │
├──────────────────────────────────────────────────────────┤
│  REVENUE TREND (AreaChart, full width)                   │
│  Rp per hari, 14 hari terakhir, gradient indigo          │
├────────────────────────┬─────────────────────────────────┤
│  TOP 10 PRODUK         │  DISTRIBUSI KATEGORI            │
│  (BarChart horizontal) │  (PieChart, 5 warna)            │
│  nama + sold_count     │  dengan legend                  │
├────────────────────────┴─────────────────────────────────┤
│  CONVERSION FUNNEL (14 hari)                             │
│  Pengunjung → Daftar → Checkout → Bayar → Confirmed      │
│  (ProgressBar horizontal, step by step %)                │
├──────────────────────────────────────────────────────────┤
│  TABEL REVENUE HARIAN                                    │
│  Tanggal | Pesanan | GMV | Avg Order Value               │
└──────────────────────────────────────────────────────────┘
```

---

## Halaman 11: Log Notifikasi (`/admin/notifikasi`) ← Baru dari ZEO insight

### Tujuan
Monitor semua WA + email yang dikirim. Sangat penting untuk debug jika buyer lapor tidak menerima akun/notifikasi.

### Filter
```
[Semua] [Pending] [Terkirim] [Gagal]    [WA] [Email]    [Cari email/nomor WA...]
```

### Tabel

| # | Tipe Event | Channel | Penerima | Payload (preview) | Status | Waktu | Aksi |
|---|-----------|---------|----------|------------------|--------|-------|------|
| 1 | account_delivered | WA | 0812xxx | "Akun Netflix..." | ❌ Gagal | 5 mnt lalu | [Retry] |
| 2 | order_created | Email | budi@.. | "Pesanan JA-001" | ✅ Terkirim | 10 mnt lalu | - |
| 3 | guarantee_active | WA | 0856xxx | "Garansi aktif" | ⏳ Pending | 1 mnt lalu | - |

**Tombol Retry** untuk notif yang `failed` — trigger ulang pengiriman tanpa buat order baru.

---

## Halaman 12: Stok Monitor (`/admin/stok-monitor`) ← Baru dari ZEO insight

### Tujuan
Lihat stok SEMUA produk aktif dalam satu halaman, tanpa harus masuk satu per satu.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ Stok Monitor                             [Export CSV]    │
│ 3 produk habis · 7 hampir habis                          │
├──────────────────────────────────────────────────────────┤
│  [Semua] [Kritis ≤5] [Habis 0]    [Kategori ▼]          │
├──────────────────────────────────────────────────────────┤
│ Produk           | Kategori  | Stok   | Terjual | Aksi  │
│ Netflix Prem 1bl | Streaming | 🔴 0   | 1.240   | + Stok│
│ Spotify Prem 3bl | Streaming | ⚠️  3  | 860     | + Stok│
│ ChatGPT Plus 1bl | AI        | ⚠️  5  | 420     | + Stok│
│ Canva Pro 1bl    | AI        | ✅ 24  | 310     | + Stok│
├──────────────────────────────────────────────────────────┤
│ [+ Stok] → membuka quick-upload panel inline             │
└──────────────────────────────────────────────────────────┘
```

**Quick Upload Inline Panel** (expand di bawah row tanpa pindah halaman):
```
▼ Netflix Premium 1 Bulan — Quick Upload Stok
  Single: [credentials:password  ] [note opsional] [Tambah]
  Bulk:   [📎 Upload CSV]  [Download Template]
```

---

## Ringkasan Semua Halaman Admin

| No | Route | Halaman | Fitur Kunci |
|----|-------|---------|-------------|
| 1 | `/admin` | Dashboard | Health score, action items, KPI cards, charts, latest orders |
| 2 | `/admin/produk` | Daftar Produk | CRUD, filter, stok badge, context menu |
| 3 | `/admin/produk/baru` | Tambah Produk | Form + upload stok awal |
| 4 | `/admin/produk/[id]` | Edit Produk | Form + kelola stok FIFO + bulk CSV |
| 5 | `/admin/pesanan` | Daftar Pesanan | Auto-refresh, filter status, highlight row, bulk action |
| 6 | `/admin/pesanan/[id]` | Detail Pesanan | Timeline, notif log, aksi cepat (deliver/refund) |
| 7 | `/admin/tiket` | Daftar Tiket | SLA countdown, filter, prioritas |
| 8 | `/admin/tiket/[id]` | Detail Tiket | Form resolusi, pilih akun pengganti, refund |
| 9 | `/admin/pengguna` | Daftar Pengguna | Search, filter, timeline modal, suspend/ban |
| 10 | `/admin/kupon` | Manajemen Kupon | CRUD, filter aktif/expired |
| 11 | `/admin/analytics` | Analytics | Revenue chart, top produk, funnel, distribusi |
| 12 | `/admin/notifikasi` | Log Notifikasi | WA + email log, retry failed, filter per channel |
| 13 | `/admin/stok-monitor` | Stok Monitor | Semua produk + quick upload inline, alert kritis |

**Total: 13 halaman admin** (11 di PRD + 2 baru dari ZEO insight)

---

## Komponen Reusable (dari ZEO pattern)

```
components/admin/
├── AdminSidebar.tsx           ← Navigasi + badge counts
├── AdminHeader.tsx            ← Title + refresh + clock
├── KpiCard.tsx                ← Icon + value + trend
├── HealthScore.tsx            ← SVG ring + tier
├── ActionItems.tsx            ← Alert list dengan links
├── DataTable.tsx              ← Generic table: sort, pagination, skeleton
├── FilterBar.tsx              ← Pills + search + dropdowns
├── StatusBadge.tsx            ← Warna per status order/tiket/notif
├── ContextMenu.tsx            ← 3-dot floating menu
├── TimelineModal.tsx          ← User activity timeline
├── ConfirmDialog.tsx          ← Destructive action confirm
├── CsvExport.tsx              ← CSV download utility
├── AutoRefresh.tsx            ← Toggle + interval hook
└── QuickStockUpload.tsx       ← Inline panel upload stok
```
