# bersama.io

**Suara Penyokong, Bebas & Berani**

Unofficial supporter web platform and mobile app for Parti Bersama Malaysia.

> This is a fan-operated platform. We are not the official party website.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web Framework | Next.js 14 (App Router) |
| CMS | Payload CMS v3 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Database | Neon DB (serverless PostgreSQL) |
| Storage | Cloudflare R2 |
| Mobile | Expo (React Native) |
| Email (transactional) | Resend |
| Email (newsletter) | Listmonk (self-hosted) |
| Push Notifications | OneSignal |
| Analytics | GA4 + Microsoft Clarity |
| Hosting | Hetzner + Coolify + Docker |
| CDN/DNS | Cloudflare |
| Monorepo | Turborepo + pnpm workspaces |

---

## Quick Start

```bash
# Prerequisites: Node >= 20, pnpm >= 9
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Install dependencies
pnpm install

# Copy env template
cp .env.example .env.local
# Fill in real values in .env.local

# Start all apps in development mode
pnpm dev
```

---

## Project Structure

```
bersama-io/
├── apps/
│   ├── web/          # Next.js 14 + Payload CMS v3 (main platform)
│   └── mobile/       # Expo React Native app (iOS + Android)
├── packages/
│   ├── ui/           # Shared React component library
│   ├── types/        # Shared TypeScript types
│   └── api-client/   # Typed API client for Payload REST endpoints
├── package.json      # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json        # Turborepo pipeline config
└── .env.example      # Environment variable template
```

---

## Scripts

```bash
pnpm dev          # Start all workspaces in watch mode
pnpm build        # Build all workspaces
pnpm lint         # Lint all workspaces
pnpm typecheck    # Type-check all workspaces
pnpm test         # Run all tests
pnpm format       # Format with Prettier
```

---

## License

Fan-operated project. Not affiliated with Parti Bersama Malaysia officially.
