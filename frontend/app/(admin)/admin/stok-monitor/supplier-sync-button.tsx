'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type SyncResult = {
  total_mapped: number
  updated: number
  orphans: string[]
  synced_at: string
}

/**
 * Tombol sync — call POST /admin/supplier/sync-stock supaya display_stock
 * di-update dengan stats.available dari Canboso untuk semua produk yang
 * sudah punya supplier_product_id.
 */
export function SupplierSyncButton() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    const result = await api.post<SyncResult>('/admin/supplier/sync-stock')
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal sync stok')
      return
    }
    const { total_mapped, updated, orphans } = result.data
    if (total_mapped === 0) {
      toast.error('Belum ada produk yang di-link ke supplier. Set "Supplier (Canboso)" di form produk dulu.')
      return
    }
    let msg = `Sync selesai: ${updated} produk di-update dari ${total_mapped} produk ter-link.`
    if (orphans.length > 0) msg += ` ⚠️ ${orphans.length} mapping tidak ketemu di supplier.`
    toast.success(msg)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        title="Auto-sync jalan setiap 10 menit. Klik untuk force refresh sekarang."
        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-brand-500 px-3.5 py-2 text-sm font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
        ) : (
          <RefreshCw size={14} strokeWidth={2.5} />
        )}
        {loading ? 'Sync...' : 'Sync Sekarang'}
      </button>
      <p className="text-[10px] font-medium text-ink-subtle leading-tight">
        Auto-sync setiap 10 menit
      </p>
    </div>
  )
}
