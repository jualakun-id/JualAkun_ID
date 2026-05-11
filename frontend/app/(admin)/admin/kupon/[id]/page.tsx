import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Tag, ShoppingBag, TrendingUp, Coins, Percent } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { KpiCard } from '@/components/admin/kpi-card'
// StatusBadge masih dipakai di kolom Status di DataTable
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDateTime } from '@/lib/utils'

type Coupon = {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  valid_for_products: string[] | null
  created_at: string
}

type OrderRow = {
  id: string
  order_number: string
  total_idr: number
  amount_idr: number
  discount_idr: number
  status: string
  created_at: string
  products: { name: string; slug: string } | { name: string; slug: string }[]
}

type AnalyticsResponse = {
  coupon: Coupon
  orders: OrderRow[]
  metrics: {
    total_orders: number
    paid_orders: number
    conversion_rate_pct: number
    total_discount_given: number
    total_revenue: number
  }
}

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Admin — Kupon Analytics' }

export default async function CouponAnalyticsPage({ params }: Props) {
  const { id } = await params
  const data = await adminFetch<AnalyticsResponse>(`/admin/coupons/${id}/analytics`)
  if (!data) notFound()
  const { coupon, orders, metrics } = data

  const discountLabel =
    coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : formatRupiah(coupon.discount_value)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title={`Kupon ${coupon.code}`}
        subtitle={`${discountLabel} off · ${coupon.used_count}${coupon.max_uses ? ' / ' + coupon.max_uses : ''} pemakaian`}
        rightSlot={
          <span className={`inline-flex items-center gap-1.5 rounded-md border-2 px-3 py-1 text-xs font-bold ${coupon.is_active ? 'bg-success/15 text-success border-success/40' : 'bg-gray-100 text-ink-muted border-gray-300'}`}>
            <Tag size={12} strokeWidth={2.5} />
            {coupon.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <KpiCard
          icon={<ShoppingBag size={20} strokeWidth={2.25} />}
          label="Total Order"
          value={metrics.total_orders}
          subLabel={`${metrics.paid_orders} berhasil bayar`}
        />
        <KpiCard
          icon={<TrendingUp size={20} strokeWidth={2.25} />}
          label="Conversion Rate"
          value={`${metrics.conversion_rate_pct}%`}
          subLabel="paid / total order"
        />
        <KpiCard
          icon={<Coins size={20} strokeWidth={2.25} />}
          label="Total Diskon"
          value={formatRupiah(metrics.total_discount_given)}
          subLabel="yang dikeluarkan"
        />
        <KpiCard
          icon={<Percent size={20} strokeWidth={2.25} />}
          label="Revenue Impact"
          value={formatRupiah(metrics.total_revenue)}
          subLabel="dari order kupon ini"
        />
      </div>

      <div className="mt-6 rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
        <h2 className="font-heading text-xl font-extrabold tracking-tight mb-1">Info Kupon</h2>
        <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Field label="Kode" value={coupon.code} mono />
          <Field label="Tipe" value={coupon.discount_type === 'percent' ? 'Persentase' : 'Fixed'} />
          <Field label="Nilai" value={discountLabel} />
          <Field label="Maks. Pemakaian" value={coupon.max_uses?.toString() ?? 'Unlimited'} />
          <Field label="Berlaku Hingga" value={coupon.expires_at ? formatDateTime(coupon.expires_at) : 'Tanpa batas'} />
          <Field label="Dibuat" value={formatDateTime(coupon.created_at)} />
          <Field
            label="Produk Berlaku"
            value={
              coupon.valid_for_products && coupon.valid_for_products.length > 0
                ? `${coupon.valid_for_products.length} produk`
                : 'Semua produk'
            }
          />
          <Field label="Status" value={coupon.is_active ? 'Aktif' : 'Nonaktif'} />
        </dl>
      </div>

      <div className="mt-6">
        <h2 className="font-heading text-xl font-extrabold tracking-tight mb-3">
          Riwayat Order ({orders.length})
        </h2>
        <DataTable
          rows={orders as unknown as Record<string, unknown>[]}
          emptyMessage="Belum ada order yang pakai kupon ini."
          columns={[
            {
              key: 'order_number',
              header: 'Order #',
              render: (r) => {
                const row = r as unknown as OrderRow
                const product = Array.isArray(row.products) ? row.products[0] : row.products
                return (
                  <Link href={`/admin/pesanan/${row.id}`} className="hover:text-brand-700">
                    <div className="font-mono text-xs">{row.order_number}</div>
                    <div className="mt-0.5 text-xs text-ink-subtle">{product?.name}</div>
                  </Link>
                )
              },
            },
            {
              key: 'discount_idr',
              header: 'Diskon',
              render: (r) => <span className="text-success font-bold tabular-nums">-{formatRupiah((r as unknown as OrderRow).discount_idr)}</span>,
              align: 'right',
            },
            {
              key: 'total_idr',
              header: 'Total',
              render: (r) => formatRupiah((r as unknown as OrderRow).total_idr),
              align: 'right',
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <StatusBadge variant="order" status={(r as unknown as OrderRow).status} />,
              align: 'center',
            },
            {
              key: 'created_at',
              header: 'Waktu',
              render: (r) => <span className="text-xs tabular-nums">{formatDateTime((r as unknown as OrderRow).created_at)}</span>,
            },
          ]}
        />
      </div>

      <Link href="/admin/kupon" className="mt-6 inline-block text-sm text-ink-muted hover:text-ink">
        ← Kembali ke daftar kupon
      </Link>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted font-bold uppercase tracking-wider">{label}</dt>
      <dd className={`mt-0.5 text-ink font-medium ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
