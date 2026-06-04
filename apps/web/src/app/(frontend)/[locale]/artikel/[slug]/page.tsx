import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/metadata'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'
import { formatDate } from '@/lib/format'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    locale: locale as 'ms' | 'en',
    limit: 1,
  })
  const article = docs[0]
  if (!article) return {}
  return buildMetadata({
    title: String(article.title),
    description: String(article.excerpt || ''),
    locale: locale as 'ms' | 'en',
    slug: `artikel/${article.slug}`,
    type: 'article',
    publishedAt: article.publishedAt?.toString(),
    author: String(article.author),
  })
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    locale: locale as 'ms' | 'en',
    limit: 1,
  })
  const article = docs[0]
  if (!article) notFound()

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/${locale}/artikel/${article.slug}`
  const byline = locale === 'ms' ? 'Oleh' : 'By'

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: String(article.title),
            description: String(article.excerpt || ''),
            author: [{ '@type': 'Person', name: String(article.author) }],
            publisher: {
              '@type': 'Organization',
              name: 'bersama.io',
              url: 'https://bersama.io',
            },
            datePublished: article.publishedAt ? String(article.publishedAt) : new Date().toISOString(),
            dateModified: article.publishedAt ? String(article.publishedAt) : new Date().toISOString(),
            url: url,
            isAccessibleForFree: true,
            inLanguage: locale === 'ms' ? 'ms-MY' : 'en-MY',
          }),
        }}
      />

      {/* Header */}
      <header className="border-b-2 border-ink bg-paper">
        <div className="container-content max-w-article py-10">
          <p className="kicker">{String(article.category)}</p>
          <h1 className="mt-3 text-balance font-display text-headline font-black tracking-tight text-ink">
            {String(article.title)}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-byline text-ink-muted">
            <span className="font-display font-semibold text-ink">
              {byline} {String(article.author)}
            </span>
            {article.publishedAt ? (
              <>
                <span className="text-ink-faint" aria-hidden="true">
                  ·
                </span>
                <time dateTime={String(article.publishedAt)}>
                  {formatDate(String(article.publishedAt), locale)}
                </time>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container-content max-w-article py-10">
        {/* Rich text rendering — Payload lexical serializer in Phase 2 */}
        <div className="article-body">
          <p className="dropcap">{String(article.excerpt)}</p>
        </div>
        <div className="mt-8 border-t border-rule pt-6">
          <WhatsAppShareButton title={String(article.title)} url={url} />
        </div>
      </div>
    </article>
  )
}
