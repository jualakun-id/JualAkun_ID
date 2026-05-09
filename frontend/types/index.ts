export type UserRole = 'buyer' | 'admin'

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'delivering'
  | 'delivered'
  | 'confirmed'
  | 'delivery_failed'
  | 'refunded'
  | 'expired'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone_wa: string | null
  role: UserRole
  referral_code: string | null
  created_at: string
}

export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  icon_url: string | null
  sort_order: number
}

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  category_id: string
  category_slug?: string
  price: number
  original_price: number | null
  thumbnail_url: string | null
  images: string[]
  duration_label: string | null
  warranty_label: string | null
  stock_count: number
  sold_count: number
  rating_avg: number
  rating_count: number
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  product_id: string
  product_name: string
  product_slug: string
  thumbnail_url: string | null
  quantity: number
  unit_price: number
  discount_amount: number
  total_amount: number
  status: OrderStatus
  coupon_code: string | null
  payment_method: string | null
  payment_url: string | null
  expires_at: string | null
  delivered_at: string | null
  confirmed_at: string | null
  created_at: string
}

export type OrderCredentials = {
  order_id: string
  username: string
  password: string
  notes: string | null
  delivered_at: string
}

export type Ticket = {
  id: string
  order_id: string
  user_id: string
  category: 'invalid_credentials' | 'account_blocked' | 'wrong_subscription' | 'other'
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  resolution_note: string | null
  created_at: string
  resolved_at: string | null
}

export type Review = {
  id: string
  order_id: string
  user_id: string
  product_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type Coupon = {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_purchase: number
  max_discount: number | null
  usage_limit: number | null
  usage_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
}
