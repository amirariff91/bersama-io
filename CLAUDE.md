# CLAUDE.md — bersama.io

A standing contract for Claude Code + Codex subagents on this repo. It overrides default
agent behavior. A coding agent with no instructions defaults to the average of everything it
has seen — and that average is mediocre. Read this, then build like you mean it.

---

## How to work

- **Pursue completeness, not adequacy.** Ship the finished thing — understood, tested, and
  explainable — not a draft or a plan. Don't offer to "table it for later" when the real solve
  is in reach.
- **Two machine spaces.** You reason in *latent space* (inference); you produce in *deterministic
  space* (code, files, DB). Anything that must be repeatable or exact — counts, transforms,
  migrations, checks — goes in a script, not in your head. Don't do in latent space what a few
  lines of code do correctly every time.
- **The context window is the lever.** Curate inputs deliberately. Read the actual files before
  changing them. Vague context produces vague output.
- **Search before building.** Reuse the components, helpers, and patterns that already exist
  (`src/components`, `src/lib`, `src/collections`) before writing new ones.
- **Fan out when it helps.** For broad or multi-surface work, delegate to subagents on disjoint
  files and have an adversarial review pass (Opus + Codex/GPT-5.5) before committing.

---

## Project

**bersama.io** is an **unofficial, independent supporter platform** for *Parti Bersama Malaysia*
(led by Rafizi Ramli). Two jobs: **civic education** (plain-language explainers of the 12-point
agenda) and **news aggregation**. Growth bet: organic search / Google News & Top Stories. Viral
loop: the Supporter ID card. Tone: a credible civic-media brand — not a SaaS page, not a party
pamphlet. Tagline: *Suara Penyokong, Bebas & Berani*.

Public face / named editor + PDPA data controller: **Hazim**. Editorial judgment: **Amir** (20
years following Rafizi). Agents do not make editorial/content decisions.

- Active design work: **`docs/runbooks.md`** (ops) and **`docs/design-brief.md`** (the
  editorial news-portal revamp). Plans in `docs/plans/`. Env reference in `.env.example`.

---

## Stack — locked; no substitutions without Amir's approval

- **Package manager: bun** (monorepo via Turborepo). `packageManager: bun@1.2.18` is required —
  Turbo can't resolve the workspace without it.
- **Web:** Next.js 15.4 (App Router, RSC) + React 19, **Payload CMS v3.85** (admin + REST +
  GraphQL in the same app), **next-intl v4**, Tailwind. TypeScript strict.
- **DB:** Neon Postgres — always the **pooled** connection string (`-pooler.neon.tech`). The CDP
  is Neon-only.
- **Storage:** Cloudflare R2 (S3 API). **Email:** Resend (transactional) + Listmonk (newsletter).
  **Push:** OneSignal. **Analytics:** GA4 + Microsoft Clarity (consent-gated) + custom CDP on Neon.
- **Host:** Hetzner (Singapore) + Coolify; Docker from `infrastructure/Dockerfile`. Cloudflare DNS/CDN.
- **Mobile (later):** Expo (push + Supporter ID card).

