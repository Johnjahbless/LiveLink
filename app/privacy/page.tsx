import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LiveLink',
}

const EFFECTIVE_DATE = 'June 1, 2025'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75 }}>{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#16C064', marginBottom: 10 }}>Legal</p>
        <h1 className="syne" style={{ fontSize: 36, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.15, marginBottom: 10 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Effective date: {EFFECTIVE_DATE}</p>
      </div>

      <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.75, marginBottom: 40 }}>
        LiveLink is operated by <strong style={{ color: '#111827' }}>Trackwise Nigeria Limited</strong> (RC: 9593605), a company registered in Nigeria. This policy explains what data we collect, why we collect it, and how we protect it.
      </p>

      <Section title="1. Data we collect">
        <p style={{ marginBottom: 12 }}>We collect only what is necessary to provide the LiveLink service:</p>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong style={{ color: '#111827' }}>Vendors:</strong> name, email address, phone number, and business name provided at registration.</li>
          <li><strong style={{ color: '#111827' }}>GPS location data:</strong> latitude, longitude, speed, and accuracy sent by the rider&rsquo;s browser during active deliveries. This data is linked to a delivery, not to any individual rider identity.</li>
          <li><strong style={{ color: '#111827' }}>Payment data:</strong> credit purchase amounts and Paystack transaction references. We do not store card numbers — all card processing is handled by Paystack.</li>
          <li><strong style={{ color: '#111827' }}>Delivery records:</strong> customer name, phone number, delivery notes, and payment confirmation status entered by the vendor.</li>
          <li><strong style={{ color: '#111827' }}>Usage data:</strong> page views and feature usage via PostHog analytics (anonymised).</li>
        </ul>
      </Section>

      <Section title="2. How we use your data">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>To provide real-time delivery tracking to your customers.</li>
          <li>To process credit purchases via Paystack and maintain your wallet balance.</li>
          <li>To send transactional emails (account confirmation, password reset).</li>
          <li>To improve the service through aggregated, anonymous usage analytics.</li>
        </ul>
        <p style={{ marginTop: 12 }}>We do not sell your data. We do not use your data for advertising.</p>
      </Section>

      <Section title="3. Third-party services">
        <p style={{ marginBottom: 12 }}>LiveLink uses the following third-party providers:</p>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong style={{ color: '#111827' }}>Supabase</strong> — database, authentication, real-time updates, and file storage. Data is hosted on Supabase&rsquo;s infrastructure. See <a href="https://supabase.com/privacy" style={{ color: '#16C064' }}>supabase.com/privacy</a>.</li>
          <li><strong style={{ color: '#111827' }}>Paystack</strong> — payment processing. Card data never reaches our servers. See <a href="https://paystack.com/privacy" style={{ color: '#16C064' }}>paystack.com/privacy</a>.</li>
          <li><strong style={{ color: '#111827' }}>Vercel</strong> — hosting and edge functions. See <a href="https://vercel.com/legal/privacy-policy" style={{ color: '#16C064' }}>vercel.com/legal/privacy-policy</a>.</li>
          <li><strong style={{ color: '#111827' }}>OpenStreetMap</strong> — map tiles displayed on the customer tracking page. No personal data is shared with OpenStreetMap.</li>
        </ul>
      </Section>

      <Section title="4. Data retention">
        <p>
          Delivery records and GPS location history are retained for <strong style={{ color: '#111827' }}>12 months</strong> from the delivery date, then permanently deleted. Account data is retained for as long as your account is active. You may request deletion of your account and all associated data by contacting us.
        </p>
      </Section>

      <Section title="5. GPS and location data">
        <p>
          GPS data is collected from the rider&rsquo;s browser only while a delivery is in the <strong style={{ color: '#111827' }}>active</strong> state. Tracking stops automatically when the rider taps &ldquo;Mark as delivered&rdquo; or when the vendor cancels the delivery. Location data is associated with delivery records, not with individual rider accounts or identities.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p style={{ marginBottom: 12 }}>You have the right to:</p>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and all associated data.</li>
          <li>Object to processing of your data in certain circumstances.</li>
        </ul>
        <p style={{ marginTop: 12 }}>To exercise any of these rights, email us at <a href="mailto:info@livelink.ng" style={{ color: '#16C064' }}>info@livelink.ng</a>.</p>
      </Section>

      <Section title="7. Security">
        <p>
          All data is transmitted over HTTPS. Database access is restricted by row-level security policies. Rider and customer tracking pages use unguessable 32-character tokens instead of authenticated sessions. We conduct periodic security reviews and will notify affected users in the event of a data breach within 72 hours of discovery.
        </p>
      </Section>

      <Section title="8. Changes to this policy">
        <p>
          We may update this policy from time to time. We will notify registered vendors by email of any material changes at least 14 days before they take effect. Continued use of LiveLink after the effective date constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Trackwise Nigeria Limited<br />
          RC: 9593605<br />
          Email: <a href="mailto:info@livelink.ng" style={{ color: '#16C064' }}>info@livelink.ng</a>
        </p>
      </Section>
    </>
  )
}
