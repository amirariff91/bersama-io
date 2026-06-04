import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import { NewsCard } from '@/components/cards/NewsCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { fetchBersamaNews } from '@/lib/rss'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  return buildMetadata({
    title: isMs ? 'Berita Bersama' : 'Bersama News',
    description: isMs
      ? 'Agregat berita terkini tentang Parti Bersama Malaysia dari pelbagai sumber media.'
      : 'Latest news aggregated about Parti Bersama Malaysia from multiple media sources.',
    locale: isMs ? 'ms' : 'en',
    slug: 'berita',
  })
}

export const revalidate = 900 // 15 minutes — matches RSS cache

export default async function BeritaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  const t = await getTranslations('home')

  const allNews = await fetchBersamaNews()
  const news = isMs
    ? allNews // Show all for BM (mix is fine)
    : allNews.filter((n) => n.language === 'en') // EN page prefers EN sources

  return (
    <>
      <PageHeader
        kicker={isMs ? 'Agregat Berita' : 'News Aggregator'}
        title={isMs ? 'Berita Bersama' : 'Bersama News'}
        deck={
          isMs
            ? 'Berita terkini tentang Parti Bersama Malaysia dari pelbagai sumber media bebas. Kami memaut ke sumber asal — kami tidak menulis atau mengedit kandungan ini.'
            : 'Latest news about Parti Bersama Malaysia aggregated from independent media sources. We link to the original — we do not write or edit this content.'
        }
      />
      <section className="container-content py-12">
        {news.length === 0 ? (
          <div className="max-w-xl border-t-2 border-ink pt-6">
            <h2 className="font-display text-xl font-bold text-ink">
              {isMs ? 'Tiada berita buat masa ini' : 'No news at the moment'}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">{t('noNews')}</p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <NewsCard
                key={`${item.sourceUrl}-${index}`}
                title={item.title}
                excerpt={item.excerpt}
                sourceUrl={item.sourceUrl}
                sourceName={item.sourceName}
                publishedAt={item.publishedAt}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
