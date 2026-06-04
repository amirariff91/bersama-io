'use client'

import { useEffect, useState } from 'react'

/**
 * Masthead dateline. Rendered client-side so the date is always current
 * (the layout is statically rendered per-locale, so a server date would bake
 * at build time). Renders nothing until mounted to avoid hydration mismatch.
 */
export function Dateline({ locale }: { locale: string }) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    const date = new Intl.DateTimeFormat(locale === 'ms' ? 'ms-MY' : 'en-MY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kuala_Lumpur',
    }).format(new Date())
    const edition = locale === 'ms' ? 'Edisi BM' : 'EN Edition'
    setLabel(`${date} · ${edition}`)
  }, [locale])

  return (
    <span className="dateline" suppressHydrationWarning>
      {label ?? ' '}
    </span>
  )
}
