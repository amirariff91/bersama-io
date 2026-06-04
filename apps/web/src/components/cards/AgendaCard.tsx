import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

interface AgendaCardProps {
  number: number
  slug: string
  icon?: string // deprecated — emoji no longer rendered
  title: string
  summary: string
  locale: string
  serverUrl: string
}

export async function AgendaCard({
  number,
  slug,
  title,
  summary,
  locale,
  serverUrl,
}: AgendaCardProps) {
  const t = await getTranslations('common')
  const url = `${serverUrl}/${locale}/agenda/${slug}`
  const readMore = t('readMore')

  return (
    <article className="group border-t border-rule pt-5">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-3xl font-black leading-none text-bersama-blue tabular-nums">
          {String(number).padStart(2, '0')}
        </span>
        <div className="flex-1">
          <Link href={`/${locale}/agenda/${slug}`} className="story-link">
            <h3 className="story-headline text-balance text-base leading-snug">{title}</h3>
          </Link>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href={`/${locale}/agenda/${slug}`}
              className="font-display text-kicker font-semibold uppercase tracking-[0.1em] text-bersama-blue hover:text-bersama-blue-light"
            >
              {readMore} →
            </Link>
            <WhatsAppShareButton title={title} url={url} />
          </div>
        </div>
      </div>
    </article>
  )
}
