import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '14px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="syne" style={{ fontSize: 18, fontWeight: 800, color: '#0A0A0A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="logo-dot" />LiveLink
          </Link>
          <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#16C064', textDecoration: 'none' }}>
            Go to dashboard →
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', width: '100%', padding: '56px 24px 80px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9CA3AF' }}>
          © 2025 Trackwise Nigeria Limited · RC 9593605 ·{' '}
          <Link href="/privacy" style={{ color: '#9CA3AF' }}>Privacy</Link>
          {' · '}
          <Link href="/terms" style={{ color: '#9CA3AF' }}>Terms</Link>
          {' · '}
          <Link href="/contact" style={{ color: '#9CA3AF' }}>Contact</Link>
        </p>
      </footer>
    </div>
  )
}
