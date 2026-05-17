# PRD — JualAkun

> Version: V1.0
> Date: 2026-05-09
> Author: Zeo Studio
> Status: Final

---

## Revision History

| Version | Tanggal | Author | Perubahan |
|---------|---------|--------|-----------|
| V0.1 | 2026-05-09 | Zeo Studio | Draft awal |
| V1.0 | 2026-05-09 | Zeo Studio | Final — resolusi TBD, tambah Appendix E (backend patterns), cron schedule, security detail, cross-references |

---

## 1. Background

JualAkun adalah platform marketplace akun digital yang dikelola admin, ditujukan untuk pengguna Indonesia yang ingin mendapatkan akses ke layanan premium (streaming, AI, produktivitas, gaming) dengan harga signifikan lebih murah dari harga resmi. Platform ini terinspirasi dari model akunmu.id namun difokuskan pada penjualan akun penuh (bukan subscription sharing), dengan pengiriman otomatis, UI/UX modern, dan sistem kepercayaan yang lebih kuat.

Secara strategis, platform ini mengisi gap di pasar Indonesia di mana tidak ada pemain yang menggabungkan kepercayaan (garansi tertulis, brand terpercaya), kecepatan (otomasi pengiriman), dan kemudahan (checkout modern, mobile-first) dalam satu produk.

---

## 2. Overview

| Field | Value |
|-------|-------|
| Platform | Web (desktop & mobile-first, PWA ready) |
| Bahasa | Bahasa Indonesia |
| Target Release | 2026-Q3 (MVP) |
| Tech Stack | Next.js 15 + Vercel (frontend), Hono + Cloudflare Workers (backend API), Supabase (database + auth + storage) |
| Payment | Manual QRIS via GoPay Saya (admin verifikasi mutasi manual) |
| Notifikasi | WAHA (self-hosted WhatsApp HTTP API) + Resend (email) |
| PM Owner | Zeo Studio |

---

## 3. Goals & Non-Goals

### Goals
- Membangun platform jual beli akun digital yang fully functional dengan catalog, checkout, dan pengiriman otomatis
- Mencapai 500 transaksi dalam 3 bulan pertama pasca-launch
- Checkout completion rate > 60%
- Waktu pengiriman akun < 5 menit untuk 95% transaksi
- NPS / rating kepuasan pembeli > 4.5/5

### Non-Goals (MVP)
- Marketplace P2P (pihak ketiga tidak bisa jual)
- Aplikasi mobile native (iOS/Android) — PWA cukup untuk MVP
- Multi-bahasa (Inggris, dll)
- Penjualan ke luar Indonesia
- Sistem affiliate/reseller

---

## 4. User Segments

| Segment | Deskripsi | Kebutuhan Utama |
|---------|-----------|----------------|
| **Pembeli Kasual** | Ingin langganan Netflix/Spotify murah, tidak terlalu tech-savvy | Proses simple, harga jelas, tidak ribet |
| **Power Buyer** | Sering beli berbagai akun digital, tech-savvy, price-sensitive | Bisa lihat riwayat, repeat order cepat, referral |
| **Admin Platform** | Tim internal yang kelola stok, pesanan, support | Panel manajemen lengkap, alert stok, monitoring |

---

## 5. User Flows

### Flow 1: Pembeli — Beli Akun (Happy Path)

1. User landing di homepage atau halaman kategori (misal: `/netflix`)
2. User browse produk, klik produk yang diinginkan
3. Halaman detail produk: baca deskripsi, durasi, garansi, harga
4. Klik "Beli Sekarang" → diarahkan ke checkout
5. (Jika belum login) Sistem minta login/daftar — bisa via email atau Google OAuth
6. Halaman checkout: konfirmasi produk, masukkan data (jika perlu)
7. Order dibuat → halaman pembayaran tampilkan QRIS Dinamis (amount + unique 3-digit suffix) untuk di-scan via GoPay/QRIS-supported e-wallet
8. Setelah admin verifikasi mutasi GoPay manual & konfirmasi di admin panel, sistem auto-kirim akun
9. User menerima notifikasi WhatsApp + email "Pesanan kamu siap!"
10. User masuk dashboard → lihat detail akun (username/password/note)
11. User klik "Konfirmasi Diterima" → garansi aktif mulai hari ini

### Flow 2: Pembeli — Klaim Garansi

1. User di dashboard klik pesanan → klik "Klaim Garansi"
2. User isi form: pilih masalah (akun tidak bisa login, sudah dipakai, dll) + opsional screenshot
3. Sistem buat tiket → notif ke admin via WhatsApp/email
4. Admin proses: kirim akun pengganti atau refund sesuai kebijakan
5. User notifikasi "Garansi kamu sudah diproses"

### Flow 3: Admin — Tambah Produk Baru

