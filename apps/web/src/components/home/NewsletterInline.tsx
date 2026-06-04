import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { NewsletterForm } from '@/components/forms/NewsletterForm'

/**
 * In-context conversion unit woven into the editorial flow: newsletter capture
 * beside the Supporter ID card loop. Not a full-width marketing CTA band.
 */
export async function NewsletterInline({ locale }: { locale: string }) {
  const t = await getTranslations('subscribe')
  const tHome = await getTranslations('home')
  const tNav = await getTranslations('nav')

  return (
    <section className="border-t-2 border-ink bg-paper">
      <div className="container-content py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Newsletter */}
          <div className="lg:border-r lg:border-rule lg:pr-10">
            <p className="kicker">{tNav('subscribe')}</p>
            <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-ink">
              {t('sectionTitle')}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">{t('sectionSubtitle')}</p>
            <div className="mt-5 max-w-md">
              <NewsletterForm />
            </div>
          </div>

          {/* Supporter ID card loop */}
          <div>
            <p className="kicker">{tHome('idCardKicker')}</p>
            <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-ink">
              {tHome('idCardTitle')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-muted">{tHome('idCardText')}</p>
            <Link href={`/${locale}/kad`} className="btn-accent mt-5">
              {tHome('idCardCta')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
