FROM node:20-slim as builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

ENV SB_CONNECTION=$SB_CONNECTION
ENV SB_URL=$SB_URL
ENV SB_SERVICE_KEY=$SB_SERVICE_KEY
ENV RPC_URL=$RPC_URL
ENV DEEPINFRA_API_KEY=$DEEPINFRA_API_KEY
ENV ADMIN_PRIVATE_KEY=$ADMIN_PRIVATE_KEY

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/server ./apps/server

# Install dependencies
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/server

# Build the app
RUN pnpm -F server build


CMD ["pnpm", "start"]

# Expose port
EXPOSE 8888

