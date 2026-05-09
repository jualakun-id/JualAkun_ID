# SRD — JualAkun

> Version: V0.1
> Date: 2026-05-09
> Author: Zeo Studio
> Status: Draft

---

## 1. Customer

**Pembeli (Primary):** Pengguna internet Indonesia usia 16–35 tahun, price-sensitive, tech-savvy, aktif menggunakan layanan digital premium. Sub-segmen: mahasiswa, pekerja muda, konten kreator, gamer.

**Admin (Internal):** Tim operasional JualAkun yang mengelola stok akun, harga, dan fulfillment.

---

## 2. Job to be Done

Pembeli ingin menemukan, membeli, dan langsung mengakses akun digital premium yang valid dalam satu alur checkout yang cepat, transparan, dan aman — tanpa negosiasi manual atau risiko penipuan.

---

## 3. Benefit

### 3.1 Customer Value
- Harga hingga 70% lebih murah dari harga resmi provider
- Pengiriman akun otomatis (< 5 menit setelah pembayaran terkonfirmasi)
- Garansi penggantian akun jika bermasalah dalam periode yang dijanjikan
- Satu platform untuk semua kebutuhan akun digital (streaming, AI, produktivitas, gaming)
- Notifikasi real-time via WhatsApp & email di setiap langkah transaksi

### 3.2 Business Value
- Revenue dari margin penjualan per transaksi
- Repeat purchase rate tinggi karena produk bersifat berlangganan (bulanan/tahunan)
- Biaya operasional rendah via otomasi pengiriman akun
- Pertumbuhan organik via program referral (user ajak user)
- Data transaksi sebagai aset untuk personalisasi dan upsell

### 3.3 Brand Impact
- Menjadi merek terpercaya untuk transaksi akun digital di Indonesia
- Positioning: "Toko akun digital #1 Indonesia — Aman, Murah, Instan"

---

## 4. Problem

**Pasar yang terfragmentasi:** Tidak ada one-stop platform terpercaya untuk akun digital di Indonesia. Pengguna terpaksa mencari di forum Kaskus, grup Telegram, Tokopedia, atau Shopee — yang tidak memberikan standar keamanan atau garansi.

**Risiko penipuan tinggi:** Transaksi P2P tanpa escrow mengakibatkan pembeli sering tidak mendapat akun setelah bayar, atau akun tidak valid/sudah digunakan orang lain.

**Proses lambat & manual:** Pengiriman akun via DM/chat memakan waktu jam hingga hari kerja, tidak ada SLA jelas.

**Harga tidak transparan:** Harga bervariasi antar seller, tidak ada standardisasi, pembeli susah membandingkan.

**Tidak ada aftersales:** Tidak ada mekanisme garansi atau komplain yang terstandar jika produk bermasalah.

---

## 5. Solution

### 5.1 Benchmark Analysis

| Platform | Kelebihan | Kekurangan |
|---------|-----------|------------|
| **akunmu.id** | Model bundling subscription sharing, terdaftar Komdigi, 990K+ transaksi | Hanya sharing slot (bukan akun penuh), model admin-centric, UI kurang modern |
| **Tokopedia/Shopee** | Kepercayaan tinggi, payment lengkap | Tidak spesialisasi digital, banyak penjual tidak terverifikasi, fulfillment manual |
| **Forum/Telegram** | Harga sangat murah | Tidak ada garansi, risiko penipuan, pengalaman buruk |
| **Harga resmi provider** | Paling aman | Mahal, tidak ada opsi berbagi biaya |

**Peluang diferensiasi JualAkun:**
- Spesialisasi akun digital (bukan subscription sharing)
- Admin-managed = kualitas terkontrol
- Otomasi pengiriman → pengalaman instan
- UI/UX modern, mobile-first
- Trust signals kuat (garansi, review terverifikasi)

### 5.2 Before/After Comparison

| Aspek | Sebelum (Status Quo) | Setelah (JualAkun) |
|-------|---------------------|------------------|
| Mencari produk | Browsing forum/marketplace umum | Katalog terstruktur dengan filter kategori & harga |
| Proses beli | Chat manual, negosiasi, transfer | Checkout online < 3 menit |
| Pengiriman akun | DM manual 1-24 jam | Otomatis < 5 menit pasca bayar |
| Garansi | Tidak ada / tidak jelas | Garansi tertulis per produk |
| Notifikasi | Tidak ada | WhatsApp + email real-time |
| Komplain | Sulit, tidak ada standar | Tiket support terstruktur |

### 5.3 Scope (In / Out)

| In Scope (MVP) | Out of Scope (V1) |
|----------------|-----------------|
| Katalog produk terstruktur (streaming, AI, produktivitas, gaming) | P2P marketplace (seller pihak ketiga) |
| Checkout & payment (Midtrans — transfer bank, e-wallet, QRIS) | Mobile app native (iOS/Android) |
| Pengiriman akun otomatis via email + tampilan di dashboard | Cryptocurrency payment |
| Dashboard pembeli (riwayat, akun aktif, garansi) | Multi-bahasa (selain Indonesia) |
| Admin panel (manajemen produk, stok, pesanan) | Internasional (luar Indonesia) |
| Sistem garansi & komplain | Program affiliate/reseller |
| Notifikasi WhatsApp (WAHA self-hosted) + email | Flash sale / auction system |
| Program referral sederhana | |
| SEO-optimized landing pages per kategori | |

