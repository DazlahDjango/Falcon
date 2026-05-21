# Docker deployment

## Files

| File | Description |
|------|-------------|
| `Dockerfile.production` | Backend ASGI image |
| `frontend/Dockerfile` | Multi-stage Vite + Nginx |
| `deploy/docker/docker-compose.production.yml` | Production stack |
| `deploy/docker/docker-compose.staging.yml` | Staging stack |

## Commands

```bash
# Production
docker compose -f deploy/docker/docker-compose.production.yml --env-file .env.production up -d

# Logs
docker compose -f deploy/docker/docker-compose.production.yml logs -f backend

# Shell
docker compose -f deploy/docker/docker-compose.production.yml exec backend python manage.py shell

# One-off migrate
docker compose -f deploy/docker/docker-compose.production.yml run --rm backend python manage.py migrate
```

## Build args (frontend)

| Arg | Default | Purpose |
|-----|---------|---------|
| `VITE_API_URL` | `/api/v1` | Relative API base (same origin) |
| `VITE_WS_URL` | empty | Same-host WS when empty |

## Volumes

- `postgres_data` — database
- `redis_data` — Redis AOF
- `static_volume`, `media_volume`, `logs_volume` — Django files

## Development vs production

| | Development | Production |
|---|-------------|------------|
| Compose | `docker-compose.yml` (root) | `deploy/docker/docker-compose.production.yml` |
| API image | `Dockerfile` (runserver) | `Dockerfile.production` (Daphne) |
| Settings | `DJANGO_ENV=development` | `DJANGO_ENV=production` |
