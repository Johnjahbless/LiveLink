'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Isolated into its own component so Suspense can wrap useSearchParams
function LoginForm() {
  const router = useRouter()
  const searchParams  = useSearchParams()
  const callbackError = searchParams.get('error')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back to LiveLink</p>
        </div>

        {callbackError === 'auth_callback_failed' && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            The confirmation link expired or is invalid. Please sign in below.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        No account?{' '}
        <Link href="/register" className="text-green-600 hover:underline font-medium">
          Create one free
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}