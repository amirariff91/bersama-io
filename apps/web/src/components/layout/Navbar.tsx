import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LocaleSwitcher } from './LocaleSwitcher'

export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations('nav')

  const links = [
    { href: `/${locale}/berita`, label: t('news') },
    { href: `/${locale}/agenda`, label: t('agenda') },
    { href: `/${locale}/johor`, label: t('johor') },
    { href: `/${locale}/pendirian`, label: t('positions') },
    { href: `/${locale}/tentang`, label: t('about') },
  ]

  return (
    <nav className="bg-bersama-blue text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <span className="text-bersama-yellow font-display font-bold text-xl tracking-tight">
              bersama.io
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm hover:text-bersama-yellow transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <LocaleSwitcher />
        </div>
      </div>
    </nav>
  )
}