### 5.4 Phasing

| Phase | Scope | Goal | Target |
|-------|-------|------|--------|
| **MVP (Phase 1)** | Katalog + checkout + pengiriman otomatis + dashboard buyer | Validasi model bisnis, first 500 transaksi | 2026-Q3 |
| **Phase 2** | Admin panel lengkap, sistem garansi, referral, SEO pages | Operasional scalable, 5K transaksi/bulan | 2026-Q4 |
| **Phase 3** | Mobile PWA, analytics dashboard, upsell/cross-sell | Retention & monetisasi lanjutan | 2027-Q1 |

---

## 6. Success Metrics

| Metric Type | Metric Name | Target (Phase 1) |
|------------|-------------|-----------------|
| Core | Jumlah transaksi per bulan | 500 transaksi (bulan ke-3) |
| Core | Gross Merchandise Value (GMV) | Rp 50 juta/bulan |
| Core | Checkout completion rate | > 60% |
| Core | Waktu pengiriman akun | < 5 menit (95% kasus) |
| Observation | Repeat purchase rate | > 30% dalam 60 hari |
| Observation | NPS / rating kepuasan | > 4.5/5 |
| Observation | Tiket komplain per 100 transaksi | < 5 tiket |
| Observation | Referral conversion rate | > 15% dari referral link |

---

## 7. Risks & Mitigation

| Risk Type | Risk Description | Mitigation |
|-----------|-----------------|------------|
| **Legal** | Penjualan akun digital bisa melanggar ToS provider (Netflix, Spotify, dll) | Legalkan dengan model reseller resmi jika tersedia; konsultasi hukum; ToS platform jelas |
| **Teknis** | Sistem pengiriman otomatis gagal / bug saat load tinggi | Queue system (BullMQ/Cloudflare Queue), fallback manual delivery, monitoring alert |
| **Stok** | Kehabisan stok akun, pembeli sudah bayar | Stok minimum threshold alert, auto-pause listing jika stok 0, refund SOP jelas |
| **Payment fraud** | Chargeback atau pembayaran palsu | Midtrans fraud detection, verifikasi manual untuk order > threshold |
| **Kompetisi** | Akunmu.id atau pemain baru copy model | Diferensiasi via UX, kecepatan, dan kepercayaan — build moat via brand dan review |
| **Reputasi** | Akun yang dijual tidak valid setelah beberapa hari | QA stok sebelum listing, garansi tertulis, proses replacement cepat |

---

## 8. Feedback Loops

### 8.1 Stakeholders Feedback
- **Key Stakeholders:** Founder, tim ops admin, early buyers (beta tester)
- **Feedback tracking:** Tiket support + rating pasca transaksi + NPS survey bulanan
- **Prioritization:** Bug kritis > UX friction > fitur baru

### 8.2 A/B Testing
- Phase 1: Belum (fokus validasi). Phase 2: A/B test halaman checkout (one-page vs multi-step)

### 8.3 Before/After Data
- Benchmark pre-launch: survey 50 target user tentang pengalaman beli akun digital saat ini
- Post-launch: track conversion rate, waktu pengiriman, dan repeat purchase setiap 2 minggu

---

## 9. Product Requirements (Summary)

- Katalog produk dengan filter kategori, harga, dan popularitas
- Halaman detail produk dengan deskripsi, garansi, cara penggunaan
- Keranjang belanja & checkout 3-langkah (pilih produk → bayar → terima akun)
- Integrasi Midtrans untuk payment gateway
- Sistem pengiriman akun otomatis (akun dikirim via email + dashboard setelah bayar dikonfirmasi)
- Dashboard pembeli: riwayat pesanan, akun aktif, status garansi
- Admin panel: manajemen produk, stok, pesanan, pengiriman manual fallback
- Sistem tiket komplain & garansi
- Notifikasi WhatsApp + email (order confirmed, akun terkirim, garansi aktif)
- Program referral: kode unik per user, cashback/kredit untuk referrer

---

## 10. UI/UX Requirements (Summary)

- Mobile-first, responsive design (Next.js + Tailwind CSS)
- Dark mode support
- Halaman beranda: hero, kategori produk, produk terlaris, testimonial, FAQ
- Navigasi cepat: search bar, filter kategori
- Checkout flow maksimal 3 klik dari halaman produk ke konfirmasi bayar
- Dashboard buyer yang clean dan informatif (status pesanan real-time)
- Komponen trust: badge garansi, jumlah terjual, rating produk
- Halaman landing SEO per kategori (contoh: /netflix, /spotify, /chatgpt)
