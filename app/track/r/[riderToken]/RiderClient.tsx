'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { haversineDistance } from '@/lib/geo'
import type { Delivery } from '@/types'

type Phase = 'ready' | 'requesting_gps' | 'tracking' | 'payment' | 'delivered' | 'cancelled'

const MIN_DISTANCE_M   = 15
const MAX_INTERVAL_S   = 30
const OFFLINE_QUEUE_KEY = 'livelink_offline_queue'

interface Props { delivery: Delivery }

export default function RiderClient({ delivery }: Props) {
  const [phase, setPhase]           = useState<Phase>(
    delivery.status === 'delivered' ? 'delivered' :
    delivery.status === 'cancelled' ? 'cancelled' :
    delivery.status === 'active'    ? 'tracking'  : 'ready'
  )
  const [isOnline, setIsOnline]     = useState(true)
  const [gpsError, setGpsError]     = useState<string | null>(null)
  const [lastPing, setLastPing]     = useState<Date | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)   // confirmation overlay

  const wakeLockRef     = useRef<WakeLockSentinel | null>(null)
  const watchIdRef      = useRef<number | null>(null)
  const lastLatRef      = useRef<number | null>(null)
  const lastLngRef      = useRef<number | null>(null)
  const lastSentTimeRef = useRef<number>(0)
  const isFlushing      = useRef(false)

  // ── REALTIME: listen for vendor cancellation ───────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const channel  = supabase
      .channel(`rider-delivery:${delivery.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deliveries', filter: `id=eq.${delivery.id}` },
        (payload) => {
          const updated = payload.new as Delivery
          if (updated.status === 'cancelled') {
            // Stop GPS + wake lock immediately
            if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
            wakeLockRef.current?.release()
            setPhase('cancelled')
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [delivery.id])

  // ── OFFLINE QUEUE ──────────────────────────────────────────────────────────
  const queuePing = useCallback((lat: number, lng: number, accuracy: number | null) => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY)
    const queue  = stored ? JSON.parse(stored) : []
    queue.push({ lat, lng, accuracy, recorded_at: new Date().toISOString() })
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  }, [])

  const flushQueue = useCallback(async () => {
    if (isFlushing.current) return
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!stored) return
    const queue = JSON.parse(stored)
    if (queue.length === 0) return
    isFlushing.current = true
    try {
      const res = await fetch('/api/location/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rider_token: delivery.rider_token, locations: queue }),
      })
      if (res.ok) localStorage.removeItem(OFFLINE_QUEUE_KEY)
    } finally { isFlushing.current = false }
  }, [delivery.rider_token])

  // ── NETWORK LISTENERS ──────────────────────────────────────────────────────
  useEffect(() => {
    const onOnline  = () => { setIsOnline(true); flushQueue() }
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [flushQueue])

  // ── SEND PING ──────────────────────────────────────────────────────────────
  const sendPing = useCallback(async (lat: number, lng: number, accuracy: number | null) => {
    if (!isOnline) { queuePing(lat, lng, accuracy); return }
    try {
      const res = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rider_token: delivery.rider_token, lat, lng, accuracy }),
      })
      if (res.ok) setLastPing(new Date())
      else queuePing(lat, lng, accuracy)
    } catch { queuePing(lat, lng, accuracy) }
  }, [delivery.rider_token, isOnline, queuePing])

  // ── GPS POSITION HANDLER ───────────────────────────────────────────────────
  const onPosition = useCallback((pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords
    const now     = Date.now()
    const prevLat = lastLatRef.current
    const prevLng = lastLngRef.current
    const moved   = prevLat != null && prevLng != null
      ? haversineDistance(prevLat, prevLng, lat, lng) >= MIN_DISTANCE_M
      : true
    const stale   = now - lastSentTimeRef.current >= MAX_INTERVAL_S * 1000
    if (moved || stale) {
      lastLatRef.current      = lat
      lastLngRef.current      = lng
      lastSentTimeRef.current = now
      sendPing(lat, lng, accuracy)
    }
  }, [sendPing])

  // ── START DELIVERY ─────────────────────────────────────────────────────────
  const startDelivery = useCallback(async () => {
    setPhase('requesting_gps')
    setGpsError(null)

    // Verify delivery hasn't been cancelled since the page loaded
    const supabase = createClient()
    const { data: fresh } = await supabase
      .from('deliveries')
      .select('status')
      .eq('rider_token', delivery.rider_token)
      .single()

    if (fresh?.status === 'cancelled') {
      setPhase('cancelled')
      return
    }
    if (!navigator.geolocation) {
      setGpsError('GPS is not supported on this browser.')
      setPhase('ready')
      return
    }
    try { wakeLockRef.current = await navigator.wakeLock.request('screen') } catch {}
    await fetch('/api/rider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rider_token: delivery.rider_token, action: 'start' }),
    })
    watchIdRef.current = navigator.geolocation.watchPosition(
      onPosition,
      (err) => {
        setGpsError(
          err.code === 1 ? 'Location permission denied. Please allow and try again.' :
          err.code === 2 ? 'Unable to get your location. Move to an open area.' :
          'Location request timed out.'
        )
        setPhase('ready')
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
    setPhase('tracking')
  }, [delivery.rider_token, onPosition])

  // ── MARK DELIVERED (after confirmation) ───────────────────────────────────
  const confirmDelivered = useCallback(async () => {
    setShowConfirm(false)
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    await wakeLockRef.current?.release()
    await flushQueue()
    setPhase('payment')
  }, [flushQueue])

  // ── CONFIRM PAYMENT ────────────────────────────────────────────────────────
  const confirmPayment = useCallback(async (paymentType: 'cash' | 'transfer') => {
    await fetch('/api/rider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rider_token: delivery.rider_token, action: 'payment', payment_type: paymentType }),
    })
    await fetch('/api/rider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rider_token: delivery.rider_token, action: 'deliver' }),
    })
    setPhase('delivered')
  }, [delivery.rider_token])

  // ── CLEANUP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
      wakeLockRef.current?.release()
    }
  }, [])

  // ── CANCELLED SCREEN ───────────────────────────────────────────────────────
  if (phase === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="text-center max-w-xs">
          <p className="text-5xl mb-4">🚫</p>
          <h1 className="text-xl font-semibold text-white mb-2">Delivery cancelled</h1>
          <p className="text-gray-400 text-sm">This delivery has been cancelled by the vendor. GPS tracking has stopped.</p>
        </div>
      </div>
    )
  }

  // ── DELIVERED SCREEN ───────────────────────────────────────────────────────
  if (phase === 'delivered') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-950 p-6">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-300 mb-2">Delivered!</h1>
          <p className="text-green-600">GPS tracking stopped. Great job!</p>
        </div>
      </div>
    )
  }

  // ── PAYMENT SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'payment') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-3">💰</p>
          <h2 className="text-xl font-semibold text-white mb-1">How was payment made?</h2>
          <p className="text-gray-400 text-sm mb-6">for {delivery.customer_name}</p>
          <div className="space-y-3">
            <button onClick={() => confirmPayment('cash')}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition">
              Cash collected
            </button>
            <button onClick={() => confirmPayment('transfer')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
              Bank transfer made
            </button>
            <button onClick={() => confirmPayment('cash')}
              className="w-full py-3 text-gray-500 text-sm hover:text-gray-300 transition">
              Skip — not collected yet
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN TRACKING SCREEN ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Delivering to</p>
          <h1 className="font-semibold text-lg">{delivery.customer_name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-400">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Notes */}
      {delivery.delivery_notes && (
        <div className="px-5 py-3 bg-amber-900/30 border-b border-amber-800/40">
          <p className="text-amber-300 text-sm">📝 {delivery.delivery_notes}</p>
        </div>
      )}

      {/* GPS error */}
      {gpsError && (
        <div className="m-5 p-4 bg-red-900/40 border border-red-700 rounded-xl">
          <p className="text-red-300 text-sm">{gpsError}</p>
        </div>
      )}

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {phase === 'ready' && (
          <div className="text-center">
            <p className="text-6xl mb-6">🛵</p>
            <h2 className="text-xl font-semibold mb-2">Ready to start?</h2>
            <p className="text-gray-400 text-sm mb-8">
              Keep this page open while you ride.<br />Your location will update automatically.
            </p>
            <button onClick={startDelivery}
              className="px-10 py-5 bg-green-500 hover:bg-green-400 text-white text-lg font-bold rounded-2xl transition">
              Start delivery
            </button>
          </div>
        )}

        {phase === 'requesting_gps' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Requesting GPS access...</p>
          </div>
        )}

        {phase === 'tracking' && (
          <div className="text-center w-full max-w-xs">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🛵</div>
            </div>
            <p className="text-green-400 font-semibold mb-1">Tracking active</p>
            {lastPing && (
              <p className="text-gray-400 text-xs mb-8">Last ping: {lastPing.toLocaleTimeString()}</p>
            )}

            {/* Deliberate action — smaller, outlined, requires a tap then confirm */}
            <button
              onClick={() => setShowConfirm(true)}
              className="px-8 py-3 border-2 border-green-500 text-green-400 font-semibold rounded-xl hover:bg-green-500/10 transition text-sm"
            >
              Mark as delivered
            </button>
          </div>
        )}
      </div>

      {/* ── CONFIRMATION OVERLAY ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 mb-4">
            <h3 className="text-lg font-bold text-white text-center mb-2">Confirm delivery?</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              This will stop GPS tracking and move to payment confirmation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-700 transition"
              >
                Not yet
              </button>
              <button
                onClick={confirmDelivered}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition"
              >
                Yes, delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
