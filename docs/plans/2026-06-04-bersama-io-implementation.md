# bersama.io — Master Implementation Plan
**Date:** 2026-06-04
**Status:** ACTIVE — Phase 1 URGENT (Johor election within 60 days)
**Goal:** Ship a bilingual (BM/EN) unofficial supporter platform for Parti Bersama Malaysia, live before Johor state election polling day.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [PRD — User Flows](#prd--user-flows)
4. [Phase 1 — Launch (Week 1–3)](#phase-1--launch-week-13)
   - [1.1 Monorepo Scaffold](#11-monorepo-scaffold)
   - [1.2 Next.js + Payload CMS Setup](#12-nextjs--payload-cms-setup)
   - [1.3 Neon DB Connection](#13-neon-db-connection)
   - [1.4 Cloudflare R2 Storage](#14-cloudflare-r2-storage)
   - [1.5 i18n with next-intl](#15-i18n-with-next-intl)
   - [1.6 Design System (Tailwind)](#16-design-system-tailwind)
   - [1.7 Homepage](#17-homepage)
   - [1.8 Party Info Hub](#18-party-info-hub)
   - [1.9 12-Point Agenda Pages](#19-12-point-agenda-pages)
   - [1.10 News Aggregator (RSS)](#110-news-aggregator-rss)
   - [1.11 Johor Election Hub](#111-johor-election-hub)
   - [1.12 Events Calendar](#112-events-calendar)
   - [1.13 SEO & Google News Compliance](#113-seo--google-news-compliance)
   - [1.14 PWA Setup](#114-pwa-setup)
   - [1.15 Email Signup (Resend)](#115-email-signup-resend)
   - [1.16 PDPA Privacy Policy Page](#116-pdpa-privacy-policy-page)
   - [1.17 Analytics (GA4 + Clarity)](#117-analytics-ga4--clarity)
   - [1.18 OneSignal Web Push](#118-onesignal-web-push)
   - [1.19 OG Images & Social Meta](#119-og-images--social-meta)
   - [1.20 Coolify Deployment](#120-coolify-deployment)
   - [1.21 Cloudflare DNS + Proxy](#121-cloudflare-dns--proxy)
5. [Phase 2 — Community (Month 2)](#phase-2--community-month-2)
6. [Phase 3 — Scale (Month 4–6)](#phase-3--scale-month-46)
7. [Legal Red Lines Reference](#legal-red-lines-reference)
8. [Launch Checklist](#launch-checklist)

---

## Architecture Overview

```
User Browser / Mobile App
        │
        ▼
Cloudflare CDN + WAF (DNS proxy, DDoS, edge caching)
        │
        ▼
Hetzner VPS (Singapore region)
  └── Coolify (self-hosted PaaS)
        ├── apps/web  (Next.js 14 + Payload CMS v3)
        │       └── Neon DB (serverless PostgreSQL via connection pooler)
        │       └── Cloudflare R2 (media/uploads)
        ├── Listmonk  (newsletter, self-hosted)
        └── (future) Redis cache sidecar

External SaaS:
  ├── Resend         (transactional email)
  ├── OneSignal      (web + mobile push)
  ├── GA4 + Clarity  (analytics)
  ├── Billplz        (payments, Phase 2)
  └── Printful       (merch fulfilment, Phase 2)

Expo Mobile App (Phase 2):
  └── hits apps/web API routes + Payload REST API
```

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Web framework | Next.js 14 App Router | Server components, streaming, edge |
| CMS | Payload CMS v3 | Native Next.js plugin, self-hosted |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS 3 | JIT, custom brand tokens |
| Database | Neon DB (PostgreSQL) | Serverless, connection pooling via @neondatabase/serverless |
| Storage | Cloudflare R2 | S3-compatible, free egress |
| CDN/DNS | Cloudflare | Proxied, WAF rules |
| Hosting | Hetzner + Coolify | Singapore region, Docker-based |
| Mobile | Expo SDK 51 (React Native) | iOS + Android |
| Shared UI | packages/ui | Tailwind web + NativeWind mobile |
| i18n | next-intl 3 | BM (ms) + English (en) |
| Email transactional | Resend | SDK + webhooks |
| Email newsletter | Listmonk | Self-hosted on Coolify |
| Push notifications | OneSignal | Web + mobile |
| Analytics | GA4 + Microsoft Clarity | via GTM or direct |
| Payments | Billplz | Phase 2 |
| Social ID cards | Satori + sharp | Server-side image gen → R2 |
| Monorepo | Turborepo | pnpm workspaces |
| RSS parsing | rss-parser | Cached, rate-limited |
| OG images | @vercel/og (ImageResponse) | Edge runtime |
| SEO | next-sitemap | news sitemap included |

---

## PRD — User Flows

### Anonymous Visitor (Phase 1)

```
Land on bersama.io (BM default)
  ├── Read tagline, hero section
  ├── Browse news aggregator → click → redirected to source
  ├── Browse 12-point agenda → read individual agenda page
  ├── Read About / Rafizi bio / Nik Nazmi bio
  ├── Check Johor election hub → live blog / results
  ├── Check events calendar
  ├── Sign up for email newsletter (name + email only)
  ├── Switch language EN ↔ BM (cookie + URL prefix /en/)
  └── Install PWA (prompt on mobile)
```

### News Aggregator Flow (legal-safe)
```
RSS fetch (15min cache, server-side)
  → parse: title, excerpt (2 sentences max), source, date, URL
  → tag by agenda item (manual CMS mapping OR keyword match)
  → display card: title + excerpt + source badge + "Baca lagi" link-out
  → NEVER store full article text
```

### Email Signup Flow
```
User submits name + email
  → API route /api/subscribe
  → server-side validation (no IC/NRIC fields, ever)
  → Resend: send welcome email
  → Listmonk: add to mailing list via API
  → Return success toast
  → Store record in Neon (email, name, created_at, consent_given=true, ip_hash)
```

### Johor Election Hub Flow
```
/johor-pilihan-raya  (ms) / /en/johor-election  (en)
  ├── Pre-election: candidate tracker, dates, polling district map
  ├── Results night: live blog (CMS-driven, Payload LiveBlog collection)
  │     └── CMS admin creates "LiveBlog Post" → appears in real-time
  │     └── Client polls /api/liveblog?after=timestamp every 30s
  └── Post-election: results summary, analysis articles
```

### CMS Admin Flow (editorial team)
```
/cms  (Payload admin panel, auth-gated)
  ├── Create/edit Articles, Pages, AgendaItems
  ├── Moderate news tags
  ├── Create LiveBlog posts during results night
  ├── Manage Events calendar
  └── Upload media → auto-stored to R2
```

---

## Phase 1 — Launch (Week 1–3)

> Each task is designed to be completable in 2–5 minutes with copy-paste commands.
> Tasks are ordered by dependency. Complete in sequence within each section.

---

### 1.1 Monorepo Scaffold

**Goal:** Create Turborepo monorepo with pnpm workspaces.

#### Task 1.1.1 — Init repo
```bash
mkdir -p /root/bersama-io && cd /root/bersama-io
git init
```

#### Task 1.1.2 — Create root package.json
File: `/root/bersama-io/package.json`
```json
{
  "name": "bersama-io",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@9.4.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0"
  }
}
```

#### Task 1.1.3 — Create pnpm workspace config
File: `/root/bersama-io/pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

#### Task 1.1.4 — Create turbo.json
File: `/root/bersama-io/turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "PAYLOAD_SECRET",
    "NEXT_PUBLIC_SERVER_URL",
    "CLOUDFLARE_R2_BUCKET",
    "CLOUDFLARE_R2_ENDPOINT",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
    "RESEND_API_KEY",
    "ONESIGNAL_APP_ID",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_CLARITY_ID",
    "LISTMONK_URL",
    "LISTMONK_API_KEY"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

#### Task 1.1.5 — Create CLAUDE.md
File: `/root/bersama-io/CLAUDE.md`
```markdown
# bersama.io — Claude Code Guide

## Project
Unofficial supporter platform for Parti Bersama Malaysia.
Tagline: Suara Penyokong, Bebas & Berani

## Monorepo
- `apps/web` — Next.js 14 + Payload CMS v3
- `apps/mobile` — Expo (Phase 2)
- `packages/ui` — Shared components
- `packages/types` — Shared TypeScript types
- `packages/api-client` — Payload API client

## Commands
- `pnpm dev` — Run all apps in dev mode
- `pnpm --filter web dev` — Run only web app
- `pnpm build` — Build all
- `pnpm lint` — Lint all

## Legal Red Lines (NEVER violate)
- NEVER collect IC/NRIC in any form
- NEVER store political affiliation without explicit PDPA consent
- News aggregator: headline + 2-sentence excerpt ONLY, always link out
- No 3R content (Race, Religion, Royalty)
- RSS cache: minimum 15 minutes

## Key Files
- `apps/web/src/payload.config.ts` — Payload CMS config
- `apps/web/src/collections/` — Payload collections
- `apps/web/src/app/[locale]/` — i18n routes
- `apps/web/messages/` — Translation strings (bm.json, en.json)

## Environment
See `.env.example` in apps/web for required vars.
```

#### Task 1.1.6 — Create .gitignore
File: `/root/bersama-io/.gitignore`
```
node_modules/
.next/
.turbo/
dist/
build/
*.env
*.env.local
.DS_Store
.pnpm-store/
```

#### Task 1.1.7 — Create package dirs
```bash
mkdir -p /root/bersama-io/apps/web
mkdir -p /root/bersama-io/apps/mobile
mkdir -p /root/bersama-io/packages/ui
mkdir -p /root/bersama-io/packages/types
mkdir -p /root/bersama-io/packages/api-client
```

#### Verification 1.1
```bash
cd /root/bersama-io
ls apps/ packages/
# Expected: apps/: mobile  web    packages/: api-client  types  ui
cat turbo.json | head -5
# Expected: {"$schema": ...}
```

---

### 1.2 Next.js + Payload CMS Setup

**Goal:** Create `apps/web` with Next.js 14 + Payload CMS v3 as native plugin.

#### Task 1.2.1 — Scaffold Next.js app
```bash
cd /root/bersama-io/apps/web
pnpm init
```

File: `/root/bersama-io/apps/web/package.json`
```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "generate:types": "payload generate:types"
  },
  "dependencies": {
    "@payloadcms/db-postgres": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/storage-s3": "^3.0.0",
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.30.0",
    "next": "14.2.3",
    "next-intl": "^3.14.0",
    "payload": "^3.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "rss-parser": "^3.13.0",
    "sharp": "^0.33.0",
    "resend": "^3.2.0",
    "@aws-sdk/client-s3": "^3.550.0",
    "next-sitemap": "^4.2.3",
    "next-pwa": "^5.6.0",
    "satori": "^0.10.13",
    "zod": "^3.23.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.3"
  }
}
```

#### Task 1.2.2 — TypeScript config
File: `/root/bersama-io/apps/web/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@payload-config": ["./src/payload.config.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Task 1.2.3 — Next.js config with Payload plugin
File: `/root/bersama-io/apps/web/next.config.mjs`
```javascript
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'r2.bersama.io',
      // RSS source domains
      'www.freemalaysiatoday.com',
      'www.malaymail.com',
      'www.thevibes.com',
      'www.sinarharian.com.my',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
  // Exclude Payload admin from i18n routing
  skipTrailingSlashRedirect: true,
}

export default withNextIntl(withPayload(nextConfig))
```

#### Task 1.2.4 — Payload config
File: `/root/bersama-io/apps/web/src/payload.config.ts`
```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from 'payload/i18n/en'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Articles } from './collections/Articles'
import { AgendaItems } from './collections/AgendaItems'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { NewsItems } from './collections/NewsItems'
import { LiveBlogPosts } from './collections/LiveBlogPosts'
import { EmailSubscribers } from './collections/EmailSubscribers'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Bersama CMS',
      favicon: '/favicon.ico',
    },
  },
  collections: [
    Users,
    Articles,
    AgendaItems,
    Pages,
    Media,
    Events,
    NewsItems,
    LiveBlogPosts,
    EmailSubscribers,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Neon serverless driver
    prodMigrations: true,
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.CLOUDFLARE_R2_BUCKET || 'bersama-media',
      config: {
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      },
    }),
  ],
  i18n: {
    supportedLanguages: { en },
  },
  upload: {
    limits: {
      fileSize: 10_000_000, // 10MB
    },
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
})
```

#### Task 1.2.5 — Payload Users collection
File: `/root/bersama-io/apps/web/src/collections/Users.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'editor'],
      defaultValue: 'editor',
      required: true,
    },
  ],
}
```

#### Task 1.2.6 — Articles collection
File: `/root/bersama-io/apps/web/src/collections/Articles.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'locale'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true, // Public read
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'Pasukan Bersama',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'agendaItems',
      type: 'relationship',
      relationTo: 'agenda-items',
      hasMany: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isJohorElection',
      type: 'checkbox',
      label: 'Tag as Johor Election content',
      defaultValue: false,
    },
  ],
}
```

#### Task 1.2.7 — AgendaItems collection
File: `/root/bersama-io/apps/web/src/collections/AgendaItems.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const AgendaItems: CollectionConfig = {
  slug: 'agenda-items',
  admin: {
    useAsTitle: 'titleEn',
    defaultColumns: ['number', 'titleBm', 'titleEn'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'number',
      type: 'number',
      required: true,
      min: 1,
      max: 12,
      admin: { description: 'Agenda item number (1–12)' },
    },
    {
      name: 'titleBm',
      type: 'text',
      required: true,
      label: 'Title (BM)',
    },
    {
      name: 'titleEn',
      type: 'text',
      required: true,
      label: 'Title (EN)',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'summaryBm',
      type: 'textarea',
      label: 'Summary (BM)',
      maxLength: 500,
    },
    {
      name: 'summaryEn',
      type: 'textarea',
      label: 'Summary (EN)',
      maxLength: 500,
    },
    {
      name: 'contentBm',
      type: 'richText',
      label: 'Full Content (BM)',
    },
    {
      name: 'contentEn',
      type: 'richText',
      label: 'Full Content (EN)',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon name (Lucide)',
      admin: { description: 'e.g. "heart", "home", "briefcase"' },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Accent color (Tailwind class)',
      defaultValue: 'yellow-400',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'RSS match keywords',
      admin: { description: 'Keywords to auto-tag news from RSS feeds' },
      fields: [
        { name: 'keyword', type: 'text' },
      ],
    },
  ],
}
```

#### Task 1.2.8 — Remaining collections (Media, Events, NewsItems, LiveBlogPosts, EmailSubscribers, Pages)
File: `/root/bersama-io/apps/web/src/collections/Media.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
```

File: `/root/bersama-io/apps/web/src/collections/Events.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'titleBm' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'titleBm', type: 'text', required: true, label: 'Title (BM)' },
    { name: 'titleEn', type: 'text', label: 'Title (EN)' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    { name: 'locationBm', type: 'text', label: 'Location (BM)' },
    { name: 'locationEn', type: 'text', label: 'Location (EN)' },
    { name: 'descriptionBm', type: 'richText', label: 'Description (BM)' },
    { name: 'descriptionEn', type: 'richText', label: 'Description (EN)' },
    { name: 'isJohorElection', type: 'checkbox', defaultValue: false },
    { name: 'registrationUrl', type: 'text' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
  ],
}
```

File: `/root/bersama-io/apps/web/src/collections/NewsItems.ts`
```typescript
import type { CollectionConfig } from 'payload'

// Cached RSS items — headline + excerpt only (legal compliance)
export const NewsItems: CollectionConfig = {
  slug: 'news-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'source', 'publishedAt', 'agendaItems'],
    description: 'RSS-aggregated news. NEVER store full article text.',
  },
  access: {
    read: () => true,
    create: () => false, // Only created by RSS sync job
    update: ({ req }) => !!req.user, // Editors can re-tag
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Headline only — as-fetched from RSS' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 400,
      required: true,
      admin: { description: '2 sentences max. Legal requirement.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      required: true,
      admin: { description: 'Always links to original article.' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Free Malaysia Today', value: 'fmt' },
        { label: 'Malay Mail', value: 'malay-mail' },
        { label: 'The Vibes', value: 'the-vibes' },
        { label: 'Sinar Daily', value: 'sinar-daily' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'agendaItems',
      type: 'relationship',
      relationTo: 'agenda-items',
      hasMany: true,
    },
    {
      name: 'isJohorElection',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'guid',
      type: 'text',
      unique: true,
      admin: { description: 'RSS GUID for deduplication' },
    },
  ],
}
```

File: `/root/bersama-io/apps/web/src/collections/LiveBlogPosts.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const LiveBlogPosts: CollectionConfig = {
  slug: 'live-blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'isPinned'],
    description: 'Real-time updates during election results night.',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    { name: 'publishedAt', type: 'date', required: true },
    { name: 'isPinned', type: 'checkbox', defaultValue: false },
    {
      name: 'type',
      type: 'select',
      options: ['update', 'result', 'breaking', 'analysis'],
      defaultValue: 'update',
    },
    { name: 'seat', type: 'text', label: 'Seat name (if result)' },
    { name: 'winner', type: 'text', label: 'Winning party (if result)' },
  ],
}
```

File: `/root/bersama-io/apps/web/src/collections/EmailSubscribers.ts`
```typescript
import type { CollectionConfig } from 'payload'

// PDPA-compliant. No IC/NRIC. No political affiliation without consent.
export const EmailSubscribers: CollectionConfig = {
  slug: 'email-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'createdAt', 'consentGiven'],
    description: 'PDPA-compliant. No IC/NRIC stored. Read-only in admin.',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false, // Only via API route
    update: () => false,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text', required: true },
    {
      name: 'consentGiven',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: { description: 'Explicit PDPA consent to receive emails.' },
    },
    {
      name: 'consentText',
      type: 'text',
      admin: { description: 'Exact consent text shown at time of signup.' },
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: { description: 'SHA-256 hash of IP. Not the IP itself.' },
    },
    {
      name: 'listmonkSubscriberId',
      type: 'number',
      admin: { description: 'Listmonk subscriber ID for sync.' },
    },
  ],
}
```

File: `/root/bersama-io/apps/web/src/collections/Pages.ts`
```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'titleBm' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'titleBm', type: 'text', required: true, label: 'Title (BM)' },
    { name: 'titleEn', type: 'text', label: 'Title (EN)' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'contentBm', type: 'richText', label: 'Content (BM)' },
    { name: 'contentEn', type: 'richText', label: 'Content (EN)' },
    { name: 'metaDescriptionBm', type: 'textarea', maxLength: 160 },
    { name: 'metaDescriptionEn', type: 'textarea', maxLength: 160 },
  ],
}
```

#### Task 1.2.9 — Payload route handler (Next.js App Router)
File: `/root/bersama-io/apps/web/src/app/(payload)/admin/[[...segments]]/page.tsx`
```typescript
/* THIS FILE IS GENERATED — DO NOT EDIT DIRECTLY */
export { RootPage as default, generateMetadata } from '@payloadcms/next/views'
```

File: `/root/bersama-io/apps/web/src/app/(payload)/admin/[[...segments]]/not-found.tsx`
```typescript
export { NotFoundPage as default } from '@payloadcms/next/views'
```

File: `/root/bersama-io/apps/web/src/app/(payload)/api/[...slug]/route.ts`
```typescript
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'
import config from '@payload-config'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

#### Task 1.2.10 — .env.example
File: `/root/bersama-io/apps/web/.env.example`
```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Payload CMS
PAYLOAD_SECRET=change-me-to-a-random-32-char-string
NEXT_PUBLIC_SERVER_URL=https://bersama.io

# Cloudflare R2
CLOUDFLARE_R2_BUCKET=bersama-media
CLOUDFLARE_R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_PUBLIC_URL=https://r2.bersama.io

# Email (Resend)
RESEND_API_KEY=re_xxxx

# Listmonk
LISTMONK_URL=https://listmonk.bersama.io
LISTMONK_API_KEY=your-listmonk-api-key
LISTMONK_LIST_ID=1

# OneSignal
ONESIGNAL_APP_ID=your-onesignal-app-id
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxx

# CRON
CRON_SECRET=change-me-random-secret
```

#### Verification 1.2
```bash
cd /root/bersama-io/apps/web
ls src/collections/
# Expected: AgendaItems.ts  Articles.ts  EmailSubscribers.ts  Events.ts  LiveBlogPosts.ts  Media.ts  NewsItems.ts  Pages.ts  Users.ts
cat src/payload.config.ts | grep -c "collections"
# Expected: at least 2 (import + config)
```

---

### 1.3 Neon DB Connection

**Goal:** Configure Payload to use Neon's serverless PostgreSQL with connection pooling.

#### Task 1.3.1 — Neon-optimized DB adapter patch
The `@payloadcms/db-postgres` adapter works with Neon via its standard PostgreSQL wire protocol. For serverless edge compatibility, add the Neon serverless driver.

File: `/root/bersama-io/apps/web/src/lib/db.ts`
```typescript
import { neon, neonConfig } from '@neondatabase/serverless'

// Use HTTP fetch for edge runtime (Cloudflare Workers / Next.js Edge)
// For Node.js runtime (Payload CMS), use standard pg driver via connection string
neonConfig.fetchConnectionCache = true

export function getNeonClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return neon(process.env.DATABASE_URL)
}
```

#### Task 1.3.2 — Create first migration script
File: `/root/bersama-io/apps/web/scripts/migrate.ts`
```typescript
#!/usr/bin/env tsx
import { execSync } from 'child_process'

async function migrate() {
  console.log('🗄️  Running Payload migrations...')
  try {
    execSync('pnpm payload migrate', { stdio: 'inherit' })
    console.log('✅ Migrations complete.')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
```

#### Task 1.3.3 — Add migrate to package.json scripts
```json
// In apps/web/package.json, add to "scripts":
"migrate": "payload migrate",
"migrate:create": "payload migrate:create",
"seed": "tsx scripts/seed.ts"
```

#### Task 1.3.4 — Seed script for 12 agenda items
File: `/root/bersama-io/apps/web/scripts/seed.ts`
```typescript
#!/usr/bin/env tsx
/**
 * Seeds the 12-point Bersama agenda items.
 * Run: pnpm seed
 */

const AGENDA_ITEMS = [
  {
    number: 1,
    titleBm: 'Ekonomi Saksama untuk Semua',
    titleEn: 'A Fair Economy for All',
    slug: 'ekonomi-saksama',
    icon: 'trending-up',
    color: 'blue-600',
    keywords: ['ekonomi', 'economy', 'GDP', 'KDNK', 'pendapatan'],
  },
  {
    number: 2,
    titleBm: 'Pendidikan Berkualiti & Terjangkau',
    titleEn: 'Quality & Affordable Education',
    slug: 'pendidikan-berkualiti',
    icon: 'graduation-cap',
    color: 'yellow-400',
    keywords: ['pendidikan', 'education', 'sekolah', 'universiti', 'PTPTN'],
  },
  {
    number: 3,
    titleBm: 'Penjagaan Kesihatan untuk Rakyat',
    titleEn: 'Healthcare for the People',
    slug: 'penjagaan-kesihatan',
    icon: 'heart-pulse',
    color: 'red-500',
    keywords: ['kesihatan', 'healthcare', 'hospital', 'doktor', 'ubat'],
  },
  {
    number: 4,
    titleBm: 'Perumahan Mampu Milik',
    titleEn: 'Affordable Housing',
    slug: 'perumahan-mampu-milik',
    icon: 'home',
    color: 'green-500',
    keywords: ['perumahan', 'housing', 'rumah', 'PR1MA', 'sewaan'],
  },
  {
    number: 5,
    titleBm: 'Alam Sekitar & Tenaga Hijau',
    titleEn: 'Environment & Green Energy',
    slug: 'alam-sekitar-hijau',
    icon: 'leaf',
    color: 'emerald-500',
    keywords: ['alam sekitar', 'environment', 'solar', 'hijau', 'green'],
  },
  {
    number: 6,
    titleBm: 'Tadbir Urus Bersih & Telus',
    titleEn: 'Clean & Transparent Governance',
    slug: 'tadbir-urus-bersih',
    icon: 'shield-check',
    color: 'blue-500',
    keywords: ['rasuah', 'corruption', 'MACC', 'SPRM', 'tadbir urus'],
  },
  {
    number: 7,
    titleBm: 'Hak & Kebajikan Pekerja',
    titleEn: 'Workers Rights & Welfare',
    slug: 'hak-pekerja',
    icon: 'briefcase',
    color: 'orange-500',
    keywords: ['pekerja', 'workers', 'gaji minimum', 'minimum wage', 'SOCSO'],
  },
  {
    number: 8,
    titleBm: 'Keselamatan Awam & Undang-Undang',
    titleEn: 'Public Safety & Rule of Law',
    slug: 'keselamatan-awam',
    icon: 'scale',
    color: 'purple-600',
    keywords: ['keselamatan', 'safety', 'polis', 'kehakiman', 'judiciary'],
  },
  {
    number: 9,
    titleBm: 'Pembangunan Luar Bandar',
    titleEn: 'Rural Development',
    slug: 'pembangunan-luar-bandar',
    icon: 'tree-pine',
    color: 'lime-600',
    keywords: ['luar bandar', 'rural', 'Felda', 'kampung', 'pertanian'],
  },
  {
    number: 10,
    titleBm: 'Belia & Sukan',
    titleEn: 'Youth & Sports',
    slug: 'belia-sukan',
    icon: 'zap',
    color: 'yellow-500',
    keywords: ['belia', 'youth', 'sukan', 'sports', 'generasi muda'],
  },
  {
    number: 11,
    titleBm: 'Wanita & Keluarga',
    titleEn: 'Women & Family',
    slug: 'wanita-keluarga',
    icon: 'users',
    color: 'pink-500',
    keywords: ['wanita', 'women', 'keluarga', 'family', 'kanak-kanak'],
  },
  {
    number: 12,
    titleBm: 'Digitalisasi & Teknologi',
    titleEn: 'Digitalisation & Technology',
    slug: 'digitalisasi-teknologi',
    icon: 'cpu',
    color: 'cyan-500',
    keywords: ['digital', 'teknologi', 'technology', 'AI', 'internet'],
  },
]

async function seed() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  console.log(`🌱 Seeding agenda items to ${baseUrl}...`)

  for (const item of AGENDA_ITEMS) {
    try {
      const res = await fetch(`${baseUrl}/api/agenda-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use admin credentials from env or interactive login
          Authorization: `users API-Key ${process.env.PAYLOAD_API_KEY || ''}`,
        },
        body: JSON.stringify(item),
      })
      if (res.ok) {
        console.log(`  ✅ Agenda item ${item.number}: ${item.titleEn}`)
      } else {
        const err = await res.text()
        console.error(`  ❌ Failed item ${item.number}:`, err)
      }
    } catch (e) {
      console.error(`  ❌ Error seeding item ${item.number}:`, e)
    }
  }
  console.log('✅ Seed complete.')
}

seed()
```

#### Verification 1.3
```bash
# After setting DATABASE_URL in .env.local:
cd /root/bersama-io/apps/web
echo "DATABASE_URL is set: $([ -n '$DATABASE_URL' ] && echo YES || echo NO)"
# Run migrations after install:
# pnpm migrate
# Expected: "Migrations complete."
```

---

### 1.4 Cloudflare R2 Storage

**Goal:** Configure media uploads to Cloudflare R2 (S3-compatible).

#### Task 1.4.1 — R2 upload utility
File: `/root/bersama-io/apps/web/src/lib/r2.ts`
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'bersama-media'
export const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Public read for media
      ACL: 'public-read',
    }),
  )
  return `${R2_PUBLIC_URL}/${key}`
}

export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`
}

// Presigned URL for private assets (Phase 2)
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    { expiresIn },
  )
}
```

#### Task 1.4.2 — Cloudflare R2 setup instructions
```
# In Cloudflare dashboard:
# 1. R2 → Create bucket → name: "bersama-media"
# 2. Settings → Custom Domains → Add domain: r2.bersama.io
# 3. API → Manage R2 API tokens → Create token with:
#    - Permission: Object Read & Write
#    - Bucket: bersama-media
# 4. Copy: Account ID, Access Key ID, Secret Access Key
# 5. Set CLOUDFLARE_R2_ENDPOINT = https://<ACCOUNT_ID>.r2.cloudflarestorage.com
# 6. Set CLOUDFLARE_R2_PUBLIC_URL = https://r2.bersama.io
```

#### Verification 1.4
```bash
# Test R2 connection (after .env.local is configured):
cd /root/bersama-io/apps/web
node -e "
const { r2Client, R2_BUCKET } = require('./src/lib/r2');
console.log('R2 bucket:', R2_BUCKET);
console.log('R2 endpoint configured:', !!process.env.CLOUDFLARE_R2_ENDPOINT);
"
# Expected: R2 bucket: bersama-media  R2 endpoint configured: true
```

---

### 1.5 i18n with next-intl

**Goal:** Bilingual routing `/` (BM default) and `/en/` (English) using next-intl 3.

#### Task 1.5.1 — Middleware for locale detection
File: `/root/bersama-io/apps/web/src/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['ms', 'en'],
  defaultLocale: 'ms',
  localePrefix: 'as-needed', // /ms routes don't need prefix, /en/... does
  localeDetection: true,
})

