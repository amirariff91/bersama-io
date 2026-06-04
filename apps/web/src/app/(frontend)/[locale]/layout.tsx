import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import { Analytics } from '@/components/analytics/Analytics'
import { CookieConsent } from '@/components/analytics/CookieConsent'
import { OneSignalInit } from '@/components/analytics/OneSignalInit'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UnofficialDisclaimer } from '@/components/ui/UnofficialDisclaimer'
import { fontSans, fontDisplay } from '../../fonts'
import '../../../styles/design-system.css'

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
    <html lang={locale} className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <UnofficialDisclaimer locale={locale} />
          <Navbar locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
        <Analytics />
        <CookieConsent />
        <OneSignalInit />
      </body>
    </html>
  )
}
