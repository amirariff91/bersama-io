'use client'

import { usePathname, useRouter } from 'next/navigation'

export function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  // pathname is like /ms/berita/slug or /en/johor
  const segments = pathname.split('/')
  // segments[1] is the locale
  const currentLocale = segments[1] === 'en' ? 'en' : 'ms'

  function switchLocale(newLocale: string) {
    if (newLocale === currentLocale) return
    segments[1] = newLocale
    router.push(segments.join('/') || `/${newLocale}`)
  }

  const base =
    'px-2 py-0.5 font-display text-kicker uppercase tracking-[0.1em] font-semibold transition-colors'
  const active = 'bg-bersama-blue text-paper'
  const idle = 'text-ink-faint hover:text-ink'

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => switchLocale('ms')}
        aria-label="Tukar ke Bahasa Malaysia"
        aria-pressed={currentLocale === 'ms'}
        className={`${base} ${currentLocale === 'ms' ? active : idle}`}
      >
        BM
      </button>
      <span className="text-ink-faint" aria-hidden="true">
        /
      </span>
      <button
        onClick={() => switchLocale('en')}
        aria-label="Switch to English"
        aria-pressed={currentLocale === 'en'}
        className={`${base} ${currentLocale === 'en' ? active : idle}`}
      >
        EN
      </button>
    </div>
  )
}

export default LocaleSwitcher
