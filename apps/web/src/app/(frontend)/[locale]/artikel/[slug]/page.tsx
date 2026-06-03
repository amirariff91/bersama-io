import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

interface Props {
  params: { locale: string; slug: string }
}

export async function generateMetadata({ params }: Props) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: params.slug }, status: { equals: 'published' } },
    locale: params.locale as 'ms' | 'en',
    limit: 1,
  })
  const article = docs[0]
  if (!article) return {}
  return buildMetadata({
    title: String(article.title),
    description: String(article.excerpt || ''),
    locale: params.locale as 'ms' | 'en',
    slug: `artikel/${article.slug}`,
    type: 'article',
    publishedAt: article.publishedAt?.toString(),
    author: String(article.author),
  })
}

export default async function ArticlePage({ params }: Props) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: params.slug }, status: { equals: 'published' } },
    locale: params.locale as 'ms' | 'en',
    limit: 1,
  })
  const article = docs[0]
  if (!article) notFound()

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/${params.locale}/artikel/${article.slug}`

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-6">
        <span className="text-xs font-medium text-bersama-blue bg-bersama-blue/10 px-2 py-0.5 rounded">
          {String(article.category)}
        </span>
        <time className="text-xs text-gray-400 ml-3">
          {article.publishedAt ? new Date(String(article.publishedAt)).toLocaleDateString() : ''}
        </time>
      </div>
      <h1 className="text-3xl font-bold text-editorial-dark mb-4">{String(article.title)}</h1>
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
            inLanguage: params.locale === 'ms' ? 'ms-MY' : 'en-MY',
          }),
        }}
      />
      <p className="text-gray-500 text-sm mb-2">Oleh / By: {String(article.author)}</p>
      <div className="prose max-w-none mt-8">
        {/* Rich text rendering — Payload lexical serializer in Phase 2 */}
        <p className="text-gray-600">{String(article.excerpt)}</p>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100">
        <WhatsAppShareButton title={String(article.title)} url={url} />
      </div>
    </main>
  )
}
