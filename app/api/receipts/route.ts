import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { v4 as uuid } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file         = formData.get('file') as File | null
    const customerToken = formData.get('customer_token') as string | null

    if (!file || !customerToken) {
      return NextResponse.json({ error: 'Missing file or token' }, { status: 400 })
    }

    const maxBytes = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 413 })
    }

    const supabase = createServiceClient()

    // Validate customer token
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('id')
      .eq('customer_token', customerToken)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const ext      = file.name.split('.').pop() ?? 'jpg'
    const filePath = `receipts/${delivery.id}/${uuid()}.${ext}`
    const buffer   = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase
      .from('payment_receipts')
      .insert({
        delivery_id:  delivery.id,
        file_url:     publicUrl,
        file_path:    filePath,
        uploaded_by:  'customer',
      })

    if (insertError) {
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, url: publicUrl })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