export default function middleware(request: NextRequest) {
  // Skip Payload CMS routes
  if (
    request.nextUrl.pathname.startsWith('/cms') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
```

#### Task 1.5.2 — next-intl request config
File: `/root/bersama-io/apps/web/src/i18n/request.ts`
```typescript
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../messages/${locale}.json`)).default,
  timeZone: 'Asia/Kuala_Lumpur',
  now: new Date(),
}))
```

#### Task 1.5.3 — BM translations
File: `/root/bersama-io/apps/web/messages/ms.json`
```json
{
  "nav": {
    "home": "Laman Utama",
    "about": "Tentang Bersama",
    "agenda": "Agenda 12",
    "news": "Berita",
    "events": "Acara",
    "johor": "PRN Johor",
    "supportUs": "Sokong Kami"
  },
  "hero": {
    "tagline": "Suara Penyokong, Bebas & Berani",
    "subtitle": "Platform rasmi penyokong Parti Bersama Malaysia — berita, agenda, dan komuniti untuk semua rakyat Malaysia.",
    "cta": "Daftar Sokongan",
    "ctaSecondary": "Baca Agenda"
  },
  "newsletter": {
    "title": "Kekal Dikemas Kini",
    "subtitle": "Dapatkan berita terkini terus ke inbox anda.",
    "namePlaceholder": "Nama anda",
    "emailPlaceholder": "Emel anda",
    "submit": "Langgan",
    "submitting": "Sedang langgan...",
    "success": "Terima kasih! Semak emel anda untuk pengesahan.",
    "error": "Ralat. Sila cuba lagi.",
    "consent": "Saya bersetuju untuk menerima berita daripada bersama.io. Saya boleh berhenti langgan pada bila-bila masa. Tiada maklumat IC/NRIC dikumpul.",
    "consentRequired": "Anda perlu bersetuju untuk meneruskan."
  },
  "news": {
    "title": "Berita Terkini",
    "readMore": "Baca lagi →",
    "source": "Sumber",
    "noNews": "Tiada berita terkini.",
    "disclaimer": "Tajuk berita dan petikan ringkas daripada sumber asal. Klik untuk baca artikel penuh."
  },
  "agenda": {
    "title": "Agenda 12 Bersama",
    "subtitle": "Dua belas komitmen kami kepada rakyat Malaysia.",
    "readFull": "Baca agenda penuh"
  },
  "about": {
    "title": "Tentang Parti Bersama Malaysia",
    "subtitle": "Sebuah parti baru untuk Malaysia baru."
  },
  "johor": {
    "title": "Pilihan Raya Negeri Johor 2026",
    "subtitle": "Ikuti perkembangan terkini PRN Johor.",
    "liveBlog": "Blog Langsung",
    "results": "Keputusan"
  },
  "events": {
    "title": "Acara Akan Datang",
    "noEvents": "Tiada acara akan datang.",
    "register": "Daftar Sekarang"
  },
  "footer": {
    "disclaimer": "bersama.io adalah platform penyokong tidak rasmi dan tidak berafiliasi secara rasmi dengan Parti Bersama Malaysia. Dibina oleh penyokong untuk penyokong.",
    "privacy": "Polisi Privasi",
    "pdpa": "PDPA",
    "contact": "Hubungi Kami"
  },
  "meta": {
    "siteName": "bersama.io",
    "siteDescription": "Platform penyokong Parti Bersama Malaysia — Suara Penyokong, Bebas & Berani"
  },
  "common": {
    "loading": "Memuatkan...",
    "error": "Ralat berlaku",
    "backToTop": "Kembali ke atas",
    "switchLang": "English"
  }
}
```

#### Task 1.5.4 — English translations
File: `/root/bersama-io/apps/web/messages/en.json`
```json
{
  "nav": {
    "home": "Home",
    "about": "About Bersama",
    "agenda": "Agenda 12",
    "news": "News",
    "events": "Events",
    "johor": "Johor Election",
    "supportUs": "Support Us"
  },
  "hero": {
    "tagline": "The Supporter's Voice, Free & Brave",
    "subtitle": "An unofficial supporter platform for Parti Bersama Malaysia — news, agenda, and community for all Malaysians.",
    "cta": "Register Support",
    "ctaSecondary": "Read the Agenda"
  },
  "newsletter": {
    "title": "Stay Updated",
    "subtitle": "Get the latest news directly to your inbox.",
    "namePlaceholder": "Your name",
    "emailPlaceholder": "Your email",
    "submit": "Subscribe",
    "submitting": "Subscribing...",
    "success": "Thank you! Check your email for confirmation.",
    "error": "An error occurred. Please try again.",
    "consent": "I agree to receive news updates from bersama.io. I can unsubscribe at any time. No IC/NRIC is collected.",
    "consentRequired": "You must agree to continue."
  },
  "news": {
    "title": "Latest News",
    "readMore": "Read more →",
    "source": "Source",
    "noNews": "No news at this time.",
    "disclaimer": "Headlines and short excerpts from original sources. Click to read the full article."
  },
  "agenda": {
    "title": "Bersama's 12-Point Agenda",
    "subtitle": "Our twelve commitments to the people of Malaysia.",
    "readFull": "Read full agenda"
  },
  "about": {
    "title": "About Parti Bersama Malaysia",
    "subtitle": "A new party for a new Malaysia."
  },
  "johor": {
    "title": "Johor State Election 2026",
    "subtitle": "Follow the latest developments in the Johor state election.",
    "liveBlog": "Live Blog",
    "results": "Results"
  },
  "events": {
    "title": "Upcoming Events",
    "noEvents": "No upcoming events.",
    "register": "Register Now"
  },
  "footer": {
    "disclaimer": "bersama.io is an unofficial supporter platform and is not officially affiliated with Parti Bersama Malaysia. Built by supporters, for supporters.",
    "privacy": "Privacy Policy",
    "pdpa": "PDPA",
    "contact": "Contact Us"
  },
  "meta": {
    "siteName": "bersama.io",
    "siteDescription": "Parti Bersama Malaysia supporter platform — The Supporter's Voice, Free & Brave"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "backToTop": "Back to top",
    "switchLang": "Bahasa Malaysia"
  }
}
```

#### Task 1.5.5 — i18n locale types helper
File: `/root/bersama-io/apps/web/src/i18n/config.ts`
```typescript
export const locales = ['ms', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ms'

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
```

#### Verification 1.5
```bash
ls /root/bersama-io/apps/web/messages/
# Expected: en.json  ms.json
cat /root/bersama-io/apps/web/messages/ms.json | python3 -m json.tool | head -5
# Expected: valid JSON output
```

---

### 1.6 Design System (Tailwind)

**Goal:** Brand design system — blue/yellow editorial palette.

#### Task 1.6.1 — Tailwind config with brand tokens
File: `/root/bersama-io/apps/web/tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bersama brand palette
        brand: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#1d4ed8', // Primary brand blue
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#1e3166',
            950: '#0f1e42',
          },
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15', // Primary brand yellow
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
          },
        },
        // Semantic aliases
        primary: '#1d4ed8',
        accent: '#facc15',
        surface: '#f8fafc',
        muted: '#64748b',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        heading: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.700'),
            a: { color: theme('colors.brand.blue.600'), textDecoration: 'underline' },
            'h1,h2,h3,h4': { fontFamily: 'var(--font-plus-jakarta)' },
          },
        },
      }),
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
```

#### Task 1.6.2 — Global CSS
File: `/root/bersama-io/apps/web/src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-geist-sans: 'Geist', system-ui, sans-serif;
    --font-geist-mono: 'Geist Mono', monospace;
    --font-plus-jakarta: 'Plus Jakarta Sans', system-ui, sans-serif;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-white text-slate-800 antialiased;
  }

  ::selection {
    @apply bg-brand-yellow-300 text-slate-900;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-600 active:scale-[0.98];
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-blue-600 px-6 py-3 text-sm font-semibold text-brand-blue-600 transition-all hover:bg-brand-blue-50 active:scale-[0.98];
  }

  .btn-accent {
    @apply inline-flex items-center justify-center gap-2 rounded-lg bg-brand-yellow-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-brand-yellow-500 active:scale-[0.98];
  }

  .card {
    @apply rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md;
  }

  .section-container {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }

  .section-heading {
    @apply text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl;
  }

  .badge-source {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
  }

  .badge-fmt { @apply badge-source bg-red-100 text-red-800; }
  .badge-malay-mail { @apply badge-source bg-blue-100 text-blue-800; }
  .badge-the-vibes { @apply badge-source bg-purple-100 text-purple-800; }
  .badge-sinar-daily { @apply badge-source bg-green-100 text-green-800; }

  /* Live blog pulse indicator */
  .live-indicator {
    @apply flex items-center gap-1.5 text-red-600 text-xs font-semibold uppercase tracking-wide;
  }
  .live-indicator::before {
    content: '';
    @apply block h-2 w-2 rounded-full bg-red-500 animate-pulse;
  }
}
```

#### Task 1.6.3 — Shared layout wrapper component
File: `/root/bersama-io/apps/web/src/components/layout/Layout.tsx`
```typescript
import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  locale: string
}

export function Layout({ children, locale }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  )
}
```

#### Task 1.6.4 — Navbar component
File: `/root/bersama-io/apps/web/src/components/layout/Navbar.tsx`
```typescript
'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { clsx } from 'clsx'
import { LocaleSwitcher } from './LocaleSwitcher'

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/tentang', label: t('about') },
    { href: '/agenda', label: t('agenda') },
    { href: '/berita', label: t('news') },
    { href: '/johor-pilihan-raya', label: t('johor') },
    { href: '/acara', label: t('events') },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="section-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-blue-600">bersama</span>
          <span className="text-xl font-bold text-brand-yellow-400">.io</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={`/${locale === 'en' ? 'en' : ''}${link.href}`}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/sokong" className="hidden btn-accent lg:inline-flex">
            {t('supportUs')}
          </Link>

          {/* Mobile menu button */}
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/sokong" className="btn-accent text-center" onClick={() => setMobileOpen(false)}>
              {t('supportUs')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
```

#### Task 1.6.5 — LocaleSwitcher component
File: `/root/bersama-io/apps/web/src/components/layout/LocaleSwitcher.tsx`
```typescript
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'

export function LocaleSwitcher() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale() {
    const nextLocale = locale === 'ms' ? 'en' : 'ms'
    // Swap locale prefix in pathname
    const newPath = locale === 'ms'
      ? `/en${pathname}`
      : pathname.replace(/^\/en/, '') || '/'
    router.push(newPath)
  }

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      aria-label="Switch language"
    >
      <Globe size={14} />
      {t('switchLang')}
    </button>
  )
}
```

#### Task 1.6.6 — Footer component
File: `/root/bersama-io/apps/web/src/components/layout/Footer.tsx`
```typescript
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')
  const prefix = locale === 'en' ? '/en' : ''

  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="section-container py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-1">
              <span className="text-lg font-bold text-brand-blue-600">bersama</span>
              <span className="text-lg font-bold text-brand-yellow-400">.io</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{t('disclaimer')}</p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href={`${prefix}/privasi`} className="text-sm text-slate-500 hover:text-brand-blue-600">
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={`${prefix}/pdpa`} className="text-sm text-slate-500 hover:text-brand-blue-600">
                    {t('pdpa')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} bersama.io. Semua hak terpelihara.
        </div>
      </div>
    </footer>
  )
}
```

---

### 1.7 Homepage

**Goal:** Hero with tagline + email signup + news preview + agenda overview.

#### Task 1.7.1 — Root layout with locale
File: `/root/bersama-io/apps/web/src/app/[locale]/layout.tsx`
```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { Layout } from '@/components/layout/Layout'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '@/app/globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  if (!locales.includes(locale as 'ms' | 'en')) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable} ${plusJakarta.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Layout locale={locale}>{children}</Layout>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

#### Task 1.7.2 — Homepage component
File: `/root/bersama-io/apps/web/src/app/[locale]/page.tsx`
```typescript
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { HeroSection } from '@/components/home/HeroSection'
import { NewsPreview } from '@/components/home/NewsPreview'
import { AgendaPreview } from '@/components/home/AgendaPreview'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { JohorBanner } from '@/components/home/JohorBanner'
import { generatePageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generatePageMetadata({
    locale,
    path: '/',
    titleKey: 'meta.siteName',
    descriptionKey: 'meta.siteDescription',
  })
}

interface HomePageProps {
  params: { locale: string }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale)

  return (
    <>
      {/* Johor election urgency banner */}
      <JohorBanner locale={locale} />

      {/* Hero */}
      <HeroSection locale={locale} />

      {/* News aggregator preview */}
      <NewsPreview locale={locale} />

      {/* 12-point agenda preview */}
      <AgendaPreview locale={locale} />

      {/* Newsletter signup */}
      <NewsletterSection locale={locale} />
    </>
  )
}
```

#### Task 1.7.3 — Hero section
File: `/root/bersama-io/apps/web/src/components/home/HeroSection.tsx`
```typescript
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

interface HeroSectionProps {
  locale: string
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero')
  const prefix = locale === 'en' ? '/en' : ''

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue-950 via-brand-blue-800 to-brand-blue-600 py-24 sm:py-32">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="section-container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tagline badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-yellow-400/20 px-4 py-1.5 text-brand-yellow-300 ring-1 ring-brand-yellow-400/30">
            <Zap size={14} />
            <span className="text-sm font-semibold">{t('tagline')}</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            <span className="text-brand-yellow-400">bersama</span>.io
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
            {t('subtitle')}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`${prefix}/sokong`} className="btn-accent">
              {t('cta')} <ArrowRight size={16} />
            </Link>
            <Link href={`${prefix}/agenda`} className="btn-secondary border-white/30 text-white hover:bg-white/10">
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 30C1200 0 960 0 720 30C480 60 240 60 0 30L0 60Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
```

#### Task 1.7.4 — Johor urgency banner
File: `/root/bersama-io/apps/web/src/components/home/JohorBanner.tsx`
```typescript
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface JohorBannerProps {
  locale: string
}

export function JohorBanner({ locale }: JohorBannerProps) {
  const prefix = locale === 'en' ? '/en' : ''
  const text = locale === 'en'
    ? 'JOHOR STATE ELECTION — Assembly dissolved June 1, 2026. Stay informed.'
    : 'PRN JOHOR — Dewan Undangan Negeri dibubarkan 1 Jun 2026. Ikuti perkembangan terkini.'
  const linkText = locale === 'en' ? 'Election Hub →' : 'Hub PRN →'

  return (
    <div className="bg-red-600 py-2.5 text-white">
      <div className="section-container flex items-center justify-center gap-3 text-sm">
        <AlertTriangle size={16} className="flex-shrink-0" />
        <span className="font-medium">{text}</span>
        <Link
          href={locale === 'en' ? '/en/johor-election' : '/johor-pilihan-raya'}
          className="flex-shrink-0 underline font-semibold hover:text-red-100"
        >
          {linkText}
        </Link>
      </div>
    </div>
  )
}
```

#### Task 1.7.5 — Newsletter section component
File: `/root/bersama-io/apps/web/src/components/home/NewsletterSection.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, CheckCircle } from 'lucide-react'

const subscribeSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100),
  email: z.string().email('Invalid email'),
  consent: z.boolean().refine((v) => v === true, 'Consent required'),
  // Honeypot — must be empty
  website: z.string().max(0).optional(),
})

type SubscribeForm = z.infer<typeof subscribeSchema>

interface NewsletterSectionProps {
  locale: string
}

export function NewsletterSection({ locale }: NewsletterSectionProps) {
  const t = useTranslations('newsletter')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscribeForm>({ resolver: zodResolver(subscribeSchema) })

  async function onSubmit(data: SubscribeForm) {
    setError('')
    // Honeypot check (client side — also checked server side)
    if (data.website) return

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          locale,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.message || t('error'))
        return
      }

      setSubmitted(true)
    } catch {
      setError(t('error'))
    }
  }

  if (submitted) {
    return (
      <section className="bg-brand-blue-50 py-20">
        <div className="section-container text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold text-slate-900">{t('success')}</h2>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-brand-blue-50 py-20">
      <div className="section-container">
        <div className="mx-auto max-w-xl text-center">
          <Mail className="mx-auto mb-4 text-brand-blue-600" size={40} />
          <h2 className="mb-2 text-3xl font-bold text-slate-900">{t('title')}</h2>
          <p className="mb-8 text-slate-500">{t('subtitle')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
            {/* Honeypot — hidden from users */}
            <input
              {...register('website')}
              type="text"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                {t('namePlaceholder')}
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-200"
                placeholder={t('namePlaceholder')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                {t('emailPlaceholder')}
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-200"
                placeholder={t('emailPlaceholder')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input
                {...register('consent')}
                id="consent"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
              />
              <label htmlFor="consent" className="text-xs leading-relaxed text-slate-500">
                {t('consent')}
              </label>
            </div>
            {errors.consent && <p className="text-xs text-red-500">{t('consentRequired')}</p>}

            {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
```

---

### 1.8 Party Info Hub

**Goal:** Static/CMS-driven pages for About, Rafizi bio, Nik Nazmi bio, founding story.

#### Task 1.8.1 — About page
File: `/root/bersama-io/apps/web/src/app/[locale]/tentang/page.tsx`
```typescript
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { PersonCard } from '@/components/about/PersonCard'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generatePageMetadata({
    locale,
    path: '/tentang',
    title: locale === 'en' ? 'About Bersama' : 'Tentang Bersama',
    description: locale === 'en'
      ? 'Learn about Parti Bersama Malaysia — our founding story, mission, and leaders.'
      : 'Ketahui lebih lanjut tentang Parti Bersama Malaysia — kisah penubuhan, misi, dan pemimpin kami.',
  })
}

const LEADERS = [
  {
    slug: 'rafizi-ramli',
    nameEn: 'Rafizi Ramli',
    nameBm: 'Rafizi Ramli',
    titleEn: 'President, Parti Bersama Malaysia',
    titleBm: 'Presiden, Parti Bersama Malaysia',
    bioEn: 'Rafizi Ramli is a Malaysian politician, former Deputy Minister of Economy, and co-founder of Parti Bersama Malaysia. Known for his data-driven approach to policy and fearless advocacy for institutional reform.',
    bioBm: 'Rafizi Ramli adalah ahli politik Malaysia, bekas Timbalan Menteri Ekonomi, dan pengasas bersama Parti Bersama Malaysia. Dikenali dengan pendekatan berasaskan data dalam penggubalan dasar dan keberanian dalam memperjuangkan reformasi institusi.',
    image: '/images/rafizi.jpg',
    twitter: 'rafiziramli',
  },
  {
    slug: 'nik-nazmi',
    nameEn: 'Nik Nazmi Nik Ahmad',
    nameBm: 'Nik Nazmi Nik Ahmad',
    titleEn: 'Secretary-General, Parti Bersama Malaysia',
    titleBm: 'Setiausaha Agung, Parti Bersama Malaysia',
    bioEn: 'Nik Nazmi Nik Ahmad is a Malaysian politician and environmental advocate, serving as Minister of Natural Resources and Environmental Sustainability and co-founder of Parti Bersama Malaysia.',
    bioBm: 'Nik Nazmi Nik Ahmad adalah ahli politik Malaysia dan pejuang alam sekitar, berkhidmat sebagai Menteri Sumber Asli dan Kelestarian Alam Sekitar serta pengasas bersama Parti Bersama Malaysia.',
    image: '/images/nik-nazmi.jpg',
    twitter: 'niknazmi',
  },
]

interface AboutPageProps {
  params: { locale: string }
}

export default function AboutPage({ params: { locale } }: AboutPageProps) {
  setRequestLocale(locale)
  const isEn = locale === 'en'

  return (
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="section-heading mb-4">
            {isEn ? 'About Parti Bersama Malaysia' : 'Tentang Parti Bersama Malaysia'}
          </h1>
          <p className="text-lg text-slate-500">
            {isEn
              ? 'A new political movement built on the principles of fairness, transparency, and courage.'
              : 'Gerakan politik baru yang dibina atas prinsip keadilan, ketelusan, dan keberanian.'}
          </p>
        </div>

        {/* Founding story */}
        <section className="mb-20 mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            {isEn ? 'Our Founding Story' : 'Kisah Penubuhan Kami'}
          </h2>
          <div className="prose prose-slate max-w-none">
            {isEn ? (
              <>
                <p>Parti Bersama Malaysia was founded in 2024 by a coalition of reform-minded politicians and civil society leaders who believed that Malaysia needed a new political vehicle — one unencumbered by decades of old politics and rooted in the aspirations of a new generation of Malaysians.</p>
                <p>The founding principle is simple: every Malaysian deserves a fair shot at prosperity, regardless of background. Bersama means "together" — and that is the animating spirit of everything we do.</p>
              </>
            ) : (
              <>
                <p>Parti Bersama Malaysia ditubuhkan pada tahun 2024 oleh gabungan ahli politik berfikiran reformis dan pemimpin masyarakat sivil yang percaya bahawa Malaysia memerlukan kenderaan politik baru — yang tidak terbebani oleh dekad-dekad politik lama dan berakar pada aspirasi generasi baru rakyat Malaysia.</p>
                <p>Prinsip penubuhan adalah mudah: setiap rakyat Malaysia berhak mendapat peluang yang adil untuk kemakmuran, tanpa mengira latar belakang. Bersama bermaksud "bersama" — dan itulah semangat yang menghidupkan segala yang kami lakukan.</p>
              </>
            )}
          </div>
        </section>

        {/* Leaders */}
        <section>
          <h2 className="mb-8 text-2xl font-bold text-slate-900">
            {isEn ? 'Our Leaders' : 'Pemimpin Kami'}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {LEADERS.map((leader) => (
              <PersonCard key={leader.slug} leader={leader} locale={locale} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
```

#### Task 1.8.2 — PersonCard component
File: `/root/bersama-io/apps/web/src/components/about/PersonCard.tsx`
```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Twitter, ExternalLink } from 'lucide-react'

interface Leader {
  slug: string
  nameEn: string
  nameBm: string
  titleEn: string
  titleBm: string
  bioEn: string
  bioBm: string
  image: string
  twitter?: string
}

interface PersonCardProps {
  leader: Leader
  locale: string
}

export function PersonCard({ leader, locale }: PersonCardProps) {
  const isEn = locale === 'en'
  const name = isEn ? leader.nameEn : leader.nameBm
  const title = isEn ? leader.titleEn : leader.titleBm
  const bio = isEn ? leader.bioEn : leader.bioBm

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-start gap-4">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
          <Image
            src={leader.image}
            alt={name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{name}</h3>
          <p className="text-sm text-brand-blue-600">{title}</p>
          {leader.twitter && (
            <a
              href={`https://twitter.com/${leader.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <Twitter size={12} />@{leader.twitter}
            </a>
          )}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{bio}</p>
      <Link
        href={`${locale === 'en' ? '/en' : ''}/tentang/${leader.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-800"
      >
        {isEn ? 'Read full bio' : 'Baca biografi penuh'} <ExternalLink size={12} />
      </Link>
    </div>
  )
}
```

---

### 1.9 12-Point Agenda Pages

**Goal:** Individual pages for all 12 agenda items with bilingual content and visual treatment.

#### Task 1.9.1 — Agenda listing page
File: `/root/bersama-io/apps/web/src/app/[locale]/agenda/page.tsx`
```typescript
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { AgendaCard } from '@/components/agenda/AgendaCard'
import { generatePageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generatePageMetadata({
    locale,
    path: '/agenda',
    title: locale === 'en' ? 'Bersama 12-Point Agenda' : 'Agenda 12 Bersama',
    description: locale === 'en'
      ? 'Our 12 commitments to the people of Malaysia.'
      : '12 komitmen kami kepada rakyat Malaysia.',
  })
}

interface AgendaPageProps {
  params: { locale: string }
}

export default async function AgendaPage({ params: { locale } }: AgendaPageProps) {
  setRequestLocale(locale)
  const t = await getTranslations('agenda')

  const payload = await getPayload({ config })
  const { docs: agendaItems } = await payload.find({
    collection: 'agenda-items',
    sort: 'number',
    limit: 12,
  })

  return (
    <div className="py-16">
      <div className="section-container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="section-heading mb-4">{t('title')}</h1>
          <p className="text-lg text-slate-500">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agendaItems.map((item) => (
            <AgendaCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### Task 1.9.2 — Individual agenda item page
File: `/root/bersama-io/apps/web/src/app/[locale]/agenda/[slug]/page.tsx`
```typescript
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@/components/RichText'
import { AgendaNewsFeed } from '@/components/agenda/AgendaNewsFeed'
import type { Metadata } from 'next'

interface AgendaItemPageProps {
  params: { locale: string; slug: string }
}

export async function generateMetadata({ params }: AgendaItemPageProps): Promise<Metadata> {
  const { locale, slug } = params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'agenda-items',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (!docs[0]) return { title: 'Not Found' }

  const item = docs[0]
  const title = locale === 'en' ? item.titleEn : item.titleBm
  const description = locale === 'en' ? item.summaryEn : item.summaryBm

  return {
    title: `${title} — Agenda Bersama`,
    description: description || '',
    openGraph: {
      title,
      description: description || '',
    },
    alternates: {
      languages: {
        'ms': `/agenda/${slug}`,
        'en': `/en/agenda/${slug}`,
      },
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'agenda-items', limit: 12 })
  return docs.map((item) => ({ slug: item.slug }))
}

export default async function AgendaItemPage({ params: { locale, slug } }: AgendaItemPageProps) {
  setRequestLocale(locale)

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'agenda-items',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (!docs[0]) notFound()
  const item = docs[0]

  const isEn = locale === 'en'
  const title = isEn ? item.titleEn : item.titleBm
  const summary = isEn ? item.summaryEn : item.summaryBm
  const content = isEn ? item.contentEn : item.contentBm

  return (
    <div>
      {/* Header with brand color accent */}
      <div className={`bg-${item.color || 'brand-blue-600'} py-16`}>
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-5xl font-black text-white/20">
              {String(item.number).padStart(2, '0')}
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
            {summary && (
              <p className="mt-4 text-lg leading-relaxed text-white/80">{summary}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            {content && (
              <div className="prose prose-slate max-w-none">
                <RichText content={content} />
              </div>
            )}

            {/* Related news */}
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                {isEn ? 'Related News' : 'Berita Berkaitan'}
              </h2>
              <AgendaNewsFeed agendaItemId={String(item.id)} locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### Task 1.9.3 — AgendaCard component
File: `/root/bersama-io/apps/web/src/components/agenda/AgendaCard.tsx`
```typescript
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface AgendaCardProps {
  item: {
    id: string | number
    number: number
    titleBm: string
    titleEn: string
    summaryBm?: string | null
    summaryEn?: string | null
    slug: string
    color?: string | null
    icon?: string | null
  }
  locale: string
}

const COLOR_MAP: Record<string, string> = {
  'blue-600': 'bg-blue-600',
  'yellow-400': 'bg-yellow-400',
  'red-500': 'bg-red-500',
  'green-500': 'bg-green-500',
  'emerald-500': 'bg-emerald-500',
  'blue-500': 'bg-blue-500',
  'orange-500': 'bg-orange-500',
  'purple-600': 'bg-purple-600',
  'lime-600': 'bg-lime-600',
  'yellow-500': 'bg-yellow-500',
  'pink-500': 'bg-pink-500',
  'cyan-500': 'bg-cyan-500',
}

export function AgendaCard({ item, locale }: AgendaCardProps) {
  const isEn = locale === 'en'
  const title = isEn ? item.titleEn : item.titleBm
  const summary = isEn ? item.summaryEn : item.summaryBm
  const href = `${locale === 'en' ? '/en' : ''}/agenda/${item.slug}`
  const colorClass = COLOR_MAP[item.color || 'blue-600'] || 'bg-blue-600'

  return (
    <Link href={href} className="card group block p-6 transition-all hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between">
        <span className={`${colorClass} flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white`}>
          {item.number}
        </span>
      </div>
      <h3 className="mb-2 text-base font-bold text-slate-900 group-hover:text-brand-blue-600">
        {title}
      </h3>
      {summary && (
        <p className="mb-4 text-sm leading-relaxed text-slate-500 line-clamp-3">{summary}</p>
      )}
      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue-600">
        {isEn ? 'Read agenda' : 'Baca agenda'} <ArrowRight size={12} />
      </span>
    </Link>
  )
}
```

---

### 1.10 News Aggregator (RSS)

**Goal:** Fetch, cache, and display headlines from FMT, Malay Mail, The Vibes, Sinar Daily. Legal-safe: headline + 2-sentence excerpt only.

#### Task 1.10.1 — RSS feed fetcher with 15-minute cache
File: `/root/bersama-io/apps/web/src/lib/rss.ts`
```typescript
import Parser from 'rss-parser'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

const parser = new Parser({
  timeout: 10_000,
  headers: {
    'User-Agent': 'bersama.io/1.0 RSS Aggregator (+https://bersama.io)',
  },
})

export const RSS_SOURCES = [
  {
    id: 'fmt' as const,
    name: 'Free Malaysia Today',
    url: 'https://www.freemalaysiatoday.com/feed/',
  },
  {
    id: 'malay-mail' as const,
    name: 'Malay Mail',
    url: 'https://www.malaymail.com/feed',
  },
  {
    id: 'the-vibes' as const,
    name: 'The Vibes',
    url: 'https://www.thevibes.com/feed',
  },
  {
    id: 'sinar-daily' as const,
    name: 'Sinar Daily',
    url: 'https://www.sinarharian.com.my/feed/',
  },
] as const

type SourceId = (typeof RSS_SOURCES)[number]['id']

// Extract a 2-sentence excerpt from text (legal compliance)
function extractExcerpt(html: string, maxChars = 300): string {
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()

  // Split into sentences and take first 2
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  const excerpt = sentences.slice(0, 2).join(' ').trim()

  // Hard truncate at maxChars as safety net
  return excerpt.length > maxChars ? excerpt.slice(0, maxChars) + '…' : excerpt
}

export interface ParsedNewsItem {
  guid: string
  title: string
  excerpt: string
  sourceUrl: string
  source: SourceId
  publishedAt: Date
}

export async function fetchRSSFeed(source: (typeof RSS_SOURCES)[number]): Promise<ParsedNewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items.slice(0, 20).map((item) => ({
      guid: item.guid || item.link || crypto.randomUUID(),
      title: item.title || '(No title)',
      excerpt: extractExcerpt(item.content || item.contentSnippet || item.summary || ''),
      sourceUrl: item.link || '',
      source: source.id,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    }))
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${source.name}:`, error)
    return []
  }
}

export async function syncAllFeeds(): Promise<void> {
  console.log('[RSS] Starting feed sync...')
  const payload = await getPayload({ config })

  for (const source of RSS_SOURCES) {
    const items = await fetchRSSFeed(source)
    console.log(`[RSS] ${source.name}: ${items.length} items`)

    for (const item of items) {
      if (!item.excerpt || !item.sourceUrl) continue

      try {
        // Upsert by GUID (deduplication)
        const existing = await payload.find({
          collection: 'news-items',
          where: { guid: { equals: item.guid } },
          limit: 1,
        })

        if (existing.docs.length === 0) {
          await payload.create({
            collection: 'news-items',
            data: {
              title: item.title,
              excerpt: item.excerpt,
              sourceUrl: item.sourceUrl,
              source: item.source,
              publishedAt: item.publishedAt.toISOString(),
              guid: item.guid,
            },
          })
        }
      } catch (e) {
        console.error(`[RSS] Failed to upsert item ${item.guid}:`, e)
      }
    }
  }
  console.log('[RSS] Feed sync complete.')
}
```

#### Task 1.10.2 — RSS sync API route (CRON trigger, rate-limited)
File: `/root/bersama-io/apps/web/src/app/api/rss-sync/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { syncAllFeeds } from '@/lib/rss'

// Minimum 15 minutes between syncs (legal requirement)
const SYNC_INTERVAL_MS = 15 * 60 * 1000
let lastSyncTime = 0

export async function POST(req: NextRequest) {
  // Verify CRON_SECRET to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const timeSinceLastSync = now - lastSyncTime

  if (timeSinceLastSync < SYNC_INTERVAL_MS) {
    const waitSeconds = Math.ceil((SYNC_INTERVAL_MS - timeSinceLastSync) / 1000)
    return NextResponse.json(
      { error: `Rate limited. Wait ${waitSeconds}s before next sync.` },
      { status: 429 },
    )
  }

  lastSyncTime = now

  try {
    await syncAllFeeds()
    return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() })
  } catch (error) {
    console.error('[RSS sync] Error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
```

#### Task 1.10.3 — News listing page
File: `/root/bersama-io/apps/web/src/app/[locale]/berita/page.tsx`
```typescript
import { setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NewsCard } from '@/components/news/NewsCard'
import { generatePageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generatePageMetadata({
    locale,
    path: '/berita',
    title: locale === 'en' ? 'Latest News' : 'Berita Terkini',
    description: locale === 'en'
      ? 'Latest political news from Malaysia — curated and tagged by Bersama agenda items.'
      : 'Berita politik terkini dari Malaysia — dikurasi dan ditanda mengikut agenda Bersama.',
  })
}

interface BeritaPageProps {
  params: { locale: string }
  searchParams: { agenda?: string; source?: string; page?: string }
}

export default async function BeritaPage({ params: { locale }, searchParams }: BeritaPageProps) {
  setRequestLocale(locale)
  const isEn = locale === 'en'

  const page = Number(searchParams.page) || 1
  const payload = await getPayload({ config })

  const whereClause: Record<string, unknown> = {}
  if (searchParams.source) {
    whereClause.source = { equals: searchParams.source }
  }

  const { docs: newsItems, totalDocs, totalPages } = await payload.find({
    collection: 'news-items',
    where: whereClause,
    sort: '-publishedAt',
    limit: 20,
    page,
  })

  return (
    <div className="py-16">
      <div className="section-container">
        <div className="mb-10">
          <h1 className="section-heading">{isEn ? 'Latest News' : 'Berita Terkini'}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {isEn
              ? 'Headlines and excerpts from original sources. Click to read the full article.'
              : 'Tajuk dan petikan daripada sumber asal. Klik untuk baca artikel penuh.'}
          </p>
        </div>

        {newsItems.length === 0 ? (
          <p className="text-slate-400">{isEn ? 'No news at this time.' : 'Tiada berita buat masa ini.'}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {newsItems.map((item) => (
              <NewsCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${p === page ? 'bg-brand-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Task 1.10.4 — NewsCard component (legal-safe display)
File: `/root/bersama-io/apps/web/src/components/news/NewsCard.tsx`
```typescript
import { ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ms } from 'date-fns/locale'

const SOURCE_LABELS: Record<string, string> = {
  'fmt': 'Free Malaysia Today',
  'malay-mail': 'Malay Mail',
  'the-vibes': 'The Vibes',
  'sinar-daily': 'Sinar Daily',
}

interface NewsCardProps {
  item: {
    id: string | number
    title: string
    excerpt: string
    sourceUrl: string
    source: string
    publishedAt: string
  }
  locale: string
}

export function NewsCard({ item, locale }: NewsCardProps) {
  const isEn = locale === 'en'
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
    locale: isEn ? undefined : ms,
  })

  return (
    <article className="card flex flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className={`badge-${item.source}`}>{SOURCE_LABELS[item.source] || item.source}</span>
        <time className="text-xs text-slate-400" dateTime={item.publishedAt}>{timeAgo}</time>
      </div>

      <h3 className="mb-2 flex-1 text-sm font-semibold leading-snug text-slate-900 line-clamp-3">
        {item.title}
      </h3>

      {/* 2-sentence excerpt — legal compliance */}
      <p className="mb-4 text-xs leading-relaxed text-slate-500 line-clamp-3">{item.excerpt}</p>

      {/* Always link out to original */}
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue-600 hover:text-brand-blue-800"
      >
        {isEn ? 'Read full article' : 'Baca artikel penuh'} <ExternalLink size={12} />
      </a>
    </article>
  )
}
```

---

### 1.11 Johor Election Hub

**Goal:** Dedicated section with live blog capability.

#### Task 1.11.1 — Johor hub page
File: `/root/bersama-io/apps/web/src/app/[locale]/johor-pilihan-raya/page.tsx`
```typescript
import { setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LiveBlog } from '@/components/johor/LiveBlog'
import { JohorNewsSection } from '@/components/johor/JohorNewsSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pilihan Raya Negeri Johor 2026 — bersama.io',
  description: 'Ikuti perkembangan terkini PRN Johor 2026. Blog langsung, keputusan, dan analisis.',
  alternates: {
    languages: {
      'ms': '/johor-pilihan-raya',
      'en': '/en/johor-election',
    },
  },
}

// Revalidate every 30 seconds during results night
export const revalidate = 30

interface JohorPageProps {
  params: { locale: string }
}

export default async function JohorPage({ params: { locale } }: JohorPageProps) {
  setRequestLocale(locale)
  const isEn = locale === 'en'

  const payload = await getPayload({ config })

  // Fetch latest live blog posts (pinned first, then by date)
  const { docs: livePosts } = await payload.find({
    collection: 'live-blog-posts',
    sort: ['-isPinned', '-publishedAt'],
    limit: 50,
  })

  // Fetch Johor-tagged news
  const { docs: johorNews } = await payload.find({
    collection: 'news-items',
    where: { isJohorElection: { equals: true } },
    sort: '-publishedAt',
    limit: 12,
  })

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 py-16 text-white">
        <div className="section-container">
          <div className="live-indicator mb-4">{isEn ? 'Following Live' : 'Ikuti Langsung'}</div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {isEn ? 'Johor State Election 2026' : 'Pilihan Raya Negeri Johor 2026'}
          </h1>
          <p className="mt-3 text-red-100">
            {isEn
              ? 'Johor state assembly dissolved June 1, 2026. Follow every development here.'
              : 'DUN Johor dibubarkan 1 Jun 2026. Ikuti setiap perkembangan di sini.'}
          </p>

          {/* Key dates */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: isEn ? 'Assembly Dissolved' : 'DUN Dibubarkan', date: '1 Jun 2026' },
              { label: isEn ? 'Nomination Day' : 'Hari Pencalonan', date: 'TBA' },
              { label: isEn ? 'Polling Day' : 'Hari Mengundi', date: 'TBA (within 60 days)' },
            ].map((d) => (
              <div key={d.label} className="rounded-lg bg-red-800/50 p-4">
                <p className="text-xs text-red-200">{d.label}</p>
                <p className="mt-1 text-sm font-semibold">{d.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Live blog — main column */}
          <div className="lg:col-span-2">
            <LiveBlog posts={livePosts} locale={locale} />
          </div>

          {/* Sidebar: Johor news */}
          <div>
            <JohorNewsSection news={johorNews} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### Task 1.11.2 — LiveBlog component with polling
File: `/root/bersama-io/apps/web/src/components/johor/LiveBlog.tsx`
```typescript
'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ms } from 'date-fns/locale'
import { Pin, AlertCircle, BarChart2, Lightbulb, RefreshCw } from 'lucide-react'
import type { LiveBlogPost } from '@/payload-types'

const TYPE_CONFIG = {
  breaking: { icon: AlertCircle, color: 'red', label: { ms: 'Terkini', en: 'Breaking' } },
  result: { icon: BarChart2, color: 'blue', label: { ms: 'Keputusan', en: 'Result' } },
  update: { icon: RefreshCw, color: 'slate', label: { ms: 'Kemaskini', en: 'Update' } },
  analysis: { icon: Lightbulb, color: 'yellow', label: { ms: 'Analisis', en: 'Analysis' } },
}

interface LiveBlogProps {
  posts: LiveBlogPost[]
  locale: string
}

export function LiveBlog({ posts: initialPosts, locale }: LiveBlogProps) {
  const [posts, setPosts] = useState(initialPosts)
  const isEn = locale === 'en'

  // Poll for new posts every 30 seconds
  const poll = useCallback(async () => {
    try {
      const latestTs = posts[0]?.publishedAt
      const res = await fetch(
        `/api/liveblog?after=${latestTs || ''}&locale=${locale}`,
        { cache: 'no-store' },
      )
      if (!res.ok) return
      const { docs } = await res.json()
      if (docs.length > 0) {
        setPosts((prev) => [...docs, ...prev])
      }
    } catch { /* silent fail */ }
  }, [posts, locale])

  useEffect(() => {
    const interval = setInterval(poll, 30_000)
    return () => clearInterval(interval)
  }, [poll])

  if (posts.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-400">
        {isEn ? 'Live updates will appear here.' : 'Kemaskini langsung akan muncul di sini.'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {isEn ? 'Live Blog' : 'Blog Langsung'}
        </h2>
        <div className="live-indicator">{isEn ? 'Live' : 'Langsung'}</div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          const typeConf = TYPE_CONFIG[post.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.update
          const Icon = typeConf.icon
          const typeLabel = typeConf.label[locale as 'ms' | 'en'] || typeConf.label.en
          const timeAgo = formatDistanceToNow(new Date(post.publishedAt), {
            addSuffix: true,
            locale: isEn ? undefined : ms,
          })

          return (
            <article
              key={post.id}
              className={`card p-5 ${post.isPinned ? 'ring-2 ring-brand-yellow-400' : ''}`}
            >
              <div className="mb-3 flex items-center gap-3">
                {post.isPinned && <Pin size={14} className="text-brand-yellow-500" />}
                <span className={`badge-source bg-${typeConf.color}-100 text-${typeConf.color}-800`}>
                  <Icon size={10} className="mr-1 inline" /> {typeLabel}
                </span>
                {post.seat && (
                  <span className="text-xs font-medium text-slate-500">{post.seat}</span>
                )}
                <time className="ml-auto text-xs text-slate-400">{timeAgo}</time>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">{post.title}</h3>
              {post.winner && (
                <div className="mb-2 rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-800">
                  🏆 {isEn ? 'Winner' : 'Pemenang'}: {post.winner}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
```

#### Task 1.11.3 — Live blog API route
File: `/root/bersama-io/apps/web/src/app/api/liveblog/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const after = searchParams.get('after')

  const payload = await getPayload({ config })

  const whereClause = after
    ? { publishedAt: { greater_than: after } }
    : {}

  const { docs } = await payload.find({
    collection: 'live-blog-posts',
    where: whereClause,
    sort: '-publishedAt',
    limit: 20,
  })

  return NextResponse.json(
    { docs },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
```

---

### 1.12 Events Calendar

**Goal:** CMS-driven events listing, read-only.

#### Task 1.12.1 — Events page
File: `/root/bersama-io/apps/web/src/app/[locale]/acara/page.tsx`
```typescript
import { setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EventCard } from '@/components/events/EventCard'
import { generatePageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generatePageMetadata({
    locale,
    path: '/acara',
    title: locale === 'en' ? 'Events' : 'Acara',
    description: locale === 'en' ? 'Upcoming Bersama events near you.' : 'Acara Bersama akan datang berhampiran anda.',
  })
}

interface AcaraPageProps {
  params: { locale: string }
}

export default async function AcaraPage({ params: { locale } }: AcaraPageProps) {
  setRequestLocale(locale)
  const isEn = locale === 'en'

  const payload = await getPayload({ config })
  const { docs: events } = await payload.find({
    collection: 'events',
    where: {
      startDate: { greater_than_equal: new Date().toISOString() },
    },
    sort: 'startDate',
    limit: 20,
  })

  return (
    <div className="py-16">
      <div className="section-container">
        <h1 className="section-heading mb-10">{isEn ? 'Upcoming Events' : 'Acara Akan Datang'}</h1>

        {events.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-16 text-center text-slate-400">
            {isEn ? 'No upcoming events at this time.' : 'Tiada acara akan datang buat masa ini.'}
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Task 1.12.2 — EventCard component
File: `/root/bersama-io/apps/web/src/components/events/EventCard.tsx`
```typescript
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ms } from 'date-fns/locale'

interface EventCardProps {
  event: {
    id: string | number
    titleBm: string
    titleEn?: string | null
    startDate: string
    endDate?: string | null
    locationBm?: string | null
    locationEn?: string | null
    registrationUrl?: string | null
    isJohorElection?: boolean | null
  }
  locale: string
}

export function EventCard({ event, locale }: EventCardProps) {
  const isEn = locale === 'en'
  const title = isEn ? (event.titleEn || event.titleBm) : event.titleBm
  const location = isEn ? (event.locationEn || event.locationBm) : event.locationBm
  const dateLocale = isEn ? undefined : ms
  const dateStr = format(new Date(event.startDate), 'PPPp', { locale: dateLocale })

  return (
    <div className={`card flex gap-4 p-5 ${event.isJohorElection ? 'border-l-4 border-l-red-500' : ''}`}>
      {/* Date block */}
      <div className="flex-shrink-0 text-center">
        <div className="rounded-lg bg-brand-blue-50 p-3 text-brand-blue-700">
          <Calendar size={20} />
          <div className="mt-1 text-xs font-bold">
            {format(new Date(event.startDate), 'dd MMM', { locale: dateLocale })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {event.isJohorElection && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              PRN Johor
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{dateStr}</p>
        {location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={12} /> {location}
          </p>
        )}
        {event.registrationUrl && (
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-blue-600"
          >
            {isEn ? 'Register' : 'Daftar'} <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}
```

---

### 1.13 SEO & Google News Compliance

**Goal:** News sitemap, Article JSON-LD, hreflang, author bylines. Google News ready.

#### Task 1.13.1 — next-sitemap config
File: `/root/bersama-io/apps/web/next-sitemap.config.js`
```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://bersama.io',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/cms', '/api/'] },
    ],
    additionalSitemaps: [
      'https://bersama.io/news-sitemap.xml',
    ],
  },
  alternateRefs: [
    { href: 'https://bersama.io', hreflang: 'ms' },
    { href: 'https://bersama.io/en', hreflang: 'en' },
    { href: 'https://bersama.io', hreflang: 'x-default' },
  ],
  exclude: ['/cms', '/cms/*', '/api/*'],
}
```

#### Task 1.13.2 — News sitemap API route
File: `/root/bersama-io/apps/web/src/app/news-sitemap.xml/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  // Articles from last 2 days (Google News requirement)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { status: { equals: 'published' } },
        { publishedAt: { greater_than: twoDaysAgo } },
      ],
    },
    sort: '-publishedAt',
    limit: 1000,
  })

  const urls = articles
    .map((article) => `
  <url>
    <loc>https://bersama.io/artikel/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>bersama.io</news:name>
        <news:language>ms</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt}</news:publication_date>
      <news:title>${article.title?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
    <xhtml:link rel="alternate" hreflang="ms" href="https://bersama.io/artikel/${article.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="https://bersama.io/en/artikel/${article.slug}" />
  </url>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=900, s-maxage=900', // 15min cache
    },
  })
}
```

#### Task 1.13.3 — Article JSON-LD component
File: `/root/bersama-io/apps/web/src/components/seo/ArticleJsonLd.tsx`
```typescript
interface ArticleJsonLdProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  author: string
  publishedAt: string
  modifiedAt?: string
  locale: string
}

export function ArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  author,
  publishedAt,
  modifiedAt,
  locale,
}: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    url,
    image: imageUrl ? [imageUrl] : undefined,
    author: {
      '@type': 'Person',
      name: author,
      url: 'https://bersama.io/tentang',
    },
    publisher: {
      '@type': 'Organization',
      name: 'bersama.io',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bersama.io/logo.png',
        width: 200,
        height: 60,
      },
    },
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    inLanguage: locale === 'en' ? 'en-MY' : 'ms-MY',
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

#### Task 1.13.4 — Metadata helper
File: `/root/bersama-io/apps/web/src/lib/metadata.ts`
```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface PageMetadataOptions {
  locale: string
  path: string
  title?: string
  titleKey?: string
  description?: string
  descriptionKey?: string
  image?: string
}

export async function generatePageMetadata({
  locale,
  path,
  title,
  titleKey,
  description,
  descriptionKey,
  image,
}: PageMetadataOptions): Promise<Metadata> {
  const t = await getTranslations({ locale })
  const resolvedTitle = title || (titleKey ? t(titleKey as Parameters<typeof t>[0]) : 'bersama.io')
  const resolvedDescription = description || (descriptionKey ? t(descriptionKey as Parameters<typeof t>[0]) : '')

  const baseUrl = 'https://bersama.io'
  const canonicalUrl = locale === 'en' ? `${baseUrl}/en${path}` : `${baseUrl}${path}`
  const ogImage = image || `${baseUrl}/api/og?title=${encodeURIComponent(resolvedTitle)}&locale=${locale}`

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ms': `${baseUrl}${path}`,
        'en': `${baseUrl}/en${path}`,
        'x-default': `${baseUrl}${path}`,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      siteName: 'bersama.io',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: locale === 'en' ? 'en_MY' : 'ms_MY',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
```

---

### 1.14 PWA Setup

**Goal:** Installable PWA with offline shell.

#### Task 1.14.1 — Web app manifest
File: `/root/bersama-io/apps/web/public/manifest.json`
```json
{
  "name": "bersama.io — Suara Penyokong",
  "short_name": "bersama.io",
  "description": "Platform penyokong Parti Bersama Malaysia",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1d4ed8",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png"
    }
  ]
}
```

#### Task 1.14.2 — Service Worker
File: `/root/bersama-io/apps/web/public/sw.js`
```javascript
const CACHE_NAME = 'bersama-v1'
const OFFLINE_URL = '/offline'

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/en',
  '/offline',
  '/manifest.json',
]

// Install: precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network first, fallback to cache, then offline page
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for HTML and assets
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached

        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL)
        }
      })
  )
})

// Push notifications (Phase 1: basic support via OneSignal)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'bersama.io', {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
```

#### Task 1.14.3 — SW registration script + head meta
File: `/root/bersama-io/apps/web/src/components/PwaInit.tsx`
```typescript
'use client'

import { useEffect } from 'react'

export function PwaInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registered:', reg.scope))
        .catch((err) => console.error('[SW] Registration failed:', err))
    }
  }, [])

  return null
}
```

Add `<PwaInit />` to the root layout `<body>` and add to `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1d4ed8" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

