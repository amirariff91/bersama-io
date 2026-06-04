import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const tCommon = await getTranslations('common')

  const sections = [
    { href: `/${locale}/berita`, label: tNav('news') },
    { href: `/${locale}/agenda`, label: tNav('agenda') },
    { href: `/${locale}/johor`, label: tNav('johor') },
    { href: `/${locale}/pendirian`, label: tNav('positions') },
    { href: `/${locale}/tentang`, label: tNav('about') },
  ]

  return (
    <footer className="mt-20 bg-paper">
      <div className="border-t-2 border-ink">
        <div className="container-content py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            {/* Masthead / statement */}
            <div className="md:col-span-5">
              <span className="block font-display font-black text-2xl tracking-tight text-ink">
                bersama<span className="text-bersama-blue">.io</span>
              </span>
              <p className="kicker-muted mt-2">{tCommon('tagline')}</p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
                {t('unofficial')}
              </p>
            </div>

            {/* Sections */}
            <nav className="md:col-span-3" aria-label={t('sectionsLabel')}>
              <h2 className="kicker text-ink-muted">{t('sectionsLabel')}</h2>
              <ul className="mt-4 space-y-2.5">
                {sections.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="text-sm text-ink hover:text-bersama-blue"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Links */}
            <nav className="md:col-span-4" aria-label={t('linksLabel')}>
              <h2 className="kicker text-ink-muted">{t('linksLabel')}</h2>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href={`/${locale}/privasi`}
                    className="text-sm text-ink hover:text-bersama-blue"
                  >
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://bersama.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink hover:text-bersama-blue"
                  >
                    {t('officialSite')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/bersamaio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink hover:text-bersama-blue"
                  >
                    Telegram
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Baseline */}
          <div className="rule-hairline mt-10 pt-6">
            <p className="text-xs text-ink-muted">{t('editor')}</p>
            <p className="mt-1 text-xs text-ink-faint">
              &copy; {new Date().getFullYear()} bersama.io. {t('rights')}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
