'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { createBrowserClient } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

type StockItem = {
  id: string
  note: string | null
  is_used: boolean
  used_at: string | null
  order_id: string | null
  created_at: string
}

type Props = {
  productId: string
  initialStock: number
  /** Set true kalau di-render dalam Modal — drop card wrapper (border + shadow + padding) */
  embedded?: boolean
}

export function StockManager({ productId, initialStock, embedded }: Props) {
  const router = useRouter()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [credentials, setCredentials] = useState('')
  const [note, setNote] = useState('')
  const [stockCount, setStockCount] = useState(initialStock)
  const [bulkResult, setBulkResult] = useState<{ added: number; rejected: number; errors: string[] } | null>(null)
  const [singleLoading, setSingleLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [items, setItems] = useState<StockItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function reloadList() {
    const result = await api.get<StockItem[]>(`/admin/products/${productId}/stock`)
    if (result.ok) {
      setItems(result.data)
      const available = result.data.filter((it) => !it.is_used).length
      setStockCount(available)
    }
    setLoadingList(false)
  }

  useEffect(() => {
    reloadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  async function handleSingle(e: React.FormEvent) {
    e.preventDefault()
    setSingleLoading(true)
    const result = await api.post<{ added: number; total_stock: number }>(
      `/admin/products/${productId}/stock`,
      { accounts: [{ credentials, note: note || undefined }] },
    )
    setSingleLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal menambah stok')
      return
    }
    toast.success(`Stok berhasil ditambah ✓ (total: ${result.data.total_stock})`)
    setCredentials('')
    setNote('')
    await reloadList()
    router.refresh()
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setBulkLoading(true)
    setBulkResult(null)

    const supabase = createBrowserClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API_URL}/admin/products/${productId}/stock/bulk`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    })
    setBulkLoading(false)
    if (!res.ok) {
      const msg = `Upload gagal (HTTP ${res.status})`
      setBulkResult({ added: 0, rejected: 0, errors: [msg] })
      toast.error(msg)
      return
    }
    const json = (await res.json()) as { data: { added: number; rejected: number; errors: string[] } }
    setBulkResult(json.data)
    if (json.data.added > 0) {
      toast.success(`${json.data.added} stok berhasil di-upload ✓`)
    } else if (json.data.rejected > 0) {
      toast.error(`Semua ${json.data.rejected} baris ditolak — cek format CSV`)
    }
    if (fileRef.current) fileRef.current.value = ''
    await reloadList()
    router.refresh()
  }

  async function handleDelete(stockId: string) {
    if (!confirm('Hapus stok ini? Aksi tidak dapat dibatalkan.')) return
    setDeletingId(stockId)
    const result = await api.delete<{ ok: true }>(`/admin/products/${productId}/stock/${stockId}`)
    setDeletingId(null)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal menghapus stok')
      return
    }
    toast.success('Stok berhasil dihapus ✓')
    await reloadList()
    router.refresh()
  }

  const wrapperClass = embedded
    ? 'space-y-5'
    : 'space-y-5 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]'

  const available = items.filter((it) => !it.is_used).length
  const sold = items.filter((it) => it.is_used).length

  return (
    <div className={wrapperClass}>
      {!embedded ? (
        <div>
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Kelola Stok</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Stok tersedia: <strong>{stockCount}</strong> unit
          </p>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-brand-200 bg-brand-50 p-3 text-sm font-bold text-brand-700">
          Tersedia: <span className="text-ink">{available}</span> · Terjual:{' '}
          <span className="text-ink">{sold}</span> · Total:{' '}
          <span className="text-ink">{items.length}</span>
        </div>
      )}

      {/* Daftar stok */}
      <section className="space-y-2 rounded-lg border border-black/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-extrabold">Daftar Stok</h3>
          <p className="text-xs text-ink-subtle">FIFO — atas duluan terkirim</p>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center py-8 text-ink-muted">
            <Loader2 size={20} className="animate-spin text-brand-600" strokeWidth={2.25} />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-black/15 bg-brand-50/30 px-4 py-6 text-center text-sm text-ink-muted font-medium">
            Belum ada stok. Tambahkan via form di bawah.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-md border border-black/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-brand-50/70 backdrop-blur text-ink border-b border-black/10">
                <tr className="text-left">
                  <th className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider">Tanggal</th>
                  <th className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider">Note</th>
                  <th className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-black/5 last:border-b-0 hover:bg-brand-50/30 transition-colors">
                    <td className="px-3 py-2 text-xs tabular-nums text-ink-muted whitespace-nowrap">
                      {formatDateTime(it.created_at)}
                    </td>
                    <td className="px-3 py-2 text-xs text-ink-muted">
                      <span className="line-clamp-1" title={it.note ?? ''}>
                        {it.note || <span className="text-ink-subtle italic">—</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {it.is_used ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-black/15 bg-gray-100 px-2 py-0.5 text-xs font-bold text-ink-muted whitespace-nowrap">
                          Terjual {it.used_at ? `· ${formatDateTime(it.used_at)}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-success/40 bg-success/10 px-2 py-0.5 text-xs font-bold text-success whitespace-nowrap">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
                          Tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {it.is_used ? null : (
                        <button
                          type="button"
                          onClick={() => handleDelete(it.id)}
                          disabled={deletingId === it.id}
                          aria-label="Hapus stok"
                          className="inline-flex items-center gap-1 rounded-md border-2 border-danger/40 bg-danger/10 px-2 py-1 text-xs font-bold text-danger hover:bg-danger/15 hover:border-danger transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {deletingId === it.id ? (
                            <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
                          ) : (
                            <Trash2 size={12} strokeWidth={2.5} />
                          )}
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form onSubmit={handleSingle} className="space-y-3 rounded-lg border border-black/10 bg-brand-50/40 p-4">
        <h3 className="font-heading text-lg font-extrabold">Tambah Single</h3>
        <Input required placeholder="email:password" value={credentials} onChange={(e) => setCredentials(e.target.value)} className="font-mono" />
        <Input placeholder="Note (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" loading={singleLoading}>
          {singleLoading ? 'Memproses...' : 'Tambah'}
        </Button>
      </form>

      <form onSubmit={handleBulk} className="space-y-3 rounded-lg border border-black/10 bg-brand-50/40 p-4">
        <h3 className="font-heading text-lg font-extrabold">Bulk Upload CSV</h3>
        <p className="text-xs text-ink-subtle">Format per baris: <code>credentials,note</code></p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm font-medium text-ink-muted file:mr-3 file:rounded-lg file:border-2 file:border-black file:bg-brand-500 file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-ink file:cursor-pointer hover:file:bg-brand-400 file:transition-colors"
        />
        <Button type="submit" loading={bulkLoading}>
          {bulkLoading ? 'Memproses...' : 'Upload'}
        </Button>
        {bulkResult && bulkResult.errors.length > 0 ? (
          <div className="rounded-lg border-2 border-warning/40 bg-warning/10 px-3.5 py-3 text-xs">
            <div className="font-bold text-ink mb-1.5">
              Hasil: <span className="text-success">+{bulkResult.added} ditambah</span>
              {bulkResult.rejected > 0 ? (
                <>, <span className="text-danger">{bulkResult.rejected} ditolak</span></>
              ) : null}
            </div>
            <ul className="list-disc pl-5 text-warning font-medium space-y-0.5">
              {bulkResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
              {bulkResult.errors.length > 5 ? (
                <li className="list-none italic">+{bulkResult.errors.length - 5} error lain</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </form>
    </div>
  )
}
