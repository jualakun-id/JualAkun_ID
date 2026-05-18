import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { Pagination } from '@/components/admin/pagination'
import { UsersTableClient } from './users-table-client'
import { adminFetch } from '@/lib/admin-fetch'

type UserRow = {
  id: string
  full_name: string | null
  phone_wa: string | null
  role: 'user' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  credits: number
  joined_at: string
}

type ListResponse = {
  users: UserRow[]
  pagination: { page: number; limit: number; total: number }
  metrics: {
    total_users: number
    new_this_week: number
    suspended_count: number
  }
}

type Props = {
  searchParams: Promise<{
    role?: string
    status?: string
    search?: string
    page?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }>
}

export const metadata = { title: 'Admin — Pengguna' }

export default async function AdminPenggunaPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const params = new URLSearchParams()
  if (sp.role) params.set('role', sp.role)
  if (sp.status) params.set('status', sp.status)
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '15')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)
  const data = await adminFetch<ListResponse>(`/admin/users?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.role) pagBaseParams.set('role', sp.role)
  if (sp.status) pagBaseParams.set('status', sp.status)
  if (sp.search) pagBaseParams.set('search', sp.search)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/pengguna${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.role) sortBaseParams.set('role', sp.role)
  if (sp.status) sortBaseParams.set('status', sp.status)
  if (sp.search) sortBaseParams.set('search', sp.search)
  const sortBasePath = `/admin/pengguna${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  // Determine active filter pill value (status atau role)
  const activeFilter = sp.status ?? (sp.role === 'admin' ? 'admin' : 'all')

  const metrics = data?.metrics
  const subtitleParts = [
    `${data?.pagination.total ?? 0} ditampilkan`,
    metrics ? `${metrics.total_users} total user` : null,
    metrics && metrics.new_this_week > 0 ? `+${metrics.new_this_week} minggu ini` : null,
    metrics && metrics.suspended_count > 0 ? `${metrics.suspended_count} suspended/banned` : null,
  ].filter(Boolean)

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Pengguna" subtitle={subtitleParts.join(' · ')} />
      <FilterBar
        activeValue={activeFilter}
        pills={[
          { label: 'Semua User', value: 'all', href: '/admin/pengguna?role=user' },
          { label: 'Aktif', value: 'active', href: '/admin/pengguna?role=user&status=active' },
          { label: 'Suspended', value: 'suspended', href: '/admin/pengguna?role=user&status=suspended' },
          { label: 'Banned', value: 'banned', href: '/admin/pengguna?role=user&status=banned' },
          { label: 'Admin', value: 'admin', href: '/admin/pengguna?role=admin' },
        ]}
        searchQuery={{ name: 'search', placeholder: 'Cari nama/WA...', defaultValue: sp.search }}
      />
      <div className="mt-4">
        <UsersTableClient
          users={data?.users ?? []}
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
    </div>
  )
}
