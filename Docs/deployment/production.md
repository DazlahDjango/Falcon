# Falcon PMS — Production Deployment Guide

## Prerequisites

- Docker 24+ **or** Ubuntu 22.04+ with Python 3.11, Node 20, PostgreSQL 15, Redis 7, Nginx
- Domain + TLS (Let's Encrypt recommended)
- Live Paystack keys for billing (`config/settings/production.py` enforces live keys)

## Environment

Copy `deploy/env/.env.production.example` to `.env.production` at the repo root.

Required variables (validated when `DJANGO_ENV=production`):

- `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`
- `DB_*`, `REDIS_URL`
- Email SMTP settings
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` (live)

## Docker Compose (recommended)

```bash
./deploy/scripts/deploy.sh production
```

Services:

| Service | Port | Notes |
|---------|------|-------|
| `frontend` | 80 | Nginx: SPA + reverse proxy to API |
| `backend` | 8000 (internal) | Daphne ASGI |
| `celery-worker` | — | Background tasks |
| `celery-beat` | — | Schedules |
| `db` | 5432 (internal) | PostgreSQL 15 |
| `redis` | 6379 (internal) | Cache, Celery, Channels |

## Post-deploy seeds (first install)

```bash
docker compose -f deploy/docker/docker-compose.production.yml exec backend python manage.py seed_config_settings
docker compose -f deploy/docker/docker-compose.production.yml exec backend python manage.py seed_accounts_policy
docker compose -f deploy/docker/docker-compose.production.yml exec backend python manage.py seed_tenant_settings
```

## Health endpoints

- `GET /health/` — django-health-check
- `GET /api/v1/health/` — app health view

## WebSockets

Nginx must include `Upgrade` headers for `/ws/` (see `deploy/nginx/snippets/websocket.conf`).

Registered routes include: accounts, KPI, config (backup/DR progress), dashboard, tenant, structure, billing, reviews.

## Rollback

```bash
./deploy/scripts/rollback.sh <git-tag> production
```

## Related

- [nginx.md](./nginx.md) — host Nginx tuning
- [docker.md](./docker.md) — compose overrides
- [../README.md](../README.md) — documentation index
