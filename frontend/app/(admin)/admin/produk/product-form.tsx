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
}

export function ProductForm({ categories, initial }: Props) {
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
    router.push(isEdit ? `/admin/produk/${initial!.id}` : `/admin/produk/${result.data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
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
      <Field label="Nama produk">
        <Input required value={form.name} onChange={(e) => update('name', e.target.value)} />
      </Field>
      {!isEdit ? (
        <Field label="Slug (auto-generate dari nama)">
          <Input
            required
            pattern="[a-z0-9-]+"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="font-mono"
          />
        </Field>
      ) : null}
      <Field label="Deskripsi">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle placeholder:font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Harga (Rp)">
          <Input type="number" min={0} required value={form.price} onChange={(e) => update('price', Number(e.target.value))} />
        </Field>
        <Field label="Durasi (hari)">
          <Input type="number" min={1} required value={form.duration_days} onChange={(e) => update('duration_days', Number(e.target.value))} />
        </Field>
        <Field label="Garansi (hari)">
          <Input type="number" min={0} required value={form.guarantee_days} onChange={(e) => update('guarantee_days', Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Thumbnail URL">
        <Input type="url" value={form.thumbnail_url} onChange={(e) => update('thumbnail_url', e.target.value)} placeholder="https://..." />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-bold text-ink">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
