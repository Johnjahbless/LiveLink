'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { DeliveryLocation, DeliveryStatus } from '@/types'

interface Props {
  locations: DeliveryLocation[]
  status: DeliveryStatus
}

const ABUJA_CENTER: [number, number] = [9.0579, 7.4951]

export default function LiveMap({ locations, status }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const leafletMap  = useRef<import('leaflet').Map | null>(null)
  const markerRef   = useRef<import('leaflet').Marker | null>(null)
  const polylineRef = useRef<import('leaflet').Polyline | null>(null)
  const prevLength  = useRef(0)

  // ── INIT MAP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return

    // Cancellation token — prevents async init completing after cleanup
    let destroyed = false

    const initMap = async () => {
      const L = (await import('leaflet')).default

      // Bail if cleanup already ran (React StrictMode double-invoke)
      if (destroyed || !mapRef.current) return

      // Clear any orphaned Leaflet instance left on this DOM node
      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number }
      if (container._leaflet_id != null) {
        delete container._leaflet_id
      }

      const map = L.map(mapRef.current, {
        center: ABUJA_CENTER,
        zoom: 13,
        zoomControl: true,
      })

      // Second destroyed check — map creation is sync but something above is async
      if (destroyed) { map.remove(); return }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      leafletMap.current = map

      if (locations.length > 0) {
        const latlngs = locations.map(l => [l.lat, l.lng] as [number, number])
        const last    = latlngs.at(-1)!

        polylineRef.current = L.polyline(latlngs, {
          color: '#16a34a', weight: 3, opacity: 0.7,
        }).addTo(map)

        const icon = makeIcon(L, status)
        markerRef.current = L.marker(last, { icon }).addTo(map)
        map.setView(last, 15)
      }
    }

    initMap()

    return () => {
      destroyed = true
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
        markerRef.current  = null
        polylineRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── UPDATE MARKER ON NEW LOCATIONS ────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current || locations.length === 0) return
    if (locations.length === prevLength.current) return
    prevLength.current = locations.length

    const update = async () => {
      if (!leafletMap.current) return
      const L       = (await import('leaflet')).default
      const latlngs = locations.map(l => [l.lat, l.lng] as [number, number])
      const last    = latlngs.at(-1)!

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs)
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: '#16a34a', weight: 3, opacity: 0.7,
        }).addTo(leafletMap.current)
      }

      const icon = makeIcon(L, status)
      if (markerRef.current) {
        markerRef.current.setLatLng(last).setIcon(icon)
      } else {
        markerRef.current = L.marker(last, { icon }).addTo(leafletMap.current)
      }

      leafletMap.current.panTo(last)
    }

    update()
  }, [locations, status])

  return (
    <div
      ref={mapRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────
function makeIcon(L: typeof import('leaflet'), status: DeliveryStatus) {
  const bg    = status === 'delivered' ? '#2563eb' : '#16a34a'
  const emoji = status === 'delivered' ? '✅' : '🛵'
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25)">${emoji}</div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  })
}