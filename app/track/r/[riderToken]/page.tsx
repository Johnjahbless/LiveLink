import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import RiderClient from './RiderClient'
import type { Delivery } from '@/types'

// Always fetch fresh — delivery status changes in real time
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ riderToken: string }> }

export default async function RiderPage({ params }: Props) {
  const { riderToken } = await params
  const supabase = createServiceClient()

  const { data: delivery } = await supabase
    .from('deliveries')
    .select('*')
    .eq('rider_token', riderToken)
    .single()

  if (!delivery) notFound()

  if (delivery.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Delivery cancelled</h1>
          <p className="text-gray-500">This delivery has been cancelled by the vendor.</p>
        </div>
      </div>
    )
  }

  return <RiderClient delivery={delivery as Delivery} />
}
