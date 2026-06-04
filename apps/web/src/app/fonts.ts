import { Archivo, Inter } from 'next/font/google'

/**
 * Self-hosted fonts (next/font auto-downloads + serves from /_next/static/media).
 * No external Google Fonts CDN request, no layout shift.
 *
 * - Archivo  → display/masthead/headlines (modern neo-grotesque)
 * - Inter    → body / humanist sans
 *
 * `latin-ext` is included so Malay loanwords and EN proper nouns render correctly.
 * Exposed to Tailwind via CSS variables (see tailwind.config.ts fontFamily).
 *
 * NOTE: import this only from server/shared modules (the locale layout) — never
 * from a "use client" component.
 */
export const fontSans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontDisplay = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})
