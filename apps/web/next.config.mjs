import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Monorepo: trace files from the repo root so the standalone bundle is complete
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Payload's GraphQL/REST routes require these at runtime but Next's file
  // tracing misses them (dynamic require) — force them into the standalone bundle.
  outputFileTracingIncludes: {
    '/**': ['../../node_modules/undici/**/*'],
  },
  // Keep Payload's heavy deps external (resolved from node_modules at runtime,
  // and thus traced into the standalone output) rather than webpack-bundled.
  serverExternalPackages: ['undici'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.bersama.io',
      },
    ],
  },
}

export default withNextIntl(withPayload(nextConfig))