1. Admin login ke `/admin`
2. Pilih menu "Produk" → "Tambah Produk"
3. Isi: nama, kategori, deskripsi, harga, durasi (1 bulan / 3 bulan / dll), periode garansi
4. Upload stok akun (bisa single atau bulk CSV)
5. Set status: aktif / draft
6. Produk tampil di katalog publik

### Flow 4: Admin — Kelola Pesanan

1. Admin lihat daftar pesanan di panel (filter: pending, processing, completed, komplain)
2. Untuk pesanan otomatis: sistem sudah deliver, admin tinggal pantau
3. Untuk pengiriman gagal (stok kosong/error): admin trigger manual delivery
4. Notifikasi Slack/WhatsApp ke admin jika ada pesanan pending > 10 menit

---

## 6. Product Requirements

### 6.1 Frontend Requirements

#### Halaman Beranda (`/`)
- Hero section: tagline + CTA "Lihat Produk" + trust badges (terjual X transaksi, rating X/5, garansi)
- Seksi kategori produk: grid icon kategori (Streaming, AI & Produktivitas, Gaming, Lainnya)
- Seksi "Produk Terlaris": 6-8 produk terlaris dengan harga, rating, badge "Terlaris"
- Seksi "Cara Kerja": 3-4 langkah ilustratif (Pilih → Bayar → Terima Otomatis → Nikmati)
- Seksi testimonial: 4-6 review nyata dengan nama & foto (jika ada)
- Seksi FAQ: accordion, minimal 8 pertanyaan umum
- Footer: navigasi, sosial media, kontak support, kebijakan & syarat

#### Halaman Katalog (`/produk` atau `/[kategori]`)
- Filter sidebar: kategori, rentang harga, durasi (1 bulan, 3 bulan, dll), tersedia/habis
- Sort: Terlaris, Termurah, Terbaru
- Grid produk: thumbnail, nama, harga, badge garansi, jumlah terjual, rating
- Pagination atau infinite scroll
- Meta tag SEO unik per halaman kategori

#### Halaman Detail Produk (`/produk/[slug]`)
- Gambar produk (thumbnail + deskripsi visual)
- Nama, harga, variasi durasi (jika ada — 1 bulan / 3 bulan / tahunan)
- Badge: garansi X hari, stok tersedia, jumlah terjual
- Deskripsi produk: apa yang didapat, cara menggunakannya, catatan penting
- Tabel spesifikasi: platform (PC/mobile/smart TV), region, dll
- FAQ per produk
- Tombol "Beli Sekarang" — sticky di mobile
- Review pembeli sebelumnya (jika ada)
- Stok 0: tombol disabled + teks "Stok habis, hubungi kami"

#### Halaman Checkout (`/checkout`)
- Ringkasan pesanan: nama produk, durasi, harga
- Form data pembeli: email (pre-fill jika login), nomor WhatsApp (untuk notifikasi)
- Metode pembayaran: **QRIS Dinamis** (scan via GoPay, OVO, Dana, ShopeePay, atau e-wallet QRIS-compatible)
- Input kode referral (opsional) — tampilkan diskon jika valid
- Total harga final (setelah diskon referral jika ada, + unique 3-digit suffix untuk identifikasi mutasi admin)
- Tombol "Lanjut Pembayaran" → tampilkan halaman QR code untuk di-scan buyer
- Halaman batas waktu: tampilkan timer countdown (24 jam) untuk menyelesaikan pembayaran

#### Halaman Konfirmasi (`/pesanan/[id]`)
- Tampil segera setelah order dibuat (sebelum buyer scan QRIS)
- Status: "Menunggu Pembayaran" / "Menunggu Verifikasi Admin" / "Pembayaran Dikonfirmasi" / "Akun Terkirim"
- Detail pesanan
- Instruksi: "Cek email dan WhatsApp kamu untuk detail akun"
- Link ke dashboard

#### Dashboard Pembeli (`/dashboard`)
- Tab: Semua Pesanan, Aktif, Selesai, Komplain
- Kartu pesanan: nama produk, tanggal beli, status, tombol aksi
- Detail pesanan: klik expand → tampilkan credential akun (username/password/catatan), masa aktif, tombol "Klaim Garansi", tombol "Konfirmasi Diterima"
- Section Referral: kode unik, link share, statistik (berapa yang daftar, berapa yang beli, kredit terkumpul)
- Section Profil: edit email, nomor WA, ganti password

#### Halaman Login / Daftar (`/masuk`, `/daftar`)
- Login via email + password atau Google OAuth (Supabase Auth)
- Daftar: email, password, nomor WhatsApp (opsional, untuk notif)
- Reset password via email
- Auto-redirect ke dashboard setelah login sukses

