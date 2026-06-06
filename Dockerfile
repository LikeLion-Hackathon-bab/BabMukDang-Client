# Build context: parent of BabMukDang-Client
#   docker compose -f BabMukDang-Backend/docker-compose.yml --project-directory .. up --build

FROM node:20-alpine AS builder
ARG VITE_SERVER_URL=http://localhost:3000
ARG VITE_WEBSOCKET_URL=http://localhost:3000
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL

WORKDIR /app

COPY BabMukDang-Client/package*.json ./
RUN npm install

COPY BabMukDang-Client/. .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist           /usr/share/nginx/html
COPY BabMukDang-Client/nginx.conf       /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
