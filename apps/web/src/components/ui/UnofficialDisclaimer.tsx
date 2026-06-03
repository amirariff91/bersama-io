// Server component — simple rendered strip, no client JS needed
interface Props {
  locale?: string
}

export function UnofficialDisclaimer({ locale }: Props) {
  const isBM = !locale || locale === 'ms'
  const text = isBM
    ? 'bersama.io adalah platform penyokong TIDAK RASMI. Kami tidak berkaitan dengan Parti Bersama Malaysia.'
    : 'bersama.io is an UNOFFICIAL supporter platform. We are not affiliated with Parti Bersama Malaysia.'

  return (
    <div className="bg-bersama-yellow text-bersama-blue text-xs text-center py-2 px-4 font-medium">
      {text}
    </div>
  )
}
