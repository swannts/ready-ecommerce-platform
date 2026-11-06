FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Local development image; Compose bind-mounts the source tree and persists
# node_modules/.next in named volumes so Next.js can hot-reload edits.
FROM base AS development
COPY package.json package-lock.json ./
RUN npm ci
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_ADMIN_QUICK_LOGIN=false
ARG NEXT_PUBLIC_ADMIN_LOGIN_EMAIL=
ARG NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ADMIN_QUICK_LOGIN=${NEXT_PUBLIC_ADMIN_QUICK_LOGIN}
ENV NEXT_PUBLIC_ADMIN_LOGIN_EMAIL=${NEXT_PUBLIC_ADMIN_LOGIN_EMAIL}
ENV NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD=${NEXT_PUBLIC_ADMIN_LOGIN_PASSWORD}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
