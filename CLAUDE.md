# CLAUDE.md — bersama.io
## Agent Working Guidelines for Claude Code + Codex Subagents

---

## NON-NEGOTIABLE MINDSET

The marginal cost of completeness is near zero with AI.
Do the whole thing. Do it right. Do it with tests. Do it with documentation.
The standard is not "good enough" — it is "holy shit, that's done."
Time is not an excuse. Fatigue is not an excuse. Complexity is not an excuse.

You can outsource the typing. You cannot outsource the understanding.
Before you call anything DONE you must be able to explain:
  - Why the code is correct
  - Exactly where it would break
  - What the failure mode looks like in production

Amir has 20 years following Rafizi Ramli. He knows the politics inside out.
Your job is to build infrastructure worthy of that knowledge — fast, correct, and legal.
Every feature you ship is a piece of Malaysia's political history.
Do not embarrass the project. Do not embarrass Rafizi's moment.

---

## THE TWO MACHINE SPACES

### Latent Space (LLM reasoning — where you live)
- Pattern recognition, synthesis, planning, writing, architecture decisions
- This is where you understand the problem, design the solution, and think through edge cases
- Never skip this step. A rushed latent-space pass produces a broken deterministic output.

### Deterministic Space (code, files, databases — what you produce)
- The actual Next.js code, Payload schemas, SQL migrations, Docker configs
- Once committed and deployed, it is real. It affects real users. Real legal risk is possible.
- Every artefact you write in deterministic space must be derivable from a solid latent-space understanding

### The Bridge Rule
Before writing a single line of code, you must hold the full problem in latent space:
- What does this feature do?
- Where does it fit in the data model?
- What are the legal implications?
- What breaks if this code fails?
- Is this bilingual (BM + EN) by default?

If you cannot answer all five, stop and think longer. Then write.

---

## PROJECT OVERVIEW

**bersama.io** — Suara Penyokong, Bebas & Berani

Unofficial supporter web platform and mobile app for Parti Bersama Malaysia.
Party launched: 17 May 2026 by Rafizi Ramli + Nik Nazmi.
20,000+ members in the first 2 weeks. Johor state election imminent — the first electoral test.
No existing unofficial supporter sites. First-mover advantage. Do not waste it.

**We are:**
- A fan-operated media and community platform, not the party itself
- The fastest, most credible unofficial source for Parti Bersama news and policy
- A growth machine: email, push, social, ID cards, merch, eventually community

**We are NOT:**
- The official party website
- A donation collection point at launch (pending legal review)
- A place for 3R content (Race, Religion, Royalty) — ever

---

## TECH STACK — LOCKED, NO SUBSTITUTIONS WITHOUT AMIR APPROVAL

### Web Platform
- **Framework:** Next.js 14 (App Router) — not Pages Router, not Next 15 until tested
- **Language:** TypeScript strict mode — `any` is banned unless annotated with a comment explaining why
- **Styling:** Tailwind CSS v3 — no inline styles, no CSS modules unless Tailwind cannot do it
- **CMS:** Payload CMS v3 — native Next.js plugin, same repo, same process
- **Database:** Neon DB (serverless PostgreSQL) — one connection string, used by both Payload and CDP
- **ORM:** Payload's built-in Drizzle adapter — do not introduce Prisma or raw SQL unless absolutely necessary

### Infrastructure
- **Hosting:** Hetzner cloud server, Singapore region, running Coolify
- **Containers:** Docker + Docker Compose, managed by Coolify — no bare-metal deploys
- **CDN + DNS + Proxy:** Cloudflare — ALL traffic must route through Cloudflare, never direct to Hetzner IP
- **Storage:** Cloudflare R2 — all images, media, supporter ID card PNGs
- **DDoS protection:** Cloudflare — do not disable under any circumstances

### Mobile
- **Framework:** Expo (React Native) — iOS + Android
- **API:** Payload REST API and/or GraphQL — same API the web uses
- **No separate backend** for mobile — it consumes the same Payload endpoints

### Services
- **Email transactional:** Resend (confirmations, password resets, notifications)
- **Email newsletter:** Listmonk (self-hosted on Coolify, separate container)
- **Push notifications:** OneSignal (web push + iOS/Android push)
- **Analytics:** GA4 + Microsoft Clarity + custom CDP (built on Neon DB — no Supabase)
- **Payments:** Billplz + TnG eWallet (merch + premium membership — Phase 2)
- **Ads:** Google AdSense (web) + AdMob (mobile)
- **Social ID card generation:** Satori + sharp (server-side PNG, stored on R2)

### Do Not Add
- No Redis at launch — Neon + Cloudflare cache is sufficient
- No separate Express/Fastify API — everything goes through Next.js route handlers or Payload endpoints
- No Supabase — Payload handles auth for CMS, CDP is Neon DB only. No Supabase at all.
- No GraphQL client on the web — use fetch() against Payload REST or server components
- No Mongoose, no MongoDB — Neon DB is relational, keep it relational
- No `next-pwa` (dead/unmaintained, incompatible with Next.js 14 — use custom service worker at `public/sw.js` instead)
- No `drizzle-orm` as a direct dependency (Payload v3 bundles its own Drizzle instance — adding a second causes version conflicts)
- No `next-sitemap` alongside custom sitemap route handlers — pick one system. The custom `/news-sitemap.xml` route handler is correct for Google News. Use that only.

