# Falcon PMS - Docker & Kubernetes Infrastructure Guide

This directory contains the production-grade container builds, multi-node Docker Compose orchestrations, and Kubernetes manifests for Falcon PMS.

---

## Directory Structure

```
Docker/
├── Dockerfile                  # Production multi-stage Python 3.11 image
├── Dockerfile.nginx            # Production Nginx load balancer image
├── entrypoint.sh               # Container startup & migration handler
├── docker-compose.yml          # Local development stack (with PgBouncer & Redis)
├── docker-compose.prod.yml     # Production hardened stack (reads root .env)
└── k8s/                        # Production Kubernetes Manifests
    ├── 00-namespace-config-secret.yaml
    ├── 01-postgres-statefulset.yaml
    ├── 02-pgbouncer-deployment.yaml
    ├── 03-redis-deployment.yaml
    ├── 04-falcon-web-deployment.yaml
    ├── 05-celery-worker-deployment.yaml
    └── 06-ingress.yaml
```

---

## 1. Running with Docker Compose

### Local Development Setup
From the project root directory:

```bash
docker compose -f Docker/docker-compose.yml up -d --build
```

### Production Stack Setup
Ensure `.env` in project root is properly configured, then run:

```bash
docker compose -f Docker/docker-compose.prod.yml up -d --build
```

### Checking Services
```bash
docker compose -f Docker/docker-compose.yml ps
docker compose -f Docker/docker-compose.yml logs -f app-1
```

---

## 2. Deploying to Kubernetes

### Apply Manifests in Order

```bash
# 1. Create Namespace, ConfigMap, and Secret
kubectl apply -f Docker/k8s/00-namespace-config-secret.yaml

# 2. Deploy PostgreSQL StatefulSet
kubectl apply -f Docker/k8s/01-postgres-statefulset.yaml

# 3. Deploy PgBouncer Connection Pooler
kubectl apply -f Docker/k8s/02-pgbouncer-deployment.yaml

# 4. Deploy Redis
kubectl apply -f Docker/k8s/03-redis-deployment.yaml

# 5. Deploy Falcon Web ASGI Application & HPA
kubectl apply -f Docker/k8s/04-falcon-web-deployment.yaml

# 6. Deploy Celery Worker and Beat Scheduler
kubectl apply -f Docker/k8s/05-celery-worker-deployment.yaml

# 7. Apply Nginx Ingress Controller
kubectl apply -f Docker/k8s/06-ingress.yaml
```

### Monitor Deployment Status

```bash
kubectl get pods -n falcon-pms
kubectl get services -n falcon-pms
kubectl get hpa -n falcon-pms
```

---

## Architecture Highlights

1. **PgBouncer Integration**: All web nodes and Celery workers connect to PgBouncer on port `6432` with transaction pooling mode for maximum database concurrency across multi-tenant schemas.
2. **WebSockets Support**: Ingress and Nginx load balancers support HTTP 1.1 upgrade headers for `/ws/` real-time WebSocket channels.
3. **Automated Migrations**: Primary web container automatically executes `python manage.py migrate` and `collectstatic` on boot via `entrypoint.sh`.
