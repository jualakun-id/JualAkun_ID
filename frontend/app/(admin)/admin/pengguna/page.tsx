import { AdminHeader } from '@/components/admin/admin-header'
import { FilterBar } from '@/components/admin/filter-bar'
import { DataTable } from '@/components/admin/data-table'
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

type Props = { searchParams: Promise<{ search?: string }> }

export const metadata = { title: 'Admin — Pengguna' }

export default async function AdminPenggunaPage({ searchParams }: Props) {
  const sp = await searchParams
  const data = await adminFetch<ListResponse>(`/admin/users${sp.search ? `?search=${encodeURIComponent(sp.search)}` : ''}`)

  return (
    <div className="px-8 py-8">
      <AdminHeader title="Pengguna" subtitle={`${data?.pagination.total ?? 0} buyer terdaftar`} />
      <FilterBar searchQuery={{ name: 'search', placeholder: 'Cari nama/WA...', defaultValue: sp.search }} />
      <div className="mt-4">
        <DataTable
          rows={(data?.users ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'full_name', header: 'Nama', render: (r) => (r as unknown as UserRow).full_name ?? '—' },
            { key: 'phone_wa', header: 'WhatsApp', render: (r) => (r as unknown as UserRow).phone_wa ?? '—' },
            { key: 'credits', header: 'Kredit', render: (r) => formatRupiah((r as unknown as UserRow).credits), align: 'right' },
            { key: 'role', header: 'Role', render: (r) => <span className="text-xs uppercase">{(r as unknown as UserRow).role}</span> },
            {
              key: 'status',
              header: 'Status',
              render: (r) => {
                const s = (r as unknown as UserRow).status
                const cls =
                  s === 'active' ? 'bg-success/15 text-success' :
                  s === 'suspended' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                return <span className={`rounded-md px-2 py-0.5 text-xs ${cls}`}>{s}</span>
              },
              align: 'center',
            },
            { key: 'joined_at', header: 'Bergabung', render: (r) => formatDate((r as unknown as UserRow).joined_at) },
          ]}
        />
      </div>
    </div>
  )
}
