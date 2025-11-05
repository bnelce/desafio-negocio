# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy API package files
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api ./apps/api
COPY turbo.json ./

# Generate Prisma Client
RUN cd apps/api && pnpm prisma:generate

# Build
RUN pnpm build --filter=@networking-groups/api

# Stage 2: Production
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Install production dependencies only
WORKDIR /app/apps/api
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma Client in production
RUN pnpm prisma:generate

EXPOSE 3333

CMD ["pnpm", "start"]
