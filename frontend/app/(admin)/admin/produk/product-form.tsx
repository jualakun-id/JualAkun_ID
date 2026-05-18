'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Link2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThumbnailUpload } from '@/components/ui/thumbnail-upload'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import type { Category } from '@/types'

type SupplierOption = {
  id: string
  name: string
  price_usd: number
  wallet_price_text: string
  available: number
  sold: number
  /** ID produk JualAkun yang sudah claim supplier ini. null = belum ada. */
  taken_by_product_id: string | null
}

type Props = {
  categories: Category[]
  initial?: Partial<{
    id: string
    category_id: string
    name: string
    slug: string
    description: string
    thumbnail_url: string
    duration_days: number
    price: number
    guarantee_days: number
    is_active: boolean
    original_price: number | null
    discount_starts_at: string | null
    discount_ends_at: string | null
    display_stock: number
    supplier_product_id: string | null
    auto_manage_publish: boolean
    cost_stats: {
      sample_size: number
      avg_cost_idr: number
      avg_revenue_idr: number
      avg_margin_pct: number
    } | null
  }>
  /** Set true kalau ProductForm di-render di dalam Modal — drop card wrapper (border + padding + shadow). */
  embedded?: boolean
  /** Callback setelah submit success — pakai untuk close modal. Default: router.push ke detail. */
  onSuccess?: (id: string) => void
}

// Convert ISO datetime → "YYYY-MM-DDTHH:mm" untuk <input type="datetime-local">
function isoToLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const off = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

