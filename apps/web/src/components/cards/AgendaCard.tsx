import Link from 'next/link'
import { WhatsAppShareButton } from '@/components/ui/WhatsAppShareButton'

interface AgendaCardProps {
  number: number
  slug: string
  icon: string
  title: string
  summary: string
  locale: string
  serverUrl: string
}

export function AgendaCard({ number, slug, icon, title, summary, locale, serverUrl }: AgendaCardProps) {
  const url = `${serverUrl}/${locale}/agenda/${slug}`
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-bersama-blue hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-bersama-blue text-bersama-yellow rounded-full flex items-center justify-center font-bold text-sm">
          {number}
        </div>
        <div className="flex-1">
          <div className="text-2xl mb-2">{icon}</div>
          <h3 className="font-semibold text-editorial-dark text-sm mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
          <div className="flex items-center gap-3 mt-4">
            <Link href={`/${locale}/agenda/${slug}`} className="text-bersama-blue text-sm font-medium hover:underline">
              Baca selanjutnya →
            </Link>
            <WhatsAppShareButton title={title} url={url} />
          </div>
        </div>
      </div>
    </div>
  )
}
