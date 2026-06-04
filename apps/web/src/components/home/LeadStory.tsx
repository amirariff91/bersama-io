import { getTranslations } from 'next-intl/server'
import type { RssItem } from '@/lib/rss'
import { formatDate } from '@/lib/format'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

/**
 * Top section: one dominant lead story with a tight stacked rail of
 * secondary stories beside it. Falls back to a typographic empty state
 * when the RSS aggregator returns nothing.
 */
export async function LeadStory({ items, locale }: { items: RssItem[]; locale: string }) {
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')
  const lead = items[0]
  const secondary = items.slice(1, 4)

  if (!lead) {
    return (
      <section className="container-content py-12">
        <p className="kicker">{t('leadLabel')}</p>
        <p className="mt-4 max-w-xl text-deck text-ink-muted">{t('noNews')}</p>
      </section>
    )
  }

  const readLabel = tCommon('readAt', { source: lead.sourceName })

  return (
    <section className="container-content py-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Lead */}
        <div className="lg:col-span-8 lg:border-r lg:border-rule lg:pr-10">
          <p className="kicker">{t('leadLabel')}</p>
          <a
            href={lead.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="story-link mt-3 block"
          >
            <h2 className="story-headline text-balance text-lead">{lead.title}</h2>
          </a>
          <p className="mt-4 max-w-2xl text-pretty text-deck text-ink-muted">{lead.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="tag-source">{lead.sourceName}</span>
            <span className="text-ink-faint" aria-hidden="true">
              ·
            </span>
            <time className="text-xs text-ink-faint" dateTime={lead.publishedAt}>
              {formatDate(lead.publishedAt, locale)}
            </time>
            <a
              href={lead.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-kicker font-semibold uppercase tracking-[0.1em] text-bersama-blue hover:text-bersama-blue-light"
            >
              {readLabel} →
            </a>
            <WhatsAppShareButton title={lead.title} url={lead.sourceUrl} />
          </div>
        </div>

        {/* Secondary rail */}
        {secondary.length > 0 ? (
          <div className="lg:col-span-4">
            <ul className="divide-y divide-rule border-t border-rule lg:border-t-0">
              {secondary.map((item) => (
                <li key={item.sourceUrl} className="py-4 first:pt-0 lg:first:pt-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="tag-source">{item.sourceName}</span>
                    <span className="text-ink-faint" aria-hidden="true">
                      ·
                    </span>
                    <time className="text-xs text-ink-faint" dateTime={item.publishedAt}>
                      {formatDate(item.publishedAt, locale)}
                    </time>
                  </div>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="story-link group"
                  >
                    <h3 className="story-headline text-balance text-base leading-snug">
                      {item.title}
                    </h3>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
