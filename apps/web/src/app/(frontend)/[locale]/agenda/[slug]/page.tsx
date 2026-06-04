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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3 px-4">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${locale}`} className="hover:text-bersama-blue">
              {isMs ? 'Utama' : 'Home'}
            </Link>
            <span>›</span>
            <Link href={`/${locale}/agenda`} className="hover:text-bersama-blue">
              {isMs ? 'Agenda' : 'Agenda'}
            </Link>
            <span>›</span>
            <span className="text-editorial-dark font-medium truncate max-w-xs">{title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-bersama-blue text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-bersama-yellow text-editorial-dark text-xs font-bold px-3 py-1 rounded-full">
              {isMs ? `Agenda #${item.number}` : `Agenda #${item.number}`}
            </span>
          </div>
          <div className="text-5xl mb-4">{item.icon}</div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{title}</h1>
          <p className="text-blue-100 text-lg leading-relaxed">{summary}</p>
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

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-editorial-dark mb-4">
            {isMs ? 'Huraian Penuh' : 'Full Explanation'}
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <p className="text-gray-500 italic">
              {isMs
                ? 'Kandungan terperinci akan ditambah tidak lama lagi. Semak kembali untuk kemas kini.'
                : 'Detailed content will be added soon. Check back for updates.'}
            </p>
          </div>
        </div>

        {/* Navigation between agenda items */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {item.number > 1 && (() => {
            const prev = agendaItems.find((a) => a.number === item.number - 1)
            return prev ? (
              <Link
                href={`/${locale}/agenda/${prev.slug}`}
                className="flex items-center gap-2 text-bersama-blue text-sm hover:underline"
              >
                ← {isMs ? prev.titleMs : prev.titleEn}
              </Link>
            ) : null
          })()}
          {item.number < 12 && (() => {
            const next = agendaItems.find((a) => a.number === item.number + 1)
            return next ? (
              <Link
                href={`/${locale}/agenda/${next.slug}`}
                className="flex items-center gap-2 text-bersama-blue text-sm hover:underline ml-auto"
              >
                {isMs ? next.titleMs : next.titleEn} →
              </Link>
            ) : null
          })()}
        </div>

        {/* Share */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-editorial-dark mb-3">
            {isMs ? 'Kongsi agenda ini' : 'Share this agenda'}
          </h3>
          <WhatsAppShareButton title={title} url={pageUrl} />
        </div>

        {/* Related news — placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-editorial-dark mb-3">
            {isMs ? 'Berita Berkaitan' : 'Related News'}
          </h3>
          <p className="text-gray-500 text-sm italic">
            {isMs
              ? 'Berita berkaitan akan muncul di sini tidak lama lagi.'
              : 'Related news will appear here soon.'}
          </p>
        </div>
      </div>
    </main>
  )
}