---

## MONOREPO DIRECTORY STRUCTURE

```
bersama-io/
├── CLAUDE.md                        # This file — agent guidelines
├── README.md                        # Human-readable project overview
├── .env.example                     # Template for all required env vars (no secrets)
├── .env.local                       # Local dev secrets — NEVER committed
├── .gitignore
├── package.json                     # Root workspace config
├── pnpm-workspace.yaml              # pnpm workspaces
├── turbo.json                       # Turborepo pipeline (build, dev, test, lint)
│
├── apps/
│   ├── web/                         # Next.js 14 + Payload CMS v3 (monolith)
│   │   ├── app/
│   │   │   ├── (frontend)/          # Public-facing routes
│   │   │   │   ├── [locale]/        # BM (/ms) + EN (/en) routing
│   │   │   │   │   ├── page.tsx     # Homepage
│   │   │   │   │   ├── berita/      # News section (/berita, /news)
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── agenda/      # 12-point agenda explainers
│   │   │   │   │   ├── johor/       # Johor election hub
│   │   │   │   │   ├── acara/       # Events calendar
│   │   │   │   │   ├── tentang/     # About — who we are (UNOFFICIAL label)
│   │   │   │   │   ├── kad/         # Supporter ID card generation + share
│   │   │   │   │   └── layout.tsx
│   │   │   ├── (auth)/              # Login/register routes (Phase 2)
│   │   │   ├── (api)/               # Custom Next.js API route handlers
│   │   │   │   ├── id-card/
│   │   │   │   │   └── generate/
│   │   │   │   │       └── route.ts # Satori + sharp → R2 PNG
│   │   │   │   ├── newsletter/
│   │   │   │   │   └── subscribe/
│   │   │   │   │       └── route.ts # Listmonk subscription handler
│   │   │   │   ├── push/
│   │   │   │   │   └── subscribe/
│   │   │   │   │       └── route.ts # OneSignal web push subscription
│   │   │   │   └── sitemap/
│   │   │   │       └── news.xml/
│   │   │   │           └── route.ts # Dynamic Google News sitemap
│   │   │   ├── (payload)/           # Payload CMS admin + API
│   │   │   │   └── admin/
│   │   │   │       └── [[...segments]]/
│   │   │   │           └── page.tsx
│   │   │   └── layout.tsx           # Root layout (fonts, providers, GA4, Clarity)
│   │   │
│   │   ├── collections/             # Payload CMS collection definitions
│   │   │   ├── Articles.ts          # News articles — bilingual fields
│   │   │   ├── Agenda.ts            # 12-point agenda items
│   │   │   ├── Events.ts            # Events calendar
│   │   │   ├── Authors.ts           # Named authors (required for Google News)
│   │   │   ├── Media.ts             # Payload media — uploads to R2
│   │   │   ├── SupporterProfiles.ts # Phase 2: user profiles
│   │   │   ├── IdCards.ts           # Phase 2: generated ID card records
│   │   │   └── Users.ts             # CMS admin users (Payload auth)
│   │   │
│   │   ├── globals/                 # Payload CMS global singletons
│   │   │   ├── SiteSettings.ts      # Site name, tagline, social links
│   │   │   ├── ElectionTracker.ts   # Johor election live data
│   │   │   └── Navigation.ts        # Header/footer nav items
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                  # Shared atomic components (Button, Badge, Card)
│   │   │   ├── layout/              # Header, Footer, Nav
│   │   │   ├── articles/            # ArticleCard, ArticleBody, AuthorByline
│   │   │   ├── agenda/              # AgendaCard, AgendaDetail
│   │   │   ├── election/            # ElectionHub, CandidateCard, ResultsBoard
│   │   │   ├── id-card/             # IdCardPreview, IdCardShare
│   │   │   ├── newsletter/          # EmailCaptureBanner, SubscribeModal
│   │   │   └── seo/                 # JsonLd, OgImage, HreflangTags
│   │   │
│   │   ├── lib/
│   │   │   ├── payload.ts           # Payload client singleton
│   │   │   ├── r2.ts                # Cloudflare R2 S3-compatible client
│   │   │   ├── resend.ts            # Resend email client
│   │   │   ├── onesignal.ts         # OneSignal server SDK wrapper
│   │   │   ├── listmonk.ts          # Listmonk API client
│   │   │   ├── satori.ts            # ID card PNG generation pipeline
│   │   │   ├── i18n.ts              # next-intl config and locale utilities
│   │   │   ├── seo.ts               # generateMetadata helper, schema builders
│   │   │   └── analytics.ts         # GA4 event helpers
│   │   │
│   │   ├── hooks/                   # React hooks (client components only)
│   │   ├── types/                   # Global TypeScript types and interfaces
│   │   ├── messages/                # i18n translation files
│   │   │   ├── ms.json              # Bahasa Malaysia (primary)
│   │   │   └── en.json              # English
│   │   │
│   │   ├── public/
│   │   │   ├── icons/               # PWA icons (all sizes)
│   │   │   ├── manifest.webmanifest # PWA manifest
│   │   │   └── robots.txt           # Allow Googlebot, block AI scrapers
│   │   │
│   │   ├── payload.config.ts        # Payload CMS configuration root
│   │   ├── next.config.mjs           # Next.js config (i18n, images, headers)
│   │   ├── tailwind.config.ts       # Tailwind config (Bersama brand colours)
│   │   ├── tsconfig.json
│   │   └── Dockerfile               # Production Docker image
│   │
│   └── mobile/                      # Expo React Native app
│       ├── app/                     # Expo Router file-based routing
│       │   ├── (tabs)/
│       │   │   ├── index.tsx        # Home feed
│       │   │   ├── berita.tsx       # News
│       │   │   ├── agenda.tsx       # Agenda
│       │   │   ├── johor.tsx        # Johor election
│       │   │   └── profil.tsx       # Supporter profile (Phase 2)
│       │   └── _layout.tsx
│       ├── components/
│       ├── lib/
│       │   ├── api.ts               # Payload API client (REST)
│       │   └── onesignal.ts         # OneSignal mobile init
│       ├── app.json                 # Expo config (bundle ID, icons)
│       ├── eas.json                 # EAS build config
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                          # Shared component library (web + mobile stubs)
│   ├── types/                       # Shared TypeScript types (Payload generated types)
│   └── config/
│       ├── eslint/                  # Shared ESLint config
│       ├── typescript/              # Shared tsconfig base
│       └── tailwind/                # Shared Tailwind preset (brand colours)
│
├── infrastructure/
│   ├── docker-compose.yml           # Local dev: Next.js + Payload + Listmonk
│   ├── docker-compose.prod.yml      # Production template (Coolify overrides)
│   ├── coolify/
│   │   ├── app.env.example          # Coolify environment variable template
│   │   └── README.md                # Coolify deployment steps
│   ├── cloudflare/
│   │   ├── waf-rules.md             # Cloudflare WAF rule documentation
│   │   ├── page-rules.md            # Cache rules, redirects
│   │   └── workers/                 # Cloudflare Workers (if needed — edge caching)
│   └── scripts/
│       ├── backup-content.sh        # Daily Payload content export → GitHub
│       ├── flush-cache.sh           # Cloudflare cache purge via API
│       └── takedown-protocol.sh     # MCMC lights-out response (see below)
│
└── docs/
    ├── architecture.md              # System design decisions
    ├── legal.md                     # Malaysian legal risk register
    ├── content-guidelines.md        # Editorial policy, 3R rules
    ├── seo-checklist.md             # Google News compliance checklist
    └── api.md                       # Payload REST API endpoints for mobile
```