export function ProductForm({ categories, initial, embedded, onSuccess }: Props) {
  const router = useRouter()
  const toast = useToast()
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    category_id: initial?.category_id ?? categories[0]?.id ?? '',
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    thumbnail_url: initial?.thumbnail_url ?? '',
    duration_days: initial?.duration_days ?? 30,
    price: initial?.price ?? 0,
    guarantee_days: initial?.guarantee_days ?? 30,
    is_active: initial?.is_active ?? false,
    display_stock: initial?.display_stock ?? 0,
    supplier_product_id: initial?.supplier_product_id ?? '',
    // Default ON untuk produk baru (signal: pakai supplier → mau auto-manage).
    // Untuk edit, baca dari initial — false kalau column belum ter-set.
    auto_manage_publish: initial?.auto_manage_publish ?? !isEdit,
    original_price: initial?.original_price ?? '',
    discount_starts_at: isoToLocal(initial?.discount_starts_at),
    discount_ends_at: isoToLocal(initial?.discount_ends_at),
  })
  const [loading, setLoading] = useState(false)
  const [showDiscount, setShowDiscount] = useState(
    !!initial?.original_price || !!initial?.discount_starts_at || !!initial?.discount_ends_at,
  )
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([])
  const [supplierLoading, setSupplierLoading] = useState(true)
  const [supplierError, setSupplierError] = useState<string | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number>(18000) // fallback kalau balance API down

  // Fetch supplier products + exchange rate (parallel, 1x on-mount)
  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get<{ walletCurrency: string; products: SupplierOption[] }>('/admin/supplier/products'),
      api.get<{ exchange_rate: number } | null>('/admin/supplier/balance'),
    ]).then(([productsResult, balanceResult]) => {
      if (cancelled) return
      setSupplierLoading(false)
      if (!productsResult.ok) {
        setSupplierError(productsResult.message ?? 'Gagal load supplier')
        return
      }
      setSupplierOptions(productsResult.data.products)
      if (balanceResult.ok && balanceResult.data) {
        setExchangeRate(balanceResult.data.exchange_rate)
      }
    })
    return () => { cancelled = true }
  }, [])

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Auto-generate slug saat user ketik nama (hanya kalau create mode + slug belum di-edit manual)
  function handleNameChange(value: string) {
    update('name', value)
    if (!isEdit) {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-')
      update('slug', autoSlug)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validasi diskon kalau showDiscount: original_price harus > price
    if (showDiscount && form.original_price !== '') {
      const orig = Number(form.original_price)
      if (orig <= Number(form.price)) {
        toast.error('Harga asli (sebelum diskon) harus lebih besar dari harga jual')
        return
      }
      if (form.discount_starts_at && form.discount_ends_at) {
        const s = new Date(form.discount_starts_at).getTime()
        const e2 = new Date(form.discount_ends_at).getTime()
        if (e2 <= s) {
          toast.error('Tanggal selesai diskon harus setelah tanggal mulai')
          return
        }
      }
    }

    setLoading(true)
    // thumbnail_url:
    //   - kalau form kosong (admin clear via tombol X) → kirim null EKSPLISIT
    //     supaya backend tahu intent "hapus" dan delete file lama dari storage
    //   - kalau ada URL → kirim URL-nya
    // Khusus create mode: kalau null/kosong, kirim undefined (jangan paksa kosong)
    const thumbnailValue = isEdit
      ? form.thumbnail_url || null
      : form.thumbnail_url || undefined
    const body = {
      category_id: form.category_id,
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      thumbnail_url: thumbnailValue,
      duration_days: Number(form.duration_days),
      price: Number(form.price),
      guarantee_days: Number(form.guarantee_days),
      is_active: form.is_active,
      display_stock: Number(form.display_stock),
      supplier_product_id: form.supplier_product_id || null,
      auto_manage_publish: form.auto_manage_publish,
      original_price:
        showDiscount && form.original_price !== '' ? Number(form.original_price) : null,
      discount_starts_at:
        showDiscount && form.discount_starts_at
          ? new Date(form.discount_starts_at).toISOString()
          : null,
      discount_ends_at:
        showDiscount && form.discount_ends_at
          ? new Date(form.discount_ends_at).toISOString()
          : null,
    }
    const result = isEdit
      ? await api.patch<{ id: string }>(`/admin/products/${initial!.id}`, body)
      : await api.post<{ id: string }>('/admin/products', body)
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal menyimpan produk')
      return
    }
    toast.success(isEdit ? 'Produk diperbarui ✓' : 'Produk berhasil dibuat ✓')
    if (onSuccess) {
      onSuccess(isEdit ? initial!.id! : result.data.id)
      router.refresh()
    } else {
      router.push(isEdit ? `/admin/produk/${initial!.id}` : `/admin/produk/${result.data.id}`)
      router.refresh()
    }
  }

  const formClass = embedded
    ? 'space-y-5'
    : 'space-y-5 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]'

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <Field label="Kategori">
        <select
          value={form.category_id}
          onChange={(e) => update('category_id', e.target.value)}
          required
          className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <Field
        label="Nama produk"
        hint='Hindari kata "Garansi" — sudah ditampilkan otomatis sebagai badge di card produk. Slug URL auto-generate dari nama.'
      >
        <Input
          required
          minLength={2}
          maxLength={100}
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Contoh: Claude Pro"
        />
      </Field>
      <Field label="Deskripsi" hint="Opsional. Tampil di halaman detail produk">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Deskripsi produk, fitur, syarat penggunaan..."
          className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
      </Field>

      {/* ── COST INSIGHT (30 hari terakhir) ─────────────────────── */}
      {initial?.cost_stats && initial.cost_stats.sample_size > 0 ? (
        <CostInsightCard stats={initial.cost_stats} currentPrice={Number(form.price)} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Harga (Rp)" hint="Harga jual ke buyer">
          <Input
            type="number"
            min={1000}
            step={1000}
            required
            value={form.price}
            onChange={(e) => update('price', Number(e.target.value))}
            placeholder="150000"
          />
        </Field>
        <Field label="Durasi (hari)" hint="Periode aktif akun">
          <Input
            type="number"
            min={1}
            required
            value={form.duration_days}
            onChange={(e) => update('duration_days', Number(e.target.value))}
          />
        </Field>
        <Field label="Garansi (hari)" hint="0 = tanpa garansi">
          <Input
            type="number"
            min={0}
            required
            value={form.guarantee_days}
            onChange={(e) => update('guarantee_days', Number(e.target.value))}
          />
        </Field>
        <Field label="Stok Tampilan" hint="Angka yang tampil di publik. Auto -1 saat admin fulfill order.">
          <Input
            type="number"
            min={0}
            required
            value={form.display_stock}
            onChange={(e) => update('display_stock', Number(e.target.value))}
            placeholder="0"
          />
        </Field>
      </div>
      <Field label="Thumbnail produk" hint="Tampil di card marketplace. Auto-upload ke storage saat dipilih.">
        <ThumbnailUpload
          value={form.thumbnail_url}
          onChange={(url) => update('thumbnail_url', url)}
          slug={form.slug}
        />
      </Field>

      {/* ── SUPPLIER MAPPING (Canboso) ─────────────────────────── */}
      <Field
        label={<span className="inline-flex items-center gap-1.5"><Link2 size={14} strokeWidth={2.5} className="text-brand-600" /> Supplier (Canboso)</span>}
        hint="Link ke produk Canboso supaya admin bisa 'Beli dari Supplier' saat fulfill + auto-sync stock. Pilih 'Tidak pakai supplier' untuk produk full manual."
      >
        {supplierLoading ? (
          <div className="rounded-lg border-2 border-black/15 bg-brand-50/40 px-4 py-3 text-sm text-ink-muted">
            Memuat daftar supplier...
          </div>
        ) : supplierError ? (
          <div className="rounded-lg border-2 border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {supplierError}
          </div>
        ) : (
          <select
            value={form.supplier_product_id}
            onChange={(e) => update('supplier_product_id', e.target.value)}
            className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-sm font-medium text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          >
            <option value="">— Tidak pakai supplier (full manual) —</option>
            {supplierOptions
              .filter((s) => {
                // Hide supplier yang sudah di-claim produk lain.
                // Keep yang null (belum di-claim) atau yang di-claim oleh produk ini sendiri.
                if (!s.taken_by_product_id) return true
                return s.taken_by_product_id === initial?.id
              })
              .map((s) => {
                const idr = Math.round(s.price_usd * exchangeRate)
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.wallet_price_text} ≈ Rp {idr.toLocaleString('id-ID')} · stok {s.available}
                  </option>
                )
              })}
          </select>
        )}

        {/* Card real-time modal supplier — muncul setelah pilih supplier */}
        {form.supplier_product_id ? (() => {
          const sel = supplierOptions.find((s) => s.id === form.supplier_product_id)
          if (!sel) return null
          return (
            <SupplierPriceCard
              supplier={sel}
              exchangeRate={exchangeRate}
              currentPrice={Number(form.price) || 0}
            />
          )
        })() : null}

        {/* Toggle auto-manage publish — hanya tampil kalau supplier sudah di-link */}
        {form.supplier_product_id ? (
          <label className="mt-3 flex items-start gap-3 rounded-lg border-2 border-black/15 bg-white p-3.5 cursor-pointer hover:border-brand-400 transition-colors">
            <input
              type="checkbox"
              checked={form.auto_manage_publish}
              onChange={(e) => update('auto_manage_publish', e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-500 cursor-pointer"
            />
            <span className="flex-1">
              <span className="text-sm font-bold text-ink block">
                Auto publish/draft berdasarkan stok supplier
              </span>
              <span className="text-xs text-ink-muted font-medium block mt-0.5 leading-relaxed">
                Sistem otomatis hide produk dari katalog publik saat stok supplier habis,
                dan publish kembali saat re-stock. Kamu tidak perlu manual unchecklist
                &ldquo;Aktif&rdquo; di bawah tiap kali stok berubah.
              </span>
            </span>
          </label>
        ) : null}
      </Field>

      {/* ── DISKON SECTION ──────────────────────────────────────── */}
      <div className="rounded-xl border-2 border-black/15 bg-brand-50/30 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showDiscount}
            onChange={(e) => setShowDiscount(e.target.checked)}
            className="h-4 w-4 accent-brand-500 cursor-pointer"
          />
          <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Tag size={14} className="text-brand-600" strokeWidth={2.5} />
            Aktifkan Diskon
          </span>
        </label>
        {showDiscount ? (
          <div className="mt-4 space-y-4">
            <Field
              label="Harga asli (sebelum diskon)"
              hint="Harga coret yang akan tampil di samping harga jual. Harus lebih besar dari harga jual."
            >
              <Input
                type="number"
                min={1000}
                step={1000}
                value={form.original_price}
                onChange={(e) => update('original_price', e.target.value as never)}
                placeholder="200000"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Diskon mulai" hint="Kosong = berlaku sekarang">
                <Input
                  type="datetime-local"
                  value={form.discount_starts_at}
                  onChange={(e) => update('discount_starts_at', e.target.value)}
                />
              </Field>
              <Field label="Diskon berakhir" hint="Kosong = no expire">
                <Input
                  type="datetime-local"
                  value={form.discount_ends_at}
                  onChange={(e) => update('discount_ends_at', e.target.value)}
                />
              </Field>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-ink-subtle font-medium">
            Centang untuk set harga asli & periode promo. Customer akan lihat harga coret + harga jual.
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border-2 border-black/15 bg-brand-50/40 p-3.5 cursor-pointer hover:border-brand-400 transition-colors">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => update('is_active', e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-500 cursor-pointer"
        />
        <span className="flex-1">
          <span className="text-sm font-bold text-ink block">Aktif (tampil di publik)</span>
          <span className="text-xs text-ink-muted font-medium block mt-0.5">
            Uncheck untuk simpan sebagai draft — tidak muncul di marketplace
          </span>
        </span>
      </label>
      <Button type="submit" loading={loading} size="lg">
        {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
      </Button>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-bold text-ink">{label}</label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-ink-subtle font-medium leading-relaxed">{hint}</p> : null}
    </div>
  )
}

function CostInsightCard({
  stats,
  currentPrice,
}: {
  stats: { sample_size: number; avg_cost_idr: number; avg_revenue_idr: number; avg_margin_pct: number }
  currentPrice: number
}) {
  const projectedMargin =
    currentPrice > 0 ? Math.round(((currentPrice - stats.avg_cost_idr) / currentPrice) * 100) : 0
  const marginColor =
    projectedMargin >= 30
      ? 'text-success'
      : projectedMargin >= 15
        ? 'text-warning'
        : 'text-danger'
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  return (
    <div className="rounded-xl border-2 border-black/15 bg-brand-50/40 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-ink">Insight Modal & Margin (30 hari terakhir)</h4>
        <span className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider">
          {stats.sample_size} order
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Stat label="Modal Avg" value={fmt(stats.avg_cost_idr)} />
        <Stat label="Revenue Avg" value={fmt(stats.avg_revenue_idr)} />
        <Stat label="Margin Avg" value={`${stats.avg_margin_pct}%`} />
        <Stat
          label="Proyeksi Margin (harga sekarang)"
          value={<span className={marginColor}>{projectedMargin}%</span>}
        />
      </div>
      {projectedMargin < 15 ? (
        <p className="text-xs text-danger font-medium">
          ⚠️ Margin tipis — pertimbangkan naikkan harga jual atau cari supplier lebih murah.
        </p>
      ) : projectedMargin < 30 ? (
        <p className="text-xs text-warning font-medium">
          Margin moderate. Aman untuk skala kecil, tapi sensitif terhadap kenaikan modal.
        </p>
      ) : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white border border-black/10 px-3 py-2">
      <div className="text-[10px] font-bold text-ink-subtle uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold text-ink tabular-nums">{value}</div>
    </div>
  )
}

/**
 * Card real-time harga supplier — muncul di bawah dropdown setelah admin
 * pilih supplier. Beda dengan CostInsightCard yang historical (avg 30 hari
 * dari orders), card ini selalu reflect harga supplier SAAT INI dari API
 * Canboso. Buat aware kalau supplier baru naikkan harga sebelum order baru
 * masuk. Proyeksi margin recompute setiap user ubah field "Harga Jual".
 */
function SupplierPriceCard({
  supplier,
  exchangeRate,
  currentPrice,
}: {
  supplier: SupplierOption
  exchangeRate: number
  currentPrice: number
}) {
  const costIdr = Math.round(supplier.price_usd * exchangeRate)
  const projectedMargin =
    currentPrice > 0 ? Math.round(((currentPrice - costIdr) / currentPrice) * 100) : null
  const marginColor =
    projectedMargin === null
      ? 'text-ink-subtle'
      : projectedMargin >= 30
        ? 'text-success'
        : projectedMargin >= 15
          ? 'text-warning'
          : 'text-danger'
  const recommendedPrice = Math.round(costIdr / 0.5) // 50% margin target
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  return (
    <div className="mt-3 rounded-xl border-2 border-brand-300/60 bg-brand-50/40 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-ink">Modal Supplier Saat Ini</h4>
        <span className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider">
          live · kurs {fmt(exchangeRate)}/$
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <Stat label="Harga Modal" value={<>{fmt(costIdr)}<span className="ml-1 text-[10px] font-bold text-ink-subtle">({supplier.wallet_price_text})</span></>} />
        <Stat label="Stok Supplier" value={`${supplier.available} unit`} />
        <Stat
          label="Proyeksi Margin"
          value={
            <span className={marginColor}>
              {projectedMargin === null ? '—' : `${projectedMargin}%`}
            </span>
          }
        />
      </div>
      {projectedMargin !== null && projectedMargin < 15 ? (
        <p className="text-xs text-danger font-medium">
          ⚠️ Margin tipis di harga jual saat ini. Rekomendasi minimum {fmt(recommendedPrice)} untuk margin 50%.
        </p>
      ) : projectedMargin === null ? (
        <p className="text-xs text-ink-subtle font-medium">
          💡 Set Harga Jual di atas {fmt(recommendedPrice)} untuk margin 50% — atau sesuaikan dengan strategi pricing kamu.
        </p>
      ) : null}
    </div>
  )
}
