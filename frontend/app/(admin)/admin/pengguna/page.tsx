import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
import { Pagination } from '@/components/admin/pagination'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDate } from '@/lib/utils'

type UserRow = {
  id: string
  full_name: string | null
  phone_wa: string | null
  role: string
  status: string
  credits: number
  joined_at: string
}

type ListResponse = {
  users: UserRow[]
  pagination: { page: number; limit: number; total: number }
}

type Props = {
  searchParams: Promise<{
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
  if (sp.search) params.set('search', sp.search)
  params.set('page', String(page))
  params.set('limit', '10')
  if (sp.sort_by) params.set('sort_by', sp.sort_by)
  if (sp.sort_dir) params.set('sort_dir', sp.sort_dir)
  const data = await adminFetch<ListResponse>(`/admin/users?${params.toString()}`)

  const pagBaseParams = new URLSearchParams()
  if (sp.search) pagBaseParams.set('search', sp.search)
  if (sp.sort_by) pagBaseParams.set('sort_by', sp.sort_by)
  if (sp.sort_dir) pagBaseParams.set('sort_dir', sp.sort_dir)
  const basePath = `/admin/pengguna${pagBaseParams.toString() ? `?${pagBaseParams.toString()}` : ''}`

  const sortBaseParams = new URLSearchParams()
  if (sp.search) sortBaseParams.set('search', sp.search)
  const sortBasePath = `/admin/pengguna${sortBaseParams.toString() ? `?${sortBaseParams.toString()}` : ''}`

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader title="Pengguna" subtitle={`${data?.pagination.total ?? 0} buyer terdaftar`} />
      <FilterBar searchQuery={{ name: 'search', placeholder: 'Cari nama/WA...', defaultValue: sp.search }} />
      <div className="mt-4">
        <DataTable
          rows={(data?.users ?? []) as unknown as Record<string, unknown>[]}
          sortBy={sp.sort_by ?? null}
          sortDir={sp.sort_dir ?? 'desc'}
          sortBasePath={sortBasePath}
          columns={[
            { key: 'full_name', header: 'Nama', sortKey: 'full_name', render: (r) => (r as unknown as UserRow).full_name ?? '—' },
            { key: 'phone_wa', header: 'WhatsApp', sortKey: 'phone_wa', render: (r) => (r as unknown as UserRow).phone_wa ?? '—' },
            { key: 'credits', header: 'Kredit', sortKey: 'credits', render: (r) => formatRupiah((r as unknown as UserRow).credits), align: 'right' },
            { key: 'role', header: 'Role', sortKey: 'role', render: (r) => <span className="text-xs uppercase">{(r as unknown as UserRow).role}</span> },
            {
              key: 'status',
              header: 'Status',
              sortKey: 'status',
              render: (r) => {
                const s = (r as unknown as UserRow).status
                const cls =
                  s === 'active' ? 'bg-success/15 text-success border-success/40' :
                  s === 'suspended' ? 'bg-warning/15 text-warning border-warning/40' : 'bg-danger/15 text-danger border-danger/40'
                return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap capitalize ${cls}`}>{s}</span>
              },
              align: 'center',
            },
            { key: 'joined_at', header: 'Bergabung', sortKey: 'joined_at', render: (r) => formatDate((r as unknown as UserRow).joined_at) },
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
