import type { Metadata } from 'next'
import { Analytics } from '@/components/analytics/Analytics'
import { CookieConsent } from '@/components/analytics/CookieConsent'
import { OneSignalInit } from '@/components/analytics/OneSignalInit'
import './globals.css'

export const metadata: Metadata = {
  title: 'bersama.io — Suara Penyokong, Bebas & Berani',
  description: 'Platform penyokong tidak rasmi Parti Bersama Malaysia. Berita, agenda, dan pendirian.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>
        {children}
        <Analytics />
        <CookieConsent />
        <OneSignalInit />
      </body>
    </html>
  )
}
