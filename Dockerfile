# BotFlow2 Backend API - Production Dockerfile
# Optimized multi-stage build for Node.js Fastify backend

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-alpine AS deps

# Add necessary packages for native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ===========================================
# Stage 2: Builder
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# ===========================================
# Stage 3: Runner (Production)
# ===========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 botflow

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder --chown=botflow:nodejs /app/public ./public
COPY --from=builder --chown=botflow:nodejs /app/.next/standalone ./
COPY --from=builder --chown=botflow:nodejs /app/.next/static ./.next/static

# Copy backend-specific files
COPY --from=builder --chown=botflow:nodejs /app/package.json ./
COPY --from=builder --chown=botflow:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER botflow

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
