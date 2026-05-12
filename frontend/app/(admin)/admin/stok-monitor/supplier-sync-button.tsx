'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Orphan = {
  product_id: string
  product_name: string
  supplier_product_id: string
}

type SyncResult = {
  total_mapped: number
  updated: number
  orphans: Orphan[]
  synced_at: string
}

/**
 * Tombol sync — call POST /admin/supplier/sync-stock supaya display_stock
 * di-update dengan stats.available dari Canboso untuk semua produk yang
 * sudah punya supplier_product_id.
 *
 * Kalau ada orphan (mapping tidak ketemu di supplier), tampilkan list nama
 * produk yang bermasalah di toast — bukan cuma count — supaya admin tau
 * persis produk mana yang harus di-cek supplier_product_id-nya.
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
    let msg = `Sync selesai: ${updated} di-update dari ${total_mapped} produk ter-link.`
    if (orphans.length > 0) {
      // List max 5 nama (kalau lebih, summary "+N lain"). Pakai newline supaya
      // di-render multi-baris di toast — toast.tsx pakai whitespace default
      // jadi \n di-handle browser sebagai space, but we ensure via JSX or
      // pre-line. Toast component perlu support multi-line — fallback: pakai
      // separator " · " kalau pendek.
      const names = orphans.slice(0, 5).map((o) => o.product_name).join(', ')
      const more = orphans.length > 5 ? ` +${orphans.length - 5} lain` : ''
      msg += `\n\n⚠️ ${orphans.length} produk tidak ketemu di supplier:\n${names}${more}`
    }
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
