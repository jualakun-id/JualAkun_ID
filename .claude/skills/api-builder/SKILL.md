# Skill: api-builder

## Deskripsi
Generate Hono route handler, service class, dan Zod schema untuk JualAkun backend (Cloudflare Workers) mengikuti pola ZEO Studio dan konvensi yang ditetapkan di PRD Appendix E.

## Dipanggil dengan
`/api-builder [nama fitur atau endpoint]`

Contoh:
- `/api-builder checkout create-order`
- `/api-builder admin products CRUD`
- `/api-builder payment webhook Midtrans`
- `/api-builder buyer dashboard`

---

## Instruksi Eksekusi

### 1. Identifikasi Endpoint
- Baca `docs/api-spec.md` untuk spec endpoint yang relevan (request/response body, auth requirement, error codes)
- Tentukan apakah route ini: **public**, **buyer (auth required)**, atau **admin (role required)**

### 2. Struktur File yang Dihasilkan

Setiap fitur menghasilkan **3 file**:

```
backend/src/
├── routes/[nama].ts         → Hono router + handler (tipis, delegasi ke service)
├── services/[nama].service.ts → Business logic + DB calls
└── (update src/index.ts)    → Mount route baru
```

Jika fitur sudah punya route file, tambahkan ke file yang ada.

### 3. Pola Route Handler (Wajib Ikuti)

```typescript
// src/routes/checkout.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { CheckoutService } from '../services/checkout.service'
import { ApiError } from '../types/errors'

const checkout = new Hono()

const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  coupon_code: z.string().optional(),
  phone_wa: z.string().regex(/^62\d{9,12}$/).optional(),
})

checkout.post('/create-order',
  authMiddleware,
  zValidator('json', createOrderSchema),
  async (c) => {
    const userId = c.get('userId')
    const body = c.req.valid('json')

    try {
      const result = await CheckoutService.createOrder(userId, body)
      return c.json({ data: result })
    } catch (e) {
      if (e instanceof ApiError) {
        return c.json({ error: e.code, message: e.message }, e.status)
      }
      throw e // Ditangkap global error handler
    }
  }
)

export { checkout }
```

### 4. Pola Service Class (Wajib Ikuti)

```typescript
// src/services/checkout.service.ts
import { createAdminClient, createUserClient } from '../lib/supabase'
import { ApiError, ERROR_CODES } from '../types/errors'

export class CheckoutService {
  // Selalu static async methods — tidak perlu instantiate
  static async createOrder(
    userId: string,
    body: { product_id: string; coupon_code?: string; phone_wa?: string }
  ): Promise<{ order_id: string; snap_token: string }> {
    const supabase = createAdminClient() // bypass RLS untuk business logic

    // 1. Validasi produk
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, price, stock_count, is_active')
      .eq('id', body.product_id)
      .single()

    if (error || !product) throw new ApiError('NOT_FOUND', 'Produk tidak ditemukan', 404)
    if (!product.is_active) throw new ApiError('NOT_FOUND', 'Produk tidak tersedia', 404)
    if (product.stock_count === 0) throw new ApiError('STOCK_EMPTY', 'Stok habis', 400)

    // 2. Validasi kupon jika ada
    let discountAmount = 0
    if (body.coupon_code) {
      const { data: couponResult } = await supabase.rpc('validate_coupon', {
        p_code: body.coupon_code,
        p_product_id: body.product_id,
        p_amount_idr: product.price,
      })
      if (!couponResult?.valid) throw new ApiError('COUPON_INVALID', 'Kode kupon tidak valid', 400)
      discountAmount = couponResult.discount_amount
    }

    const totalPrice = product.price - discountAmount

    // 3. Buat order di DB
    const { data: order } = await supabase
      .from('orders')
      .insert({ user_id: userId, product_id: body.product_id, total_idr: totalPrice, status: 'pending_payment' })
      .select('id, order_number')
      .single()

    // 4. Buat Midtrans Snap token (panggil MidtransService)
    // ... dst

    return { order_id: order!.id, snap_token: '...' }
  }
}
```

### 5. Aturan Penting

#### Selalu gunakan `c.env` bukan `process.env` di middleware/index
```typescript
// Di middleware/env.ts, semua binding di-bridge ke process.env
// Di service, bisa pakai process.env setelah bridge berjalan
const encKey = process.env.ENCRYPTION_KEY!
```

#### Response format wajib
```typescript
// Success
return c.json({ data: result })           // GET/POST success
return c.json({ data: result }, 201)       // POST create success

// Error — JANGAN throw, return langsung dari handler
return c.json({ error: 'CODE', message: 'Pesan user-friendly' }, 400)
```

#### Auth middleware inject context
```typescript
// Setelah authMiddleware berjalan:
const userId = c.get('userId')   // string UUID
const userRole = c.get('userRole') // 'buyer' | 'admin'
```

#### Admin route selalu chain dua middleware
```typescript
adminRouter.get('/kpis', authMiddleware, adminMiddleware, async (c) => {
  // ...
})
```

#### RPC untuk operasi kritis — JANGAN query langsung
```typescript
// ✅ Benar
await supabase.rpc('deliver_order_account', { p_order_id: orderId })

// ❌ Salah — bypass FIFO + row lock
await supabase.from('account_stock').update({ is_used: true }).eq('id', stockId)
```

### 6. Zod Schema Patterns

```typescript
// UUID
z.string().uuid()

// Nomor WA Indonesia (format 628xx)
z.string().regex(/^62\d{9,12}$/, 'Format: 628xxxxx')

// Enum dari DB
z.enum(['pending_payment', 'paid', 'delivering', 'delivered', 'confirmed', 'expired', 'delivery_failed', 'refunded'])

// Pagination
z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// Optional dengan default
z.string().optional().default('')
```

### 7. Error Codes (dari PRD Appendix E)
```
AUTH_REQUIRED     → 401
AUTH_FORBIDDEN    → 403
NOT_FOUND         → 404
VALIDATION_ERROR  → 400
STOCK_EMPTY       → 400
ORDER_EXPIRED     → 400
COUPON_INVALID    → 400
PAYMENT_INVALID   → 400
INTERNAL_ERROR    → 500
```

---

## Referensi Dokumen
- API spec lengkap: `docs/api-spec.md`
- Backend patterns: `docs/prd.md` Appendix E
- Hono file structure: `docs/sitemap.md` (Backend section)
- CLAUDE.md konvensi: `CLAUDE.md`
