# Nginx configuration

Falcon ships two Nginx setups:

## 1. Inside frontend container (`frontend/nginx.conf`)

Used by `frontend/Dockerfile` in Docker Compose. Proxies:

- `/api/` → `backend:8000`
- `/ws/` → WebSocket upgrade
- `/` → Vite `dist/` SPA (`try_files`)

Snippets: `frontend/nginx-snippets/`

## 2. Host Nginx (`deploy/nginx/falcon.conf`)

For VMs without routing through the frontend container:

- Static SPA: `/var/www/falcon/dist`
- API: `upstream falcon_api` → `127.0.0.1:8000` (Daphne)
- Static files: `/var/www/falcon/staticfiles`, `/var/www/falcon/media`

### Install

```bash
sudo cp deploy/nginx/falcon.conf /etc/nginx/sites-available/falcon.conf
sudo cp deploy/nginx/snippets/proxy-params.conf /etc/nginx/snippets/
sudo cp deploy/nginx/snippets/websocket.conf /etc/nginx/snippets/
sudo cp deploy/nginx/snippets/ssl-params.conf /etc/nginx/snippets/
sudo ln -s /etc/nginx/sites-available/falcon.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### TLS

1. Point DNS to the server
2. `sudo certbot --nginx -d app.example.com`
3. Uncomment `listen 443 ssl` and certificate paths in `falcon.conf`

### Limits

- `client_max_body_size 50M` in `proxy-params.conf` (KPI attachments, backups)
- WebSocket `proxy_read_timeout 86400s` for long-lived dashboard channels
