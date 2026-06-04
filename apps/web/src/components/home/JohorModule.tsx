import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

/**
 * Johor election module — the current forcing function. A contained dark band
 * with a red live marker, distinct from the news flow.
 */
export async function JohorModule({ locale }: { locale: string }) {
  const t = await getTranslations('johor')
  const tCommon = await getTranslations('common')

  return (
    <section className="bg-ink text-paper">
      <div className="container-content py-12">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="tag-live">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              {tCommon('live')}
            </span>
            <h2 className="mt-4 font-display text-headline font-black tracking-tight text-paper">
              {t('heroHeading')}
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-deck text-paper/75">
              {t('heroSubheading')}
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              href={`/${locale}/johor`}
              className="inline-flex items-center gap-2 bg-bersama-yellow px-5 py-2.5 font-display font-bold text-bersama-blue transition-colors hover:bg-bersama-yellow-light"
            >
              {t('cta')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
