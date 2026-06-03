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

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchLocale('ms')}
        aria-label="Tukar ke Bahasa Malaysia"
        className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
          currentLocale === 'ms'
            ? 'bg-bersama-yellow text-bersama-blue'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        BM
      </button>
      <button
        onClick={() => switchLocale('en')}
        aria-label="Switch to English"
        className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
          currentLocale === 'en'
            ? 'bg-bersama-yellow text-bersama-blue'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  )
}

export default LocaleSwitcher
