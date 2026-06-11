import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wallet } = await supabase
    .from('vendor_wallets')
    .select('credits')
    .eq('vendor_id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b px-5 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-green-700 text-lg">LiveLink</Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/wallet"
            className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-sm font-medium text-green-700 hover:bg-green-100 transition"
          >
            <span>🪙</span>
            <span>{wallet?.credits ?? 0} credits</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Settings
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-6">
        {children}
      </main>
    </div>
  )
}
