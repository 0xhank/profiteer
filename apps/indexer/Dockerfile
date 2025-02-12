FROM node:20-slim as builder
ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm tsx

WORKDIR /app

# Copy root package.json, pnpm-workspace.yaml, and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Copy workspace files
COPY apps/indexer ./apps/indexer

# Install dependencies
RUN NODE_ENV=production pnpm install --frozen-lockfile --no-scripts --production

WORKDIR /app/apps/indexer

CMD ["pnpm", "start"]

