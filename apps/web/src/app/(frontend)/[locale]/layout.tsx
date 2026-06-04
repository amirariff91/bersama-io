import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import { Analytics } from '@/components/analytics/Analytics'
import { CookieConsent } from '@/components/analytics/CookieConsent'
import { OneSignalInit } from '@/components/analytics/OneSignalInit'
import '../../globals.css'

export const metadata: Metadata = {
  title: 'bersama.io — Suara Penyokong, Bebas & Berani',
  description:
    'Platform penyokong tidak rasmi Parti Bersama Malaysia. Berita, agenda, dan pendirian.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'),
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locales, locale)) notFound()

  // Enable static rendering for this locale
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <CookieConsent />
        <OneSignalInit />
      </body>
    </html>
  )
}
