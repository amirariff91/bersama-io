import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { UnofficialDisclaimer } from '@/components/ui/UnofficialDisclaimer'
import { NewsletterForm } from '@/components/forms/NewsletterForm'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations('common')
  return {
    title: `${t('siteTitle')} — ${t('tagline')}`,
    description: t('unofficial'),
  }
}

export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations('hero')
  const tJohor = await getTranslations('johorBanner')
  const tAgenda = await getTranslations('agenda')
  const tSubscribe = await getTranslations('subscribe')

  // Static agenda items — will be dynamic in Wave 4
  const agendaItems = [
    { number: '01', title: tAgenda('items.0.title'), summary: tAgenda('items.0.summary') },
    { number: '02', title: tAgenda('items.1.title'), summary: tAgenda('items.1.summary') },
    { number: '03', title: tAgenda('items.2.title'), summary: tAgenda('items.2.summary') },
    { number: '04', title: tAgenda('items.3.title'), summary: tAgenda('items.3.summary') },
  ]

  return (
    <main className="min-h-screen flex flex-col">
      {/* Unofficial disclaimer strip */}
      <UnofficialDisclaimer locale={locale} />

      {/* Hero */}
      <section className="bg-bersama-blue text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
            {t('heading')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            {t('subheading')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/berita`}
              className="inline-flex items-center justify-center px-8 py-3 bg-bersama-yellow text-bersama-blue font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('ctaNews')}
            </Link>
            <Link
              href={`/${locale}/agenda`}
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {t('ctaAgenda')}
            </Link>
          </div>
        </div>
      </section>

      {/* Johor Election Banner */}
      <section className="bg-bersama-yellow py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-bersama-blue/70 mb-2">
            🗳️ Pilihan Raya Negeri 2026
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-bersama-blue">
            {tJohor('heading')}
          </h2>
          <p className="mt-3 text-bersama-blue/80 text-lg">
            {tJohor('subheading')}
          </p>
          <Link
            href={`/${locale}/johor`}
            className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-bersama-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {tJohor('cta')} →
          </Link>
        </div>
      </section>

      {/* Agenda Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-bersama-blue">
              {tAgenda('sectionTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agendaItems.map(item => (
              <div
                key={item.number}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl font-display font-bold text-bersama-yellow">
                  {item.number}
                </span>
                <h3 className="mt-2 font-semibold text-bersama-blue">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.summary}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href={`/${locale}/agenda`}
              className="inline-flex items-center text-bersama-blue font-semibold hover:underline"
            >
              {tAgenda('viewAll')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-bersama-blue">
              {tSubscribe('sectionTitle')}
            </h2>
            <p className="mt-2 text-gray-600">{tSubscribe('sectionSubtitle')}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </main>
  )
}
