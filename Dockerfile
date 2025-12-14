# Build stage for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY backend ./backend

# Copy frontend build to backend/public
COPY --from=frontend-build /app/dist ./backend/public

# Create data directory for SQLite with proper permissions
RUN mkdir -p /app/backend/data && chmod 755 /app/backend/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/app/backend/data/pos.db

# Expose port
EXPOSE 8000

# Start the server
WORKDIR /app/backend
CMD ["node", "src/index.js"]