---

### 1.15 Email Signup (Resend)

**Goal:** PDPA-compliant email subscribe API route.

#### Task 1.15.1 — Subscribe API route
File: `/root/bersama-io/apps/web/src/app/api/subscribe/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const subscribeSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  locale: z.enum(['ms', 'en']).default('ms'),
  // Honeypot
  website: z.string().max(0).optional(),
})

// PDPA consent text — stored verbatim
const CONSENT_TEXT = 'I agree to receive news updates from bersama.io. I can unsubscribe at any time. No IC/NRIC is collected.'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid data', errors: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, locale, website } = parsed.data

  // Server-side honeypot check
  if (website) {
    // Silently succeed to fool bots
    return NextResponse.json({ ok: true })
  }

  // Hash IP for PDPA compliance (no raw IPs stored)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

  try {
    const payload = await getPayload({ config })

    // Check if already subscribed
    const existing = await payload.find({
      collection: 'email-subscribers',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ ok: true, message: 'Already subscribed' })
    }

    // Store in Payload (PDPA-compliant)
    await payload.create({
      collection: 'email-subscribers',
      data: {
        name,
        email,
        consentGiven: true,
        consentText: CONSENT_TEXT,
        ipHash,
      },
    })

    // Add to Listmonk
    await addToListmonk(name, email, locale)

    // Send welcome email via Resend
    const isEn = locale === 'en'
    await resend.emails.send({
      from: 'bersama.io <hello@bersama.io>',
      to: email,
      subject: isEn ? 'Welcome to bersama.io!' : 'Selamat datang ke bersama.io!',
      html: buildWelcomeEmail(name, locale),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[subscribe] Error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

async function addToListmonk(name: string, email: string, locale: string): Promise<void> {
  const listmonkUrl = process.env.LISTMONK_URL
  const apiKey = process.env.LISTMONK_API_KEY
  const listId = Number(process.env.LISTMONK_LIST_ID) || 1

  if (!listmonkUrl || !apiKey) return

  try {
    await fetch(`${listmonkUrl}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        name,
        status: 'enabled',
        lists: [listId],
        attribs: { locale },
      }),
    })
  } catch (e) {
    console.error('[Listmonk] Failed to add subscriber:', e)
    // Don't throw — Listmonk failure shouldn't block signup
  }
}

