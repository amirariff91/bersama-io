import { withPayload } from '@payloadcms/next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.bersama.io',
      },
    ],
  },
  experimental: {
    reactCompiler: false,
  },
}

export default withNextIntl(withPayload(nextConfig))
