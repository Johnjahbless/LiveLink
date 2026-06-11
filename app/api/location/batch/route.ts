import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { LocationPing } from '@/types'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rider_token, locations } = body as {
      rider_token: string
      locations: LocationPing[]
    }

    if (!rider_token || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (locations.length > 200) {
      return NextResponse.json({ error: 'Too many locations (max 200)' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select('id, status')
      .eq('rider_token', rider_token)
      .single()

    if (error || !delivery) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!['active', 'delivered'].includes(delivery.status)) {
      return NextResponse.json({ error: 'Delivery not active' }, { status: 409 })
    }

    const rows = locations
      .filter(l => l.lat >= -90 && l.lat <= 90 && l.lng >= -180 && l.lng <= 180)
      .map(l => ({
        delivery_id: delivery.id,
        lat: l.lat,
        lng: l.lng,
        accuracy: l.accuracy ?? null,
        speed: l.speed ?? null,
        heading: l.heading ?? null,
        recorded_at: l.recorded_at ?? new Date().toISOString(),
      }))

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 })
    }

    const { error: insertError } = await supabase
      .from('delivery_locations')
      .insert(rows)

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, inserted: rows.length })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
