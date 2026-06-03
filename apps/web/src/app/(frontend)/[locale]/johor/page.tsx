import { getTranslations } from 'next-intl/server'
import { UnofficialDisclaimer } from '@/components/ui/UnofficialDisclaimer'
import { LiveBlog } from './liveblog'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations('johor')
  return {
    title: `${t('heroHeading')} — bersama.io`,
    description: t('heroSubheading'),
  }
}

export default async function JohorPage({ params: { locale } }: Props) {
  const t = await getTranslations('johor')

  const seats = [
    { name: 'Pulai Sebatang', status: locale === 'ms' ? 'Sasaran' : 'Target', incumbent: 'BN' },
    { name: 'Skudai', status: locale === 'ms' ? 'Sasaran' : 'Target', incumbent: 'PKR' },
    { name: 'Johor Jaya', status: locale === 'ms' ? 'Pertahan' : 'Hold', incumbent: 'Bersama' },
    { name: 'Permas', status: locale === 'ms' ? 'Sasaran' : 'Target', incumbent: 'BN' },
    { name: 'Kempas', status: locale === 'ms' ? 'Pantau' : 'Watch', incumbent: 'BN' },
    { name: 'Mengkibol', status: locale === 'ms' ? 'Sasaran' : 'Target', incumbent: 'MCA' },
  ]

  const statusColour: Record<string, string> = {
    Sasaran: 'bg-blue-100 text-blue-800',
    Target: 'bg-blue-100 text-blue-800',
    Pertahan: 'bg-green-100 text-green-800',
    Hold: 'bg-green-100 text-green-800',
    Pantau: 'bg-amber-100 text-amber-800',
    Watch: 'bg-amber-100 text-amber-800',
  }

  return (
    <main className="min-h-screen flex flex-col">
      <UnofficialDisclaimer locale={locale} />

      {/* Hero */}
      <section className="bg-bersama-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bersama-yellow text-sm font-semibold uppercase tracking-widest mb-3">
            🗳️ Pilihan Raya Negeri Johor
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
            {t('heroHeading')}
          </h1>
          <p className="mt-4 text-gray-300 text-lg max-w-2xl mx-auto">
            {t('heroSubheading')}
          </p>
        </div>
      </section>

      {/* Electoral disclaimer */}
      <section className="bg-gray-50 border-b border-gray-200 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            ⚠️ {t('disclaimer')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 w-full">
        {/* Live blog */}
        <section>
          <h2 className="text-2xl font-display font-bold text-bersama-blue mb-6">
            {t('liveBlogTitle')}
          </h2>
          <LiveBlog />
        </section>

        {/* Key seats grid */}
        <section className="border-t border-gray-100 pt-10">
          <h2 className="text-2xl font-display font-bold text-bersama-blue mb-6">
            {t('keySeatsTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seats.map(seat => (
              <div
                key={seat.name}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2"
              >
                <h3 className="font-semibold text-bersama-blue">{seat.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      statusColour[seat.status] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {seat.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {locale === 'ms' ? 'Pemegang:' : 'Incumbent:'} {seat.incumbent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
