'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { Delivery, DeliveryLocation } from '@/types'

const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  ),
})

interface Props {
  delivery: Delivery
  initialLocations: DeliveryLocation[]
}

export default function CustomerClient({ delivery, initialLocations }: Props) {
  const [locations, setLocations] = useState<DeliveryLocation[]>(initialLocations)
  const [currentDelivery, setCurrentDelivery] = useState<Delivery>(delivery)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(
    initialLocations.length > 0 ? new Date(initialLocations.at(-1)!.recorded_at) : null
  )
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── REALTIME SUBSCRIPTION ──────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    // Location inserts
    const locationChannel = supabase
      .channel(`delivery-locations:${delivery.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_locations',
          filter: `delivery_id=eq.${delivery.id}`,
        },
        (payload) => {
          const loc = payload.new as DeliveryLocation
          setLocations(prev => [...prev, loc])
          setLastUpdate(new Date(loc.recorded_at))
        }
      )
      .subscribe()

    // Delivery status changes
    const deliveryChannel = supabase
      .channel(`delivery-status:${delivery.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deliveries',
          filter: `id=eq.${delivery.id}`,
        },
        (payload) => setCurrentDelivery(payload.new as Delivery)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(locationChannel)
      supabase.removeChannel(deliveryChannel)
    }
  }, [delivery.id])

  // ── RECEIPT UPLOAD ─────────────────────────────────────────────────────────
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('customer_token', delivery.customer_token)
      const res = await fetch('/api/receipts', { method: 'POST', body: form })
      if (res.ok) setUploaded(true)
    } finally {
      setUploading(false)
    }
  }

  // ── STATUS BADGE ───────────────────────────────────────────────────────────
  const statusBadge: Record<string, { label: string; icon: string; bg: string }> = {
    pending:   { label: 'Rider on the way', icon: '🕐', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
    active:    { label: 'En route to you',  icon: '🛵', bg: 'bg-green-50 border-green-200 text-green-800' },
    delivered: { label: 'Delivered!',        icon: '✅', bg: 'bg-blue-50 border-blue-200 text-blue-800' },
    cancelled: { label: 'Cancelled',         icon: '🚫', bg: 'bg-red-50 border-red-200 text-red-800' },
  }
  const badge = statusBadge[currentDelivery.status] ?? statusBadge.pending

  // If cancelled in real-time while viewing — replace map with cancellation screen
  if (currentDelivery.status === 'cancelled') {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Status header */}
      <div className={`px-5 py-3 border-b ${badge.bg} flex items-center gap-2`}>
        <span className="text-xl">{badge.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">{badge.label}</p>
          {lastUpdate && currentDelivery.status === 'active' && (
            <p className="text-xs opacity-70">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Live map — flex-1 + relative so the absolute Leaflet div fills it */}
      <div className="flex-1" style={{ position: 'relative', minHeight: '50vh' }}>
        <LiveMap
          locations={locations}
          status={currentDelivery.status}
        />
      </div>

      {/* Bottom panel */}
      <div className="bg-white border-t p-5 space-y-3">
        <p className="text-gray-600 text-sm">
          Tracking delivery for <span className="font-medium text-gray-900">{delivery.customer_name}</span>
        </p>

        {currentDelivery.status === 'delivered' && !uploaded && (
          <div>
            <p className="text-sm text-gray-700 mb-2">Upload your payment receipt (optional)</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleReceiptUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 text-sm hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : '📎 Upload payment receipt'}
            </button>
          </div>
        )}

        {uploaded && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            ✅ Receipt uploaded — vendor has been notified
          </div>
        )}
      </div>
    </div>
  )
}
