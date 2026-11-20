# Build context: repository root containing BabMukDang-Client and BabMukDang-Shared.
#   docker build -f BabMukDang-Client/Dockerfile .
# Types come from the npm package (@kimdaegyu/babmukdang-shared), but vite.config.ts
# aliases the runtime import to ../BabMukDang-Shared/src, so the Shared source is copied in.

FROM node:20-alpine AS builder
ARG VITE_API_SERVER_URL=http://localhost:3000
ARG VITE_WEBSOCKET_SERVER_URL=http://localhost:3000
ARG VITE_API_URL_PREFIX=/api/v1
ARG VITE_CDN_URL=https://d1buecxls251mg.cloudfront.net
ENV VITE_API_SERVER_URL=$VITE_API_SERVER_URL
ENV VITE_WEBSOCKET_SERVER_URL=$VITE_WEBSOCKET_SERVER_URL
ENV VITE_API_URL_PREFIX=$VITE_API_URL_PREFIX
ENV VITE_CDN_URL=$VITE_CDN_URL

WORKDIR /app
COPY BabMukDang-Shared/src ./BabMukDang-Shared/src

WORKDIR /app/BabMukDang-Client
COPY BabMukDang-Client/package*.json ./
RUN npm ci
COPY BabMukDang-Client/. .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/BabMukDang-Client/dist /usr/share/nginx/html
COPY BabMukDang-Client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
