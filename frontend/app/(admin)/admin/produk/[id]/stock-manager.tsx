'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { createBrowserClient } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

type Props = { productId: string; initialStock: number }

export function StockManager({ productId, initialStock }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [credentials, setCredentials] = useState('')
  const [note, setNote] = useState('')
  const [stockCount, setStockCount] = useState(initialStock)
  const [bulkResult, setBulkResult] = useState<{ added: number; rejected: number; errors: string[] } | null>(null)
  const [singleStatus, setSingleStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSingle(e: React.FormEvent) {
    e.preventDefault()
    setSingleStatus(null)
    setLoading(true)
    const result = await api.post<{ added: number; total_stock: number }>(
      `/admin/products/${productId}/stock`,
      { accounts: [{ credentials, note: note || undefined }] },
    )
    setLoading(false)
    if (!result.ok) {
      setSingleStatus(`❌ ${result.message}`)
      return
    }
    setSingleStatus(`✅ Berhasil ditambah. Stok sekarang: ${result.data.total_stock}`)
    setStockCount(result.data.total_stock)
    setCredentials('')
    setNote('')
    router.refresh()
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
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
    setLoading(false)
    if (!res.ok) {
      setBulkResult({ added: 0, rejected: 0, errors: [`HTTP ${res.status}`] })
      return
    }
    const json = (await res.json()) as { data: { added: number; rejected: number; errors: string[] } }
    setBulkResult(json.data)
    if (fileRef.current) fileRef.current.value = ''
    router.refresh()
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-surface p-6">
      <div>
        <h2 className="font-heading text-h3">Kelola Stok</h2>
        <p className="mt-1 text-sm text-text-muted">Stok tersedia: <strong>{stockCount}</strong> unit</p>
      </div>

      <form onSubmit={handleSingle} className="space-y-3 rounded-lg border border-border-subtle bg-surface-2 p-4">
        <h3 className="font-heading text-h4">Tambah Single</h3>
        <Input required placeholder="email:password" value={credentials} onChange={(e) => setCredentials(e.target.value)} className="font-mono" />
        <Input placeholder="Note (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Tambah'}
        </Button>
        {singleStatus ? <p className="text-sm text-text-muted">{singleStatus}</p> : null}
      </form>

      <form onSubmit={handleBulk} className="space-y-3 rounded-lg border border-border-subtle bg-surface-2 p-4">
        <h3 className="font-heading text-h4">Bulk Upload CSV</h3>
        <p className="text-xs text-text-subtle">Format per baris: <code>credentials,note</code></p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Upload'}
        </Button>
        {bulkResult ? (
          <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <div className="text-success">Ditambah: {bulkResult.added}</div>
            {bulkResult.rejected > 0 ? <div className="mt-1 text-danger">Rejected: {bulkResult.rejected}</div> : null}
            {bulkResult.errors.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-text-muted">
                {bulkResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  )
}
