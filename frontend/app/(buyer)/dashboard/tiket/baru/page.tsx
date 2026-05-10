import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { ClaimForm } from './claim-form'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'

type OrderInfo = {
  id: string
  order_number: string
  status: string
  guarantee_expires_at: string | null
  product: { name: string } | null
}

type Props = { searchParams: Promise<{ order_id?: string }> }

export const metadata = { title: 'Klaim Garansi' }

export default async function ClaimPage({ searchParams }: Props) {
  const sp = await searchParams
  if (!sp.order_id) redirect('/dashboard/pesanan')

  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const order = await serverFetch<OrderInfo>(`/orders/${sp.order_id}`, {
    jwt: session?.access_token,
    cache: 'no-store',
  })

  if (!order) redirect('/dashboard/pesanan')

  const guaranteeExpired =
    order.guarantee_expires_at && new Date(order.guarantee_expires_at) < new Date()
  const orderNotEligible = !['delivered', 'confirmed'].includes(order.status)

  return (
    <section className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
      <DashboardTabs active="/dashboard/tiket" />

      <div className="max-w-2xl">
        <Link
          href={`/dashboard/pesanan/${order.id}`}
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted hover:text-brand-700"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Kembali ke detail pesanan
        </Link>

        <div className="mt-4">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            Klaim Garansi
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted font-medium">
            Untuk pesanan <strong className="text-ink font-mono">{order.order_number}</strong>
            {order.product?.name ? (
              <>
                {' '}
                — <strong className="text-ink">{order.product.name}</strong>
              </>
            ) : null}
          </p>
        </div>

        {orderNotEligible ? (
          <div className="mt-7 rounded-2xl border-2 border-warning/40 bg-warning/10 p-5 text-warning">
            <p className="font-bold">Pesanan belum bisa diklaim</p>
            <p className="mt-1.5 text-sm font-medium">
              Status pesanan harus sudah <strong>terkirim</strong> atau <strong>selesai</strong>{' '}
              sebelum bisa klaim garansi.
            </p>
          </div>
        ) : guaranteeExpired ? (
          <div className="mt-7 rounded-2xl border-2 border-danger/40 bg-danger/10 p-5 text-danger">
            <p className="font-bold">Masa garansi sudah habis</p>
            <p className="mt-1.5 text-sm font-medium">
              Sayang sekali, periode garansi untuk pesanan ini sudah berakhir. Silakan hubungi tim
              support kami via WhatsApp untuk diskusi lebih lanjut.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  size={18}
                  className="text-brand-700 shrink-0 mt-0.5"
                  strokeWidth={2.25}
                />
                <p className="text-sm text-brand-700 font-medium leading-relaxed">
                  Tim kami akan review klaim kamu dalam <strong>1×24 jam</strong>. Sertakan bukti
                  yang jelas (screenshot error, dll) supaya proses lebih cepat.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-black bg-white p-6 md:p-7 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
              <ClaimForm orderId={order.id} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