#### Admin Panel (`/admin`) — Protected Route
- Dashboard overview: transaksi hari ini, GMV, pesanan pending, stok kritis
- Manajemen Produk: CRUD produk, upload stok akun (single / bulk CSV), set harga & durasi, status aktif/draft
- Manajemen Pesanan: list semua pesanan, filter status, manual delivery, update status
- Manajemen Garansi/Komplain: list tiket, respond, resolusi (kirim akun baru / refund)
- Manajemen User: list buyer, riwayat transaksi per user
- Manajemen Stok: alert stok kritis, top-up stok
- Pengaturan: konfigurasi notifikasi, payment setting, kebijakan garansi

### 6.2 Backend / Business Logic Requirements

#### Produk & Stok

**Business rule:**
- Setiap produk memiliki pool stok akun (FIFO — first in, first out)
- Stok akun disimpan terenkripsi di database
- Ketika stok = 0, produk otomatis set status `out_of_stock` dan tombol beli di-disable
- Admin dapat set threshold minimum stok untuk alert
- Produk bisa memiliki multiple variasi (durasi: 1 bulan, 3 bulan, 1 tahun) dengan harga berbeda

**Edge cases:**
- Upload stok CSV: validasi format sebelum simpan, reject baris invalid
- Concurrent purchase: gunakan database transaction + row locking untuk cegah stok yang sama dikirim ke 2 pembeli
- Stok habis saat checkout berlangsung: tampilkan error "Stok baru saja habis" + redirect ke halaman produk

#### Order & Checkout

**Business rule:**
- Order dibuat dengan status `pending_payment` setelah user submit checkout
- Manual payment: backend inject unique 3-digit suffix ke `total_idr` + generate QRIS Dinamis dari `QRIS_STATIC_PAYLOAD` admin
- Order expired otomatis setelah 12 jam jika belum dibayar (cron `expire-orders`)
- Buyer transfer via QRIS, lalu klik "Saya Sudah Bayar" → status `verifying`
- Admin cek mutasi GoPay manual, konfirmasi di `/admin/pesanan` → status `paid` → trigger pengiriman akun
- Pengiriman akun: ambil 1 akun dari pool stok (FIFO), assign ke order, kirim via WA + email + simpan di dashboard
- Setelah pengiriman berhasil, status → `delivered`
- Garansi mulai aktif saat user klik "Konfirmasi Diterima" (atau otomatis setelah 48 jam) → status `confirmed`

**Edge cases:**
- Collision amount: unique partial index pada `(total_idr, status IN pending|verifying)` cegah dua order aktif dengan amount sama (suffix di-regenerate)
- Pengiriman gagal (stok kosong mendadak): order status → `delivery_failed`, alert admin, refund otomatis dalam 1x24 jam
- Buyer transfer tapi amount tidak match: admin reject → status `cancelled`, buyer diminta order ulang

#### Referral System

**Business rule:**
- Setiap user punya kode referral unik (8 karakter alfanumerik)
- Referrer mendapat kredit (misal: Rp 5.000) untuk setiap referred user yang berhasil transaksi pertama
- Kredit dapat digunakan sebagai potongan harga di checkout berikutnya
- Kredit tidak bisa di-withdraw (hanya untuk belanja di platform)

**Edge cases:**
- User pakai kode referral sendiri: tolak, tampilkan error
- Kredit tidak bisa melebihi total harga transaksi

#### Cron Jobs (Cloudflare Workers Scheduled Triggers)

Maksimal 5 cron di free tier. JualAkun butuh 3:

| Cron Expression | Handler | Fungsi |
|-----------------|---------|--------|
| `*/5 * * * *` | `expire-orders` | Expire order pending > 24 jam, set status `expired` |
| `*/30 * * * *` | `stock-alerts` | Cek produk stok < threshold, kirim WA ke admin |
| `*/10 * * * *` | `retry-notifications` | Retry notifikasi WA/email yang gagal (status `failed` di `notifications_log`) |

Cron handler dipanggil via `scheduled(event, env, ctx)` di Worker entry point. Protected via `CRON_SECRET` header atau admin JWT untuk mencegah abuse jika diakses manual.

#### Notifikasi

**Business rule:**
- WhatsApp notif (via WAHA) pada event: order created, payment confirmed, akun terkirim, garansi aktif, tiket komplain update
- Email notif (via Resend) pada event yang sama sebagai backup
- Admin notif via WhatsApp: pesanan baru, stok kritis, tiket komplain baru

#### Garansi & Komplain

**Business rule:**
- Setiap produk memiliki periode garansi yang dikonfigurasi admin (contoh: 30 hari)
- Klaim garansi hanya bisa diajukan selama masa garansi aktif
- Opsi resolusi: kirim akun pengganti (default) atau refund (kasus tertentu, approval admin)
- SLA admin: respond dalam 1x24 jam

