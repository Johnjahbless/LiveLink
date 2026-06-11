import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackSignature } from '@/lib/paystack'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs' // needs crypto module

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature') ?? ''

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    if (event.event !== 'charge.success') {
      return NextResponse.json({ ok: true }) // acknowledge non-payment events
    }

    const { reference, metadata, amount } = event.data
    const supabase = createServiceClient()

    // Idempotency: check if we've already processed this reference
    const { data: existing } = await supabase
      .from('credit_transactions')
      .select('id, status')
      .eq('paystack_reference', reference)
      .single()

    if (existing?.status === 'completed') {
      return NextResponse.json({ ok: true }) // already processed
    }

    const vendorId = metadata?.vendor_id
    const credits  = metadata?.credits
    const packageId = metadata?.package_id ?? null

    if (!vendorId || !credits) {
      console.error('Paystack webhook: missing metadata', { reference, metadata })
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    // Create pending transaction if it doesn't exist yet
    if (!existing) {
      await supabase.from('credit_transactions').insert({
        vendor_id:          vendorId,
        package_id:         packageId,
        credits:            credits,
        amount_ngn:         amount,
        paystack_reference: reference,
        status:             'pending',
      })
    }

    // Credit the wallet and mark transaction complete (atomic stored function)
    const { error } = await supabase.rpc('add_credits', {
      p_vendor_id:          vendorId,
      p_credits:            credits,
      p_amount_ngn:         amount,
      p_paystack_reference: reference,
      p_package_id:         packageId,
    })

    if (error) {
      console.error('add_credits RPC failed:', error)
      return NextResponse.json({ error: 'Credit update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
