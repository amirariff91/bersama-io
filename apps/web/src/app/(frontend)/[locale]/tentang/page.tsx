import { getTranslations, setRequestLocale } from 'next-intl/server'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'
import { PageHeader } from '@/components/layout/PageHeader'

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

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'
  const pageUrl = `${serverUrl}/${locale}/tentang`

  const people = [
    { initials: 'RR', name: t('rafizi.name'), role: t('rafizi.role'), bio: t('rafizi.bio') },
    { initials: 'NN', name: t('nikNazmi.name'), role: t('nikNazmi.role'), bio: t('nikNazmi.bio') },
  ]

  return (
    <>
      <PageHeader
        kicker={locale === 'ms' ? 'Tentang Kami' : 'About Us'}
        title={t('title')}
      />

      <div className="container-content max-w-3xl py-12">
        {/* What is bersama.io */}
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            {t('whatWeAre')}
          </h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{t('whatWeAreText')}</p>

          <div className="mt-6 border-l-2 border-bersama-yellow bg-paper-dim p-4">
            <p className="text-sm font-semibold text-ink">{t('disclaimerBox')}</p>
          </div>
        </section>

        {/* Leadership */}
        {people.map((person) => (
          <section key={person.initials} className="mt-10 border-t border-rule pt-10">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-ink bg-paper-dim">
                <span className="font-display text-2xl font-black text-bersama-blue">
                  {person.initials}
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                  {person.name}
                </h2>
                <p className="kicker-muted mt-1">{person.role}</p>
                <p className="mt-3 leading-relaxed text-ink-muted">{person.bio}</p>
              </div>
            </div>
          </section>
        ))}

        {/* Share */}
        <section className="mt-10 flex items-center gap-4 border-t border-rule pt-10">
          <span className="text-sm text-ink-muted">{t('shareLabel')}:</span>
          <WhatsAppShareButton title={t('title')} url={pageUrl} />
        </section>
      </div>
    </>
  )
}
