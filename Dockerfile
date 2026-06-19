# Build context: repository root containing BabMukDang-Client and BabMukDang-Shared.
#   docker build -f BabMukDang-Client/Dockerfile .

FROM node:20-alpine AS shared-builder
WORKDIR /app/BabMukDang-Shared
COPY BabMukDang-Shared/package*.json ./
RUN npm ci
COPY BabMukDang-Shared/src ./src
COPY BabMukDang-Shared/tsconfig*.json ./
COPY BabMukDang-Shared/tsup.config.ts ./
RUN npm run build

FROM node:20-alpine AS builder
ARG VITE_SERVER_URL=http://localhost:3000
ARG VITE_WEBSOCKET_URL=http://localhost:3000
ARG VITE_BASE_API_URL=/api/v1
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL

WORKDIR /app
COPY --from=shared-builder /app/BabMukDang-Shared ./BabMukDang-Shared
COPY BabMukDang-Client/package*.json ./BabMukDang-Client/
WORKDIR /app/BabMukDang-Client
RUN npm ci
COPY BabMukDang-Client/. .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/BabMukDang-Client/dist /usr/share/nginx/html
COPY BabMukDang-Client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
