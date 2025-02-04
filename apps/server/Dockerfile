FROM node:20-slim as builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/server ./apps/server

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN pnpm -F server build

FROM node:20-slim

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 8888

# Start the server
CMD ["node", "dist/bin/index.js"]