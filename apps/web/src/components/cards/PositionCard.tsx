interface PositionCardProps {
  id: string
  issueTitle: string
  positionSummary: string
  evidenceType: string
  evidenceUrl: string
  date: string
  locale: string
}

export function PositionCard({ id: _id, issueTitle, positionSummary, evidenceType, evidenceUrl, date, locale }: PositionCardProps) {
  const evidenceLabels: Record<string, string> = {
    statement: locale === 'ms' ? 'Kenyataan Rasmi' : 'Official Statement',
    hansard: 'Hansard',
    'press-release': locale === 'ms' ? 'Kenyataan Media' : 'Press Release',
    social: locale === 'ms' ? 'Media Sosial' : 'Social Media',
    interview: locale === 'ms' ? 'Temu Bual' : 'Interview',
  }
  return (
    <article className="bg-white border-l-4 border-bersama-yellow rounded-r-xl p-5 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium bg-bersama-yellow/20 text-editorial-dark px-2 py-0.5 rounded">
          {evidenceLabels[evidenceType] ?? evidenceType}
        </span>
        <time className="text-xs text-gray-400">{new Date(date).toLocaleDateString()}</time>
      </div>
      <h3 className="font-semibold text-editorial-dark mb-2">{issueTitle}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">{positionSummary}</p>
      <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-bersama-blue text-xs hover:underline">
        Lihat sumber →
      </a>
    </article>
  )
}
