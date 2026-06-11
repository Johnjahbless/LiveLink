import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* NAV */}
      <nav style={{ background: 'var(--ink)', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="logo-dot" />
            LiveLink
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#features" className="hide-sm" style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Features</a>
            <a href="#pricing"  className="hide-sm" style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Pricing</a>
            <Link href="/login"    style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{ background: 'var(--green)', color: '#fff', padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Start free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'var(--ink)', padding: '72px 0 88px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 56, alignItems: 'center' }}>

            {/* Left — copy */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
                Pay-as-you-go · From ₦80 per delivery
              </div>
              <h1 className="syne" style={{ fontSize: 50, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 18 }}>
                The one link that stops delivery drama{' '}
                <span style={{ color: 'var(--green)' }}>before it starts.</span>
              </h1>
              <p style={{ fontSize: 16, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 32, maxWidth: 420 }}>
                Send your rider and customer live tracking links straight from WhatsApp. No app download. No monthly fee. Your customer watches their package move in real time.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <Link href="/register" style={{ background: 'var(--green)', color: '#fff', padding: '13px 26px', borderRadius: 10, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                  Start with 5 free deliveries →
                </Link>
                <a href="#how" style={{ color: '#6B7280', fontSize: 14, textDecoration: 'none' }}>See how it works ↓</a>
              </div>
              <div style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span>✓ No credit card</span><span>·</span>
                <span>✓ No rider app</span><span>·</span>
                <span>✓ Works on all networks</span>
              </div>
            </div>

            {/* Right — live demo card */}
            <div className="demo-wrap">
              <div className="demo-glow" style={{ background: '#111', border: '1px solid rgba(22,192,100,.2)', borderRadius: 20, padding: 24, boxShadow: '0 0 60px rgba(22,192,100,.07)', position: 'relative', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#D1D5DB' }}>📦 Delivery #247 · Chiamaka Eze</span>
                  <span style={{ background: 'rgba(22,192,100,.12)', border: '1px solid rgba(22,192,100,.25)', color: 'var(--green)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="live-dot" /> Live
                  </span>
                </div>

                {/* Map */}
                <div style={{ background: '#0B0F17', borderRadius: 12, height: 148, position: 'relative', overflow: 'hidden', marginBottom: 18, border: '1px solid rgba(255,255,255,.05)' }}>
                  <div className="map-grid" />
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} viewBox="0 0 360 148" fill="none">
                    <path d="M30 108 Q80 82 130 68 Q178 54 210 46 Q255 36 305 42" stroke="rgba(22,192,100,.2)" strokeWidth="2" strokeDasharray="5 4" fill="none" />
                  </svg>
                  <div className="rider-dot">🛵</div>
                  <div style={{ position: 'absolute', top: '24%', right: '10%', fontSize: 18, zIndex: 2 }}>📍</div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Last ping',    value: '4s ago', green: true  },
                    { label: 'Est. arrival', value: '~8 min', green: false },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '11px 13px' }}>
                      <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: s.green ? 'var(--green)' : '#fff' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* COD */}
                <div style={{ background: 'rgba(22,192,100,.07)', border: '1px solid rgba(22,192,100,.18)', borderRadius: 10, padding: '10px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>Payment</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>₦15,000 cash</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 500 }}>⏳ Pending collection</div>
                </div>

                {/* Quick links */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { icon: '🛵', label: 'Rider link',  active: false },
                    { icon: '🗺️', label: 'Customer',    active: false },
                    { icon: '💬', label: 'WhatsApp',    active: true  },
                  ].map(l => (
                    <div key={l.label} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: `1px solid ${l.active ? 'var(--green)' : 'rgba(255,255,255,.09)'}`, borderRadius: 8, padding: '7px 6px', textAlign: 'center', fontSize: 11, color: l.active ? 'var(--green)' : '#9CA3AF', cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>{l.icon}</div>
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44, flexWrap: 'wrap' }}>
          {['🚫 No app for riders', '🔋 Battery-light GPS', '💳 Powered by Paystack', '📶 Offline-resilient'].map(t => (
            <span key={t} style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* PAIN */}
      <section id="pain" style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12 }}>The problem</p>
          <h2 className="syne" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 14 }}>You know this feeling.</h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 500, marginBottom: 44 }}>Every Nigerian delivery creates the same 3-way stress between vendor, rider, and customer. LiveLink kills all three at once.</p>
          <div className="pain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { e: '📱', t: '"Where is my package?!" — 7 WhatsApp pings in 2 hours',   d: "Your customer doesn't trust you yet. They trusted you with their money, and now your rider has gone quiet." },
              { e: '📵', t: "Your rider isn't picking up. Nobody knows where they are.", d: "Freelance dispatch riders are reliable but unreachable mid-delivery. You're guessing until they surface." },
              { e: '💸', t: 'Cash collected or not? End-of-day payment chasing.',        d: 'No delivery tool solves this. We built COD confirmation directly into the rider page — one tap, instant alert.' },
            ].map(c => (
              <div key={c.t} style={{ background: 'var(--snow)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                <span style={{ fontSize: 26, marginBottom: 14, display: 'block' }}>{c.e}</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: '#F0FDF4', padding: '72px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12 }}>The solution</p>
          <h2 className="syne" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 14 }}>One link. Three problems solved.</h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 500, marginBottom: 44 }}>Create a delivery, send two WhatsApp links, and LiveLink handles the rest automatically.</p>
          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { i: '🛵', t: 'Zero friction for your rider',   d: 'Browser link. No app download. No sign-up. Tap "Start delivery" and GPS streams live. Stays running even when they switch to Google Maps.',          tag: 'Wake Lock API'    },
              { i: '🗺️', t: 'Your customer watches live',     d: "They open a map showing the rider moving in real time. No more pings to you. Shows \"Delivered\" the second it's done. No install required.",         tag: 'Supabase Realtime' },
              { i: '✅', t: 'COD confirmation built-in',      d: 'Rider taps "Cash received" or "Transfer made" after delivery. You see it instantly. No chasing. No end-of-day ambiguity. Our key differentiator.',   tag: 'Our differentiator'},
            ].map(f => (
              <div key={f.t} style={{ background: '#fff', border: '1px solid #D1FAE5', borderRadius: 20, padding: '28px 24px' }}>
                <div style={{ width: 44, height: 44, background: '#DCFCE7', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18 }}>{f.i}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 9 }}>{f.t}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{f.d}</p>
                <span style={{ display: 'inline-block', marginTop: 12, fontSize: 10, fontWeight: 700, color: 'var(--gd)', background: '#DCFCE7', padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12 }}>How it works</p>
          <h2 className="syne" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 52 }}>From order to door in 5 steps.</h2>
          <div className="steps-grid steps-line" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0, position: 'relative' }}>
            {[
              { n: '1', t: 'Create delivery', d: 'Name, phone, notes. Done in 10 seconds.',          active: false },
              { n: '2', t: 'Send links',       d: 'WhatsApp deep links auto-generated for both.',     active: true  },
              { n: '3', t: 'Rider starts GPS', d: 'Tap the link, hit Start. Live stream begins.',    active: false },
              { n: '4', t: 'Customer tracks',  d: 'Live map. No app. No pings to you.',              active: false },
              { n: '5', t: 'Payment confirmed',d: 'Rider logs cash or transfer. You see it live.',   active: false },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 6px' }}>
                <div className="syne" style={{ width: 46, height: 46, background: s.active ? 'var(--green)' : '#fff', border: `2px solid ${s.active ? 'var(--green)' : 'var(--border)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: s.active ? '#fff' : 'var(--text)', margin: '0 auto 14px' }}>{s.n}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: 'var(--snow)', padding: '72px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gd)', marginBottom: 12 }}>Pricing</p>
          <h2 className="syne" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 14 }}>Pay only when you deliver.</h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 500, marginBottom: 44 }}>Credits never expire. No monthly fees. Perfect for vendors doing 10 deliveries one week and 50 the next.</p>
          <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { n: 'Starter',  c: 25,  p: '₦2,000',  per: '₦80 per delivery', pop: false },
              { n: 'Basic',    c: 75,  p: '₦5,000',  per: '₦67 per delivery', pop: true  },
              { n: 'Standard', c: 175, p: '₦10,000', per: '₦57 per delivery', pop: false },
              { n: 'Pro',      c: 500, p: '₦25,000', per: '₦50 per delivery', pop: false },
            ].map(pkg => (
              <div key={pkg.n} style={{ background: '#fff', border: `1.5px solid ${pkg.pop ? 'var(--green)' : 'var(--border)'}`, borderRadius: 20, padding: '26px 22px', position: 'relative' }}>
                {pkg.pop && (
                  <span style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    Most popular
                  </span>
                )}
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{pkg.n}</p>
                <p className="syne" style={{ fontSize: 38, fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 3 }}>{pkg.c}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>credits</p>
                <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>{pkg.p}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>{pkg.per}</p>
                <Link href="/register" style={{ display: 'block', padding: 11, background: pkg.pop ? 'var(--green)' : '#fff', border: `1.5px solid ${pkg.pop ? 'var(--green)' : 'var(--border)'}`, color: pkg.pop ? '#fff' : 'var(--text)', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
            Every new account starts with <strong style={{ color: 'var(--text)' }}>5 free credits</strong> — no card required.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--ink)', padding: '88px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <h2 className="syne" style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.025em', maxWidth: 520, margin: '0 auto 16px' }}>
            Ready to stop the{' '}
            <span style={{ color: 'var(--green)' }}>delivery drama?</span>
          </h2>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32 }}>5 free tracking links. Set up in under 2 minutes.</p>
          <Link href="/register" style={{ background: 'var(--green)', color: '#fff', padding: '15px 34px', borderRadius: 10, fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            Start for free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="syne" style={{ fontSize: 17, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span className="logo-dot" />LiveLink
            </div>
            <p style={{ fontSize: 12, color: '#374151' }}>© 2025 Trackwise Nigeria Limited · RC 9593605</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 12, color: '#374151', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
