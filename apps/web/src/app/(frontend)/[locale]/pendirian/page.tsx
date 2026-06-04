import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import { PositionCard } from '@/components/cards/PositionCard'
import { PageHeader } from '@/components/layout/PageHeader'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  return buildMetadata({
    title: isMs ? 'Pendirian Bersama' : 'Bersama Positions',
    description: isMs
      ? 'Rekod pendirian rasmi Parti Bersama Malaysia berdasarkan bukti kukuh — kenyataan, Hansard, dan media.'
      : 'Official positions of Parti Bersama Malaysia backed by solid evidence — statements, Hansard, and media.',
    locale: isMs ? 'ms' : 'en',
    slug: 'pendirian',
  })
}

export default async function PendirianPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('positions')

  // Placeholder — positions will be loaded from Payload CMS (Positions collection)
  const positions: Parameters<typeof PositionCard>[0][] = []

  return (
    <>
      <PageHeader
        kicker={locale === 'ms' ? 'Rekod Pendirian' : 'Position Records'}
        title={t('heading')}
        deck={t('subheading')}
      />
      <section className="container-content py-12">
        {positions.length === 0 ? (
          <div className="max-w-xl border-t-2 border-ink pt-6">
            <h2 className="font-display text-xl font-bold text-ink">{t('emptyHeading')}</h2>
            <p className="mt-2 text-sm text-ink-muted">{t('emptyText')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {positions.map((position) => (
              <PositionCard key={position.id} {...position} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
