# Build context: parent of BabMukDang-Client
#   docker compose -f BabMukDang-Backend/docker-compose.yml --project-directory .. up --build

FROM node:20-alpine AS builder
WORKDIR /workspace

# ── 1. Shared 빌드 ────────────────────────────────────────────────────────────
COPY BabMukDang-Shared/package*.json    ./BabMukDang-Shared/
COPY BabMukDang-Shared/tsconfig*.json  ./BabMukDang-Shared/
COPY BabMukDang-Shared/tsup.config.ts  ./BabMukDang-Shared/
COPY BabMukDang-Shared/src             ./BabMukDang-Shared/src

RUN cd BabMukDang-Shared && npm install && npm run build

# ── 2. Client 빌드 환경 변수 ──────────────────────────────────────────────────
ARG VITE_SERVER_URL=http://localhost:3000
ARG VITE_WEBSOCKET_URL=http://localhost:3000
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL

# ── 3. Client 의존성 설치 ─────────────────────────────────────────────────────
WORKDIR /workspace/BabMukDang-Client
COPY BabMukDang-Client/package*.json ./
RUN npm install

# package-lock.json의 "link:true" 항목은 symlink로 처리되는데,
# Docker layer 안에서 TypeScript가 symlink를 못 따라가는 경우가 있으므로
# node_modules 내 Shared 엔트리를 빌드 결과물로 직접 교체한다.
RUN rm -rf node_modules/@kimdaegyu/babmukdang-shared && \
    mkdir -p node_modules/@kimdaegyu/babmukdang-shared && \
    cp /workspace/BabMukDang-Shared/package.json \
       node_modules/@kimdaegyu/babmukdang-shared/ && \
    cp -r /workspace/BabMukDang-Shared/dist \
          node_modules/@kimdaegyu/babmukdang-shared/

# ── 4. Client 소스 복사 및 빌드 ───────────────────────────────────────────────
COPY BabMukDang-Client/. .
RUN npm run build

# ── 5. Nginx 프로덕션 이미지 ───────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /workspace/BabMukDang-Client/dist  /usr/share/nginx/html
COPY BabMukDang-Client/nginx.conf                       /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
