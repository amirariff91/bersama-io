import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'

interface MetaOptions {
  title: string
  description: string
  locale: 'ms' | 'en'
  slug?: string
  type?: 'website' | 'article'
  publishedAt?: string
  author?: string
  image?: string
}

export function buildMetadata(opts: MetaOptions): Metadata {
  const { title, description, locale, slug, type = 'website', publishedAt, author, image } = opts
  const alternateLocale = locale === 'ms' ? 'en' : 'ms'
  const url = slug ? `${BASE_URL}/${locale}/${slug}` : `${BASE_URL}/${locale}`
  const alternateUrl = slug ? `${BASE_URL}/${alternateLocale}/${slug}` : `${BASE_URL}/${alternateLocale}`
  const ogImage = image || `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&locale=${locale}`

  return {
    title: `${title} | bersama.io`,
    description,
    alternates: {
      canonical: url,
      languages: {
        'ms': locale === 'ms' ? url : alternateUrl,
        'en': locale === 'en' ? url : alternateUrl,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'bersama.io',
      locale: locale === 'ms' ? 'ms_MY' : 'en_MY',
      type,
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
      ...(author ? { authors: [author] } : {}),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}
