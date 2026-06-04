# Stage 1: deps (install ALL deps incl devDeps — needed for Next.js build + runtime)
FROM oven/bun:1-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

# Stage 2: builder
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# next build collects page data + runs generateStaticParams, which load Payload
# config — so DATABASE_URL and PAYLOAD_SECRET must be present at build time.
ARG DATABASE_URL
ARG PAYLOAD_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
# Build args for public env vars (baked into the client bundle)
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_GA4_ID
ARG NEXT_PUBLIC_CLARITY_ID
ARG NEXT_PUBLIC_ONESIGNAL_APP_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID
ENV NEXT_PUBLIC_CLARITY_ID=$NEXT_PUBLIC_CLARITY_ID
ENV NEXT_PUBLIC_ONESIGNAL_APP_ID=$NEXT_PUBLIC_ONESIGNAL_APP_ID
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
WORKDIR /app/apps/web
RUN bun run payload generate:importmap 2>/dev/null || true
RUN bun run build

# Stage 3: runner — ship full node_modules + run `next start` (no standalone).
# Payload's admin/GraphQL dynamically require packages that standalone tracing
# misses; carrying the real node_modules avoids MODULE_NOT_FOUND at runtime.
FROM node:20-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
# Workspace layout: hoisted node_modules at /app, app build under /app/apps/web
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
USER nextjs
WORKDIR /app/apps/web
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1
CMD ["../../node_modules/.bin/next", "start"]
