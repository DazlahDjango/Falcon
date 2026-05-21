# Falcon PMS — production frontend (Vite → Nginx)
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api/v1
ARG VITE_WS_URL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine

COPY nginx-snippets/proxy-params.conf /etc/nginx/snippets/proxy-params.conf
COPY nginx-snippets/websocket.conf /etc/nginx/snippets/websocket.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
