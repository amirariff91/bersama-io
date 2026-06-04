import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { agendaItems } from '@/data/agenda-seed'
import { buildMetadata } from '@/lib/metadata'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const locales = ['ms', 'en']
  return locales.flatMap((locale) =>
    agendaItems.map((item) => ({ locale, slug: item.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const item = agendaItems.find((a) => a.slug === slug)
  if (!item) return {}
  const isMs = locale === 'ms'
  return buildMetadata({
    title: isMs ? item.titleMs : item.titleEn,
    description: isMs ? item.summaryMs : item.summaryEn,
    locale: isMs ? 'ms' : 'en',
    slug: `agenda/${slug}`,
    type: 'article',
  })
}

export default async function AgendaItemPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const item = agendaItems.find((a) => a.slug === slug)
  if (!item) notFound()

  const isMs = locale === 'ms'
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'
  const pageUrl = `${serverUrl}/${locale}/agenda/${slug}`
  const title = isMs ? item.titleMs : item.titleEn
  const summary = isMs ? item.summaryMs : item.summaryEn
  const prev = item.number > 1 ? agendaItems.find((a) => a.number === item.number - 1) : undefined
  const next = item.number < 12 ? agendaItems.find((a) => a.number === item.number + 1) : undefined

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-rule bg-paper">
        <nav
          className="container-content flex items-center gap-2 py-3 text-xs text-ink-faint"
          aria-label="Breadcrumb"
        >
          <Link href={`/${locale}`} className="hover:text-bersama-blue">
            {isMs ? 'Utama' : 'Home'}
          </Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${locale}/agenda`} className="hover:text-bersama-blue">
            {isMs ? 'Agenda' : 'Agenda'}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="max-w-xs truncate font-medium text-ink">{title}</span>
        </nav>
      </div>

      {/* Header */}
      <header className="border-b-2 border-ink bg-paper">
        <div className="container-content max-w-3xl py-10">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-5xl font-black leading-none text-bersama-blue tabular-nums">
              {String(item.number).padStart(2, '0')}
            </span>
            <p className="kicker pt-2">{isMs ? `Agenda ${item.number} / 12` : `Agenda ${item.number} of 12`}</p>
          </div>
          <h1 className="mt-4 text-balance font-display text-headline font-black tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-3 text-pretty text-deck text-ink-muted">{summary}</p>
        </div>
      </header>

      {/* Content */}
      <div className="container-content max-w-3xl py-10">
        <section>
          <h2 className="kicker">{isMs ? 'Huraian Penuh' : 'Full Explanation'}</h2>
          <div className="article-body mt-4">
            <p className="italic text-ink-faint">
              {isMs
                ? 'Kandungan terperinci akan ditambah tidak lama lagi. Semak kembali untuk kemas kini.'
                : 'Detailed content will be added soon. Check back for updates.'}
            </p>
          </div>
        </section>

        {/* Share */}
        <section className="mt-8 flex items-center gap-4 border-t border-rule pt-6">
          <span className="text-sm text-ink-muted">
            {isMs ? 'Kongsi agenda ini' : 'Share this agenda'}:
          </span>
          <WhatsAppShareButton title={title} url={pageUrl} />
        </section>

        {/* Prev / Next */}
        <nav className="mt-8 flex items-stretch justify-between gap-4 border-t border-rule pt-6">
          {prev ? (
            <Link href={`/${locale}/agenda/${prev.slug}`} className="group max-w-[45%]">
              <span className="kicker-muted">← {isMs ? 'Sebelum' : 'Previous'}</span>
              <span className="story-headline mt-1 block text-sm font-bold">
                {isMs ? prev.titleMs : prev.titleEn}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/${locale}/agenda/${next.slug}`} className="group ml-auto max-w-[45%] text-right">
              <span className="kicker-muted">{isMs ? 'Seterusnya' : 'Next'} →</span>
              <span className="story-headline mt-1 block text-sm font-bold">
                {isMs ? next.titleMs : next.titleEn}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {/* Related news — placeholder */}
        <section className="mt-8 border-t border-rule pt-6">
          <h2 className="kicker">{isMs ? 'Berita Berkaitan' : 'Related News'}</h2>
          <p className="mt-3 text-sm italic text-ink-faint">
            {isMs
              ? 'Berita berkaitan akan muncul di sini tidak lama lagi.'
              : 'Related news will appear here soon.'}
          </p>
        </section>
      </div>
    </>
  )
}
