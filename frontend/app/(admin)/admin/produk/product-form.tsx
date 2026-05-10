'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import type { Category } from '@/types'

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
  }>
  /** Set true kalau ProductForm di-render di dalam Modal — drop card wrapper (border + padding + shadow). */
  embedded?: boolean
  /** Callback setelah submit success — pakai untuk close modal. Default: router.push ke detail. */
  onSuccess?: (id: string) => void
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
  })
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    const body = {
      ...form,
      duration_days: Number(form.duration_days),
      price: Number(form.price),
      guarantee_days: Number(form.guarantee_days),
      thumbnail_url: form.thumbnail_url || undefined,
      description: form.description || undefined,
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
      <Field label="Nama produk" hint="Akan dipakai sebagai display name di marketplace">
        <Input
          required
          minLength={2}
          maxLength={100}
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Contoh: Claude Pro Full Garansi"
        />
      </Field>
      {!isEdit ? (
        <Field label="Slug (URL)" hint="Auto-generate dari nama. Bisa di-edit manual — hanya huruf kecil, angka, dan tanda −">
          <Input
            required
            pattern="[a-z0-9-]+"
            minLength={2}
            maxLength={100}
            value={form.slug}
            onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="font-mono"
            placeholder="claude-pro-full-garansi"
          />
        </Field>
      ) : null}
      <Field label="Deskripsi" hint="Opsional. Tampil di halaman detail produk">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Deskripsi produk, fitur, syarat penggunaan..."
          className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>
      <Field label="Thumbnail URL" hint="URL gambar produk (Supabase Storage / CDN). Optional — tampil di card marketplace">
        <Input
          type="url"
          value={form.thumbnail_url}
          onChange={(e) => update('thumbnail_url', e.target.value)}
          placeholder="https://..."
        />
      </Field>
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
  label: string
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