function buildWelcomeEmail(name: string, locale: string): string {
  const isEn = locale === 'en'
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#1d4ed8;font-size:24px;margin-bottom:4px;">bersama<span style="color:#facc15;">.io</span></h1>
    <p style="color:#64748b;font-size:14px;">Suara Penyokong, Bebas & Berani</p>
  </div>

  <h2 style="font-size:20px;">${isEn ? `Welcome, ${name}!` : `Selamat datang, ${name}!`}</h2>
  <p>${isEn
    ? 'Thank you for subscribing to bersama.io. We\'ll keep you updated on the latest news, Bersama\'s agenda, and important events — including the Johor state election.'
    : 'Terima kasih kerana melanggan bersama.io. Kami akan mengemas kini anda dengan berita terkini, agenda Bersama, dan acara penting — termasuk pilihan raya negeri Johor.'
  }</p>

  <div style="margin:24px 0;padding:16px;background:#eff6ff;border-radius:8px;">
    <h3 style="margin:0 0 8px;">${isEn ? 'What you\'ll receive:' : 'Apa yang anda akan terima:'}</h3>
    <ul style="margin:0;padding-left:20px;color:#475569;">
      <li>${isEn ? 'Breaking political news' : 'Berita politik terkini'}</li>
      <li>${isEn ? 'Bersama agenda updates' : 'Kemaskini agenda Bersama'}</li>
      <li>${isEn ? 'Johor election coverage' : 'Liputan PRN Johor'}</li>
      <li>${isEn ? 'Event announcements' : 'Pengumuman acara'}</li>
    </ul>
  </div>

  <p style="font-size:12px;color:#94a3b8;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;">
    ${isEn
      ? 'You can unsubscribe at any time. bersama.io is an unofficial supporter platform. No IC/NRIC data is stored.'
      : 'Anda boleh berhenti langgan pada bila-bila masa. bersama.io adalah platform penyokong tidak rasmi. Tiada data IC/NRIC disimpan.'
    }
    <br>bersama.io
  </p>
</body>
</html>`
}
```

---

### 1.16 PDPA Privacy Policy Page

**Goal:** Clear, bilingual PDPA-compliant privacy policy.

File: `/root/bersama-io/apps/web/src/app/[locale]/privasi/page.tsx`
```typescript
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polisi Privasi — bersama.io',
  description: 'Cara kami melindungi data anda selaras dengan PDPA 2010.',
}

export default function PrivasiPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const isEn = locale === 'en'

  return (
    <div className="py-16">
      <div className="section-container">
        <div className="mx-auto max-w-3xl prose prose-slate">
          <h1>{isEn ? 'Privacy Policy' : 'Polisi Privasi'}</h1>
          <p className="lead">
            {isEn
              ? 'Last updated: June 2026. bersama.io is committed to protecting your privacy in compliance with the Personal Data Protection Act 2010 (PDPA) of Malaysia.'
              : 'Dikemas kini: Jun 2026. bersama.io komited untuk melindungi privasi anda selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia.'
            }
          </p>

          <h2>{isEn ? '1. What Data We Collect' : '1. Data yang Kami Kumpul'}</h2>
          <p>
            {isEn
              ? 'When you subscribe to our newsletter, we collect: your name, email address, and the date you subscribed. We also store a cryptographic hash (SHA-256) of your IP address — not the IP address itself — for abuse prevention.'
              : 'Apabila anda melanggan surat berita kami, kami mengumpul: nama anda, alamat emel, dan tarikh anda melanggan. Kami juga menyimpan cincang kriptografi (SHA-256) alamat IP anda — bukan alamat IP itu sendiri — untuk pencegahan penyalahgunaan.'
            }
          </p>

          <h2>{isEn ? '2. What We Never Collect' : '2. Yang Tidak Pernah Kami Kumpul'}</h2>
          <ul>
            <li>{isEn ? 'IC/NRIC number (never, under any circumstances)' : 'Nombor IC/NRIC (tidak pernah, dalam apa jua keadaan)'}</li>
            <li>{isEn ? 'Political affiliation without explicit consent' : 'Afiliasi politik tanpa persetujuan eksplisit'}</li>
            <li>{isEn ? 'Financial information' : 'Maklumat kewangan'}</li>
            <li>{isEn ? 'Biometric data' : 'Data biometrik'}</li>
          </ul>

          <h2>{isEn ? '3. How We Use Your Data' : '3. Cara Kami Menggunakan Data Anda'}</h2>
          <p>
            {isEn
              ? 'Your data is used solely to: send you news updates you have opted into, and improve our services. We do not sell, rent, or share your data with any third party for marketing purposes.'
              : 'Data anda digunakan semata-mata untuk: menghantar kemaskini berita yang anda telah pilih untuk terima, dan meningkatkan perkhidmatan kami. Kami tidak menjual, menyewa, atau berkongsi data anda dengan mana-mana pihak ketiga untuk tujuan pemasaran.'
            }
          </p>

          <h2>{isEn ? '4. Your Rights (PDPA)' : '4. Hak Anda (PDPA)'}</h2>
          <ul>
            <li>{isEn ? 'Right to access your data' : 'Hak untuk mengakses data anda'}</li>
            <li>{isEn ? 'Right to correct inaccurate data' : 'Hak untuk membetulkan data yang tidak tepat'}</li>
            <li>{isEn ? 'Right to withdraw consent at any time' : 'Hak untuk menarik balik persetujuan pada bila-bila masa'}</li>
            <li>{isEn ? 'Right to have your data deleted' : 'Hak untuk memadamkan data anda'}</li>
          </ul>
          <p>
            {isEn
              ? 'To exercise any of these rights, contact us at: privacy@bersama.io'
              : 'Untuk menggunakan mana-mana hak ini, hubungi kami di: privacy@bersama.io'
            }
          </p>

          <h2>{isEn ? '5. Data Retention' : '5. Tempoh Penyimpanan Data'}</h2>
          <p>
            {isEn
              ? 'We retain your data for as long as you are subscribed. Upon unsubscription, your data is deleted within 30 days.'
              : 'Kami menyimpan data anda selagi anda melanggan. Selepas berhenti langgan, data anda akan dipadamkan dalam masa 30 hari.'
            }
          </p>

          <h2>{isEn ? '6. Third-Party Services' : '6. Perkhidmatan Pihak Ketiga'}</h2>
          <p>
            {isEn
              ? 'We use: Resend (email delivery), Listmonk (newsletter management), Google Analytics 4 and Microsoft Clarity (anonymised usage analytics), OneSignal (push notifications). Each service has its own privacy policy.'
              : 'Kami menggunakan: Resend (penghantaran emel), Listmonk (pengurusan surat berita), Google Analytics 4 dan Microsoft Clarity (analitik penggunaan yang dianonimkan), OneSignal (pemberitahuan push). Setiap perkhidmatan mempunyai polisi privasi tersendiri.'
            }
          </p>

          <h2>{isEn ? '7. Cookies' : '7. Kuki'}</h2>
          <p>
            {isEn
              ? 'We use essential cookies for language preference and session management. Analytics cookies from GA4/Clarity can be disabled via your browser settings.'
              : 'Kami menggunakan kuki penting untuk pilihan bahasa dan pengurusan sesi. Kuki analitik dari GA4/Clarity boleh dilumpuhkan melalui tetapan pelayar anda.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

### 1.17 Analytics (GA4 + Clarity)

**Goal:** GA4 and Microsoft Clarity via GTM or direct script injection.

#### Task 1.17.1 — Analytics component
File: `/root/bersama-io/apps/web/src/components/Analytics.tsx`
```typescript
import Script from 'next/script'

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

  return (
    <>
      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}
    </>
  )
}
```

Add `<Analytics />` inside the root layout `<body>` (server component safe — it uses Script which defers).

---

### 1.18 OneSignal Web Push

**Goal:** Web push notifications for breaking news and Johor election alerts.

#### Task 1.18.1 — OneSignal init component
File: `/root/bersama-io/apps/web/src/components/OneSignalInit.tsx`
```typescript
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: unknown) => void>
  }
}

