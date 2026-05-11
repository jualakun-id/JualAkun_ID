import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { Pagination } from '@/components/admin/pagination'
import { CouponsTableClient } from './coupons-table-client'
import { CouponForm } from './coupon-form'
import { adminFetch } from '@/lib/admin-fetch'

type Coupon = {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

type ListResponse = {
  coupons: Coupon[]
  pagination: { page: number; limit: number; total: number }
  metrics: { total_redemption: number; total_active: number }
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

export const metadata = { title: 'Admin — Kupon' }

export default async function AdminKuponPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.status) params.set('status', sp.status)
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)

  const data = await adminFetch<ListResponse>(`/admin/coupons?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.status) pagBaseParams.set('status', sp.status)
  if (sp.search) pagBaseParams.set('search', sp.search)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/kupon${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.status) sortBaseParams.set('status', sp.status)
  if (sp.search) sortBaseParams.set('search', sp.search)
  const sortBasePath = `/admin/kupon${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  const total = data?.pagination.total ?? 0
  const activeCount = data?.metrics.total_active ?? 0
  const totalRedemption = data?.metrics.total_redemption ?? 0

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title="Kupon"
        subtitle={`${total} kupon · ${activeCount} aktif · ${totalRedemption} kali dipakai (total)`}
      />

      <FilterBar
        activeValue={sp.status ?? 'all'}
        pills={[
          { label: 'Semua', value: 'all', href: '/admin/kupon' },
          { label: 'Aktif', value: 'active', href: '/admin/kupon?status=active' },
          { label: 'Nonaktif', value: 'inactive', href: '/admin/kupon?status=inactive' },
          { label: 'Expired', value: 'expired', href: '/admin/kupon?status=expired' },
          { label: 'Habis', value: 'exhausted', href: '/admin/kupon?status=exhausted' },
        ]}
        searchQuery={{ name: 'search', placeholder: 'Cari kode kupon...', defaultValue: sp.search }}
      />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <CouponsTableClient
            coupons={data?.coupons ?? []}
            sortBy={sp.sort_by ?? null}
            sortDir={sp.sort_dir ?? 'desc'}
            sortBasePath={sortBasePath}
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

        <CouponForm />
      </div>
    </div>
  )
}