---

## ENVIRONMENT VARIABLES

All secrets live in `.env.local` (local) or Coolify's environment manager (production).
Never hardcode secrets. Never commit `.env.local`. Never log env vars.

### Required — Web App (apps/web)

```bash
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgres://...-pooler.neon.tech/bersama?sslmode=require
# Neon DB POOLER connection string. Payload and CDP both use this.
# IMPORTANT: Always use the pooler connection string (-pooler.neon.tech).
# Direct connections will hit Neon's concurrent connection limit under load.
# CDP is built on Neon DB only. No Supabase.

# ── Payload CMS ───────────────────────────────────────────────────────────────
PAYLOAD_SECRET=                    # 64-char random string, rotate annually
NEXT_PUBLIC_SERVER_URL=https://bersama.io

# ── Cloudflare R2 (S3-compatible) ─────────────────────────────────────────────
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=bersama-media
R2_PUBLIC_URL=https://media.bersama.io  # Custom domain on R2 bucket

# ── Resend (transactional email) ──────────────────────────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@bersama.io

# ── Listmonk (newsletter) ─────────────────────────────────────────────────────
LISTMONK_URL=https://list.bersama.io   # Internal Coolify service URL
LISTMONK_USERNAME=
LISTMONK_PASSWORD=
LISTMONK_LIST_ID=1                     # Default subscriber list ID

# ── OneSignal (push notifications) ───────────────────────────────────────────
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=
NEXT_PUBLIC_ONESIGNAL_APP_ID=          # Same as above, exposed to client

# ── Analytics ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-...
NEXT_PUBLIC_CLARITY_PROJECT_ID=

# ── Payments (Phase 2) ────────────────────────────────────────────────────────
BILLPLZ_API_KEY=
BILLPLZ_COLLECTION_ID=
BILLPLZ_X_SIGNATURE=
TNG_CLIENT_ID=
TNG_CLIENT_SECRET=

# ── Cloudflare (for cache purge scripts) ──────────────────────────────────────
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=                  # Scoped to cache purge only

# ── Sentry (error tracking) ───────────────────────────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=                # Same value, client-side
SENTRY_AUTH_TOKEN=                     # Source maps upload only

# ── Google AdSense ────────────────────────────────────────────────────────────
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-...
```

### Required — Mobile App (apps/mobile)

```bash
EXPO_PUBLIC_API_URL=https://bersama.io/api
EXPO_PUBLIC_ONESIGNAL_APP_ID=
EXPO_PUBLIC_GA4_MEASUREMENT_ID=G-...
ADMOB_APP_ID_IOS=
ADMOB_APP_ID_ANDROID=
```