### 6.3 Acceptance Criteria

| Feature | Acceptance Criteria |
|---------|-------------------|
| **Katalog Produk** | [ ] Halaman katalog load < 2 detik di koneksi 4G |
| | [ ] Filter kategori memperbarui daftar tanpa refresh halaman |
| | [ ] Produk out-of-stock ditampilkan tapi tombol beli disabled |
| **Checkout** | [x] Checkout **wajib login** — tidak ada guest checkout. Redirect ke `/masuk` jika belum login. Alasan: credential akun disimpan di dashboard, referral & garansi butuh user identity. |
| | [ ] Kode referral valid menampilkan diskon sebelum konfirmasi bayar |
| | [ ] Kode referral invalid menampilkan pesan error yang jelas |
| | [ ] Order dibuat & QRIS Dinamis ter-generate sebelum tampil ke buyer |
| **Payment** | [ ] Admin verifikasi mutasi GoPay dalam < 30 menit (target SLA, manual) |
| | [ ] Unique 3-digit suffix cegah collision: dua order aktif tidak boleh punya `total_idr` sama |
| | [ ] Order expired setelah 12 jam otomatis dibatalkan |
| **Pengiriman Akun** | [ ] Akun terkirim ke email dan tersedia di dashboard dalam < 5 menit setelah bayar dikonfirmasi |
| | [ ] Satu akun dari pool tidak bisa dikirim ke dua pembeli berbeda (concurrent safety) |
| | [ ] Jika stok kosong saat delivery, admin langsung dapat alert dan order masuk status `delivery_failed` |
| **Dashboard** | [ ] User bisa lihat credential akun (username/password) hanya untuk pesanannya sendiri |
| | [ ] Tombol "Klaim Garansi" hanya tampil jika masa garansi masih aktif |
| **Referral** | [ ] User tidak bisa gunakan kode referralnya sendiri |
| | [ ] Kredit referral masuk ke akun referrer setelah referred user transaksi pertama selesai |
| **Admin Panel** | [ ] Bulk upload stok akun via CSV, baris invalid ditolak dengan pesan error spesifik |
| | [ ] Admin bisa manual trigger pengiriman akun untuk order yang gagal auto-deliver |
| | [ ] Alert stok kritis tampil di dashboard admin dan terkirim via WhatsApp |
| **Notifikasi** | [ ] WhatsApp notif terkirim dalam < 2 menit setelah event terjadi |
| | [ ] Email backup terkirim jika WA notif gagal |

---

## 7. Data Requirements

### 7.1 Analytics Events

| Event Name | Trigger | Properties |
|-----------|---------|-----------|
| `page_viewed` | User membuka halaman apapun | `page_path`, `referrer`, `user_id` (jika login) |
| `product_viewed` | User buka detail produk | `product_id`, `product_name`, `category`, `price` |
| `add_to_checkout` | User klik "Beli Sekarang" | `product_id`, `variant`, `price` |
| `checkout_started` | User tiba di halaman checkout | `order_id`, `total_price` |
| `payment_initiated` | User klik "Lanjut Pembayaran" (QRIS muncul) | `order_id`, `total_price` |
| `payment_completed` | Admin konfirmasi mutasi GoPay (`paid`) | `order_id`, `total_price` |
| `order_delivered` | Akun berhasil dikirim ke buyer | `order_id`, `product_id`, `delivery_time_seconds` |
| `guarantee_claimed` | User submit klaim garansi | `order_id`, `product_id`, `reason` |
| `referral_used` | Kode referral valid dipakai | `referrer_user_id`, `order_id` |

### 7.2 A/B Testing
- TBD — Phase 2. Kandidat: one-page checkout vs multi-step checkout.

---

## 8. Non-Functional Requirements

### 8.1 Performance
- First Contentful Paint (FCP): < 1.5 detik (mobile, 4G)
- Time to Interactive (TTI): < 3 detik
- API response time: < 500ms (p95) untuk semua endpoint publik
- Pengiriman akun (end-to-end setelah webhook): < 5 menit (p95)
- Uptime target: 99.5%

