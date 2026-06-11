import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Delivery } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800',
  active:    'bg-green-100 text-green-800',
  delivered: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: deliveries } = await supabase
    .from('deliveries')
    .select('*')
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const all = (deliveries ?? []) as Delivery[]

  const stats = {
    active:    all.filter(d => d.status === 'active').length,
    delivered: all.filter(d => d.status === 'delivered').length,
    pending:   all.filter(d => d.status === 'pending').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Deliveries</h1>
        <Link
          href="/dashboard/deliveries/new"
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition"
        >
          + New delivery
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active',     count: stats.active,    color: 'green' },
          { label: 'Delivered',  count: stats.delivered, color: 'blue'  },
          { label: 'Pending',    count: stats.pending,   color: 'amber' },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Delivery list */}
      {all.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <p className="text-3xl mb-3">📦</p>
          <p className="text-gray-600 font-medium">No deliveries yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first delivery to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {all.map(d => (
            <Link key={d.id} href={`/dashboard/deliveries/${d.id}`} className="block bg-white border rounded-xl p-4 hover:border-green-300 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{d.customer_name}</p>
                  {d.customer_phone && (
                    <p className="text-gray-500 text-sm">{d.customer_phone}</p>
                  )}
                  {d.delivery_notes && (
                    <p className="text-gray-400 text-xs mt-1 truncate">{d.delivery_notes}</p>
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_STYLES[d.status]}`}>
                  {d.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-gray-400 text-xs">{formatDate(d.created_at)}</p>
                <span className="text-gray-300 text-sm">→</span>
              </div>
              {d.payment_confirmed && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <span>✅</span>
                  <span>Payment confirmed — {d.payment_type}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}