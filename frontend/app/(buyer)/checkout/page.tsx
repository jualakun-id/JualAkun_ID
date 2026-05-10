import { redirect } from 'next/navigation'
import { CheckoutClient } from './checkout-client'
import { createServerClient } from '@/lib/supabase-server'
import { serverFetch } from '@/lib/server-fetch'

type Props = { searchParams: Promise<{ product?: string }> }

type ProductDetail = {
  id: string
  name: string
  slug: string
  thumbnail_url: string | null
  price: number
  duration_days: number
  guarantee_days: number
  stock_count: number
}

export const metadata = { title: 'Checkout' }

export default async function CheckoutPage({ searchParams }: Props) {
  const sp = await searchParams
  if (!sp.product) redirect('/')

  const supabase = await createServerClient()
  const { data } = await supabase.from('products').select('slug').eq('id', sp.product).maybeSingle()
  if (!data) redirect('/')

  const product = await serverFetch<ProductDetail>(`/catalog/${data.slug}`, { revalidate: 60 })
  if (!product) redirect('/')

  return (
    <section className="container mx-auto max-w-4xl px-4 py-10 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
        Selesaikan Pesanan
      </h1>
      <p className="mt-2 text-[15px] text-ink-muted font-medium">
        Periksa detail di bawah, lalu klik <strong className="text-ink">Bayar Sekarang</strong> untuk lanjut ke pilihan pembayaran.
      </p>
      <div className="mt-7">
        <CheckoutClient product={product} />
      </div>
    </section>
  )
}