### 8.2 Security
- Autentikasi via Supabase Auth (JWT + refresh token)
- Admin routes dilindungi middleware role-based (`admin` role), chained setelah `authMiddleware`
- Middleware ordering: `envMiddleware → corsMiddleware → rateLimitMiddleware → authMiddleware → adminMiddleware`
- Credential akun disimpan terenkripsi dengan **AES-256-GCM + random IV per enkripsi** (IV di-embed dalam ciphertext base64) — bukan AES-256-CBC. Ini mencegah pattern analysis meskipun plaintext sama.
- Manual payment verification dilakukan admin via dashboard — tidak ada webhook eksternal yang perlu di-validate signature
- Rate limiting: user-id based untuk `/api/*` (120 req/menit), IP-based untuk `/auth/*` (20 req/menit) — in-memory bucket dengan TTL cleanup (cocok untuk Cloudflare Workers stateless)
- **Zod validators** di semua endpoint via `@hono/zod-validator` — validasi sebelum handler, reject request invalid sebelum ke service layer
- HTTPS-only, HSTS header
- Input sanitization di semua form (cegah XSS & SQL injection)
- Tidak menyimpan data kartu kredit/debit (manual QRIS tidak melibatkan card data)
- `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, dan `QRIS_STATIC_PAYLOAD` disimpan sebagai Cloudflare Workers secrets (`wrangler secret put`) — tidak pernah di `wrangler.toml` plaintext

### 8.3 Aksesibilitas
- Target: WCAG 2.1 Level AA (dasar)
- Kontras warna minimal 4.5:1 untuk teks utama
- Semua elemen interaktif accessible via keyboard
- Alt text pada semua gambar produk

### 8.4 SEO
- Halaman beranda dan halaman kategori: SSR (server-side rendered) via Next.js
- Meta title & description unik per halaman (produk, kategori)
- Open Graph tags untuk share di media sosial
- Sitemap.xml auto-generated
- URL struktur: `/netflix`, `/spotify`, `/chatgpt-plus`, `/gaming/[slug]`
- Structured data (JSON-LD) untuk produk di halaman detail
- Core Web Vitals target: semua hijau

---

## 9. Dependencies

| Dependency | Tipe | Fungsi | Status |
|-----------|------|--------|--------|
| **GoPay Saya (QRIS Statis)** | Eksternal | Penerima pembayaran QRIS (manual verifikasi via app) | Set `QRIS_STATIC_PAYLOAD` dari raw payload QRIS Statis admin |
| **WAHA (WhatsApp HTTP API)** | Eksternal (self-hosted) | Notifikasi WhatsApp | Self-host WAHA + scan QR untuk session, set WAHA_BASE_URL/API_KEY/SESSION |
| **Resend** | Eksternal | Email transaksional | Perlu mendaftar + verifikasi domain |
| **Supabase** | Eksternal | Database, auth, storage | Setup project |
| **Cloudflare Workers** | Eksternal | Backend API hosting | Setup account |
| **Vercel** | Eksternal | Frontend hosting | Setup project |
| **Google OAuth** | Eksternal | Social login | Perlu Google Cloud project |

---

## 10. Launch Strategy

### 10.1 Rollout Plan
- **Soft launch (Beta):** Undang 20-50 tester dari lingkaran terdekat. Transaksi gratis/diskon untuk feedback.
- **Hard launch:** Publish ke publik, mulai promosi organik (TikTok, Instagram, komunitas online Indonesia).
- **No feature flag** untuk MVP — full deploy ke production setelah QA clear.

### 10.2 Rollback Plan
- Jika critical bug ditemukan pasca-launch: Vercel instant rollback ke deployment sebelumnya (< 1 menit)
- Jika pengiriman akun gagal massal: admin bisa disable mode "auto-deliver" → switch ke manual deliver sementara
- Database: Supabase point-in-time recovery tersedia

### 10.3 Launch Checklist

**Technical:**
- [ ] Semua acceptance criteria pass
- [ ] Load test: simulasi 100 concurrent checkout
- [ ] QRIS Dinamis test end-to-end di staging (scan, transfer kecil, admin verify)
- [ ] Notifikasi WhatsApp & email test end-to-end
- [ ] Monitoring error (Sentry atau Cloudflare Analytics) aktif
- [ ] Backup & recovery database diverifikasi

**Bisnis & Legal:**
- [ ] Syarat & Ketentuan platform published
- [ ] Kebijakan Privasi published
- [ ] Kebijakan Garansi & Refund published
- [ ] Kontak support (WA Business) aktif dan responsif
- [ ] Akun GoPay Saya admin sudah aktif, QRIS Statis sudah di-print/decode payload
- [ ] Stok produk awal tersedia minimal 50 unit per produk unggulan

**Marketing:**
- [ ] Halaman beranda & SEO pages live
- [ ] Akun media sosial (Instagram, TikTok) dibuat
- [ ] Konten peluncuran (video demo, post produk) siap
- [ ] Promo launch (misal: diskon 10% untuk 100 pembeli pertama) dikonfigurasi

---

## 11. Responsibility Matrix

| Area | PM / Founder | Frontend Dev | Backend Dev | Designer |
|------|-------------|--------------|-------------|---------|
| Requirement & PRD | R | C | C | C |
| UI Design & Wireframe | C | C | I | R |
| Frontend Implementation | I | R | C | C |
| Backend API & Logic | C | C | R | I |
| Database Schema | C | I | R | I |
| Payment Integration | C | C | R | I |
| Notifikasi Integration | C | C | R | I |
| QA & Testing | R | C | C | C |
| Launch & Deployment | R | C | C | I |
| Post-launch Monitoring | R | C | C | I |

R = Responsible (author/PIC), C = Consulted (reviewer), I = Informed

---

## Appendix A: Tech Stack Decision Log

| Layer | Dipilih | Alternatif Dipertimbangkan | Alasan Pilih |
|-------|---------|---------------------------|-------------|
| Frontend | Next.js 15 + Vercel | React SPA + Vercel | SSR untuk SEO, image optimization, file-based routing |
| Backend API | Hono + Cloudflare Workers | Express + Railway, Fastify + Fly.io | Edge computing (0ms cold start), biaya sangat murah, dekat ke CDN |
| Database | Supabase (PostgreSQL) | PlanetScale, Neon, Railway Postgres | Auth built-in, Realtime, Row Level Security, free tier generous |
| File Storage | Supabase Storage | Cloudflare R2 | Sudah terintegrasi dengan Supabase, cukup untuk MVP |
| Payment | Manual QRIS (GoPay Saya) | Midtrans, Duitku, OkeConnect | Midtrans & Duitku rejected approval merchant (2026-05-09 & 2026-05-13), OkeConnect H2H butuh CS approval. Manual QRIS = zero biaya admin per transaksi + admin punya kontrol penuh verifikasi |
| Email | Resend | SendGrid, Mailgun | Developer-friendly, pricing murah, deliverability baik |
| WA Notif | WAHA (self-hosted) | Wablas, WA Business API | Self-host WAHA: tanpa biaya per pesan, kontrol penuh, mudah swap engine (Core/Plus/NoWeb) |
| Auth | Supabase Auth | NextAuth, Clerk | Sudah satu ekosistem dengan DB, gratis di free tier |

---

## Appendix B: Kategori Produk (MVP)

| Kategori | Produk Unggulan |
|---------|----------------|
| **Streaming** | Netflix, Spotify, Disney+ Hotstar, Crunchyroll, WeTV, iQIYI, YouTube Premium, Apple TV+ |
| **AI & Produktivitas** | ChatGPT Plus, Claude Pro, Google Gemini Advanced, Canva Pro, Microsoft 365, Google One |
| **VPN & Security** | NordVPN, Surfshark |
| **Gaming** | Game Pass, PlayStation Plus, Steam Wallet Code |
| **Edukasi** | Duolingo Plus, Skillshare, Coursera Plus |

---

## Appendix C: Database Schema (Ringkasan)

> Schema lengkap + RLS + RPC ada di `supabase/migrations/`. Gunakan sebagai panduan debug backend.

```
users (id, email, phone_wa, referral_code, credits, role, created_at)

