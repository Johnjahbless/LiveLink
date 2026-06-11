'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CreditPackage, CreditTransaction, VendorWallet } from '@/types'

declare global {
  interface Window {
    PaystackPop: {
      setup(options: Record<string, unknown>): { openIframe(): void }
    }
  }
}

const FORMAT_NGN = (kobo: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
    .format(kobo / 100)

export default function WalletPage() {
  const [wallet,   setWallet]   = useState<VendorWallet | null>(null)
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [history,  setHistory]  = useState<CreditTransaction[]>([])
  const [loading,  setLoading]  = useState(true)
  const [buying,   setBuying]   = useState<string | null>(null)
  const [userId,   setUserId]   = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      setUserEmail(user.email ?? null)

      const [{ data: w }, { data: p }, { data: t }] = await Promise.all([
        supabase.from('vendor_wallets').select('*').eq('vendor_id', user.id).single(),
        supabase.from('credit_packages').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('credit_transactions').select('*').eq('vendor_id', user.id)
          .order('created_at', { ascending: false }).limit(20),
      ])

      setWallet(w)
      setPackages(p ?? [])
      setHistory(t ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const buyPackage = (pkg: CreditPackage) => {
    if (!userId || !userEmail || buying) return
    setBuying(pkg.id)

    // Inject Paystack script if not already loaded
    if (!window.PaystackPop) {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => openPaystack(pkg)
      document.head.appendChild(script)
    } else {
      openPaystack(pkg)
    }
  }

  const openPaystack = (pkg: CreditPackage) => {
    const handler = window.PaystackPop.setup({
      key:    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email:  userEmail,
      amount: pkg.price_ngn,
      currency: 'NGN',
      ref:    `livelink_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      metadata: {
        vendor_id:  userId,
        credits:    pkg.credits,
        package_id: pkg.id,
      },
      callback: () => {
        // Paystack webhook handles credit crediting; just refresh
        setTimeout(() => window.location.reload(), 2000)
      },
      onClose: () => setBuying(null),
    })
    handler.openIframe()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Wallet</h1>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white mb-6">
        <p className="text-green-200 text-sm mb-1">Available credits</p>
        <p className="text-5xl font-bold">{wallet?.credits ?? 0}</p>
        <p className="text-green-200 text-xs mt-2">
          {wallet?.total_used ?? 0} used · {wallet?.total_purchased ?? 0} purchased all-time
        </p>
      </div>

      {/* Packages */}
      <h2 className="font-semibold text-gray-900 mb-3">Top up</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {packages.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => buyPackage(pkg)}
            disabled={!!buying}
            className="bg-white border rounded-2xl p-4 text-left hover:border-green-400 hover:shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <p className="text-2xl font-bold text-gray-900">{pkg.credits}</p>
            <p className="text-xs text-gray-500 mb-2">credits</p>
            <p className="font-semibold text-green-700">{FORMAT_NGN(pkg.price_ngn)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {FORMAT_NGN(Math.round(pkg.price_ngn / pkg.credits))}/delivery
            </p>
            {pkg.name === 'Starter' && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                Most popular
              </span>
            )}
            {buying === pkg.id && (
              <p className="text-xs text-green-600 mt-1 animate-pulse">Opening payment...</p>
            )}
          </button>
        ))}
      </div>

      {/* Transaction history */}
      {history.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Purchase history</h2>
          <div className="space-y-2">
            {history.map(txn => (
              <div key={txn.id} className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">+{txn.credits} credits</p>
                  <p className="text-xs text-gray-400">
                    {new Date(txn.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">{FORMAT_NGN(txn.amount_ngn)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                    txn.status === 'failed'    ? 'bg-red-100 text-red-700'    :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
