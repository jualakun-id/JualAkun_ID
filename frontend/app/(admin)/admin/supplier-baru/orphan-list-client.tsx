'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ExternalLink, Loader2, Unlink, Wrench } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Orphan = {
  product_id: string
  product_name: string
  supplier_product_id: string
  first_orphan_at: string
  confirmed_at: string
}

type UnmapResult = {
  unmapped: { id: string; name: string }[]
  skipped: string[]
}

type Props = {
  initialOrphans: Orphan[]
}

/**
 * Tampilkan semua produk JualAkun yang punya supplier_product_id tapi
 * link-nya rusak (CONFIRMED orphan ≥30 menit). Admin bisa unmap per row
 * (icon button) atau bulk Auto-fix semua sekaligus. Setelah unmap, row
 * hilang dari list — auto-refresh data via router.
 */
export function OrphanListClient({ initialOrphans }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [orphans, setOrphans] = useState(initialOrphans)
  const [loading, setLoading] = useState<string | 'all' | null>(null)

  if (orphans.length === 0) return null

  async function unmap(productIds: string[], scope: string | 'all') {
    setLoading(scope)
    const result = await api.post<UnmapResult>('/admin/supplier/unmap-orphans', {
      product_ids: productIds,
    })
    setLoading(null)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal unmap produk')
      return
    }
    const { unmapped, skipped } = result.data
    setOrphans((prev) => prev.filter((o) => !unmapped.some((u) => u.id === o.product_id)))
    let msg = `${unmapped.length} produk di-unmap dari supplier.`
    if (skipped.length > 0) msg += ` ${skipped.length} di-skip.`
    toast.success(msg)
    router.refresh()
  }

  async function handleAutoFix() {
    const confirmMsg = [
      `Auto-fix ${orphans.length} produk?`,
      '',
      `Pastikan supplier benar-benar delisted (bukan cuma maintenance).`,
      `Produk akan kehilangan link supplier — perlu re-link manual kalau`,
      `ternyata supplier balik dengan ID berbeda.`,
    ].join('\n')
    if (!confirm(confirmMsg)) return
    await unmap(orphans.map((o) => o.product_id), 'all')
  }

  async function handleUnmapOne(o: Orphan) {
    if (!confirm(`Unmap link supplier untuk "${o.product_name}"?`)) return
    await unmap([o.product_id], o.product_id)
  }

  return (
    <section className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            strokeWidth={2.5}
            className="mt-0.5 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-extrabold text-ink">
              {orphans.length} produk punya supplier link rusak
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Produk berikut sudah di-link ke Canboso tapi product ID-nya tidak ditemukan lagi
              (kemungkinan sudah delisted supplier). Stok tidak bisa auto-sync. Unmap saja kalau
              yakin tidak akan dipakai lagi, atau re-link via form edit produk.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoFix}
          disabled={loading !== null}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-brand-500 px-3 py-2 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
        >
          {loading === 'all' ? (
            <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
          ) : (
            <Wrench size={13} strokeWidth={2.5} />
          )}
          {loading === 'all' ? 'Memperbaiki...' : `Auto-fix Semua (${orphans.length})`}
        </button>
      </div>

      <ul className="mt-4 divide-y divide-amber-300/60 border-t-2 border-amber-300/60">
        {orphans.map((o) => (
          <li
            key={o.product_id}
            className="flex items-center justify-between gap-3 py-2.5 text-[13px]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-bold text-ink">{o.product_name}</span>
                <Link
                  href={`/admin/produk/${o.product_id}`}
                  className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100/60"
                  title="Buka halaman produk"
                >
                  <ExternalLink size={10} strokeWidth={2.5} />
                  Detail
                </Link>
              </div>
              <p className="mt-0.5 truncate font-mono text-[10px] text-ink-subtle">
                supplier_id: {o.supplier_product_id} · orphan sejak{' '}
                {formatRelative(o.first_orphan_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleUnmapOne(o)}
              disabled={loading !== null}
              className="shrink-0 inline-flex items-center gap-1 rounded-md border-2 border-amber-700/30 bg-white px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:border-amber-700 hover:bg-amber-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              title="Lepaskan link supplier untuk produk ini saja"
            >
              {loading === o.product_id ? (
                <Loader2 size={11} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <Unlink size={11} strokeWidth={2.5} />
              )}
              Unmap
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] italic leading-relaxed text-ink-subtle">
        💡 Sistem hanya tampilkan orphan yang ter-confirm ≥30 menit untuk hindari false alarm dari
        supplier glitch sementara.
      </p>
    </section>
  )
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay > 0) return `${diffDay} hari lalu`
  if (diffHr > 0) return `${diffHr} jam lalu`
  if (diffMin > 0) return `${diffMin} menit lalu`
  return 'baru saja'
}
