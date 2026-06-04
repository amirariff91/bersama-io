# bersama.io — Runbooks & Long-form Operational Detail

> Reference detail relocated out of `CLAUDE.md` to keep that file lean. These are
> runbooks/checklists, not per-session agent rules. CLAUDE.md links here.

## Deployment (Coolify + Hetzner)

- **Server:** Hetzner Cloud, Singapore. **Orchestrator:** Coolify (self-hosted).
- **App:** Docker image from `infrastructure/Dockerfile` (build pack = Dockerfile in Coolify).
- **Staging app:** Coolify app `uzqru6eo9b60sfrq4bquc322` → `https://bersama.arusdigital.com`, port 3000.
- **DB:** Neon (external serverless) — pooled connection string. **Media:** Cloudflare R2.
- **Newsletter:** Listmonk (separate Coolify service).

**Build/runtime model (important):** we do **NOT** use Next.js `output: 'standalone'`.
Payload's admin/GraphQL routes dynamically require packages (`undici`, `ws`, `ajv`, …)
that Next's file tracing drops, which crashes a standalone server. The image ships the
full `node_modules` and runs `next start`. Reliable on a non-serverless host.

**Env at build time:** `next build` loads Payload config (and runs `generateStaticParams`),
so `DATABASE_URL` + `PAYLOAD_SECRET` must be present as Docker build args (declared in the
Dockerfile builder stage; Coolify marks `DATABASE_URL` build-time automatically). The build
does not connect to Postgres (agenda pages use static seed data; the only `getPayload` page
is dynamic), so a placeholder DB URL is enough to build.

**Deploy:** push to `main` → CI (lint/typecheck/test/build) → Coolify rebuilds and rolling-
restarts → healthcheck `GET /api/health` → live. CI is bun-based (`oven-sh/setup-bun`).

**Schema + seed:** the Payload CLI fails under tsx/node ESM here (extensionless imports) —
run Payload scripts with `bun` directly. `bun apps/web/scripts/seed.ts` boots Payload (which
pushes schema to Neon in dev) and seeds the 12 agenda items; it requires `SEED_ADMIN_PASSWORD`
(no default credential). For prod schema changes prefer generated migrations over dev push.

**Rollback:** Coolify keeps the last image versions — redeploy a previous one from its UI.

## Cloudflare configuration

- **DNS:** all `bersama.io` / `*.bersama.io` records proxied (orange cloud) — never expose the
  Hetzner origin IP. `media.bersama.io` → R2 custom domain. Listmonk subdomain proxied.
- **SSL:** Full (strict); origin uses a Cloudflare Origin Certificate (not Let's Encrypt, to
  avoid IP leakage). HSTS on.
- **Caching:** standard pages cached; article pages ~1h edge TTL revalidated via ISR on publish;
  API/admin `no-store`; R2 media 1y immutable.
- **WAF (min):** rate-limit `/api/newsletter/subscribe` (~5/min/IP) and `/api/id-card/generate`
  (~10/min/IP); challenge bot-flagged IPs. (App also has in-memory limits; WAF is the durable layer.)
- **Redirects:** always HTTPS; `www` → apex; `/admin/*` bypass cache + extra security headers.

## Lights-out protocol (MCMC takedown)

If MCMC issues a takedown/blocking order or the site is forced offline:

1. **Don't panic, don't delete content** (may be needed for legal proceedings). Alert Amir + Hazim.
2. Snapshot state: `pg_dump` Neon → private repo; archive R2 media; export Payload content as JSON.
3. If DNS-blocked: activate a **pre-registered mirror domain** (register at least one backup, e.g.
   `bersamakita.net` / `suarabersama.my`, parked at Cloudflare). Repoint DNS to the same origin;
   update OneSignal link URLs; email subscribers via Listmonk "We've moved" template.
4. If a specific article must come down on legal advice: `410 Gone` (not 404); keep a private archive.
5. Hazim handles all public statements. Coordinate with CIJ Malaysia (cij.org.my) for lawyer referrals.

## Election-night infrastructure (Johor)

Results night is the highest-traffic event. ~1 week before polling:
1. Scale the Hetzner node up (e.g. CX51+).
2. Pre-provision a hot-standby Coolify node.
3. Live-blog: switch from polling to **SSE** (`/api/liveblog/stream`, emit on LiveBlogPost
   afterChange) or a short cache TTL with tag purging — not `no-store`.
4. Confirm Neon pooler under load; run a k6 load test (~3,000 concurrent) before election week.

## Content bootstrap (minimum before launch)

Don't launch with empty pages. Minimum ~37 original pieces: 12 agenda explainers ×2 languages,
Rafizi + Nik Nazmi bios (bilingual), founding story, ~5 Johor analysis pieces. Amir provides
substance/judgment; Claude drafts from primary sources (speeches, press releases, Hansard);
Amir reviews and publishes. Never publish AI-drafted content without Amir's review.
Apply to **Google News Publisher Center early** (approval takes weeks; needs publication history).

## Feature notes

- **Kedudukan Bersama (position tracker, Phase 1.5):** `Positions` collection (localized
  issue/summary, evidence URL + type, date, agenda relationship, status). The authoritative
  "what does Bersama think about X?" record — strong SEO + a push-notification type users keep on.
- **WhatsApp sharing:** every content card + article/agenda page gets a `WhatsAppShareButton`
  (`https://wa.me/?text=…`). Highest-ROI share feature in Malaysia.
- **Cookie consent:** GA4 + Microsoft Clarity set cookies → require opt-in consent (PDPA) before
  firing. Necessary always-on; Analytics opt-in; state in localStorage. The subscribe consent
  checkbox must include explicit cross-border-transfer language (BM + EN).
- **AdSense:** political-advocacy sites are a policy-violation risk — apply but don't rely on it;
  keep a direct-sponsorship fallback; expect possible suspension during election traffic spikes.

## Payments (Phase 2)

No direct donation collection before a Malaysian lawyer's review. Merch/membership (goods/services)
differ legally. Use SSM-registered Malaysian providers (Billplz / TnG) — not PayPal/Stripe for
Malaysian supporters. Verify webhook signatures.
