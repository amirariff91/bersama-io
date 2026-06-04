import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Dateline } from './Dateline'

export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations('nav')
  const tCommon = await getTranslations('common')

  const links = [
    { href: `/${locale}/berita`, label: t('news') },
    { href: `/${locale}/agenda`, label: t('agenda') },
    { href: `/${locale}/johor`, label: t('johor') },
    { href: `/${locale}/pendirian`, label: t('positions') },
    { href: `/${locale}/tentang`, label: t('about') },
  ]

  return (
    <header className="bg-paper">
      {/* Masthead band */}
      <div className="container-content">
        <div className="flex items-end justify-between gap-4 py-5 sm:py-6">
          <Link href={`/${locale}`} className="group shrink-0">
            <span className="block font-display font-black tracking-tight text-3xl sm:text-4xl text-ink leading-none">
              bersama<span className="text-bersama-blue">.io</span>
            </span>
            <span className="kicker-muted mt-2 block">{tCommon('tagline')}</span>
          </Link>
          <div className="hidden sm:flex flex-col items-end gap-2 text-right">
            <Dateline locale={locale} />
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* Section navigation — sticky, masthead rule above */}
      <nav className="sticky top-0 z-50 border-y-2 border-ink bg-paper/95 backdrop-blur">
        <div className="container-content">
          <div className="flex items-center gap-5 sm:gap-7 h-11 overflow-x-auto scrollbar-hide">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="kicker text-ink-muted hover:text-bersama-blue whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-auto sm:hidden">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