### Optional — Local Dev Overrides

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
DATABASE_URL=postgres://localhost:5432/bersama_dev
```

---

## BILINGUAL REQUIREMENTS — MANDATORY FROM DAY ONE

### The Rule
Every user-facing page, component, and piece of content must support both:
- **ms** — Bahasa Malaysia (primary, default locale)
- **en** — English (secondary)

There is no "we'll add translations later." Later never comes. Build it bilingual or do not build it.

### Implementation
- **Routing:** `/ms/berita/[slug]` and `/en/news/[slug]` via Next.js App Router `[locale]` segment
- **Translation files:** `apps/web/messages/ms.json` and `apps/web/messages/en.json`
- **Library:** next-intl — use `useTranslations()` in client components, `getTranslations()` in server components
- **Content:** Payload CMS article fields use localised fields (`localized: true`) for title, body, excerpt, slug
- **hreflang:** Every page must emit correct `<link rel="alternate" hreflang="...">` tags
- **Default locale:** BM (`ms`) — no locale prefix for BM if using `localePrefix: 'as-needed'` strategy
- **SEO:** Article slugs are language-specific. BM slug: `rafizi-bentang-agenda-ekonomi`, EN slug: `rafizi-presents-economic-agenda`
- **OG images:** Generate locale-aware OG images (BM headline for ms routes, EN for en routes)

### Translation Key Naming
```json
{
  "nav": { "home": "Laman Utama", "news": "Berita", ... },
  "article": { "readMore": "Baca Lagi", "publishedOn": "Diterbitkan pada" },
  "footer": { "disclaimer": "Laman web penyokong tidak rasmi..." }
}
```

### Do Not
- Do not use Google Translate for content. Amir writes BM, translations are human-reviewed.
- Do not hardcode UI strings. Every string goes in `messages/ms.json` first.
- Do not build a page in English only and "translate later."

---

## SEO REQUIREMENTS — GOOGLE NEWS COMPLIANCE

Google News approval is a Phase 1 launch target. Every article page must pass.

### Required Per Article Page
- `<title>` — unique, includes author name and publication name
- `<meta name="description">` — 150-160 chars, BM for ms, EN for en
- **Article JSON-LD schema:**
  ```json
  {
    "@type": "NewsArticle",
    "headline": "...",
    "datePublished": "ISO8601",
    "dateModified": "ISO8601",
    "author": { "@type": "Person", "name": "Hazim ..." },
    "publisher": { "@type": "Organization", "name": "bersama.io", "logo": "..." },
    "image": "https://media.bersama.io/og/article-slug.jpg",
    "inLanguage": "ms" | "en",
    "isAccessibleForFree": true
  }
  ```
- **OG tags:** `og:title`, `og:description`, `og:image` (1200×630), `og:type: article`
- **Twitter Card:** `summary_large_image`
- **hreflang:** Link BM ↔ EN canonical pair
- **Canonical URL:** Always self-referencing canonical
- **Author byline:** Visible on page with real name — not "Admin," not "Staff"
- **Publish date:** Visible on page in human-readable format
- **News sitemap:** `/api/sitemap/news.xml` — updated on every publish, max 1000 articles, last 2 days priority

### Core Web Vitals Targets
- LCP < 2.5s — use Next.js `Image` with `priority` on hero images
- CLS < 0.1 — reserve space for images, no layout shift from ads loading
- INP < 200ms — minimise client-side JS, prefer server components

### Do Not
- Do not use `noindex` on any article page
- Do not use `rel="canonical"` pointing to a different domain
- Do not publish articles without an author
- Do not publish articles without a featured image (used for OG + Google News thumbnail)

---

## LEGAL RED LINES — ABSOLUTE, NON-NEGOTIABLE

These are not guidelines. These are hard stops. If a feature would violate these, do not build it. Raise it with Amir first.

### UNOFFICIAL Label
- Every page must display a clear "Laman web penyokong tidak rasmi / Unofficial supporter website" notice
- This label must appear in the footer on every page
- The About page must dedicate a full section to the unofficial nature of this site
- Never claim to represent the party. Never claim to speak for Rafizi or Nik Nazmi.

### Data Collection — PDPA Compliance
- **No Malaysian IC (MyKad) number collection** — ever, not even optionally
- Collect only: name, email, state/region (optional), phone (optional, Phase 2 only with explicit consent)
- Privacy policy must be written before any email capture goes live
- Named data controller: **Hazim** (his name, his responsibility, his legal exposure)
- Data retention policy: clearly stated. Default: **2 years of inactivity → send deletion notice → 30 days to respond → delete**
- All forms must have explicit consent checkbox (not pre-ticked) before submission
- Unsubscribe must work within 24 hours — Listmonk handles this automatically

### CMA Section 233 — Malicious Communications
- **No user-generated content at launch** — no comments, no forum, no public posts
- All content is editorial, written by Amir/Hazim or approved contributors
- Phase 3 community features require legal counsel review before any code is written
- If a moderation system is ever built: pre-moderation, not post-moderation

### Sedition Act + 3R Rule
- **Never publish content touching Race, Religion, or Royalty** in ways that could be construed as seditious
- If in doubt, do not publish. Amir makes this call, not the AI.
- No AI-generated political opinion content — all editorial is human-authored

### Server IP — Cloudflare Proxy
- The Hetzner server IP must never appear in any DNS record accessible to the public
- All A/AAAA records for bersama.io point to Cloudflare proxied — orange cloud ALWAYS on
- Never disable Cloudflare proxy, even temporarily for debugging
- If debugging requires direct server access, use SSH tunnel, not public IP exposure
- Cloudflare API token for cache purge must be scoped to cache purge only — not zone management

### Payments
- No direct donation collection before legal review by a Malaysian lawyer
- Merch and membership payments are for goods/services — different legal treatment
- Payment provider: Billplz + TnG only (SSM-registered, Malaysian-compliant)
- Never route payments through PayPal or Stripe for Malaysian supporters

### Electoral Offences Act 1954 (EOA)
- EOA applies during formal campaign periods (when election writ is issued)
- **Do NOT generate or distribute supporter ID cards during the formal campaign period**
- **Do NOT describe donations or merch as "supporting the party"**
- **Do NOT publish content that could constitute false statements about candidates (Section 9 EOA)**
- See Campaign Period Lock — SiteSettings.campaignPeriodLock must be toggled on at writ issuance

### Campaign Period Lock
- `SiteSettings` global Payload collection MUST include a `campaignPeriodLock` boolean field
- When `campaignPeriodLock = true`:
  1. ID card generation route returns `423 Locked`
  2. Merch store displays suspension notice
  3. All election hub pages show: *"This election coverage represents the independent editorial judgment of bersama.io and does not constitute official Parti Bersama electoral communications."*

### PPPA — CRITICAL LEGAL RISK
**PPPA (Printing Presses & Publications Act 1984) RISK — CRITICAL:**
bersama.io's editorial content may constitute a "newspaper" under Section 2(1) PPPA, creating **criminal liability for the named editor (Hazim)**.

**MANDATORY BEFORE LAUNCH:**
- A specific PPPA legal opinion MUST be obtained from a Malaysian media lawyer before launch
- Hazim must be fully informed of this personal criminal exposure
- Contact Centre for Independent Journalism Malaysia for lawyer referrals: www.cij.org.my
- This is not optional. Do not launch without completing this step.

---

## LIGHTS-OUT PROTOCOL — MCMC TAKEDOWN RESPONSE

If MCMC (Multimedia and Communications Commission) issues a takedown notice, blocking order, or if the site is otherwise forced offline:

### Immediate Response (within 1 hour)
1. **Do not panic.** A blocking order targets the domain/IP, not the content host.
2. Alert Amir and Hazim immediately via WhatsApp.
3. Do NOT delete any content — this may be needed for legal proceedings.
4. Run `infrastructure/scripts/takedown-protocol.sh` which will:
   - Snapshot current state of Neon DB via pg_dump to private GitHub repo
   - Archive all R2 media to private GitHub LFS backup
   - Export full Payload CMS content as JSON to encrypted private repo

### Domain Response (within 2 hours)
5. If bersama.io is blocked at DNS level by ISPs: activate mirror domain (pre-registered)
   - Mirror domains must be pre-registered and parked at Cloudflare before launch
   - Candidates: `bersamakita.net`, `suarabersama.my` — register at least one backup
6. Update Cloudflare DNS to point mirror domain to same Hetzner origin
7. Update OneSignal app URL for push notification links
8. Communicate to subscribers via Listmonk using pre-written "We've moved" email template

### Content Response (within 4 hours)
9. Identify which specific content triggered the action (if notice specifies)
10. Do not remove unless legally advised to do so
11. If specific article must be removed: 410 Gone response, not 404
12. Preserve a private archive of removed content for legal reference

### Legal Response
13. Contact pre-identified Malaysian digital rights lawyer (Malaysian Bar, tech law specialty)
14. Hazim handles all public statements — not Amir, not any AI agent
15. Coordinate with Centre for Independent Journalism (CIJ) Malaysia if applicable

### The pre-written takedown template in Listmonk:
Subject: Bersama.io — Kami Masih Di Sini / We're Still Here
Body: [Template in `docs/templates/takedown-email.md`]

---

## DEPLOYMENT WORKFLOW — COOLIFY + HETZNER

### Environment
- **Server:** Hetzner Cloud, Singapore region (SGP1), minimum CX31 (2 vCPU, 8GB RAM)
- **Container orchestrator:** Coolify (self-hosted, installed on Hetzner)
- **App container:** Docker image built from `apps/web/Dockerfile`
- **Listmonk container:** Official Listmonk Docker image, separate Coolify service
- **Database:** Neon DB (external serverless, not on Hetzner)

### Dockerfile Requirements (apps/web/Dockerfile)
```dockerfile
# Multi-stage build
FROM node:20-alpine AS base
# ... install pnpm ...

