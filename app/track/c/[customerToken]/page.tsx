import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import CustomerClient from './CustomerClient'
import type { Delivery, DeliveryLocation } from '@/types'

// Always fetch fresh — delivery status changes in real time
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ customerToken: string }> }

export default async function CustomerPage({ params }: Props) {
  const { customerToken } = await params
  const supabase = createServiceClient()

  const { data: delivery } = await supabase
    .from('deliveries')
    .select('*')
    .eq('customer_token', customerToken)
    .single()

  if (!delivery) notFound()

  // Show cancellation screen immediately — no point loading the map
  if (delivery.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-xs">
          <p className="text-5xl mb-4">🚫</p>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Delivery cancelled</h1>
          <p className="text-gray-500 text-sm">
            This delivery has been cancelled. Please contact the vendor for more information.
          </p>
        </div>
      </div>
    )
  }

  // Fetch last 50 location pings for initial trail
  const { data: locations } = await supabase
    .from('delivery_locations')
    .select('*')
    .eq('delivery_id', delivery.id)
    .order('recorded_at', { ascending: false })
    .limit(50)

  const orderedLocations = (locations ?? []).reverse() as DeliveryLocation[]

  return (
    <CustomerClient
      delivery={delivery as Delivery}
      initialLocations={orderedLocations}
    />
  )
}
