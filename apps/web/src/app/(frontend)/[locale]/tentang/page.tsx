import { getTranslations, setRequestLocale } from 'next-intl/server'
import { UnofficialDisclaimer } from '@/components/ui/UnofficialDisclaimer'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  return {
    title: `${t('title')} — bersama.io`,
    description: t('whatWeAreText'),
  }
}

export default async function TentangPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')

  const pageUrl =
    typeof process !== 'undefined'
      ? `https://bersama.io/${locale}/tentang`
      : `/${locale}/tentang`

  return (
    <main className="min-h-screen flex flex-col">
      <UnofficialDisclaimer locale={locale} />

      {/* Hero */}
      <section className="bg-bersama-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-bold">{t('title')}</h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 w-full">
        {/* What is bersama.io */}
        <section>
          <h2 className="text-2xl font-display font-bold text-bersama-blue mb-4">
            {t('whatWeAre')}
          </h2>
          <p className="text-gray-700 leading-relaxed">{t('whatWeAreText')}</p>

          {/* Important disclaimer box */}
          <div className="mt-6 bg-bersama-yellow/20 border-l-4 border-bersama-yellow rounded-r-lg p-4">
            <p className="text-sm font-semibold text-bersama-blue">{t('disclaimerBox')}</p>
          </div>
        </section>

        {/* Rafizi Ramli */}
        <section className="border-t border-gray-100 pt-10">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0 w-20 h-20 rounded-full bg-bersama-blue/10 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-bersama-blue">RR</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-bersama-blue">
                {t('rafizi.name')}
              </h2>
              <p className="text-sm font-medium text-bersama-yellow-dark text-gray-500 mb-3">
                {t('rafizi.role')}
              </p>
              <p className="text-gray-700 leading-relaxed">{t('rafizi.bio')}</p>
            </div>
          </div>
        </section>

        {/* Nik Nazmi */}
        <section className="border-t border-gray-100 pt-10">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0 w-20 h-20 rounded-full bg-bersama-blue/10 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-bersama-blue">NN</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-bersama-blue">
                {t('nikNazmi.name')}
              </h2>
              <p className="text-sm font-medium text-gray-500 mb-3">{t('nikNazmi.role')}</p>
              <p className="text-gray-700 leading-relaxed">{t('nikNazmi.bio')}</p>
            </div>
          </div>
        </section>

        {/* Share */}
        <section className="border-t border-gray-100 pt-10 flex items-center gap-4">
          <span className="text-sm text-gray-600">{t('shareLabel')}:</span>
          <WhatsAppShareButton title={t('title')} url={pageUrl} />
        </section>
      </div>
    </main>
  )
}
