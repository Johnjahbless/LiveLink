'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Vendor } from '@/types'

export default function SettingsPage() {
  const [vendor,  setVendor]  = useState<Vendor | null>(null)
  const [name,    setName]    = useState('')
  const [biz,     setBiz]     = useState('')
  const [phone,   setPhone]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [newPw,   setNewPw]   = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved,  setPwSaved]  = useState(false)
  const [pwError,  setPwError]  = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setVendor(data)
        setName(data.name ?? '')
        setBiz(data.business_name ?? '')
        setPhone(data.phone ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendor) return
    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('vendors')
      .update({
        name:          name.trim(),
        business_name: biz.trim() || null,
        phone:         phone.trim() || null,
      })
      .eq('id', vendor.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    setPwSaving(true)
    setPwError(null)
    setPwSaved(false)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPw })

    if (error) {
      setPwError(error.message)
    } else {
      setPwSaved(true)
      setNewPw('')
      setTimeout(() => setPwSaved(false), 3000)
    }
    setPwSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <form onSubmit={saveProfile} className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
            <input
              type="text"
              value={biz}
              onChange={e => setBiz(e.target.value)}
              placeholder="Optional — shows on tracking pages"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="08012345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>
        )}
        {saved && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">✅ Profile saved</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={changePassword} className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-1">Change password</h2>
        <p className="text-sm text-gray-500 mb-4">Leave blank if you don&apos;t want to change it.</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {pwError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{pwError}</p>
        )}
        {pwSaved && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">✅ Password updated</p>
        )}

        <button
          type="submit"
          disabled={pwSaving || newPw.length === 0}
          className="mt-4 w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition disabled:opacity-50"
        >
          {pwSaving ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {/* Account info (read-only) */}
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Account</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{vendor?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm text-gray-900">
              {vendor ? new Date(vendor.created_at).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'long', year: 'numeric',
              }) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
