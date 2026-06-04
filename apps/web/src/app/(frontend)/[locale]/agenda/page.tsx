import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { agendaItems } from '@/data/agenda-seed'
import { AgendaCard } from '@/components/cards/AgendaCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { buildMetadata } from '@/lib/metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  return buildMetadata({
    title: isMs ? '12 Agenda Bersama' : '12 Bersama Agenda',
    description: isMs
      ? 'Terokai 12 agenda utama Parti Bersama Malaysia — dasar konkrit untuk rakyat.'
      : 'Explore the 12 key agenda items of Parti Bersama Malaysia — concrete policies for the people.',
    locale: isMs ? 'ms' : 'en',
    slug: 'agenda',
  })
}

export default async function AgendaListingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  const t = await getTranslations('agenda')
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'

  return (
    <>
      <PageHeader
        kicker={isMs ? 'Dasar & Agenda' : 'Policy & Agenda'}
        title={t('heading')}
        deck={
          isMs
            ? 'Dasar konkrit Parti Bersama Malaysia untuk membina negara yang lebih adil dan makmur.'
            : 'Concrete policies from Parti Bersama Malaysia to build a more just and prosperous nation.'
        }
      />
      <section className="container-content py-12">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
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
      </section>
    </>
  )
}
