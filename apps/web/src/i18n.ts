import { getRequestConfig } from 'next-intl/server'

export const locales = ['ms', 'en'] as const
export const defaultLocale = 'ms' as const

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl v4: requestLocale is a Promise resolving to the matched segment
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