FROM base AS deps
# Copy workspace files, install dependencies

FROM base AS builder
# Build Next.js + Payload together
# Set NEXT_TELEMETRY_DISABLED=1
# Build output: standalone mode (output: 'standalone' in next.config.ts)

FROM base AS runner
# Copy standalone output
# Run as non-root user (node)
# EXPOSE 3000
# Health check: GET /api/health → 200
```

### Coolify Deployment Steps
1. Connect Coolify to the `bersama-io` GitHub repo (main branch = production)
2. Set build command: `pnpm build` (Turborepo handles the rest)
3. Set start command: `node apps/web/.next/standalone/server.js`
4. Set all production environment variables in Coolify's env manager — never in the repo
5. Enable "Auto-deploy on push to main" — but only after the first manual deploy succeeds
6. Set health check path: `/api/health`
7. Enable Coolify's built-in SSL (Let's Encrypt) — but Cloudflare terminates SSL externally, so set SSL mode to "Full (strict)" in Cloudflare

### Deploy Process (CI)
```
git push origin main
  → GitHub Actions: lint + typecheck + test (must pass)
  → If pass: Coolify webhook triggers rebuild
  → Coolify: docker build → docker push (internal registry)
  → Coolify: rolling restart (zero downtime)
  → Health check passes → deploy complete
  → Cloudflare cache purge: run flush-cache.sh for changed pages
