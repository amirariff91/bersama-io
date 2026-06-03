import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'bersama.io — Suara Penyokong, Bebas & Berani',
  description: 'Platform penyokong tidak rasmi Parti Bersama Malaysia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
