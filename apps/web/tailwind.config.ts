import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand accents — used as rules, kickers, labels (NOT large fills)
        'bersama-blue': '#082448',
        'bersama-blue-light': '#1a3d6b',
        'bersama-yellow': '#E6D44A',
        'bersama-yellow-light': '#F2E87A',
        // Editorial red — reserved strictly for live / breaking / urgency
        'bersama-red': '#C8102E',
        // Ink-on-paper base
        paper: '#FAF8F3',
        'paper-dim': '#F1EDE4',
        ink: '#1A1A1A',
        'ink-muted': '#5A5751',
        'ink-faint': '#8A867E',
        rule: '#E2DCD0',
        // Legacy editorial tokens (kept for existing references)
        'editorial-dark': '#111827',
        'editorial-mid': '#374151',
        'editorial-light': '#F9FAFB',
      },
      fontFamily: {
        // next/font ↔ Tailwind bridge (vars defined in app/fonts.ts)
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Editorial hierarchy — fluid where it carries the masthead/lead
        kicker: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.14em' }],
        byline: ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        deck: ['clamp(1.05rem, 1.6vw, 1.3rem)', { lineHeight: '1.45' }],
        headline: ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        lead: ['clamp(2.25rem, 6vw, 4rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
      },
      maxWidth: {
        content: '1200px',
        article: '680px',
      },
    },
  },
  plugins: [],
}

export default config
