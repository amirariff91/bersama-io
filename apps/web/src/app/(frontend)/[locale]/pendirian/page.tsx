import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import { PositionCard } from '@/components/cards/PositionCard'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'
  return buildMetadata({
    title: isMs ? 'Kedudukan Bersama' : 'Bersama Positions',
    description: isMs
      ? 'Rekod pendirian rasmi Parti Bersama Malaysia berdasarkan bukti kukuh — kenyataan, Hansard, dan media.'
      : 'Official positions of Parti Bersama Malaysia backed by solid evidence — statements, Hansard, and media.',
    locale: isMs ? 'ms' : 'en',
    slug: 'pendirian',
  })
}

export default async function PendrianPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isMs = locale === 'ms'

  // Placeholder — positions will be loaded from Payload CMS (Positions collection)
  const positions: Parameters<typeof PositionCard>[0][] = []

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-bersama-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bersama-yellow text-sm font-semibold uppercase tracking-widest mb-3">
            {isMs ? 'Rekod Pendirian' : 'Position Records'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isMs ? 'Kedudukan Bersama' : 'Bersama Positions'}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {isMs
              ? 'Pendirian Parti Bersama Malaysia atas isu-isu semasa, disokong oleh bukti kukuh.'
              : 'Parti Bersama Malaysia\'s stance on current issues, backed by solid evidence.'}
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

      {/* Positions list */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        {positions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚖️</div>
            <h2 className="text-xl font-semibold text-editorial-dark mb-3">
              {isMs ? 'Rekod Pendirian Akan Datang' : 'Position Records Coming Soon'}
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-2">
              {isMs
                ? 'Rekod pendirian Parti Bersama Malaysia akan muncul di sini.'
                : 'The record of Parti Bersama Malaysia\'s positions will appear here.'}
            </p>
            <p className="text-gray-400 text-xs max-w-md mx-auto">
              {isMs
                ? 'Kami sedang mendokumentasikan pendirian parti berdasarkan kenyataan rasmi, Hansard Parlimen, dan siaran media.'
                : 'We are documenting party positions based on official statements, Parliamentary Hansard, and press releases.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => (
              <PositionCard key={position.id} {...position} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
