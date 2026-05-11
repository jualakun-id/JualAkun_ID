'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { createBrowserClient } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

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
    setStockCount(result.data.total_stock)
    setCredentials('')
    setNote('')
    router.refresh()
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setBulkLoading(true)
    setBulkResult(null)

    // FormData needs raw fetch — pull JWT manually for Authorization header.
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
    router.refresh()
  }

  const wrapperClass = embedded
    ? 'space-y-5'
    : 'space-y-5 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]'

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
          Stok tersedia: <span className="text-ink">{stockCount}</span> unit
        </div>
      )}

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
