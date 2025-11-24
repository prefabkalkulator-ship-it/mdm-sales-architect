# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

# (Wstawić na początku Etapu 1, zaraz po FROM node:20-alpine AS builder)
# Krok dodaje narzędzia kompilacji
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application (Vite + Server TypeScript)
# This runs: tsc -b && vite build && tsc -p server/tsconfig.json
RUN npm run build

# ==========================================
# Stage 2: Runner (Production Proxy Server)
# ==========================================
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
# dist now contains both the frontend assets and the compiled server.js
COPY --from=builder /app/dist ./dist

# Cloud Run sets the PORT environment variable.
ENV PORT=8080
EXPOSE 8080

# Start the compiled server
CMD ["npm", "start"]
