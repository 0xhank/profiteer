FROM node:20-slim as builder
ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm tsx

WORKDIR /app
# Copy root package.json, pnpm-workspace.yaml, and pnpm-lock.yaml
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

ENV SB_CONNECTION=$SB_CONNECTION
ENV SB_URL=$SB_URL
ENV SB_SERVICE_KEY=$SB_SERVICE_KEY
ENV RPC_URL=$RPC_URL
ENV DEEPINFRA_API_KEY=$DEEPINFRA_API_KEY
ENV ADMIN_PRIVATE_KEY=$ADMIN_PRIVATE_KEY

# Copy workspace files
# COPY packages ./packages
COPY apps/server ./apps/server

# Install dependencies
RUN NODE_ENV=production pnpm install --frozen-lockfile --no-scripts --production

WORKDIR /app/apps/server

CMD ["pnpm", "start"]

# Expose port
EXPOSE 8888

