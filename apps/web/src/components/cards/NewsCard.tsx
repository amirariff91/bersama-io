import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

interface NewsCardProps {
  title: string
  excerpt: string // Max 2 sentences — copyright compliant
  sourceUrl: string
  sourceName: string
  publishedAt: string
  locale: string
}

export function NewsCard({ title, excerpt, sourceUrl, sourceName, publishedAt, locale }: NewsCardProps) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 hover:border-bersama-blue hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-bersama-blue bg-bersama-blue/10 px-2 py-0.5 rounded">{sourceName}</span>
        <time className="text-xs text-gray-400" dateTime={publishedAt}>
          {new Date(publishedAt).toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
        </time>
      </div>
      <h3 className="font-semibold text-editorial-dark text-sm leading-snug mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{excerpt}</p>
      <div className="flex items-center gap-3">
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-bersama-blue text-xs font-medium hover:underline">
          Baca di {sourceName} →
        </a>
        <WhatsAppShareButton title={title} url={sourceUrl} className="text-xs" />
      </div>
    </article>
  )
}
