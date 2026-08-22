# Falcon PMS - Deep Dive Docker & Kubernetes Architecture (`docker.md`)

This document provides a detailed technical explanation of how all Docker container files, Docker Compose orchestrations, and Kubernetes (K8s) manifests inside the `Docker/` directory operate to support **Falcon PMS**.

---

## 🏗️ Architecture Overview

Falcon PMS uses a **decoupled, multi-tier container architecture** designed for high availability, zero-downtime scaling, and low database overhead:

```
                          ┌────────────────────────┐
                          │   Client Requests      │
                          └───────────┬────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │  Nginx Load Balancer / Ingress │
                      └───────────────┬────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
  ┌─────────────────────────┐                   ┌─────────────────────────┐
  │  Django Web Node 1      │                   │  Django Web Node 2      │
  │  (HTTP ASGI + WSS)      │                   │  (HTTP ASGI + WSS)      │
  └────────────┬────────────┘                   └────────────┬────────────┘
               │                                             │
               ├──────────────────────┬──────────────────────┤
               │                      │                      │
               ▼                      ▼                      ▼
    ┌────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │  PgBouncer Pooler  │  │  Celery Workers  │  │  Redis 7 Cache   │
    │  (Port 6432)       │  │  & Beat Scheduler│  │  (Sessions/WSS)  │
    └──────────┬─────────┘  └──────────────────┘  └──────────────────┘
               │
               ▼
    ┌────────────────────┐
    │ PostgreSQL 16 DB   │
    │ (Port 5432)        │
    └────────────────────┘
```

---

## 🐳 1. Dockerfiles & Container Life-Cycle (`Docker/`)

### 1.1 `Docker/Dockerfile` (Production Multi-Stage Build)
The main container image builder for Python 3.11, Django, Gunicorn, Uvicorn, and Celery workers.

#### Why Multi-Stage Building?
Multi-stage builds separate the compilation environment from the final runtime environment, resulting in a **smaller, faster, and more secure** final image.

- **Stage 1 (`builder`)**:
  - Starts from `python:3.11-slim`.
  - Installs compilation tools (`gcc`, `g++`, `libpq-dev`, `libcairo2-dev`, `libpango1.0-dev`) needed to compile native C-extensions like `psycopg2` (PostgreSQL driver) and `WeasyPrint` (PDF generator).
  - Installs Python dependencies into `/root/.local`.

- **Stage 2 (`runner`)**:
  - Copies *only* the pre-compiled Python packages from `builder` into runtime.
  - Installs runtime dynamic libraries (`libpq5`, `libcairo2`, `libpango-1.0-0`, `postgresql-client`).
  - Sets up runtime directories (`staticfiles/`, `media/`, `logs/`).
  - Sets `ENTRYPOINT ["/app/Docker/entrypoint.sh"]`.
  - Sets default `CMD` to launch Gunicorn with Uvicorn ASGI workers (`gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 4`).

---

### 1.2 `Docker/Dockerfile.nginx` (Web Server & Reverse Proxy)
- Starts from lightweight `nginx:1.25-alpine`.
- Copies `config/nginx.docker.conf` into `/etc/nginx/nginx.conf`.
- Handles static asset caching (`/static/` with 30-day cache-control) and media serving (`/media/`).
- Performs round-robin load balancing across Django app nodes (`app-1:8000`, `app-2:8000`).
- Upgrades HTTP requests to WebSockets for Channels routes (`/ws/`).

---

### 1.4 `Docker/Dockerfile.frontend` (React SPA + Nginx)
- Multi-stage build for the Vite + React frontend application inside `frontend/`.
- **Stage 1 (`builder`)**: Uses `node:20-alpine`, installs NPM packages via `npm ci`, and compiles static HTML/JS/CSS assets via `npm run build`.
- **Stage 2 (`runner`)**: Uses `nginx:1.25-alpine`, copies the compiled SPA dist files into `/usr/share/nginx/html`, and sets up proxy rules to route `/api/`, `/ws/`, `/admin/` requests to the Django backend container.

---

### 1.5 `Docker/entrypoint.sh` (Startup Orchestrator Script)
Executed automatically whenever any application container boots up:
1. **Database Readiness Check**: Uses `pg_isready` to poll the database host (`$DB_HOST`) until PostgreSQL/PgBouncer accepts connections.
2. **Automated Migrations**: If `CONTAINER_ROLE=primary_web`, automatically runs:
   ```bash
   python manage.py migrate --noinput
   python manage.py collectstatic --noinput --clear
   ```
3. **Process Execution**: Runs `exec "$@"` to start the process specified in the `CMD` (e.g. Gunicorn web server or Celery worker).

---

## 🐙 2. Docker Compose Orchestration

Docker Compose coordinates all microservices into a single unified virtual network.

### 2.1 `Docker/docker-compose.yml` (Development Environment)
Defines 8 connected services on isolated bridge network `falcon-net`:

1. **`nginx`**: Listens on port `80`. Proxies requests to `app-1` and `app-2`.
2. **`app-1` & `app-2`**: Dual Django application server nodes simulating multi-instance load balancing. Mounts local directory `..:/app` for instant live-reloading.
3. **`celery-worker`**: Asynchronous task consumer running `celery -A config worker --loglevel=info`.
4. **`celery-beat`**: Cron job scheduler running `celery -A config beat --loglevel=info`.
5. **`pgbouncer`**: Transaction connection pooler listening on port `6432`. Multiplexes up to 10,000 client connections down to PostgreSQL.
6. **`db`**: PostgreSQL 16 database engine mounting `config/postgresql.conf` and `config/pg_hba.conf`.
7. **`redis`**: Redis 7 cache engine for sessions, Celery broker, and WebSocket channels.

