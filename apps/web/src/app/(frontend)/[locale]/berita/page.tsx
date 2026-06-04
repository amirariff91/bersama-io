import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import { NewsCard } from '@/components/cards/NewsCard'
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
    slug: isMs ? 'berita' : 'berita',
  })
}

export const revalidate = 900 // 15 minutes — matches RSS cache

export default async function BeritaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'

  const allNews = await fetchBersamaNews()
  const news = isMs
    ? allNews // Show all for BM (mix is fine)
    : allNews.filter((n) => n.language === 'en') // EN page prefers EN sources

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-bersama-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bersama-yellow text-sm font-semibold uppercase tracking-widest mb-3">
            {isMs ? 'Agregat Berita' : 'News Aggregator'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isMs ? 'Berita Bersama' : 'Bersama News'}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {isMs
              ? 'Berita terkini tentang Parti Bersama Malaysia dari pelbagai sumber media bebas.'
              : 'Latest news about Parti Bersama Malaysia aggregated from independent media sources.'}
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-bersama-yellow/10 border-b border-bersama-yellow/30 py-2 px-4 text-center">
        <p className="text-xs text-editorial-dark">
          {isMs
            ? '⚠️ bersama.io mengagregat berita dari sumber luar. Kami tidak menulis atau mengedit kandungan ini.'
            : '⚠️ bersama.io aggregates news from external sources. We do not write or edit this content.'}
        </p>
      </div>

      {/* News grid */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📰</div>
            <h2 className="text-xl font-semibold text-editorial-dark mb-2">
              {isMs ? 'Tiada berita buat masa ini' : 'No news at the moment'}
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {isMs
                ? 'Tiada berita berkaitan Parti Bersama Malaysia dijumpai. Semak kembali tidak lama lagi.'
                : 'No news about Parti Bersama Malaysia found right now. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-5 md:grid-cols-2">
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
    </main>
  )
}
