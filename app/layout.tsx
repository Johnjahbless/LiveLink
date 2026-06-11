import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#16C064',
}

export const metadata: Metadata = {
  title: 'LiveLink — Real-time delivery tracking',
  description: 'No-app delivery tracking for Nigerian Instagram & WhatsApp vendors',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'LiveLink' },
  formatDetection: { telephone: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={`${dmSans.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
