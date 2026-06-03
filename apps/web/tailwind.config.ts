import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bersama-blue': '#082448',
        'bersama-blue-light': '#1a3d6b',
        'bersama-yellow': '#E6D44A',
        'bersama-yellow-light': '#F2E87A',
        'editorial-dark': '#111827',
        'editorial-mid': '#374151',
        'editorial-light': '#F9FAFB',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
