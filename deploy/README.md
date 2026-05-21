# Falcon PMS — Deployment

Production and staging deployment assets for Docker and bare-metal (systemd + host Nginx).

## Layout

| Path | Purpose |
|------|---------|
| `docker/docker-compose.production.yml` | Full stack: Postgres, Redis, API, Celery, frontend |
| `docker/docker-compose.staging.yml` | Staging variant (`DJANGO_ENV=staging`) |
| `nginx/falcon.conf` | Host Nginx site (VM install) |
| `nginx/snippets/` | `proxy-params`, `websocket`, `ssl-params` |
| `systemd/*.service` | API (Daphne), Celery worker, Celery beat |
| `scripts/deploy.sh` | Build, migrate, collectstatic, up |
| `scripts/rollback.sh` | Checkout ref + recreate containers |
| `scripts/health_check.sh` | `/health/` + `/api/v1/health/` |
| `env/.env.production.example` | Template for secrets |

## Quick start (Docker)

```bash
cp deploy/env/.env.production.example .env.production
# Edit secrets, domains, Paystack live keys

chmod +x deploy/scripts/*.sh
./deploy/scripts/deploy.sh production
```

App listens on port **80** (frontend Nginx proxies API + serves SPA).

## Bare-metal (systemd + Nginx)

1. Install app under `/opt/falcon-pms`, venv at `/opt/falcon-pms/fasc`
2. `cp deploy/env/.env.production.example /opt/falcon-pms/.env.production`
3. `pip install -r requirements/production.txt`
4. `python manage.py migrate && python manage.py collectstatic`
5. `npm run build` in `frontend/` → copy `dist/` to `/var/www/falcon/dist`
6. `sudo ./deploy/scripts/install-systemd.sh`
7. `sudo cp deploy/nginx/falcon.conf /etc/nginx/sites-available/`
8. `sudo nginx -t && sudo systemctl reload nginx`

## Images

| File | Role |
|------|------|
| `Dockerfile.production` | API: Daphne + `config.asgi:application` |
| `frontend/Dockerfile` | Vite build → Nginx |

## TLS

Use Certbot on the host Nginx `server_name`, then uncomment SSL lines in `deploy/nginx/falcon.conf`.

## CI/CD

GitHub Actions (`.github/workflows/ci-cd.yml`) builds these Dockerfiles on `main` / `staging`.
