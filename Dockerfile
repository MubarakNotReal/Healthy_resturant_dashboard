# Multi-stage build with Bun
FROM oven/bun:1.3.5-slim AS base
WORKDIR /app

# Install deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run build

ENV PORT=3001
EXPOSE 3001

# Run migrations + seed + start API
CMD ["bun", "run", "start:prod"]
