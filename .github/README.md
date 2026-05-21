# Falcon PMS — GitHub Automation

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI/CD** | `workflows/ci-cd.yml` | Push / PR to `main`, `develop`, `staging`; manual | Lint, test, build, security scan, optional deploy |

## CI jobs (always on PR)

1. **lint** — Python `flake8` + `isort` on `apps/`; frontend `eslint` + `vite build`
2. **backend** — `migrate` + `manage.py check` on PostgreSQL 14
3. **frontend-build** — Production build artifact
4. **security** — `bandit` (Python), `npm audit` (advisory)

## CD jobs (deploy)

Runs only on `main` or `staging` when repository secrets are configured:

| Secret | Used for |
|--------|----------|
| `DOCKER_USERNAME` / `DOCKER_PASSWORD` | Push images |
| `STAGING_HOST` / `STAGING_USER` / `STAGING_SSH_KEY` | Staging SSH deploy |
| `PROD_HOST` / `PROD_USER` / `PROD_SSH_KEY` | Production SSH deploy |
| `SLACK_WEBHOOK` | Optional deploy notification |

Without secrets, build steps still validate Dockerfiles where possible; deploy steps are skipped or no-op safe.

## Deployment assets (repo)

| Path | Purpose |
|------|---------|
| `deploy/docker/docker-compose.production.yml` | Production stack |
| `deploy/nginx/falcon.conf` | Host Nginx |
| `deploy/scripts/deploy.sh` | Migrate + up |
| `Dockerfile.production` | Daphne API image |
| `frontend/Dockerfile` | SPA + Nginx |

See `deploy/README.md` and `Docs/deployment/`.

## Local parity

```bash
# Backend (match CI)
set DJANGO_SETTINGS_MODULE=config.settings.test
pip install -r requirements/development.txt
python manage.py migrate
python manage.py check

# Frontend
cd frontend && npm ci && npm run lint && npm run build
```

## Required checks (recommended branch protection)

- Lint & Code Quality  
- Backend — Django Check & Migrations  
- Frontend — Production Build  