categories (id, name, slug, icon_url, sort_order)

products (id, category_id, name, slug, description, thumbnail_url, 
          duration_days, price, guarantee_days, is_active, sold_count, 
          rating_avg, created_at)

account_stock (id, product_id, credentials_encrypted, is_used, 
               used_at, order_id, created_at)

orders (id, user_id, product_id, status, total_idr, unique_suffix,
        qris_dynamic_payload, delivered_at, paid_at,
        guarantee_expires_at, created_at, expires_at)

order_account (id, order_id, account_stock_id, is_confirmed_by_user, confirmed_at)

referrals (id, referrer_user_id, referred_user_id, order_id, 
           credit_amount, created_at)

support_tickets (id, order_id, user_id, reason, status, 
                 admin_note, resolved_at, created_at)

notifications_log (id, user_id, type, channel, payload, 
                   status, sent_at, created_at)
```

---

## Appendix D: Supabase Migration Files

Semua migration ada di `supabase/migrations/`. Jalankan via `supabase db push` atau paste langsung di **Supabase SQL Editor**.

| File | Isi | Kapan dipakai |
|------|-----|---------------|
| `001_create_profiles.sql` | Tabel `profiles`, trigger auto-create saat register, fungsi generate referral code | Setup awal |
| `002_create_categories.sql` | Tabel `categories` + seed 6 kategori default | Setup awal |
| `003_create_products.sql` | Tabel `products` dengan field stock_count, sold_count, rating | Setup awal |
| `004_create_account_stock.sql` | Tabel `account_stock` (pool FIFO), trigger sync stock_count ke products | Setup awal |
| `005_create_orders.sql` | Tabel `coupons` + tabel `orders` (legacy: kolom payment_* dari era Midtrans/Duitku, sekarang NULL untuk manual QRIS) | Setup awal |
| `006_create_referrals.sql` | Tabel `referrals` untuk tracking kredit referral | Setup awal |
| `007_create_support_tickets.sql` | Tabel `support_tickets` untuk klaim garansi | Setup awal |
| `008_create_notifications_log.sql` | Tabel `notifications_log` untuk audit trail WA & email | Setup awal |
| `009_create_product_reviews.sql` | Tabel `product_reviews` + trigger sync rating ke products | Setup awal |
| `010_create_indexes.sql` | Semua performance indexes (partial indexes untuk stok & order aktif) | Setup awal |
| `011_create_rls_policies.sql` | Row Level Security semua tabel — user hanya akses data sendiri | Setup awal |
| `012_create_rpc_functions.sql` | 9 RPC functions (lihat detail di bawah) | Setup awal |

### RPC Functions (012) — Panduan Backend

| RPC | Fungsi | Dipanggil oleh |
|-----|--------|----------------|
| `deliver_order_account(order_id)` | FIFO delivery akun + row lock (cegah duplicate) | Backend setelah admin konfirmasi pembayaran |
| `confirm_order_received(order_id, user_id)` | Buyer konfirmasi terima akun | API endpoint buyer |
| `validate_coupon(code, product_id, amount)` | Validasi + hitung diskon kupon | API checkout |
| `increment_coupon_usage(code)` | Atomic increment used_count kupon | Backend setelah order paid |
| `credit_referral(order_id)` | Beri kredit ke referrer setelah transaksi pertama | Backend setelah deliver_order_account |
| `get_buyer_dashboard(user_id)` | Semua data dashboard buyer dalam 1 query | API buyer dashboard |
| `get_order_credentials(order_id, user_id)` | Ambil credentials akun dengan verifikasi kepemilikan | API buyer, setelah delivered |
| `get_admin_kpis()` | KPI admin (revenue, orders, stok kritis, tiket open) | API admin dashboard |
| `expire_old_orders()` | Cancel order pending > 24 jam | Cron job (Cloudflare Cron Trigger) |

### Pola Debugging SQL Editor

```sql
-- Cek stok kritis (< 5 unit)
SELECT name, stock_count FROM products WHERE is_active = true AND stock_count <= 5 ORDER BY stock_count;

