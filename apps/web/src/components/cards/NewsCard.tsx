import { getTranslations } from 'next-intl/server'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'
import { formatDate } from '@/lib/format'

interface NewsCardProps {
  title: string
  excerpt: string // Max 2 sentences — copyright compliant
  sourceUrl: string
  sourceName: string
  publishedAt: string
  locale: string
}

export async function NewsCard({
  title,
  excerpt,
  sourceUrl,
  sourceName,
  publishedAt,
  locale,
}: NewsCardProps) {
  const t = await getTranslations('common')
  const readLabel = t('readAt', { source: sourceName })

  return (
    <article className="group flex flex-col border-t border-rule pt-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="tag-source">{sourceName}</span>
        <span className="text-ink-faint" aria-hidden="true">
          ·
        </span>
        <time className="text-xs text-ink-faint" dateTime={publishedAt}>
          {formatDate(publishedAt, locale)}
        </time>
      </div>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="story-link">
        <h3 className="story-headline text-balance text-lg leading-snug">{title}</h3>
      </a>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{excerpt}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-kicker font-semibold uppercase tracking-[0.1em] text-bersama-blue hover:text-bersama-blue-light"
        >
          {readLabel} →
        </a>
        <WhatsAppShareButton title={title} url={sourceUrl} />
      </div>
    </article>
  )
}
