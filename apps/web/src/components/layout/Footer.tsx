import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer')

  return (
    <footer className="bg-bersama-blue text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-bersama-yellow font-display font-bold text-lg">
              bersama.io
            </span>
            <p className="text-sm text-gray-300 mt-2">{t('unofficial')}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">Pautan / Links</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <Link
                href={`/${locale}/privasi`}
                className="hover:text-bersama-yellow transition-colors"
              >
                {t('privacy')}
              </Link>
              <a
                href="https://bersama.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bersama-yellow transition-colors"
              >
                bersama.org (Laman Rasmi)
              </a>
              <a
                href="https://t.me/bersamaio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bersama-yellow transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>

          {/* Copyright + disclaimer */}
          <div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} bersama.io. {t('rights')}.
            </p>
            <p className="text-xs text-gray-400 mt-2">{t('unofficial')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
