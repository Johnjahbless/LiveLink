import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/rider
// body: { rider_token, action: 'start' | 'deliver' | 'payment' }
// Used by the rider's browser page — no session cookie needed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rider_token, action, payment_type } = body

    if (!rider_token || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
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

    let updates: Record<string, unknown> = {}

    switch (action) {
      case 'start':
        if (delivery.status !== 'pending') {
          return NextResponse.json({ error: 'Already started' }, { status: 409 })
        }
        updates = { status: 'active', started_at: new Date().toISOString() }
        break

      case 'deliver':
        if (delivery.status !== 'active') {
          return NextResponse.json({ error: 'Not active' }, { status: 409 })
        }
        updates = { status: 'delivered', delivered_at: new Date().toISOString() }
        break

      case 'payment':
        if (!payment_type || !['cash', 'transfer'].includes(payment_type)) {
          return NextResponse.json({ error: 'Invalid payment_type' }, { status: 400 })
        }
        updates = { payment_type }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', delivery.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
