'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { buildWhatsAppLink } from '@/lib/geo'

interface CreatedLinks {
  rider_link:         string
  customer_link:      string
  rider_whatsapp:     string | null
  customer_whatsapp:  string | null
  customer_name:      string
}

export default function NewDeliveryPage() {
  const router = useRouter()
  const [customerName,  setCustomerName]  = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes,         setNotes]         = useState('')
  const [paymentType,   setPaymentType]   = useState<'cash' | 'transfer' | ''>('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [created,   setCreated]   = useState<CreatedLinks | null>(null)
  const [copied,    setCopied]    = useState<string | null>(null)

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setError('Customer name is required.')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name:  customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        delivery_notes: notes.trim() || undefined,
        payment_type:   paymentType || undefined,
        payment_amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
      if (res.status === 402) {
        setError('Not enough credits. Please top up your wallet.')
      }
      setLoading(false)
      return
    }

    setCreated({
      rider_link:        json.rider_link,
      customer_link:     json.customer_link,
      rider_whatsapp:    json.rider_whatsapp,
      customer_whatsapp: json.customer_whatsapp,
      customer_name:     customerName.trim(),
    })
    setLoading(false)
  }

  // ── LINKS CREATED VIEW ─────────────────────────────────────────────────────
  if (created) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">Delivery created!</h1>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="text-green-800 font-semibold mb-1">✅ 1 credit used</p>
          <p className="text-green-700 text-sm">Delivery for {created.customer_name}</p>
        </div>

        {/* Rider section */}
        <div className="bg-white border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🛵</span>
            <h2 className="font-semibold text-gray-900">Send to rider</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              readOnly
              value={created.rider_link}
              className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-600 font-mono"
            />
            <button
              onClick={() => copy(created.rider_link, 'rider')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              {copied === 'rider' ? '✅' : 'Copy'}
            </button>
          </div>
          {created.rider_whatsapp && (
            <a
              href={created.rider_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
            >
              <span>💬</span> Send via WhatsApp
            </a>
          )}
        </div>

        {/* Customer section */}
        <div className="bg-white border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🗺️</span>
            <h2 className="font-semibold text-gray-900">Send to customer</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              readOnly
              value={created.customer_link}
              className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-600 font-mono"
            />
            <button
              onClick={() => copy(created.customer_link, 'customer')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              {copied === 'customer' ? '✅' : 'Copy'}
            </button>
          </div>
          {created.customer_whatsapp && (
            <a
              href={created.customer_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
            >
              <span>💬</span> Send via WhatsApp
            </a>
          )}
        </div>

        <Link
          href="/dashboard"
          className="block text-center py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          Back to deliveries
        </Link>
      </div>
    )
  }

  // ── CREATE FORM ─────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition">←</Link>
        <h1 className="text-xl font-bold text-gray-900">New delivery</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-2xl p-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer name *</label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            required
            placeholder="Chiamaka Eze"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer phone (WhatsApp)</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            placeholder="08012345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">We'll generate WhatsApp quick-send links automatically.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Address, landmark, special instructions..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment method (optional)</label>
          <select
            value={paymentType}
            onChange={e => setPaymentType(e.target.value as 'cash' | 'transfer' | '')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Not specified</option>
            <option value="cash">Cash on delivery</option>
            <option value="transfer">Bank transfer</option>
          </select>
        </div>

        {paymentType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              min="0"
              placeholder="15000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : '🚀 Generate tracking links (1 credit)'}
          </button>
        </div>
      </form>
    </div>
  )
}
