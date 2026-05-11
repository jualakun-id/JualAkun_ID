'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, UserCog, Ban, RotateCcw, Loader2, Eye } from 'lucide-react'
import { DataTable, type SortDir } from '@/components/admin/data-table'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'
import { formatRupiah, formatDate } from '@/lib/utils'
import { UserDetailModal } from './user-detail-modal'

type UserRow = {
  id: string
  full_name: string | null
  phone_wa: string | null
  role: 'user' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  credits: number
  joined_at: string
}

type Props = {
  users: UserRow[]
  sortBy: string | null
  sortDir: SortDir
  sortBasePath: string
}

export function UsersTableClient({ users, sortBy, sortDir, sortBasePath }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [actingId, setActingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  async function handleStatusChange(u: UserRow, status: 'active' | 'suspended' | 'banned') {
    const labels = { active: 'aktifkan', suspended: 'suspend', banned: 'ban' }
    if (!confirm(`Yakin ${labels[status]} user ${u.full_name ?? u.phone_wa ?? u.id.slice(0, 8)}?`)) return
    setActingId(u.id)
    const result = await api.patch(`/admin/users/${u.id}/status`, { status })
    setActingId(null)
    if (!result.ok) {
      toast.error(result.message ?? `Gagal ${labels[status]} user`)
      return
    }
    toast.success(`User di-${labels[status]} ✓`)
    router.refresh()
  }

  return (
    <>
      <DataTable
      rows={users as unknown as Record<string, unknown>[]}
      sortBy={sortBy}
      sortDir={sortDir}
      sortBasePath={sortBasePath}
      emptyMessage="Belum ada user yang cocok dengan filter."
      rowClassName={(r) => {
        const u = r as unknown as UserRow
        if (u.status === 'banned') return 'bg-danger/5'
        if (u.status === 'suspended') return 'bg-warning/5'
        return ''
      }}
      columns={[
        {
          key: 'full_name',
          header: 'Nama',
          sortKey: 'full_name',
          render: (r) => {
            const u = r as unknown as UserRow
            return (
              <button
                type="button"
                onClick={() => setDetailId(u.id)}
                className="text-left hover:text-brand-700"
              >
                <div className="font-bold text-ink">{u.full_name ?? <span className="text-ink-subtle italic">— belum isi —</span>}</div>
                <div className="text-xs text-ink-subtle font-mono mt-0.5">{u.id.slice(0, 8)}</div>
              </button>
            )
          },
        },
        {
          key: 'phone_wa',
          header: 'WhatsApp',
          sortKey: 'phone_wa',
          render: (r) => {
            const wa = (r as unknown as UserRow).phone_wa
            if (!wa) return <span className="text-ink-subtle">—</span>
            return (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-brand-700 hover:underline"
              >
                {wa}
              </a>
            )
          },
        },
        {
          key: 'credits',
          header: 'Kredit',
          sortKey: 'credits',
          render: (r) => {
            const c = (r as unknown as UserRow).credits
            return <span className={c > 0 ? 'font-bold text-success tabular-nums' : 'text-ink-subtle tabular-nums'}>{formatRupiah(c)}</span>
          },
          align: 'right',
        },
        {
          key: 'role',
          header: 'Role',
          sortKey: 'role',
          render: (r) => {
            const role = (r as unknown as UserRow).role
            if (role === 'admin') {
              return (
                <span className="inline-flex items-center gap-1 rounded-md border-2 border-brand-500 bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-700">
                  <Shield size={10} strokeWidth={2.5} />
                  Admin
                </span>
              )
            }
            return (
              <span className="text-xs uppercase font-bold text-ink-muted">User</span>
            )
          },
        },
        {
          key: 'status',
          header: 'Status',
          sortKey: 'status',
          render: (r) => {
            const s = (r as unknown as UserRow).status
            const cls =
              s === 'active' ? 'bg-success/15 text-success border-success/40' :
              s === 'suspended' ? 'bg-warning/15 text-warning border-warning/40' :
              'bg-danger/15 text-danger border-danger/40'
            return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold whitespace-nowrap capitalize ${cls}`}>{s}</span>
          },
          align: 'center',
        },
        {
          key: 'joined_at',
          header: 'Bergabung',
          sortKey: 'joined_at',
          render: (r) => <span className="text-xs tabular-nums">{formatDate((r as unknown as UserRow).joined_at)}</span>,
        },
        {
          key: 'action',
          header: '',
          render: (r) => {
            const u = r as unknown as UserRow
            const isLoading = actingId === u.id
            // Hide actions untuk admin role — protect dari self-ban accident
            if (u.role === 'admin') {
              return (
                <button
                  type="button"
                  onClick={() => setDetailId(u.id)}
                  title="Lihat detail"
                  className="inline-flex items-center rounded-md border-2 border-black/15 bg-white px-2 py-1 text-xs font-bold text-ink-muted hover:border-brand-400 hover:text-brand-700"
                >
                  <Eye size={11} strokeWidth={2.5} />
                </button>
              )
            }
            return (
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setDetailId(u.id)}
                  title="Lihat detail"
                  className="inline-flex items-center rounded-md border-2 border-black/15 bg-white px-2 py-1 text-xs font-bold text-ink-muted hover:border-brand-400 hover:text-brand-700"
                >
                  <Eye size={11} strokeWidth={2.5} />
                </button>
                {u.status === 'active' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(u, 'suspended')}
                      disabled={isLoading}
                      title="Suspend user"
                      className="inline-flex items-center rounded-md border-2 border-warning/40 bg-warning/10 px-2 py-1 text-xs font-bold text-warning hover:bg-warning/15 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={11} className="animate-spin" strokeWidth={2.5} /> : <UserCog size={11} strokeWidth={2.5} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(u, 'banned')}
                      disabled={isLoading}
                      title="Ban user"
                      className="inline-flex items-center rounded-md border-2 border-danger/40 bg-danger/10 px-2 py-1 text-xs font-bold text-danger hover:bg-danger/15 disabled:opacity-50"
                    >
                      <Ban size={11} strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(u, 'active')}
                    disabled={isLoading}
                    title="Aktifkan kembali"
                    className="inline-flex items-center rounded-md border-2 border-success/40 bg-success/10 px-2 py-1 text-xs font-bold text-success hover:bg-success/15 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={11} className="animate-spin" strokeWidth={2.5} /> : <RotateCcw size={11} strokeWidth={2.5} />}
                  </button>
                )}
              </div>
            )
          },
          align: 'right',
        },
      ]}
    />

      <UserDetailModal
        open={detailId !== null}
        userId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  )
}
