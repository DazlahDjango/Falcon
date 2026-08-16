# Docker Cluster Deployment & Execution Guide

This document provides step-by-step instructions for building, launching, inspecting, and managing the fully containerized **Falcon PMS Cluster** (PostgreSQL 16 Primary + PgBouncer Pooler + Redis Cache + Nginx Load Balancer + Dual Django Nodes + Celery Workers).

---

## Container Stack Architecture

```
                                  HTTP Request (Port 80 / 443)
                                               │
                                               ↓
                                ┌─────────────────────────────┐
                                │   falcon-nginx Load Balancer │
                                └──────────────┬──────────────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         ↓                                           ↓
           ┌───────────────────────────┐               ┌───────────────────────────┐
           │ falcon-app-1 Node (:8000) │               │ falcon-app-2 Node (:8000) │
           └─────────────┬─────────────┘               └─────────────┬─────────────┘
                         │                                           │
                         └─────────────────────┬─────────────────────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         ↓ (Port 6379)         ↓ (Port 6432)         ↓ (Direct Port 5432 - Backup Bypassing)
           ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
           │     falcon-redis Cache    │ │   falcon-pgbouncer Pool   │ │   falcon-postgres Engine  │
           └───────────────────────────┘ └─────────────┬─────────────┘ └───────────────────────────┘
                                                       │
                                                       ↓ (Internal 5432)
                                         ┌───────────────────────────┐
                                         │   falcon-postgres Engine  │
                                         └───────────────────────────┘
```

---

## Prerequisites

1. Install **Docker Desktop for Windows** (WSL 2 backend enabled).
2. Ensure Docker service is running:
   ```powershell
   docker info
   ```

---

## Step 1: Development / Testing Cluster Setup

### 1. Build and Launch Container Cluster
In your PowerShell terminal at project root (`C:\Users\Dazlah Administrator\Desktop\Forward\Falcon`):
```powershell
docker-compose up -d --build
```

### 2. Verify Container Status
```powershell
docker-compose ps
```
You should see 7 active running containers:
* `falcon-nginx-dev` (Port `80:80`)
* `falcon-app-1` (Node 1)
* `falcon-app-2` (Node 2)
* `falcon-celery-worker-dev` (Background worker)
* `falcon-pgbouncer-dev` (Port `6432:6432`)
* `falcon-postgres-dev` (Port `5432:5432`)
* `falcon-redis-dev` (Port `6379:6379`)

---

## Step 2: Running Database Migrations & Initial Setup

Execute Django management commands inside container `app-1`:

```powershell
# 1. Run database migrations across public & tenant schemas
docker-compose exec app-1 python manage.py migrate

# 2. Collect static files for Nginx volume serving
docker-compose exec app-1 python manage.py collectstatic --noinput

# 3. Create superuser (if needed)
docker-compose exec app-1 python manage.py createsuperuser
```

---

## Step 3: Inspecting Metrics & Container Logs

### 1. Check Connection Metrics Across Nodes
```powershell
docker-compose exec app-1 python manage.py manage_connections metrics
```

### 2. Tail Live Container Logs
```powershell
# Tail logs for all containers
docker-compose logs -f

# Tail logs for Nginx load balancer
docker-compose logs -f nginx

# Tail logs for PgBouncer pooler
docker-compose logs -f pgbouncer
```

---

## Step 4: Testing Nginx Load Balancing

1. Open your browser and navigate to **`http://localhost`**.
2. Nginx will automatically distribute requests across `app-1` and `app-2`.
3. Test WebSockets: Connecting to `ws://localhost/ws/` forwards cleanly to the app nodes.

---

## Step 5: Production Container Cluster Deployment

For production deployments using Daphne ASGI server:

```powershell
# Launch production stack
docker-compose -f docker-compose.prod.yml up -d --build

# Inspect production status
docker-compose -f docker-compose.prod.yml ps
```

---

## Step 6: Stopping or Resetting the Cluster

```powershell
# Stop containers (data volume preserved)
docker-compose down

# Stop containers and remove volumes (Full reset)
docker-compose down -v
```
