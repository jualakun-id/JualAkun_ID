import Link from 'next/link'
import { Link2, AlertTriangle } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { Pagination } from '@/components/admin/pagination'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'

type OrderRow = {
  id: string
  order_number: string
  total_idr: number
  cost_idr: number | null
  status: string
  payment_method: string | null
  created_at: string
  paid_at: string | null
  delivered_at: string | null
  expires_at: string | null
  products: { name: string; slug: string; supplier_product_id: string | null } | { name: string; slug: string; supplier_product_id: string | null }[]
  profiles: { full_name: string | null; phone_wa: string | null } | { full_name: string | null; phone_wa: string | null }[] | null
}

type ListResponse = {
  orders: OrderRow[]
  pagination: { page: number; limit: number; total: number }
}

type Props = {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }>
}

export const metadata = { title: 'Admin — Pesanan' }

/**
 * SLA breach detection (paid order belum di-fulfill):
 *   < 2h    → OK (no highlight)
 *   2h–24h  → warning row (kuning)
 *   > 24h   → critical row (merah)
 */
function slaToneClass(row: OrderRow): string {
  if (row.status !== 'paid' || !row.paid_at) return ''
  const ageHours = (Date.now() - new Date(row.paid_at).getTime()) / 3_600_000
  if (ageHours >= 24) return 'bg-danger/10'
  if (ageHours >= 2) return 'bg-warning/10'
  return ''
}

export default async function AdminPesananPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)
  const data = await adminFetch<ListResponse>(`/admin/orders?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.status) pagBaseParams.set('status', sp.status)
  if (sp.search) pagBaseParams.set('search', sp.search)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/pesanan${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.status) sortBaseParams.set('status', sp.status)
  if (sp.search) sortBaseParams.set('search', sp.search)
  const sortBasePath = `/admin/pesanan${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Pesanan" subtitle={`${data?.pagination.total ?? 0} total`} />

      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/pesanan' },
          { label: 'Menunggu Bayar', value: 'pending_payment', href: '/admin/pesanan?status=pending_payment' },
          { label: 'Verifikasi', value: 'verifying', href: '/admin/pesanan?status=verifying' },
          { label: 'Dibayar', value: 'paid', href: '/admin/pesanan?status=paid' },
          { label: 'Terkirim', value: 'delivered', href: '/admin/pesanan?status=delivered' },
          { label: 'Selesai', value: 'confirmed', href: '/admin/pesanan?status=confirmed' },
          { label: 'Dibatalkan', value: 'cancelled', href: '/admin/pesanan?status=cancelled' },
          { label: 'Refunded', value: 'refunded', href: '/admin/pesanan?status=refunded' },
          { label: 'Expired', value: 'expired', href: '/admin/pesanan?status=expired' },
        ]}
        searchQuery={{ name: 'search', placeholder: 'Cari order# atau nama...', defaultValue: sp.search }}
      />

      <div className="mt-4">
        <DataTable
          rows={(data?.orders ?? []) as unknown as Record<string, unknown>[]}
          sortBy={sp.sort_by ?? null}
          sortDir={sp.sort_dir ?? 'desc'}
          sortBasePath={sortBasePath}
          rowClassName={(r) => slaToneClass(r as unknown as OrderRow)}
          columns={[
            {
              key: 'order_number',
              header: 'Order #',
              sortKey: 'order_number',
              render: (r) => {
                const row = r as unknown as OrderRow
                const product = Array.isArray(row.products) ? row.products[0] : row.products
                const hasSupplier = !!product?.supplier_product_id
                return (
                  <Link href={`/admin/pesanan/${row.id}`} className="hover:text-brand-700">
                    <div className="font-mono text-xs flex items-center gap-1.5">
                      {row.order_number}
                      {hasSupplier ? (
                        <span title="Produk ter-link supplier (Canboso)">
                          <Link2 size={11} strokeWidth={2.5} className="text-brand-500" />
                        </span>
                      ) : null}
                      {row.status === 'paid' && row.paid_at && (Date.now() - new Date(row.paid_at).getTime()) / 3_600_000 >= 2 ? (
                        <span title="SLA breach: paid > 2 jam belum di-fulfill">
                          <AlertTriangle size={11} strokeWidth={2.5} className="text-warning" />
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-subtle">{product?.name}</div>
                  </Link>
                )
              },
            },
            {
              key: 'buyer',
              header: 'Buyer',
              render: (r) => {
                const row = r as unknown as OrderRow
                const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
                return (
                  <div className="text-xs">
                    <div className="text-ink font-medium">{profile?.full_name ?? '—'}</div>
                    <div className="text-ink-subtle font-mono">{profile?.phone_wa ?? ''}</div>
                  </div>
                )
              },
            },
            {
              key: 'status',
              header: 'Status',
              sortKey: 'status',
              render: (r) => <StatusBadge variant="order" status={(r as unknown as OrderRow).status} />,
              align: 'center',
            },
            {
              key: 'total_idr',
              header: 'Total',
              sortKey: 'total_idr',
              render: (r) => formatRupiah((r as unknown as OrderRow).total_idr),
              align: 'right',
            },
            {
              key: 'profit',
              header: 'Profit',
              render: (r) => {
                const row = r as unknown as OrderRow
                if (row.cost_idr === null) return <span className="text-xs text-ink-subtle">—</span>
                const profit = row.total_idr - row.cost_idr
                const margin = row.total_idr > 0 ? Math.round((profit / row.total_idr) * 100) : 0
                const tone = margin >= 30 ? 'text-success' : margin >= 15 ? 'text-warning' : margin >= 0 ? 'text-ink-muted' : 'text-danger'
                return (
                  <div className={`text-xs font-bold tabular-nums ${tone}`}>
                    {formatRupiah(profit)}
                    <div className="text-[10px] font-medium opacity-75">{margin}% margin</div>
                  </div>
                )
              },
              align: 'right',
            },
            {
              key: 'created_at',
              header: 'Waktu',
              sortKey: 'created_at',
              render: (r) => <span className="text-xs tabular-nums">{formatDateTime((r as unknown as OrderRow).created_at)}</span>,
            },
          ]}
        />

        {data?.pagination ? (
          <Pagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            basePath={basePath}
          />
        ) : null}
      </div>
    </div>
  )
}