---

### 2.2 `Docker/docker-compose.prod.yml` (Production Stack)
Extends development compose with production hardening:
- `restart: always` on all services.
- Loads production secrets directly from `../.env`.
- Splits Celery into dedicated workers:
  - `celery-worker-default`: Consumes lightweight queues (`email`, `cleanup`, `notifications`, `dashboard`).
  - `celery-worker-billing-report`: Consumes heavy queues (`billing`, `webhooks`, `reportplt_*`, `reviews_*`).
- Nginx binds to both HTTP `80` and HTTPS `443`.

---

## ☸️ 3. Kubernetes (K8s) Production Manifests (`Docker/k8s/`)

The `Docker/k8s/` directory contains cloud-native Kubernetes manifests designed for deployment on AWS EKS, Google GKE, Azure AKS, or self-hosted Kubernetes.

### 3.1 `00-namespace-config-secret.yaml`
- **Namespace (`falcon-pms`)**: Isolates all Falcon PMS resources into a dedicated cluster namespace.
- **ConfigMap (`falcon-config`)**: Holds non-sensitive environment settings (`DJANGO_ENV`, `DB_HOST`, `DB_PORT`, `REDIS_URL`).
- **Secret (`falcon-secrets`)**: Holds base64/opaque encrypted secrets (`DJANGO_SECRET_KEY`, `JWT_SIGNING_KEY`, `DB_PASSWORD`, `PAYSTACK_SECRET_KEY`).

---

### 3.2 `01-postgres-statefulset.yaml`
- Uses **StatefulSet** (instead of a Deployment) because database nodes require sticky identity and persistent storage.
- Mounts a 20GB `PersistentVolumeClaim` (PVC) at `/var/lib/postgresql/data` so data persists across pod restarts.
- Configures readiness probes (`pg_isready`) and Headless Service `postgres-service`.

---

### 3.3 `02-pgbouncer-deployment.yaml`
- Deploys 2 PgBouncer pods in front of PostgreSQL.
- Exposes port `6432` via ClusterIP service `pgbouncer-service`.
- Handles connection transaction pooling (`POOL_MODE=transaction`, `DEFAULT_POOL_SIZE=150`, `MAX_CLIENT_CONN=10000`).

---

### 3.4 `03-redis-deployment.yaml`
- Single-instance Redis deployment for caching and Celery message brokering.
- Enforces strict memory and CPU resource limits (`requests: 256Mi`, `limits: 1Gi`).

---

### 3.5 `04-falcon-web-deployment.yaml`
- **Deployment (`falcon-web`)**: Scalable web pods running the Gunicorn/Uvicorn ASGI container.
- **Health Probes**: Configures HTTP readiness probe (`/api/v1/health/`) on port 8000 to prevent unready pods from receiving web traffic.
- **Horizontal Pod Autoscaler (HPA)**:
  - Dynamically scales web pods between **3 minimum** and **15 maximum** replicas based on **75% CPU** or **80% Memory** utilization.

---

### 3.6 `05-celery-worker-deployment.yaml`
- **Celery Worker Deployment**: Scalable worker pods handling task processing from Redis.
- **Celery Beat Deployment**: Configured strictly with **`replicas: 1`** (Singleton pattern) to prevent duplicate execution of cron schedules.

---

### 3.7 `06-ingress.yaml`
- **Nginx Ingress Controller**:
  - Routes root domain traffic (`/`) to `falcon-frontend-service` (React SPA).
  - Routes `/api/`, `/ws/`, `/admin/`, `/health/` traffic to `falcon-web-service` (Django ASGI Backend).
  - Configures `proxy-body-size: 100m` for large report/document uploads.
  - Enables WebSocket upgrade headers for real-time channels (`/ws/`).

---

### 3.8 `07-frontend-deployment.yaml`
- Deploys 2 pods running the compiled React / Vite static frontend server (`falcon-frontend`).
- Exposes port `80` via ClusterIP service `falcon-frontend-service`.

---

## 📊 Summary of Ports & Network Protocol Map

| Service Name | Internal Port | Protocol / Purpose | Container Image |
| :--- | :--- | :--- | :--- |
| **Nginx Ingress** | `80`, `443` | HTTP / HTTPS Load Balancer | `nginx:1.25-alpine` |
| **Falcon React Frontend** | `80` (Port 5173 dev) | React SPA Client Application | `node:20-alpine` → `nginx:1.25-alpine` |
| **Falcon Web** | `8000` | HTTP ASGI & WebSockets (`/ws/`) | `python:3.11-slim` |
| **PgBouncer** | `6432` | Postgres Connection Pooler | `edoburu/pgbouncer:latest` |
| **PostgreSQL** | `5432` | PostgreSQL Database Engine | `postgres:16-alpine` |
| **Redis** | `6379` | In-Memory Cache & Message Broker | `redis:7-alpine` |
| **Celery Worker** | N/A | Background Task Consumer | `python:3.11-slim` |
| **Celery Beat** | N/A | Periodic Cron Scheduler | `python:3.11-slim` |
