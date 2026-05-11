import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShoppingBag, Coins, Users, TrendingUp, Shield, Mail, Phone, Calendar, Clock } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { UserStatusActions } from './user-status-actions'
import { AdjustCreditsForm } from './adjust-credits-form'
import { adminFetch } from '@/lib/admin-fetch'
import { formatRupiah, formatDate, formatDateTime } from '@/lib/utils'

type UserDetail = {
  id: string
  full_name: string | null
  phone_wa: string | null
  role: 'user' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  credits: number
  joined_at: string
  referral_code: string | null
  referred_by: string | null
  email: string | null
  last_sign_in_at: string | null
  stats: {
    total_orders: number
    paid_orders: number
    total_spent: number
    referral_count: number
  }
  recent_orders: Array<{
    id: string
    order_number: string
    total_idr: number
    status: string
    created_at: string
    products: { name: string } | { name: string }[]
  }>
}

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Admin — Detail Pengguna' }

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params
  const user = await adminFetch<UserDetail>(`/admin/users/${id}`)
  if (!user) notFound()

  const statusTone =
    user.status === 'active'
      ? 'bg-success/15 text-success border-success/40'
      : user.status === 'suspended'
        ? 'bg-warning/15 text-warning border-warning/40'
        : 'bg-danger/15 text-danger border-danger/40'

  return (
    <div className="px-6 md:px-8 py-8">
      <AdminHeader
        title={user.full_name ?? user.phone_wa ?? user.id.slice(0, 12)}
        subtitle={user.email ?? '— belum verifikasi email —'}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {user.role === 'admin' ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-brand-500 bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">
                <Shield size={12} strokeWidth={2.5} />
                ADMIN
              </span>
            ) : null}
            <span className={`inline-flex items-center rounded-md border-2 px-2.5 py-1 text-xs font-bold capitalize ${statusTone}`}>
              {user.status}
            </span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <KpiCard
          icon={<ShoppingBag size={20} strokeWidth={2.25} />}
          label="Total Order"
          value={user.stats.total_orders}
          subLabel={`${user.stats.paid_orders} berhasil bayar`}
        />
        <KpiCard
          icon={<TrendingUp size={20} strokeWidth={2.25} />}
          label="Total Pengeluaran"
          value={formatRupiah(user.stats.total_spent)}
          subLabel="dari order yang sudah bayar"
        />
        <KpiCard
          icon={<Coins size={20} strokeWidth={2.25} />}
          label="Saldo Kredit"
          value={formatRupiah(user.credits)}
          subLabel="bisa dipakai checkout"
        />
        <KpiCard
          icon={<Users size={20} strokeWidth={2.25} />}
          label="Referral"
          value={user.stats.referral_count}
          subLabel="orang yang sudah credited"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Profil</h2>
          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <InfoField icon={<Mail size={14} />} label="Email" value={user.email ?? '—'} />
            <InfoField
              icon={<Phone size={14} />}
              label="WhatsApp"
              value={
                user.phone_wa ? (
                  <a
                    href={`https://wa.me/${user.phone_wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:underline font-mono text-xs"
                  >
                    {user.phone_wa}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <InfoField
              icon={<Coins size={14} />}
              label="Kode Referral"
              value={user.referral_code ? <code className="font-mono text-xs">{user.referral_code}</code> : '—'}
            />
            <InfoField icon={<Calendar size={14} />} label="Bergabung" value={formatDate(user.joined_at)} />
            <InfoField
              icon={<Clock size={14} />}
              label="Last Login"
              value={user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : 'Belum pernah'}
            />
            <InfoField icon={<Shield size={14} />} label="Di-refer Oleh" value={user.referred_by ?? '—'} />
          </dl>

          {user.role !== 'admin' ? <UserStatusActions userId={user.id} currentStatus={user.status} /> : null}
        </div>

        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Adjust Kredit</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Tambah/kurangi saldo kredit manual. Misal untuk bonus referral, kompensasi, atau koreksi error.
          </p>
          <AdjustCreditsForm userId={user.id} currentCredits={user.credits} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-heading text-xl font-extrabold tracking-tight mb-3">
          Riwayat Order ({user.recent_orders.length})
        </h2>
        <DataTable
          rows={user.recent_orders as unknown as Record<string, unknown>[]}
          emptyMessage="Belum ada order dari user ini."
          columns={[
            {
              key: 'order_number',
              header: 'Order #',
              render: (r) => {
                const row = r as unknown as UserDetail['recent_orders'][number]
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
              key: 'total_idr',
              header: 'Total',
              render: (r) => formatRupiah((r as unknown as UserDetail['recent_orders'][number]).total_idr),
              align: 'right',
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <StatusBadge variant="order" status={(r as unknown as UserDetail['recent_orders'][number]).status} />,
              align: 'center',
            },
            {
              key: 'created_at',
              header: 'Waktu',
              render: (r) => <span className="text-xs tabular-nums">{formatDateTime((r as unknown as UserDetail['recent_orders'][number]).created_at)}</span>,
            },
          ]}
        />
      </div>

      <Link href="/admin/pengguna" className="mt-6 inline-block text-sm text-ink-muted hover:text-ink">
        ← Kembali ke daftar pengguna
      </Link>
    </div>
  )
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink-muted font-bold uppercase tracking-wider">
        <span className="text-ink-subtle">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-ink font-medium break-all">{value}</dd>
    </div>
  )
}