export function OneSignalInit() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  useEffect(() => {
    if (!appId) return

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async function (OneSignal: {
      init: (config: Record<string, unknown>) => Promise<void>
    }) {
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: { enable: false }, // Use custom UI
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: 'push',
                autoPrompt: false, // Only prompt when user clicks "allow notifications"
                text: {
                  actionMessage: 'Mahu dapatkan kemaskini PRN Johor secara langsung?',
                  acceptButton: 'Ya, beritahu saya',
                  cancelButton: 'Tidak',
                },
              },
            ],
          },
        },
      })
    })

    // Load OneSignal SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    document.head.appendChild(script)
  }, [appId])

  return null
}
```

---

### 1.19 OG Images & Social Meta

**Goal:** Dynamic OG images using Next.js ImageResponse (edge runtime).

#### Task 1.19.1 — OG image route
File: `/root/bersama-io/apps/web/src/app/api/og/route.tsx`
```typescript
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'bersama.io'
  const subtitle = searchParams.get('subtitle') || 'Suara Penyokong, Bebas & Berani'
  const locale = searchParams.get('locale') || 'ms'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f1e42 0%, #1d4ed8 60%, #1e40af 100%)',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '40px' }}>
          <span style={{ color: '#60a5fa', fontSize: 36, fontWeight: 900 }}>bersama</span>
          <span style={{ color: '#facc15', fontSize: 36, fontWeight: 900 }}>.io</span>
        </div>

        {/* Title */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p
            style={{
              color: 'white',
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.2,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 28, margin: '20px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px 24px',
            marginTop: '40px',
          }}
        >
          <span style={{ color: '#facc15', fontSize: 20, fontWeight: 600 }}>
            Suara Penyokong, Bebas & Berani
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>bersama.io</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
```

---

### 1.20 Coolify Deployment

**Goal:** Deploy to Hetzner Singapore via Coolify with Docker.

#### Task 1.20.1 — Dockerfile
File: `/root/bersama-io/apps/web/Dockerfile`
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/api-client/package.json ./packages/api-client/

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Build
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_CLARITY_ID
ARG NEXT_PUBLIC_ONESIGNAL_APP_ID

RUN pnpm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Task 1.20.2 — Docker Compose for Coolify
File: `/root/bersama-io/docker-compose.coolify.yml`
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        NEXT_PUBLIC_SERVER_URL: ${NEXT_PUBLIC_SERVER_URL}
        NEXT_PUBLIC_GA_ID: ${NEXT_PUBLIC_GA_ID}
        NEXT_PUBLIC_CLARITY_ID: ${NEXT_PUBLIC_CLARITY_ID}
        NEXT_PUBLIC_ONESIGNAL_APP_ID: ${NEXT_PUBLIC_ONESIGNAL_APP_ID}
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      NEXT_PUBLIC_SERVER_URL: ${NEXT_PUBLIC_SERVER_URL}
      CLOUDFLARE_R2_BUCKET: ${CLOUDFLARE_R2_BUCKET}
      CLOUDFLARE_R2_ENDPOINT: ${CLOUDFLARE_R2_ENDPOINT}
      CLOUDFLARE_R2_ACCESS_KEY_ID: ${CLOUDFLARE_R2_ACCESS_KEY_ID}
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: ${CLOUDFLARE_R2_SECRET_ACCESS_KEY}
      CLOUDFLARE_R2_PUBLIC_URL: ${CLOUDFLARE_R2_PUBLIC_URL}
      RESEND_API_KEY: ${RESEND_API_KEY}
      LISTMONK_URL: ${LISTMONK_URL}
      LISTMONK_API_KEY: ${LISTMONK_API_KEY}
      LISTMONK_LIST_ID: ${LISTMONK_LIST_ID}
      ONESIGNAL_APP_ID: ${ONESIGNAL_APP_ID}
      CRON_SECRET: ${CRON_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Task 1.20.3 — Health check API route
File: `/root/bersama-io/apps/web/src/app/api/health/route.ts`
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  })
}
```

#### Task 1.20.4 — Coolify deployment steps
```
# In Coolify dashboard (https://coolify.bersama.io or Hetzner IP):
# 1. New Project → "bersama-io"
# 2. New Service → Docker Compose → paste docker-compose.coolify.yml
# 3. Environment → add all vars from .env.example
# 4. Domain → bersama.io (port 3000)
# 5. SSL → Let's Encrypt (auto)
# 6. Deploy

# Listmonk sidecar:
# 1. New Service → Docker → image: listmonk/listmonk:latest
# 2. Domain → listmonk.bersama.io (port 9000)
# 3. Environment: LISTMONK_db__host, LISTMONK_db__password etc.

# CRON — RSS sync every 30 minutes:
# 1. In Coolify → Scheduled Tasks (or use Coolify's built-in cron)
# OR add to Coolify as a cron service that POSTs to /api/rss-sync:
# Schedule: */30 * * * *
# Command: curl -X POST https://bersama.io/api/rss-sync \
#            -H "x-cron-secret: $CRON_SECRET"
```

#### Verification 1.20
```bash
# After deployment:
curl -s https://bersama.io/api/health | python3 -m json.tool
# Expected: {"status": "ok", "timestamp": "...", "version": "0.1.0"}

curl -s https://bersama.io/ -o /dev/null -w "%{http_code}"
# Expected: 200
```

---

### 1.21 Cloudflare DNS + Proxy

**Goal:** Cloudflare proxy in front of Hetzner for CDN, WAF, and DDoS protection.

#### Task 1.21.1 — Cloudflare setup steps
```
# DNS Records (in Cloudflare dashboard):
# A record: bersama.io → <Hetzner IP> [Proxied ✓]
# A record: www.bersama.io → <Hetzner IP> [Proxied ✓]
# A record: listmonk.bersama.io → <Hetzner IP> [Proxied ✓]
# CNAME: r2.bersama.io → <R2 bucket custom domain> [Proxied ✓]

# Page Rules:
# 1. bersama.io/cms* → Cache Level: Bypass
# 2. bersama.io/api/* → Cache Level: Bypass
# 3. bersama.io/* → Cache Level: Standard, Edge Cache TTL: 1 hour

# WAF Rules:
# 1. Block countries with high bot traffic if needed
# 2. Rate limit: /api/subscribe → max 10 req/min per IP
# 3. Rate limit: /api/rss-sync → max 4 req/hour per IP (belt + suspenders)

# Speed → Optimization:
# ✓ Minify: JS, CSS, HTML
# ✓ Brotli compression
# ✓ HTTP/3 (QUIC)
# ✓ Early Hints

# SSL/TLS:
# Mode: Full (strict)
# Min TLS: 1.2
# HSTS: Enable (max-age 6 months)
```

#### Task 1.21.2 — Redirect www → apex
```
# In Cloudflare → Rules → Redirect Rules:
# When: hostname is "www.bersama.io"
# Then: Static redirect to https://bersama.io/$1 (301)
```

---

## Phase 2 — Community (Month 2)

> Less granular — full task breakdown to be written once Phase 1 ships.

### 2.1 User Authentication
- Payload built-in auth with email + OTP flow (no passwords)
- Magic link emails via Resend
- Session management with HttpOnly cookies
- Logout, session expiry (7 days)
- Rate limiting on OTP requests

### 2.2 User Profiles
- Minimal profile: name, email, supporter_since_date
- Profile page at `/profil`
- NO IC/NRIC, NO political affiliation without PDPA consent flow

### 2.3 Supporter ID Card
- Satori + sharp: server-side PNG generation
- Card includes: name, supporter number (sequential), "since" date, tier badge, QR code
- Stored to R2: `id-cards/<userId>.png`
- Shareable URL: `bersama.io/kad/<userId>`
- Tiers: Bronze (0-90 days), Silver (91-180 days), Gold (181+ days)
- OG image for social sharing

### 2.4 Member Stories
- Form: name, story text, optional photo upload (R2)
- Moderation queue in Payload admin
- Published stories page: `/cerita-penyokong`

### 2.5 Merch Store
- Printful API integration
- Product catalog from Printful → displayed in Next.js
- Checkout: Billplz payment gateway (redirect flow)
- Order confirmation email via Resend
- No payment data stored (Billplz handles PCI compliance)

### 2.6 Premium Membership
- Billplz recurring payment API
- RM5–10/month tiers
- Benefit: Gold ID card, "Ahli Premium" badge
- Cancellation self-service

### 2.7 Listmonk Deep Integration
- Segment lists: General / PRN Johor / Premium Members
- Transactional + campaign templates
- Unsubscribe webhook sync back to Payload

### 2.8 Custom CDP (Customer Data Platform)
- Neon DB schema: `user_events` table
  - user_id (hashed email, no PII key)
  - event_type (page_view, news_click, agenda_view, signup)
  - metadata (JSONB)
  - created_at
- Server-side event tracking (no client-side PII)
- Daily aggregation job

### 2.9 AdSense/AdMob Integration
- AdSense: add `<Script>` in news pages, between article cards
- PDPA notice updated to include ad cookies
- Mobile: AdMob banner in Expo app

### 2.10 Expo Mobile App
- Expo SDK 51, TypeScript, NativeWind
- Screens: Home (news feed), Agenda (list + detail), Events, ID Card
- OneSignal mobile push
- Auth: email OTP via Payload API
- Deep linking: bersama.io → app handoff

---

## Phase 3 — Scale (Month 4–6)

> Milestone outlines only. Each requires its own detailed plan.

### 3.1 Community Forum
- Legal prerequisite: complete legal review of forum liability, moderation policy
- Stack: Discourse (self-hosted on Coolify) OR custom Payload collection
- Moderation: report system, moderator queue, strike system
- PDPA: separate consent for public forum participation
- 3R content automated filter + human review

### 3.2 CDP Segmentation Engine
- Neon: materialized views for user segments
- Segments: Johor residents, agenda-specific interest, engagement level
- Listmonk: segment-targeted campaigns via API
- Dashboard: `/cms/analytics` — custom Payload view

### 3.3 TnG eWallet Integration
- TnG eWallet API (Touch 'n Go Digital)
- Payment flow for merch and premium membership
- Requires: MCC registration, TnG merchant agreement

### 3.4 Donations Feature
- Hard prerequisite: legal review of political donation laws in Malaysia
- ROS (Registrar of Societies) compliance
- Transaction records for regulatory reporting

### 3.5 Advanced Analytics Dashboard
- Custom Next.js page in CMS at `/cms/dashboard`
- Metrics: subscriber growth, page views by content, news click-through rates
- Johor election: seat-by-seat result tracking

### 3.6 App Store Submissions
- iOS: Apple Developer account, TestFlight → App Store review
- Android: Google Play Console, closed testing → production
- App content compliance: Google Play political content policy
- Both stores: Privacy policy, PDPA disclosure in app description

---

## Legal Red Lines Reference

These rules must be enforced in code, not just policy.

| Rule | Enforcement |
|---|---|
| No IC/NRIC in forms | Zod schema rejects any field named `ic`, `nric`, `mykad`, `identityNumber` |
| No political affiliation storage without PDPA consent | EmailSubscribers collection has no affiliation field; Phase 2 profile requires separate consent checkbox + timestamp |
| RSS: headline + 2-sentence excerpt only | `extractExcerpt()` enforces 2-sentence hard limit; `NewsItems` collection has no `fullContent` field |
| No 3R content generation | Content moderation checklist for all CMS-published content; automated keyword scan on submission |
| RSS 15-minute minimum cache | `/api/rss-sync` enforces `SYNC_INTERVAL_MS = 15 * 60 * 1000` server-side; HTTP 429 if called sooner |
| Unofficial platform disclaimer | Footer on every page; welcome email; PDPA page; About page |

---

## Launch Checklist

```
PRE-LAUNCH (48 hours before):
[ ] All Phase 1 pages functional and bilingual
[ ] PDPA policy page live
[ ] Email subscribe flow tested end-to-end
[ ] RSS sync running and news appearing
[ ] Johor hub page live with correct dates
[ ] OG images rendering correctly (test with Twitter Card Validator)
[ ] Lighthouse score: Performance >85, Accessibility >95, SEO >95
[ ] Core Web Vitals: LCP <2.5s, CLS <0.1 (test with PageSpeed Insights)
[ ] Google Search Console: site verified, sitemap submitted
[ ] Google News Publisher: application submitted
[ ] PWA: installable, offline page works
[ ] OneSignal: web push prompt tested
[ ] GA4: events flowing (page_view, scroll, signup)
[ ] Clarity: session recordings visible
[ ] Cloudflare: proxy active, SSL Full (strict)
[ ] Health check: https://bersama.io/api/health returns 200
[ ] All links checked (no 404s)
[ ] Mobile: tested on iPhone Safari + Android Chrome

LAUNCH DAY:
[ ] Monitor GA4 real-time for traffic spikes
[ ] Monitor Coolify logs for errors
[ ] Check Cloudflare Analytics for bot traffic patterns
[ ] Announce on Rafizi/Nik Nazmi social accounts (coordinate with comms team)
[ ] Submit to Google News (https://publishercenter.google.com)
[ ] Social media announcements (Twitter/X, Facebook, Instagram)
[ ] WhatsApp broadcast to early supporters

POST-LAUNCH (48 hours):
[ ] Check RSS sync is running every 30 minutes
[ ] Check email delivery rates in Resend dashboard
[ ] Check subscriber growth in Listmonk
[ ] Monitor for any PDPA complaints
[ ] Fix any reported bugs immediately (hot patches via Coolify redeploy)
```

---

## Quick Reference Commands

```bash
# Dev (run from monorepo root)
pnpm --filter web dev
# Open: http://localhost:3000
# CMS: http://localhost:3000/cms

# Build
pnpm --filter web build

# Type check
pnpm --filter web type-check

# Generate Payload types (after schema changes)
pnpm --filter web generate:types

# Database migration
pnpm --filter web migrate

# Seed agenda items (after first migration)
pnpm --filter web seed

# RSS sync (manual trigger)
curl -X POST http://localhost:3000/api/rss-sync \
  -H "x-cron-secret: <CRON_SECRET>"

# Lint
pnpm --filter web lint

# Production logs (via Coolify CLI or SSH)
ssh root@<hetzner-ip> 'docker logs bersama-web-1 --tail=100 -f'
```

---

*Plan written: 2026-06-04. Maintained by: Hazim / bersama.io engineering team.*
*Next review: After Phase 1 launch. Phase 2 detailed tasks to be broken out separately.*
