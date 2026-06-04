// Server component — rendered strip, no client JS needed.
interface Props {
  locale?: string
}

export function UnofficialDisclaimer({ locale }: Props) {
  const isBM = !locale || locale === 'ms'
  const tag = isBM ? 'Tidak Rasmi' : 'Unofficial'
  const text = isBM
    ? 'Platform penyokong bebas. Kami tidak berkaitan dengan Parti Bersama Malaysia.'
    : 'An independent supporter platform. Not affiliated with Parti Bersama Malaysia.'

  return (
    <div className="bg-ink text-paper">
      <div className="container-content flex items-center justify-center gap-2.5 py-1.5 text-center">
        <span className="bg-bersama-yellow text-bersama-blue font-display font-bold uppercase text-kicker tracking-[0.1em] px-1.5 py-0.5">
          {tag}
        </span>
        <span className="text-[0.72rem] sm:text-xs text-paper/85">{text}</span>
      </div>
    </div>
  )
}