**Do NOT reintroduce:** pnpm, `output: 'standalone'`, Supabase, `next.config.ts` (it's `.mjs`),
or a `next-sitemap`/`drizzle-orm` direct dependency. The runner ships full `node_modules` + runs
`next start` (see `docs/runbooks.md` for why standalone is off).

### Commands
```bash
bun install
bun run dev          # turbo dev (apps/web on :3000)
bun run build        # turbo build
bun run lint         # turbo → next lint
bun run typecheck    # turbo → tsc --noEmit
bun run test         # turbo → vitest
bun apps/web/scripts/seed.ts   # push schema to Neon + seed 12 agenda items (needs SEED_ADMIN_PASSWORD)
```
Local dev reads `apps/web/.env.local` (`DATABASE_URL` pooled + `PAYLOAD_SECRET` already set).
The **Payload CLI fails under tsx here** (extensionless imports) — run Payload scripts with `bun`.

---

## Non-negotiable rules

### Legal red lines (hard stops — if a feature would violate these, don't build it; raise with Amir)
- **UNOFFICIAL label** on every page (footer + a dedicated About section). Never claim to
  represent the party or speak for Rafizi/Nik Nazmi.
- **PDPA:** never collect Malaysian IC/MyKad numbers — ever. Collect only name/email (+ optional
  state). Explicit, un-pre-ticked consent before any capture; consent text includes cross-border-
  transfer language (BM + EN). Hazim is the named data controller. Privacy policy live before capture.
- **No user-generated content at launch** (CMA s233 — you're the publisher). Editorial only.
  Community features (Phase 3) need legal sign-off before any code.
- **3R / Sedition:** never publish content touching Race, Religion, or Royalty in seditious ways.
  No AI-generated political opinion as published content — editorial is human-authored, Amir-approved.
- **PPPA risk (critical):** editorial may count as a "newspaper" → criminal exposure for the named
  editor. A Malaysian media-lawyer opinion is mandatory before public launch. Don't launch without it.
- **Electoral Offences Act / campaign lock:** `SiteSettings.campaignPeriodLock` exists and is
  enforced (e.g. ID-card route returns `423` when on). During a formal campaign period: no ID-card
  generation, no "support the party" framing on paid items.
- **Server IP:** the Hetzner origin IP must never appear in public DNS — Cloudflare proxy always on.
- **Payments:** no direct donations before a Malaysian lawyer's review (see `docs/runbooks.md`).

### Bilingual (BM default, EN second) — from day one
- All user-facing copy lives in `src/messages/{ms,en}.json`. Add every new key to **both** files —
  identical key sets. Never hard-code user-facing strings in components.
- Homepage and the 12-agenda explainers must exist in BM. Use next-intl; keep `hreflang` correct.

### SEO / Google News
- Article pages emit `NewsArticle` JSON-LD, real bylines, visible publish dates, OG images
  (`/api/og`), and appear in the news sitemap (`/api/sitemap/news.xml`). `hreflang` pairs for ms/en.
  Don't regress these. Good Core Web Vitals; `next/image` for images; `next/font` for fonts.

### Code quality
- TypeScript strict; **`any` is banned** (lint enforces it) — if unavoidable, disable inline with a
  reason. RSC by default; `"use client"` only when interactivity needs it; never import server-only
  libs (sharp, satori) into client components.
- API routes validate input and return `{ "error": "...", "code": "..." }`; auth before
  authenticated ops; rate-limit (durable limit at Cloudflare WAF).
- Payload: every collection defines access control (no `() => true` for reads of drafts); localized
  fields explicitly `localized: true`; hooks pure and tested.
- No `console.log` in production paths — use a structured logger. No `@ts-ignore` without a reason.

### Tests
- If it has logic, it has a test (Vitest; Playwright for critical journeys). New logic ships with
  its test in the same commit. Cover: collection hooks, ID-card pipeline (mock R2), subscribe
  handler, i18n routing, SEO helpers, consent/validation logic. Pure UI rendering needs no test.

---

## Definition of done

A task is DONE only when all hold; otherwise it's a draft:
1. Works as specified. 2. `bun run typecheck`, `bun run lint`, `bun run test` all clean; new logic
has tests. 3. `bun run build` succeeds. 4. Any user-facing text is in both `ms.json` and `en.json`.
5. Legal-compliant (UNOFFICIAL present, no IC, no 3R, consent where data is collected). 6. New page
types have correct meta/schema/sitemap. 7. Non-obvious decisions have a comment or docs update.
8. Committed with a correct message to the right branch. 9. Amir is told what was built.

---

## After every task

Commit and push (correct branch + Conventional Commit, e.g. `feat(web): …`, `fix(api): …`,
`legal(web): …`, `i18n(web): …`, `infra: …`). Report what changed and any restart/redeploy or
follow-up needed. Don't leave the tree half-done.

---

## When confused

On high-stakes ambiguity (legal, data collection, irreversible/prod, editorial intent), **stop and
ask** — present concrete options with a recommendation. Don't guess on anything that touches the
legal red lines or production.

---

## Safety / never do

- Never commit secrets or `.env*.local`. Never expose the Hetzner origin IP. Never disable the
  Cloudflare proxy, even to debug.
- Never push to `main` with red CI. Never run prod DB migrations without a backup snapshot.
- Never build UGC, collect IC numbers, remove the UNOFFICIAL disclaimer, skip the bilingual
  requirement, or publish AI-written content as editorial — without explicit approval.
- Production is real: confirm outward-facing/irreversible actions unless durably authorized.

---

## How Amir wants to be talked to

Direct, specific, concrete. No filler, no hedging, no jargon. When Amir asks for something, the
answer is the finished product — not a plan to maybe do it. State plainly what's done and verified,
and surface what isn't.

*Build it like you mean it. Suara Penyokong, Bebas & Berani.*
