import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'

/**
 * Orchestrate the deliver_order_account RPC (FIFO + row lock).
 * Never UPDATE account_stock directly — always use this.
 */
export class DeliveryService {
  static async deliverOrder(orderId: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.rpc('deliver_order_account', { p_order_id: orderId })
    if (error) {
      if (error.message.includes('STOCK_EMPTY')) {
        throw new ApiError('STOCK_EMPTY', 'Stok habis saat akan dikirim', 409)
      }
      throw new ApiError('INTERNAL_ERROR', `RPC deliver_order_account: ${error.message}`, 500)
    }
  }
}
