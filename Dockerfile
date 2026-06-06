# Build context: parent of BabMukDang-Client (e.g., docker build -f BabMukDang-Client/Dockerfile ..)
# Both BabMukDang-Client and BabMukDang-Shared must be present in the context.

FROM node:20-alpine AS builder
WORKDIR /workspace

# --- Shared 패키지 빌드 ---
COPY BabMukDang-Shared/package*.json ./BabMukDang-Shared/
COPY BabMukDang-Shared/src ./BabMukDang-Shared/src
COPY BabMukDang-Shared/tsconfig*.json ./BabMukDang-Shared/

RUN cd BabMukDang-Shared && npm ci && npm run build

# --- Client 빌드 ---
ARG VITE_SERVER_URL=http://localhost:3000
ARG VITE_WEBSOCKET_URL=http://localhost:3000
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL

WORKDIR /workspace/BabMukDang-Client
COPY BabMukDang-Client/package*.json ./
RUN npm ci

COPY BabMukDang-Client/. .
RUN npm run build

# --- Nginx 프로덕션 이미지 ---
FROM nginx:alpine AS production
COPY --from=builder /workspace/BabMukDang-Client/dist /usr/share/nginx/html
COPY BabMukDang-Client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
