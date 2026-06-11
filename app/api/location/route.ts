import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rider_token, lat, lng, accuracy, speed, heading } = body

    if (!rider_token || lat == null || lng == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Basic coordinate sanity check
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Validate rider token and delivery status
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('id, status')
      .eq('rider_token', rider_token)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!['active', 'delivered'].includes(delivery.status)) {
      return NextResponse.json({ error: 'Delivery not active' }, { status: 409 })
    }

    const { error: insertError } = await supabase
      .from('delivery_locations')
      .insert({
        delivery_id: delivery.id,
        lat,
        lng,
        accuracy: accuracy ?? null,
        speed: speed ?? null,
        heading: heading ?? null,
      })

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
