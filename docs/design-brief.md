# bersama.io — Design Brief (Editorial News-Portal Revamp)

> Seed for `impeccable:shape`. Goal: replace the current AI-slop UI with a distinctive,
> editorial **civic news portal**. This brief is direction, not dogma — `shape` should
> interrogate and refine it before any code is written.

## 1. Product & why design matters here

bersama.io is an **unofficial, independent supporter platform** for *Parti Bersama Malaysia*
(led by Rafizi Ramli). Its two jobs: **(B) civic education** — plain-language explainers of
the party's 12-point agenda — and **(C) news aggregation** — one curated place for everything
written about Bersama. The growth bet is **organic search / Google News & Top Stories**, and the
viral loop is the **Supporter ID card**.

Design implication: this must read as a **serious civic-media brand**, not a SaaS landing page
and not a party pamphlet. The mental model is *The Economist's* relationship to the politics it
covers — adjacent, credible, editorially independent. A news-portal homepage (not a hero/CTA
page) is the correct primary surface.

Non-negotiables:
- **Bilingual** — Bahasa Malaysia (default) + English. Copy stays in `src/messages/{ms,en}.json`.
- **UNOFFICIAL disclaimer** stays visible (`UnofficialDisclaimer` component) — legal + trust.
- **SEO/Google News** structure preserved: Article JSON-LD, news sitemap, hreflang, bylines,
  visible publish dates (already wired — don't regress).

## 2. Audience

Educated, urban, 30–55, bilingual, politically engaged Malaysians; followers of Rafizi since
PKR days **and** the politically-curious newcomer who heard about Bersama and wants to understand
it. Mobile-first (WhatsApp-share culture), reads on the go, skims headlines.

## 3. The AI-slop to eliminate

The current build is generic: centered hero, full-bleed blue→ gradient, emoji bullets (🛡️🏭🏫),
uniform rounded-xl white cards in a 4-col grid, symmetric everything, soft shadows, "CTA band"
newsletter. Kill all of it.

**Banned:** centered hero with two pill buttons; emoji as iconography; identical card grids; big
gradient fills; generic "Get started" CTA bands; perfectly symmetric layouts; rounded-everything.

## 4. Direction

**Homepage = news portal**, composed of editorial modules (not a marketing page):
1. **Masthead** — real wordmark + tagline *"Suara Penyokong, Bebas & Berani"*, dateline/edition,
   language switch, search-adjacent feel. A nav of sections (Berita, Agenda, Johor, Pendirian).
2. **Lead story** — one dominant story (from Payload `Articles` or top aggregated item), large
   headline, dek, byline, timestamp — with a tighter secondary 2–4 story grid beside/below it.
   Source: `src/lib/rss.ts` (`fetchBersamaNews`) + Payload Articles.
3. **Policy tracker rail** — the 12-point agenda as a live "what Bersama stands for" module
   (the genuinely original feature). Numbered, scannable, links to `/agenda/[slug]` explainers.
   Data: `src/data/agenda-seed.ts` / `agenda-items` collection.
4. **Johor election module** — live seat/results strip while it's the forcing function; pulls
   `/api/liveblog`. Prominent but contained.
5. **Latest news feed** — chronological aggregator list (`NewsCard`), categorized by agenda topic.
6. **In-context conversion** — newsletter capture + Supporter ID card woven into the editorial
   flow (e.g. a sidebar/inline unit), not a generic full-width band.

Then restyle the rest to match: `Navbar`, `Footer`, article template (`artikel/[slug]`), agenda
list + detail (`agenda`, `agenda/[slug]`), `berita`, `johor`, `pendirian`, `tentang`, `kad`.

## 5. Visual system (to be locked by `shape`)

- **Color** — complementary to Bersama's blue/yellow but distinct. Current tokens: deep navy
  `#082448`, yellow `#E6D44A` (see `src/styles/brand.css`, `tailwind.config.ts`). Use them as
  **editorial accents** (rules, kickers, the masthead, section labels) — not as large fills.
  Mostly ink-on-paper: near-black text, warm off-white background, a strong accent.
- **Typography** — this carries the editorial credibility. A real **display serif or strong
  grotesk for headlines** + a clean humanist sans for body. Tight headline leading, generous body
  measure, clear hierarchy (kicker / headline / dek / byline·timestamp). Self-host fonts; mind
  BM diacritics. *No* default system-font flatness.
- **Layout** — asymmetric, grid-driven, newspaper rhythm: column rules, varied story sizes,
  intentional density above the fold. Mobile collapses to a single prioritized column.
- **Motion** — restrained; subtle reveal on scroll for story blocks. No bouncy SaaS animations.
- **Imagery** — editorial; where no image exists, a strong typographic treatment (kicker + rule),
  not a stock illustration. The OG image style (`/api/og`) is a good tonal reference.

## 6. Build constraints

- Stack: Next 15 (App Router, RSC), React 19, next-intl v4, Tailwind, Payload v3.85. `bun`.
- **Do not** change `payload.config.ts`, collections, the API routes' *logic*, or deploy config
  unless the design strictly requires it (e.g. a new field). Reskin presentation only.
- Keep all `t('…')` keys working; add new keys to **both** `ms.json` and `en.json`.
- Reuse/replace these components: `components/layout/{Navbar,Footer,LocaleSwitcher}`,
  `components/cards/{NewsCard,AgendaCard,PositionCard}`, `components/forms/NewsletterForm`,
  `components/ui/{UnofficialDisclaimer,WhatsAppShareButton}`. Brand tokens live in
  `src/styles/brand.css` + `tailwind.config.ts` + `src/app/globals.css`.
- **Verify before finishing:** `bun run typecheck && bun run lint && bun run build`, and
  `bun run dev` smoke of `/`, `/ms` & `/en`, `/agenda/[slug]`, `/johor`, `/berita`, `/admin`.

## 7. Suggested workflow

`impeccable:shape` (lock design system + homepage IA) → fan out subagents per surface
(brand tokens · masthead/nav · homepage modules · article/agenda templates · footer) →
`impeccable:craft` to build → `impeccable:critique` + `impeccable:polish` to remove residual
slop → review pass. Keep the build green throughout.

## 8. Success test

A first-time visitor lands on `/` and, within 5 seconds, reads it as *"a credible independent
news site about this party"* — skims a lead story, sees what the party stands for, and finds the
Johor coverage — **without** it feeling like a template or a campaign microsite.
