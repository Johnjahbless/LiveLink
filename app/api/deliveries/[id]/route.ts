import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

// PATCH /api/deliveries/[id]
// body: { action: 'start' | 'deliver' | 'cancel' | 'confirm_payment' }
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { action } = body

  // Verify delivery belongs to this vendor
  const { data: delivery, error: fetchError } = await supabase
    .from('deliveries')
    .select('id, status, vendor_id')
    .eq('id', id)
    .eq('vendor_id', user.id)
    .single()

  if (fetchError || !delivery) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let updates: Record<string, unknown> = {}

  switch (action) {
    case 'start':
      if (delivery.status !== 'pending') {
        return NextResponse.json({ error: 'Delivery already started' }, { status: 409 })
      }
      updates = { status: 'active', started_at: new Date().toISOString() }
      break

    case 'deliver':
      if (delivery.status !== 'active') {
        return NextResponse.json({ error: 'Delivery not active' }, { status: 409 })
      }
      updates = { status: 'delivered', delivered_at: new Date().toISOString() }
      break

    case 'cancel':
      if (['delivered', 'cancelled'].includes(delivery.status)) {
        return NextResponse.json({ error: 'Cannot cancel' }, { status: 409 })
      }
      updates = { status: 'cancelled' }
      break

    case 'confirm_payment':
      updates = {
        payment_confirmed: true,
        payment_confirmed_at: new Date().toISOString(),
      }
      break

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('deliveries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}

// GET /api/deliveries/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('id', id)
    .eq('vendor_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
