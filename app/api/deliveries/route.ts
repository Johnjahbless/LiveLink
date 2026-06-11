import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateToken, buildRiderLink, buildCustomerLink } from '@/lib/tokens'
import { buildWhatsAppLink } from '@/lib/geo'
import type { CreateDeliveryInput } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

// GET /api/deliveries — list vendor's deliveries
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/deliveries — create delivery (deducts 1 credit atomically)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: CreateDeliveryInput = await request.json()

  if (!body.customer_name?.trim()) {
    return NextResponse.json({ error: 'Customer name required' }, { status: 400 })
  }

  const riderToken   = generateToken()
  const customerToken = generateToken()

  // Atomic credit deduction + delivery creation via stored function
  const service = createServiceClient()
  const { data: delivery, error } = await service.rpc('create_delivery_and_deduct', {
    p_vendor_id:      user.id,
    p_customer_name:  body.customer_name.trim(),
    p_customer_phone: body.customer_phone?.trim() ?? null,
    p_delivery_notes: body.delivery_notes?.trim() ?? null,
    p_rider_token:    riderToken,
    p_customer_token: customerToken,
    p_payment_type:   body.payment_type ?? null,
    p_payment_amount: body.payment_amount ?? null,
  })

  if (error) {
    const isInsufficient = error.message.includes('Insufficient credits')
    return NextResponse.json(
      { error: isInsufficient ? 'Insufficient credits' : error.message },
      { status: isInsufficient ? 402 : 500 }
    )
  }

  const riderLink    = buildRiderLink(BASE_URL, riderToken)
  const customerLink = buildCustomerLink(BASE_URL, customerToken)

  // Build WhatsApp deep links if phone provided
  const riderWhatsApp = body.customer_phone
    ? buildWhatsAppLink(body.customer_phone, `Hi, here is your delivery tracking link for ${body.customer_name}: ${riderLink}`)
    : null

  const customerWhatsApp = body.customer_phone
    ? buildWhatsAppLink(body.customer_phone, `Hi ${body.customer_name}! Track your delivery in real time here: ${customerLink}`)
    : null

  return NextResponse.json({
    delivery,
    rider_link:      riderLink,
    customer_link:   customerLink,
    rider_whatsapp:  riderWhatsApp,
    customer_whatsapp: customerWhatsApp,
  }, { status: 201 })
}
