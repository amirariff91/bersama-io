import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { agendaItems } from '@/data/agenda-seed'
import { AgendaCard } from '@/components/cards/AgendaCard'

/**
 * The 12-point agenda as a "what Bersama stands for" policy tracker — the
 * platform's original module. Set on a dim paper band to separate it from
 * the news flow.
 */
export async function PolicyTrackerRail({
  locale,
  serverUrl,
}: {
  locale: string
  serverUrl: string
}) {
  const t = await getTranslations('home')
  const tAgenda = await getTranslations('agenda')
  const isMs = locale === 'ms'

  return (
    <section className="border-t-2 border-ink bg-paper-dim">
      <div className="container-content py-12">
        <div className="max-w-2xl">
          <p className="kicker">{tAgenda('itemPrefix')} 01—12</p>
          <h2 className="mt-3 font-display text-headline font-black tracking-tight text-ink">
            {t('agendaLabel')}
          </h2>
          <p className="mt-2 text-deck text-ink-muted">{tAgenda('subheading')}</p>
        </div>

        <div className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {agendaItems.map((item) => (
            <AgendaCard
              key={item.slug}
              number={item.number}
              slug={item.slug}
              title={isMs ? item.titleMs : item.titleEn}
              summary={isMs ? item.summaryMs : item.summaryEn}
              locale={locale}
              serverUrl={serverUrl}
            />
          ))}
        </div>

        <div className="mt-10 border-t-2 border-ink pt-5">
          <Link
            href={`/${locale}/agenda`}
            className="font-display text-sm font-bold uppercase tracking-[0.08em] text-bersama-blue hover:text-bersama-blue-light"
          >
            {tAgenda('viewAll')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
