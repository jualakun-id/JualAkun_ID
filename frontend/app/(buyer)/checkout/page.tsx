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
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-h1">Checkout</h1>
      <p className="mt-2 text-text-muted">Periksa pesanan dan lanjutkan ke pembayaran.</p>
      <div className="mt-8">
        <CheckoutClient product={product} />
      </div>
    </section>
  )
}
