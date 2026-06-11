'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppLink } from '@/lib/geo'
import type { Delivery } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ''

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Pending'   },
  active:    { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Active'    },
  delivered: { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Delivered' },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Cancelled' },
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [delivery,  setDelivery]  = useState<Delivery | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [actioning, setActioning] = useState(false)
  const [copied,    setCopied]    = useState<string | null>(null)
  const [locCount,  setLocCount]  = useState<number>(0)

  const load = useCallback(async () => {
    const supabase = createClient()
    const [{ data: d }, { count }] = await Promise.all([
      supabase.from('deliveries').select('*').eq('id', id).single(),
      supabase.from('delivery_locations').select('*', { count: 'exact', head: true }).eq('delivery_id', id),
    ])
    if (d) { setDelivery(d as Delivery); setLocCount(count ?? 0) }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const action = async (act: string) => {
    setActioning(true)
    const res = await fetch(`/api/deliveries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act }),
    })
    if (res.ok) await load()
    setActioning(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Delivery not found.</p>
        <Link href="/dashboard" className="text-green-600 text-sm mt-2 inline-block">← Back to dashboard</Link>
      </div>
    )
  }

  const riderLink    = `${BASE_URL}/track/r/${delivery.rider_token}`
  const customerLink = `${BASE_URL}/track/c/${delivery.customer_token}`
  const riderWA      = delivery.customer_phone ? buildWhatsAppLink(delivery.customer_phone, `Your delivery link (rider) 👉 ${riderLink}`) : null
  const customerWA   = delivery.customer_phone ? buildWhatsAppLink(delivery.customer_phone, `Hi ${delivery.customer_name}! Track your order live 👉 ${customerLink}`) : null

  const st = STATUS_STYLE[delivery.status] ?? STATUS_STYLE.pending

  return (
    <div className="max-w-2xl">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition text-lg">←</Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{delivery.customer_name}</h1>
          {delivery.customer_phone && (
            <p className="text-sm text-gray-500">{delivery.customer_phone}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${st.bg} ${st.text}`}>
          {st.label}
        </span>
      </div>

      {/* Notes */}
      {delivery.delivery_notes && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          📝 {delivery.delivery_notes}
        </div>
      )}

      {/* Rider link card */}
      <div className="bg-white border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🛵</span>
          <h2 className="font-semibold text-gray-900">Rider link</h2>
          <span className="ml-auto text-xs text-gray-400">Send this to your rider</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            readOnly value={riderLink}
            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-xs text-gray-500 font-mono truncate"
          />
          <button
            onClick={() => copy(riderLink, 'rider')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            {copied === 'rider' ? '✅ Copied' : 'Copy'}
          </button>
        </div>
        {riderWA && (
          <a href={riderWA} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
            💬 Send via WhatsApp
          </a>
        )}
      </div>

      {/* Customer link card */}
      <div className="bg-white border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🗺️</span>
          <h2 className="font-semibold text-gray-900">Customer link</h2>
          <span className="ml-auto text-xs text-gray-400">Send this to your customer</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            readOnly value={customerLink}
            className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-xs text-gray-500 font-mono truncate"
          />
          <button
            onClick={() => copy(customerLink, 'customer')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            {copied === 'customer' ? '✅ Copied' : 'Copy'}
          </button>
        </div>
        {customerWA && (
          <a href={customerWA} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
            💬 Send via WhatsApp
          </a>
        )}
      </div>

      {/* Status + GPS stats */}
      <div className="bg-white border rounded-2xl p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Delivery info</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Created',   value: fmtDate(delivery.created_at) },
            { label: 'Started',   value: fmtDate(delivery.started_at) },
            { label: 'Delivered', value: fmtDate(delivery.delivered_at) },
            { label: 'GPS pings', value: locCount.toLocaleString() },
          ].map(row => (
            <div key={row.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{row.label}</p>
              <p className="text-sm font-semibold text-gray-900">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-white border rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
        {delivery.payment_type ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 capitalize">{delivery.payment_type}</p>
              {delivery.payment_amount && (
                <p className="text-lg font-bold text-gray-900">
                  ₦{Number(delivery.payment_amount).toLocaleString()}
                </p>
              )}
            </div>
            {delivery.payment_confirmed
              ? <span className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-semibold rounded-full">✅ Confirmed</span>
              : <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">⏳ Pending</span>
            }
          </div>
        ) : (
          <p className="text-sm text-gray-400">No payment details recorded yet.</p>
        )}

        {/* Vendor confirm payment */}
        {delivery.status === 'delivered' && !delivery.payment_confirmed && (
          <button
            onClick={() => action('confirm_payment')}
            disabled={actioning}
            className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
          >
            {actioning ? 'Confirming…' : 'Mark payment as confirmed'}
          </button>
        )}
      </div>

      {/* Actions */}
      {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
        <div className="flex gap-3">
          {delivery.status === 'pending' && (
            <button
              onClick={() => action('start')}
              disabled={actioning}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
            >
              {actioning ? '…' : 'Mark as started'}
            </button>
          )}
          {delivery.status === 'active' && (
            <button
              onClick={() => action('deliver')}
              disabled={actioning}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
            >
              {actioning ? '…' : 'Mark as delivered'}
            </button>
          )}
          <button
            onClick={() => { if (confirm('Cancel this delivery?')) action('cancel') }}
            disabled={actioning}
            className="px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
