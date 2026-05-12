'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Wrench, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Orphan = {
  product_id: string
  product_name: string
  supplier_product_id: string
  first_orphan_at: string
}

type UnmapResult = {
  unmapped: { id: string; name: string }[]
  skipped: string[]
}

/**
 * Banner alert untuk produk dengan supplier link rusak (auto-detected oleh
 * sync). Muncul kalau ada >0 orphan, dengan tombol Auto-fix yang bulk-unmap
 * semua orphan dalam 1 klik.
 *
 * State orphan persisted di kolom products.supplier_orphan_at — jadi banner
 * tetap visible setelah refresh page tanpa harus sync ulang.
 */
export function OrphanBanner({ orphans }: { orphans: Orphan[] }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  if (orphans.length === 0) return null

  async function handleAutoFix() {
    if (!confirm(`Unmap ${orphans.length} produk dari supplier yang sudah hilang? Produk tetap ada — cuma supplier link-nya yang dihapus.`)) return
    setLoading(true)
    const result = await api.post<UnmapResult>('/admin/supplier/unmap-orphans', {
      product_ids: orphans.map((o) => o.product_id),
    })
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal unmap produk')
      return
    }
    const { unmapped, skipped } = result.data
    let msg = `${unmapped.length} produk berhasil di-unmap dari supplier.`
    if (skipped.length > 0) msg += `\n${skipped.length} di-skip (mungkin sudah ter-fix).`
    toast.success(msg)
    router.refresh()
  }

  return (
    <div className="mt-4 rounded-xl border-2 border-amber-400 bg-amber-50 p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} strokeWidth={2.5} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="flex-1">
          <div className="font-extrabold text-ink text-sm">
            {orphans.length} produk punya supplier link rusak
          </div>
          <p className="mt-1 text-[13px] text-ink-muted leading-relaxed">
            Produk berikut di-link ke supplier tapi product ID-nya sudah tidak ada di Canboso (mungkin sudah delisted). Stok tidak bisa auto-sync.
          </p>
          <ul className="mt-2 space-y-1">
            {orphans.slice(0, 5).map((o) => (
              <li key={o.product_id} className="flex items-center gap-2 text-[13px]">
                <span className="font-bold text-ink">• {o.product_name}</span>
                <span className="text-ink-subtle text-[11px]">
                  (orphan sejak {formatRelative(o.first_orphan_at)})
                </span>
              </li>
            ))}
            {orphans.length > 5 && (
              <li className="text-[12px] text-ink-subtle italic">
                + {orphans.length - 5} produk lain
              </li>
            )}
          </ul>
        </div>
        <button
          type="button"
          onClick={handleAutoFix}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-brand-500 px-3 py-2 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
        >
          {loading ? (
            <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
          ) : (
            <Wrench size={13} strokeWidth={2.5} />
          )}
          {loading ? 'Memperbaiki...' : `Auto-fix (${orphans.length})`}
        </button>
      </div>
    </div>
  )
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay > 0) return `${diffDay} hari lalu`
  if (diffHr > 0) return `${diffHr} jam lalu`
  if (diffMin > 0) return `${diffMin} menit lalu`
  return 'baru saja'
}
