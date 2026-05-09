import { AdminHeader } from '@/components/admin/admin-header'
import { DataTable } from '@/components/admin/data-table'
import { CouponForm } from './coupon-form'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDate } from '@/lib/utils'

type Coupon = {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
}

export const metadata = { title: 'Admin — Kupon' }

export default async function AdminKuponPage() {
  const data = await adminFetch<Coupon[]>('/admin/coupons')

  return (
    <div className="px-8 py-8">
      <AdminHeader title="Kupon" subtitle={`${data?.length ?? 0} kupon`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <DataTable
          rows={(data ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'code', header: 'Kode', render: (r) => <span className="font-mono">{(r as unknown as Coupon).code}</span> },
            {
              key: 'discount_value',
              header: 'Diskon',
              render: (r) => {
                const c = r as unknown as Coupon
                return c.discount_type === 'percent' ? `${c.discount_value}%` : formatRupiah(c.discount_value)
              },
            },
            { key: 'used_count', header: 'Pemakaian', render: (r) => `${(r as unknown as Coupon).used_count} / ${(r as unknown as Coupon).max_uses ?? '∞'}` },
            { key: 'expires_at', header: 'Berlaku Hingga', render: (r) => (r as unknown as Coupon).expires_at ? formatDate((r as unknown as Coupon).expires_at!) : 'Tanpa batas' },
            {
              key: 'is_active',
              header: 'Status',
              render: (r) => {
                const a = (r as unknown as Coupon).is_active
                return <span className={`rounded-md px-2 py-0.5 text-xs ${a ? 'bg-success/15 text-success' : 'bg-zinc-800 text-zinc-400'}`}>{a ? 'Aktif' : 'Nonaktif'}</span>
              },
              align: 'center',
            },
          ]}
        />

        <CouponForm />
      </div>
    </div>
  )
}
