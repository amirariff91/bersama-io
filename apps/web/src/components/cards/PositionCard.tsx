import { getTranslations } from 'next-intl/server'
import { formatDate } from '@/lib/format'

interface PositionCardProps {
  id: string
  issueTitle: string
  positionSummary: string
  evidenceType: string
  evidenceUrl: string
  date: string
  locale: string
}

export async function PositionCard({
  id: _id,
  issueTitle,
  positionSummary,
  evidenceType,
  evidenceUrl,
  date,
  locale,
}: PositionCardProps) {
  const t = await getTranslations('positions')
  const evidenceKeys = ['statement', 'hansard', 'press-release', 'social', 'interview']
  const evidenceLabel = evidenceKeys.includes(evidenceType)
    ? t(`evidenceTypes.${evidenceType}` as 'evidenceTypes.statement')
    : evidenceType
  const sourceLabel = t('viewSource')

  return (
    <article className="border-l-2 border-bersama-yellow pl-5">
      <div className="mb-2 flex flex-wrap items-center gap-2.5">
        <span className="tag-agenda">{evidenceLabel}</span>
        <time className="text-xs text-ink-faint" dateTime={date}>
          {formatDate(date, locale)}
        </time>
      </div>
      <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-ink">
        {issueTitle}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{positionSummary}</p>
      <a
        href={evidenceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block font-display text-kicker font-semibold uppercase tracking-[0.1em] text-bersama-blue hover:text-bersama-blue-light"
      >
        {sourceLabel} →
      </a>
    </article>
  )
}
