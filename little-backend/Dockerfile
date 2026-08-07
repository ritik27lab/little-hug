# ---------- deps: install dependencies + generate the Prisma client ----------
# Generating the client here (inside the same base image the app will run
# on) is what matters — Prisma downloads a query engine binary matched to
# this OS, so it must NOT be generated on your Mac and copied in.
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

# ---------- build: compile TypeScript ----------
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- production: small runtime image ----------
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
COPY prisma ./prisma
COPY api.json ./api.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh && mkdir -p uploads

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD ["node", "-e", "require('http').get('http://localhost:4000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]