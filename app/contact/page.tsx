'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

// Note: metadata export won't work in a 'use client' file.
// Move to a server wrapper if needed, but this is fine for now.

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    // Opens the user's email client with pre-filled content
    // For a real backend form, replace with a fetch() to an API route or Resend/Mailgun
    const mailto = `mailto:info@livelink.ng?subject=${encodeURIComponent(`[LiveLink Contact] ${subject}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`
    window.location.href = mailto
    setStatus('sent')
  }

  return (
    <>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16C064', marginBottom: 10 }}>Get in touch</p>
        <h1 className="syne" style={{ fontSize: 36, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.15, marginBottom: 14 }}>Contact us</h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7 }}>
          Questions about LiveLink, billing, or a bug you found? We&rsquo;re a small team and we read every message.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

        {/* Contact form */}
        <div>
          {status === 'sent' ? (
            <div style={{ padding: '24px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>✅</p>
              <p style={{ fontWeight: 600, color: '#166534', marginBottom: 4 }}>Message ready</p>
              <p style={{ fontSize: 14, color: '#15803D' }}>Your email client should have opened with the message pre-filled. If it didn&rsquo;t, email us directly at info@livelink.ng.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Amaka Okonkwo"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 15, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">Select a topic…</option>
                  <option value="General question">General question</option>
                  <option value="Billing / credits">Billing / credits</option>
                  <option value="Technical issue">Technical issue</option>
                  <option value="Feature request">Feature request</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 15, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{ padding: '13px', background: '#16C064', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}
              >
                {status === 'sending' ? 'Opening email…' : 'Send message →'}
              </button>
            </form>
          )}
        </div>

        {/* Direct contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '20px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Email</p>
            <a href="mailto:info@livelink.ng" style={{ fontSize: 15, fontWeight: 600, color: '#16C064', textDecoration: 'none' }}>
              info@livelink.ng
            </a>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>We respond within 1 business day.</p>
          </div>

          <div style={{ padding: '20px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>WhatsApp</p>
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 15, fontWeight: 600, color: '#16C064', textDecoration: 'none' }}
            >
              +234 7039001367
            </a>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Mon – Fri, 9am – 6pm WAT.</p>
          </div>

          <div style={{ padding: '20px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Company</p>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              Trackwise Nigeria Limited<br />
              RC: 9593605<br />
              Abuja, FCT, Nigeria
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
