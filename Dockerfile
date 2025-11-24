# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
# Copying package files first to leverage Docker cache
COPY package*.json ./
# Use npm ci for clean, deterministic installation
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React application (Vite)
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

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist
# Copy the server script
COPY --from=builder /app/server.js ./

# Cloud Run sets the PORT environment variable.
# We expose port 8080 as a default documentation.
ENV PORT=8080
EXPOSE 8080

# Start the proxy server
CMD ["node", "server.js"]
