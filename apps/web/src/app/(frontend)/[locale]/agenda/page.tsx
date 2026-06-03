import type { Metadata } from 'next'
import { agendaItems } from '@/data/agenda-seed'
import { AgendaCard } from '@/components/cards/AgendaCard'
import { buildMetadata } from '@/lib/metadata'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
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
  const isMs = locale === 'ms'
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-bersama-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bersama-yellow text-sm font-semibold uppercase tracking-widest mb-3">
            {isMs ? 'Dasar & Agenda' : 'Policy & Agenda'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isMs ? '12 Agenda Bersama' : '12 Bersama Agenda'}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {isMs
              ? 'Dasar konkrit Parti Bersama Malaysia untuk membina negara yang lebih adil dan makmur.'
              : 'Concrete policies from Parti Bersama Malaysia to build a more just and prosperous nation.'}
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-bersama-yellow/10 border-b border-bersama-yellow/30 py-2 px-4 text-center">
        <p className="text-xs text-editorial-dark">
          {isMs
            ? '⚠️ bersama.io adalah platform penyokong TIDAK RASMI. Kami tidak berkaitan dengan Parti Bersama Malaysia.'
            : '⚠️ bersama.io is an UNOFFICIAL supporter platform. We are not affiliated with Parti Bersama Malaysia.'}
        </p>
      </div>

      {/* Agenda Grid */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-4 md:gap-6">
          {agendaItems.map((item) => (
            <AgendaCard
              key={item.slug}
              number={item.number}
              slug={item.slug}
              icon={item.icon}
              title={isMs ? item.titleMs : item.titleEn}
              summary={isMs ? item.summaryMs : item.summaryEn}
              locale={locale}
              serverUrl={serverUrl}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
