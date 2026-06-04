import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: deliberately NOT using `output: 'standalone'`. Payload's admin/GraphQL
  // routes dynamically require packages (undici, ws, ajv, …) that Next's file
  // tracing misses, which crashes a standalone server at runtime. We ship the
  // full node_modules and run `next start` instead — reliable on a non-serverless
  // host (Hetzner/Coolify) where image size is not a hard constraint.
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
