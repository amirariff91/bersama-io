import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Articles } from './collections/Articles'
import { AgendaItems } from './collections/AgendaItems'
import { Events } from './collections/Events'
import { NewsItems } from './collections/NewsItems'
import { LiveBlogPosts } from './collections/LiveBlogPosts'
import { Members } from './collections/Members'
import { Positions } from './collections/Positions'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // CRITICAL: localization must be defined or localized:true fields silently return empty
  localization: {
    locales: [
      { label: 'Bahasa Malaysia', code: 'ms' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ms',
    fallback: true,
  },
  collections: [
    Users,
    Articles,
    AgendaItems,
    Events,
    NewsItems,
    LiveBlogPosts,
    Members,
    Positions,
    Media,
    Pages,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? (() => { throw new Error('PAYLOAD_SECRET env var is required') })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL env var is required') })(),
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.R2_BUCKET_NAME || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        // NEVER set ACL: Cloudflare R2 does not support S3 ACLs — use R2 bucket public access setting
      },
    }),
  ],
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
