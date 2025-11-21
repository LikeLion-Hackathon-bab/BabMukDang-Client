# --- Production Dockerfile (multi-stage) ---
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

# Runtime stage (Nginx)
FROM nginx:1.27-alpine AS runtime

# Copy custom nginx config for SPA routing and caching
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


