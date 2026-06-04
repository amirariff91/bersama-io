import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LiveBlog } from './liveblog'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('johor')
  return {
    title: `${t('heroHeading')} — bersama.io`,
    description: t('heroSubheading'),
  }
}

export default async function JohorPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('johor')
  const tCommon = await getTranslations('common')
  const isMs = locale === 'ms'

  const seats = [
    { name: 'Pulai Sebatang', status: isMs ? 'Sasaran' : 'Target', incumbent: 'BN' },
    { name: 'Skudai', status: isMs ? 'Sasaran' : 'Target', incumbent: 'PKR' },
    { name: 'Johor Jaya', status: isMs ? 'Pertahan' : 'Hold', incumbent: 'Bersama' },
    { name: 'Permas', status: isMs ? 'Sasaran' : 'Target', incumbent: 'BN' },
    { name: 'Kempas', status: isMs ? 'Pantau' : 'Watch', incumbent: 'BN' },
    { name: 'Mengkibol', status: isMs ? 'Sasaran' : 'Target', incumbent: 'MCA' },
  ]

  // Full literal class strings (purge-safe lookup).
  const statusColour: Record<string, string> = {
    Sasaran: 'border border-bersama-blue text-bersama-blue',
    Target: 'border border-bersama-blue text-bersama-blue',
    Pertahan: 'bg-bersama-blue text-paper',
    Hold: 'bg-bersama-blue text-paper',
    Pantau: 'border border-bersama-red text-bersama-red',
    Watch: 'border border-bersama-red text-bersama-red',
  }

  return (
    <>
      {/* Header — live, dark band */}
      <header className="border-b-2 border-ink bg-ink text-paper">
        <div className="container-content py-12">
          <span className="tag-live">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            {tCommon('live')}
          </span>
          <h1 className="mt-4 text-balance font-display text-headline font-black tracking-tight text-paper">
            {t('heroHeading')}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-deck text-paper/75">
            {t('heroSubheading')}
          </p>
          <p className="mt-5 max-w-2xl border-t border-white/15 pt-4 text-xs leading-relaxed text-paper/60">
            {t('disclaimer')}
          </p>
        </div>
      </header>

      <div className="container-content max-w-4xl space-y-12 py-12">
        {/* Live blog */}
        <section>
          <h2 className="kicker-live">{t('liveBlogTitle')}</h2>
          <div className="mt-4">
            <LiveBlog locale={locale} />
          </div>
        </section>

        {/* Key seats */}
        <section className="border-t-2 border-ink pt-10">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">
            {t('keySeatsTitle')}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seats.map((seat) => (
              <div key={seat.name} className="border-t border-rule pt-4">
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  {seat.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 font-display text-kicker font-semibold uppercase tracking-[0.1em] ${
                      statusColour[seat.status] ?? 'border border-rule text-ink-muted'
                    }`}
                  >
                    {seat.status}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {t('incumbentLabel')}: {seat.incumbent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
