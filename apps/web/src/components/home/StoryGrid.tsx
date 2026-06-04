import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { RssItem } from '@/lib/rss'
import { NewsCard } from '@/components/cards/NewsCard'

/**
 * Chronological "latest" grid below the lead section. Renders nothing when
 * there are no additional stories.
 */
export async function StoryGrid({ items, locale }: { items: RssItem[]; locale: string }) {
  if (items.length === 0) return null
  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')

  return (
    <section className="border-t-2 border-ink bg-paper">
      <div className="container-content py-10">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">
            {t('latestLabel')}
          </h2>
          <Link
            href={`/${locale}/berita`}
            className="font-display text-kicker font-semibold uppercase tracking-[0.1em] text-bersama-blue hover:text-bersama-blue-light"
          >
            {tNav('news')} →
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard
              key={item.sourceUrl}
              title={item.title}
              excerpt={item.excerpt}
              sourceUrl={item.sourceUrl}
              sourceName={item.sourceName}
              publishedAt={item.publishedAt}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