-- Cek order yang gagal delivery
SELECT id, order_number, status, created_at FROM orders WHERE status = 'delivery_failed' ORDER BY created_at DESC;

-- Cek pending orders > 30 menit (buyer belum bayar / admin belum verify)
SELECT id, order_number, status, created_at FROM orders 
WHERE status IN ('pending_payment','verifying') AND created_at < NOW() - INTERVAL '30 minutes';

-- Cek tiket garansi yang belum direspons > 24 jam
SELECT id, reason, created_at FROM support_tickets 
WHERE status = 'open' AND created_at < NOW() - INTERVAL '24 hours';

-- GMV hari ini
SELECT COALESCE(SUM(total_idr), 0) AS gmv_today FROM orders 
WHERE status IN ('delivered','confirmed') AND paid_at >= CURRENT_DATE;

-- Top 10 produk terlaris
SELECT name, sold_count, stock_count FROM products ORDER BY sold_count DESC LIMIT 10;

-- Cek notifikasi yang gagal terkirim
SELECT template, channel, recipient, error, created_at FROM notifications_log 
WHERE status = 'failed' ORDER BY created_at DESC LIMIT 20;

-- Cek referral yang sudah terkreditkan hari ini
SELECT r.id, referrer.email AS referrer, referred.email AS referred, r.credit_amount, r.created_at
FROM referrals r
JOIN profiles referrer ON r.referrer_user_id = referrer.id
JOIN profiles referred ON r.referred_user_id = referred.id
WHERE r.created_at >= CURRENT_DATE;

-- Cek pesanan yang sudah delivered tapi belum dikonfirmasi buyer > 48 jam (auto-confirm trigger)
SELECT id, order_number, delivered_at FROM orders
WHERE status = 'delivered' AND delivered_at < NOW() - INTERVAL '48 hours';
```

---

## Appendix E: Backend Architecture Patterns (ZEO-Inspired)

> Pola ini diadopsi dari ZEO Studio Backend (Hono + Cloudflare Workers production). Ikuti pola ini saat implementasi `backend/`.

### E.1 Error Handling

Buat `src/types/errors.ts` dengan `ApiError` class dan typed error codes:

```typescript
// src/types/errors.ts
export const ERROR_CODES = {
  AUTH_REQUIRED:    'AUTH_REQUIRED',
  AUTH_FORBIDDEN:   'AUTH_FORBIDDEN',
  NOT_FOUND:        'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STOCK_EMPTY:      'STOCK_EMPTY',
  ORDER_EXPIRED:    'ORDER_EXPIRED',
  COUPON_INVALID:   'COUPON_INVALID',
  PAYMENT_INVALID:  'PAYMENT_INVALID',
  INTERNAL_ERROR:   'INTERNAL_ERROR',
} as const