```

### GitHub Actions Pipeline (.github/workflows/ci.yml)
Required checks before any merge to main:
- `pnpm lint` — ESLint, must be zero warnings in production files
- `pnpm typecheck` — `tsc --noEmit`, zero errors
- `pnpm test` — Vitest, 100% pass rate
- `pnpm build` — dry-run build must succeed

### Branch Strategy
- `main` — production, auto-deploys to bersama.io
- `dev` — staging, auto-deploys to staging.bersama.io (same Hetzner, separate Coolify app)
- `feature/*` — feature branches, PR to `dev`
- Direct push to `main` is prohibited except for emergency hotfixes (Amir only)

### Rollback
Coolify maintains last 3 image versions. To rollback:
```bash
# In Coolify UI: Deployments → select previous → Re-deploy
# Or via CLI:
coolify redeploy --app bersama-web --revision <previous-sha>
```

### Database Migrations
- Payload CMS handles its own migrations via `payload migrate`
- Run before deploying new code that changes Payload schemas:
  ```bash
  pnpm --filter web payload migrate
  ```
- Never run migrations directly against Neon DB production without a backup snapshot

---

## CLOUDFLARE CONFIGURATION RULES

### DNS
- All records for `bersama.io` and `*.bersama.io` must be proxied (orange cloud)
- Exception: internal services (e.g., SMTP records) that technically cannot be proxied — document these explicitly
- `media.bersama.io` → R2 bucket custom domain (proxied through Cloudflare)
- `list.bersama.io` → Listmonk on Hetzner (proxied)

### SSL/TLS
- Mode: Full (strict) — Cloudflare ↔ origin uses valid SSL
- Hetzner origin gets Cloudflare Origin Certificate (not Let's Encrypt, to avoid IP leakage)
- HSTS: enabled, max-age 31536000, includeSubDomains

### Caching
- Cache level: Standard for most pages
- Article pages: Cache TTL 1 hour (Cloudflare edge), revalidate via ISR on publish
- API routes: Cache-Control: no-store (Payload admin, auth endpoints)
- R2 media: Cache TTL 1 year (immutable, content-addressed filenames)

### WAF Rules (minimum set)
- Block requests where `cf.threat_score > 50`
- Rate limit: `/api/newsletter/subscribe` — max 5 req/min per IP
- Rate limit: `/api/id-card/generate` — max 10 req/min per IP
- Block countries where there is no legitimate user base (configure conservatively — do not over-block)
- Challenge (JS challenge) on IPs flagged as bots by CF

### Page Rules / Transform Rules
- `bersama.io/*` → Always use HTTPS
- `www.bersama.io/*` → 301 Redirect to `bersama.io/*`
- `/admin/*` → Bypass cache + extra security headers

---

## TESTING REQUIREMENTS

### The Rule
If it has logic, it has a test. If it has a test, it passes. If it passes, you can explain why.

### Framework
- **Unit + integration:** Vitest
- **Component tests:** React Testing Library + Vitest
- **E2E:** Playwright (critical user journeys only)
- **Coverage target:** 80% line coverage minimum on `lib/` and `collections/`

### What Must Be Tested
- All Payload collection hooks (beforeChange, afterChange, beforeRead)
- ID card generation pipeline (Satori → sharp → R2 upload) — mock R2
- Newsletter subscription handler (Listmonk API call, validation, error handling)
- i18n routing — correct locale detection, fallback behaviour
- SEO helpers — `generateMetadata()` returns correct OG, schema, hreflang for all locales
- Payment webhook handlers (Phase 2) — Billplz signature verification
- All form validation logic
- Legal compliance helpers — e.g., consent checkbox requirement

### What Does Not Need Tests
- Static UI components with no logic (just rendering)
- Tailwind class names
- Payload admin UI customisations (UI only, no business logic)

### Test File Naming
- Unit/integration: `*.test.ts` or `*.test.tsx` adjacent to the file being tested
- E2E: `e2e/[feature].spec.ts`

### Running Tests
```bash
pnpm test              # All tests, watch mode
pnpm test --run        # All tests, CI mode (no watch)
pnpm test:e2e          # Playwright E2E
pnpm test:coverage     # With coverage report
```

---

## COMMIT CONVENTIONS

Format: `type(scope): description`

### Types
- `feat` — new feature
- `fix` — bug fix
- `content` — editorial content (articles, translations)
- `legal` — legal/compliance change (footer notices, consent forms)
- `seo` — SEO-specific change (schema, sitemap, meta tags)
- `i18n` — translation/bilingual change
- `infra` — deployment, Docker, Cloudflare, Coolify
- `test` — tests only
- `docs` — documentation only
- `refactor` — code change with no behaviour change
- `chore` — dependency updates, config changes

### Scopes
`web`, `mobile`, `cms`, `api`, `ui`, `r2`, `email`, `push`, `analytics`, `payments`, `seo`, `i18n`, `infra`

### Examples
```
feat(web/cms): add article collection with bilingual localised fields
fix(api/id-card): handle R2 upload timeout with 3-retry backoff
legal(web): add UNOFFICIAL disclaimer to all article footers
seo(web): add NewsArticle JSON-LD schema to article page template
i18n(web): add English translations for nav and footer strings
infra(cloudflare): add rate limit rule for newsletter subscribe endpoint
content(cms): publish Rafizi economic agenda explainer (BM + EN)
test(web/lib): add coverage for newsletter subscription handler edge cases
```

### Rules
- Present tense imperative mood: "add" not "added" not "adds"
- No period at end of description
- Description < 72 chars
- If a commit touches legal compliance: add `[legal]` in commit body for audit trail
- Breaking changes: add `BREAKING CHANGE:` in commit body

---

## CODE QUALITY STANDARDS

### TypeScript
- Strict mode: `"strict": true` in all tsconfig.json files
- `any` is banned. If you must use it, add: `// eslint-disable-next-line @typescript-eslint/no-explicit-any — [reason why]`
- All Payload collection types must be generated via `payload generate:types` and committed
- No implicit `any` from untyped third-party packages — write declaration files

### React / Next.js
- Default to Server Components — only use `"use client"` when interactivity requires it
- Never import heavy libraries into client components (e.g., sharp, satori — server only)
- Use `next/image` for all images — never raw `<img>` tags
- Use `next/font` for all fonts — no Google Fonts `<link>` in `<head>`
- Loading states and error boundaries on all data-fetching components

### API Routes
- All route handlers must validate input (use zod schemas)
- All route handlers must return consistent error shapes:
  ```json
  { "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }
  ```
- Authentication checks before any authenticated operation
- Rate limiting enforced at Cloudflare WAF level (not just in code)

### Payload CMS
- Every collection must have access control defined — never use `allow: () => true` in production
- Hook functions must be pure and tested
- Localised fields must explicitly set `localized: true` — no silent English-only fields
- Media collection uploads directly to R2 via `@payloadcms/storage-s3`

---

## WHAT "DONE" MEANS

A task is DONE when ALL of the following are true:

1. **Code works** — the feature does what was specified
2. **Tests pass** — all existing tests pass, new logic has new tests
3. **Types are clean** — `pnpm typecheck` exits 0
4. **Lint is clean** — `pnpm lint` exits 0 with no warnings in production files
5. **Bilingual** — any user-facing text is in both `ms.json` and `en.json`
6. **Legal compliant** — no new data collection without consent, no 3R content, UNOFFICIAL label present
7. **SEO correct** — if it's a new page type, it has correct meta, schema, and sitemap entry
8. **Documented** — non-obvious decisions have a code comment or docs update
9. **Committed** — pushed to the correct branch with a correct commit message
10. **Amir has been informed** — via a summary of what was built and what it does

If any of these are false, it is not done. It is a draft.

---

## CONTENT BOOTSTRAP — MINIMUM BEFORE LAUNCH

Launch CANNOT happen with empty pages. Amir writes, Claude drafts. This is non-negotiable.

### Minimum content inventory before go-live (37 pieces):
1. All 12 agenda item explainers in BM — 500+ words each
2. All 12 agenda item explainers in English — 400+ words each
3. Rafizi Ramli biography — authoritative, 600+ words, bilingual
4. Nik Nazmi Nik Ahmad biography — same
5. Founding story of Bersama — bilingual, 500+ words
6. 5 Johor election analysis pieces — seats to watch, BM + EN pairs

Total: 37 original pieces. Not 5. Not 10. 37.

### Workflow:
- Amir provides political substance and editorial judgment
- Claude drafts from source material (speeches, press releases, Hansard)
- Amir reviews, corrects, and publishes
- Never publish AI-drafted content without Amir's review and approval

### Google News:
Apply for Google News Publisher Center IMMEDIATELY — do not wait for launch day.
Approval takes 4-8 weeks. Start the clock now.
Google News rejects sites with no publication history. Seed content first, apply early.

---

## KEDUDUKAN BERSAMA — POSITION TRACKER (Phase 1.5)

A structured, searchable database of Parti Bersama's official positions on political issues.
This is the feature that makes bersama.io the authoritative reference — not just a news aggregator.

### Why this matters:
- Supporters' #1 question: "What does Bersama actually think about X?"
- No single, searchable, authoritative record exists anywhere
- Amir is the only person with 20 years of context to write these accurately
- Journalists, researchers, and undecided voters will bookmark this

### Payload collection: Positions
Fields:
- `issuetitle` — localized BM/EN
- `positionsummary` — localized BM/EN
- `evidenceurl` — URL to primary source
- `evidencetype` — enum: statement | hansard | press-release | social
- `date` — date of position
- `agendatag` — relationship to AgendaItems collection
- `status` — draft | published

### Push notification use case:
"Bersama telah menyatakan pendirian mereka tentang pengumuman subsidi terbaru — ini yang mereka kata."
This is the one push notification type supporters will NOT turn off.

### SEO use case:
"bersama position on [issue]" → top-3 Google result for every political issue Rafizi comments on.

---

## WHATSAPP SHARING — REQUIRED ON ALL CONTENT CARDS

WhatsApp is how Malaysians share political content. Every card needs a share button.

### Implementation:
```tsx
// Shared component: WhatsAppShareButton
export function WhatsAppShareButton({ title, url }: { title: string; url: string }) {
  const text = encodeURIComponent(`${title} — baca lebih lanjut di bersama.io: ${url}`)
  return (
    <a
      href={`https://wa.me/?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Kongsi di WhatsApp"
    >
      {/* WhatsApp icon */}
    </a>
  )
}
```

Apply to: NewsCard, AgendaCard, PositionCard, every article page, every agenda item page.
This is a 30-minute build with the highest ROI of any sharing feature.

Also add: Telegram channel link in footer and email welcome template.

---

## COOKIE CONSENT — REQUIRED BEFORE GA4/CLARITY

GA4 and Microsoft Clarity set persistent cookies. Under PDPA Section 6, these require
informed consent before placement. A cookie consent banner is required in Phase 1.

### Implementation:
- Use `vanilla-cookieconsent` (lightweight, no React dependency) or a simple custom implementation
- GA4 and Clarity scripts must NOT fire before consent is obtained
- Two categories: Necessary (always on) and Analytics (opt-in)
- Consent state stored in localStorage
- On consent: fire GA4 gtag('consent', 'update', ...) and initialize Clarity

### PDPA cross-border transfer consent:
The email subscription consent checkbox MUST include:
BM: "Saya bersetuju data saya diproses oleh bersama.io dan pembekal perkhidmatan kami,
    termasuk pembekal di luar Malaysia, bagi tujuan menerima kemaskini berita."
EN: "I consent to my data being processed by bersama.io and its service providers,
    including providers outside Malaysia, for the purpose of receiving news updates."

---

## ADSENSE RISK WARNING

Google AdSense policy restricts ad serving on sites that advocate for or against political parties.
A Parti Bersama supporter site is a textbook policy violation risk.

- Apply for AdSense on launch day but DO NOT rely on it as primary revenue
- Have a direct sponsorship model as fallback (Malaysian law firms, financial planners, property developers)
- DO NOT display AdSense adjacent to RSS-sourced news content during election campaign periods
- AdSense may approve initially then suspend during election when traffic spikes attract policy review
- This has happened to multiple Malaysian political sites in previous election cycles

---

## ELECTION NIGHT INFRASTRUCTURE

The Johor election results night is the highest-traffic event of this project's life.
The current Hetzner CX31 CANNOT handle peak election night traffic without preparation.

### Required actions 1 week before election day:
1. Upgrade Hetzner to CX51 minimum (4 vCPU, 16GB RAM)
2. Pre-provision a second Coolify node as hot standby
3. Change live blog API cache from `Cache-Control: no-store` to 10-second TTL with cache-tag purging on new posts
4. Use Server-Sent Events (SSE) for live blog clients instead of 30-second polling
5. Enable Neon DB pooler connection string (already required, but double-check under load)
6. Run k6 load test simulating 3,000 concurrent users before election week

### Live blog SSE endpoint:
Replace polling at `/api/liveblog` with an SSE stream at `/api/liveblog/stream`
that emits events when new LiveBlogPost items are published via Payload afterChange hook.

---

## WHAT AGENTS MUST NEVER DO

- Never push directly to `main` without CI passing
- Never commit `.env.local` or any file containing secrets
- Never expose the Hetzner server IP in any public configuration
- Never build a user-generated content feature without explicit approval
- Never collect Malaysian IC numbers in any form
- Never make editorial decisions — content decisions belong to Amir
- Never use AI-generated content as published articles
- Never disable Cloudflare proxy, even temporarily
- Never remove the UNOFFICIAL disclaimer from any page
- Never use `console.log` in production code — use a structured logger
- Never ignore TypeScript errors with `@ts-ignore` without a detailed comment
- Never skip the bilingual requirement for expediency

---

## CONTEXT FOR NEW AGENTS PICKING UP THIS PROJECT

You are building the infrastructure for something that matters to a lot of Malaysians.
Parti Bersama Malaysia launched 17 May 2026. Rafizi Ramli, former Finance Minister, is betting his political career on this party. 20,000 people joined in 2 weeks. There are people who genuinely care about this and have no good place online to follow it.

You are not building a toy. You are building a news platform, a community anchor, and a growth engine for a political movement in a country with real legal risks for free expression.

Amir has followed Rafizi for 20 years. He knows every policy position, every speech, every pivotal moment. Trust his editorial judgment. Your job is to make his knowledge accessible, fast, bilingual, legal, and beautifully presented to the Malaysian public.

Build it like you mean it.
Suara Penyokong, Bebas & Berani.