export class ApiError extends Error {
  constructor(
    public code: keyof typeof ERROR_CODES,
    message: string,
    public status: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message)
  }
}
```

Global error handler di `src/index.ts`:
```typescript
app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json({ ok: false, code: err.code, message: err.message }, err.status)
  }
  console.error('Unhandled:', err)
  return c.json({ ok: false, code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500)
})
```

### E.2 Middleware Ordering

```typescript
// src/index.ts — urutan penting, jangan dibalik
app.use('*', envMiddleware)         // 1. Cloudflare bindings → process.env
app.use('*', corsMiddleware)        // 2. CORS headers
app.use('/api/*', rateLimitMiddleware)    // 3. Rate limit user-based
app.use('/auth/*', authRateLimitMiddleware) // 4. Rate limit IP-based untuk auth
// authMiddleware & adminMiddleware di-apply per-route atau route group
```

### E.3 Environment Bindings (Cloudflare Workers)

Karena Cloudflare Workers tidak pakai `process.env`, semua env dari `c.env` (Bindings). Gunakan `envMiddleware` untuk bridge ke `process.env` agar service code tidak bergantung Cloudflare-specific API:

```typescript
// src/middleware/env.ts
export async function envMiddleware(c: Context, next: Next): Promise<void> {
  const env = c.env as Partial<Bindings>
  if (env.SUPABASE_URL) process.env.SUPABASE_URL = env.SUPABASE_URL
  if (env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  if (env.ENCRYPTION_KEY) process.env.ENCRYPTION_KEY = env.ENCRYPTION_KEY
  // ... semua bindings
  await next()
}
```

`wrangler.toml` — hanya non-secret di `vars`:
```toml
[vars]
CORS_ORIGINS = "https://jualakun.id"

# JANGAN taruh secret di sini — gunakan: wrangler secret put NAMA_KEY
```

### E.4 Dual Supabase Client Pattern

```typescript
// src/lib/supabase.ts
export function createUserClient(jwt: string) {
  // RLS aktif — user hanya akses data miliknya
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } }
  })
}

export function createAdminClient() {
  // Bypass RLS — untuk cron, webhook, admin ops
  return createClient(url, serviceRoleKey)
}
```

Gunakan `createUserClient(jwt)` di route buyer, `createAdminClient()` di service layer dan cron.

### E.5 Zod Request Validation

Semua route wajib gunakan `@hono/zod-validator`:

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  coupon_code: z.string().optional(),
  phone_wa: z.string().regex(/^62\d{9,12}$/).optional(),
})

checkout.post('/create-order',
  authMiddleware,
  zValidator('json', createOrderSchema),
  async (c) => {
    const body = c.req.valid('json') // typed, sudah validated
    // ...
  }
)
```

### E.6 Service Layer Pattern

Static async methods, throw ApiError jika terjadi kondisi invalid:

```typescript
// src/services/order.service.ts
export class OrderService {
  static async createOrder(userId: string, productId: string, couponCode?: string) {
    const product = await createAdminClient()
      .from('products').select('*').eq('id', productId).single()

    if (!product.data) throw new ApiError('NOT_FOUND', 'Produk tidak ditemukan', 404)
    if (product.data.stock_count === 0) throw new ApiError('STOCK_EMPTY', 'Stok habis', 400)
    // ...
  }
}
```

### E.7 Cron Trigger Handler

```typescript
// src/index.ts — Cloudflare Workers scheduled export
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    const cronMap: Record<string, string> = {
      '*/5 * * * *':  '/api/cron/expire-orders',
      '*/30 * * * *': '/api/cron/stock-alerts',
      '*/10 * * * *': '/api/cron/retry-notifications',
    }
    const path = cronMap[event.cron]
    if (path) {
      const url = `http://localhost${path}`
      const req = new Request(url, {
        headers: { 'x-cron-secret': env.CRON_SECRET }
      })
      ctx.waitUntil(app.fetch(req, env))
    }
  }
}
```

---

## Dokumen Terkait

| Dokumen | Path | Isi |
|---------|------|-----|
| Brand Guide | `docs/brand-guide.md` | Warna, font, komponen UI, Tailwind config |
| API Spec | `docs/api-spec.md` | Semua endpoint Hono — request/response body, error codes |
| Admin Design | `docs/admin-design.md` | Wireframe & spec 13 halaman admin panel |
| Sitemap | `docs/sitemap.md` | Route list frontend + backend, file structure App Router |
| Env Template | `.env.example` | Semua environment variables yang dibutuhkan |
| CLAUDE.md | `CLAUDE.md` | Konvensi kode, naming, aturan penting untuk AI/developer |
| Migrations | `supabase/migrations/` | 12 SQL migration files + RPC functions |
