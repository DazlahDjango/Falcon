# Falcon PMS - Docker & Kubernetes Step-by-Step Setup Guide (`docker_flow.md`)

This document provides a clear, step-by-step walkthrough for setting up, running, and managing **Falcon PMS** using **Docker Compose** (for local development and single-server production) and **Kubernetes** (for high-availability production clusters).

---

## 📋 Prerequisites Checklist

Before beginning, ensure you have the following installed on your machine:
- **Docker Desktop** (Windows / macOS) or **Docker Engine + Docker Compose v2** (Linux).
- **Git** (to clone and manage the codebase).
- **`kubectl` CLI** (if deploying to Kubernetes).
- A local Kubernetes cluster for testing (e.g., **Minikube**, **K3s**, **Kind**, or **Docker Desktop Kubernetes**).

---

## 🛠️ Phase 1: Local Development Setup (Docker Compose)

The local development stack uses `Docker/docker-compose.yml` to start all required microservices: Nginx, 2 Django App Nodes, Celery Worker, Celery Beat, PgBouncer, PostgreSQL 16, and Redis 7.

### Step 1: Verify Environment Variables
Ensure a `.env` file exists in your project root directory (`c:\Users\...\Falcon\.env`). If not, copy the template:

```bash
cp .env.example .env
```

Ensure the key database settings in `.env` match:
```ini
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=6432
REDIS_URL=redis://redis:6379/0
```

### Step 2: Build and Launch Containers
Open your terminal in the project root directory (`Falcon/`) and run:

```bash
docker compose -f Docker/docker-compose.yml up -d --build
```

- `-f Docker/docker-compose.yml`: Points Docker to the compose file inside `Docker/`.
- `-d`: Runs containers in detached background mode.
- `--build`: Forces Docker to build fresh images from `Docker/Dockerfile` and `Docker/Dockerfile.nginx`.

### Step 3: Check Container Status & Logs
Verify all 8 containers are running cleanly:

```bash
docker compose -f Docker/docker-compose.yml ps
```

You should see the following active containers:
- `falcon-nginx-dev` (Up - Ports `0.0.0.0:80->80`)
- `falcon-app-1` (Up)
- `falcon-app-2` (Up)
- `falcon-celery-worker-dev` (Up)
- `falcon-celery-beat-dev` (Up)
- `falcon-pgbouncer-dev` (Up - Ports `0.0.0.0:6432->6432`)
- `falcon-postgres-dev` (Up - Ports `0.0.0.0:5432->5432` - Healthy)
- `falcon-redis-dev` (Up - Ports `0.0.0.0:6379->6379` - Healthy)

To view live logs from the web servers or Celery worker:
```bash
docker compose -f Docker/docker-compose.yml logs -f app-1 celery-worker
```

### Step 4: Run Migrations & Create Superuser
The primary web container (`falcon-app-1`) runs `python manage.py migrate` automatically on boot via `entrypoint.sh`.

To create an administrator user, execute interactive Python inside container `falcon-app-1`:

```bash
docker exec -it falcon-app-1 python manage.py createsuperuser
```

Follow the prompts to set your email and admin password.

### Step 5: Access the Application
- **Web Application / APIs**: `http://localhost/`
- **Django Admin Interface**: `http://localhost/admin/`
- **Swagger API Docs**: `http://localhost/api/docs/`
- **ReDoc API Docs**: `http://localhost/api/redoc/`
- **Health Check Probe**: `http://localhost/health/`
- **PgBouncer Multiplexer**: `localhost:6432`
- **Direct PostgreSQL Engine**: `localhost:5432`
- **Redis Cache Engine**: `localhost:6379`

### Step 6: Stopping and Cleaning Up
To stop the development environment without deleting stored data:
```bash
docker compose -f Docker/docker-compose.yml stop
```

To completely tear down containers, networks, and named volumes:
```bash
docker compose -f Docker/docker-compose.yml down -v
```

---

## 🚀 Phase 2: Production Setup (Docker Compose)

For production deployment on a single server or virtual machine (EC2 / DigitalOcean Droplet):

### Step 1: Configure Production `.env`
Update `.env` with production secrets:
```ini
DJANGO_ENV=production
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-actual-production-secret-key
JWT_SIGNING_KEY=your-actual-jwt-signing-key
MFA_ENCRYPTION_KEY=your-actual-mfa-key
DB_PASSWORD=your-secure-db-password
CORS_ALLOWED_ORIGINS=https://falcon.yourcompany.com
```

### Step 2: Launch Production Stack
Run:

```bash
docker compose -f Docker/docker-compose.prod.yml up -d --build
```

### What happens in Production Compose:
- Nginx binds to both HTTP `80` and HTTPS `443`.
- Two isolated Celery worker processes start:
  - `falcon-celery-worker-default`: Handles fast queues (`email`, `cleanup`, `notifications`, `dashboard`).
  - `falcon-celery-worker-billing-report`: Handles heavy queues (`billing`, `webhooks`, `reportplt_*`, `reviews_*`).
- Containers use restart policy `restart: always` to automatically recover from system reboots or crashes.

---

## ☸️ Phase 3: Kubernetes (K8s) Cluster Deployment

For enterprise high-availability with auto-scaling, deploy the Kubernetes manifests in `Docker/k8s/`.

### Step 1: Connect to your Cluster
Verify connection to your Kubernetes cluster:
```bash
kubectl cluster-info
```

### Step 2: Apply Manifests in Sequence

Execute the manifests in numbered order:

#### 1. Create Namespace, ConfigMap, and Secret:
```bash
kubectl apply -f Docker/k8s/00-namespace-config-secret.yaml
```

#### 2. Deploy PostgreSQL StatefulSet (Database Storage):
```bash
kubectl apply -f Docker/k8s/01-postgres-statefulset.yaml
```

#### 3. Deploy PgBouncer Connection Pooler:
```bash
kubectl apply -f Docker/k8s/02-pgbouncer-deployment.yaml
```

#### 4. Deploy Redis Cache:
```bash
kubectl apply -f Docker/k8s/03-redis-deployment.yaml
```

#### 5. Deploy Falcon Web ASGI Application & Horizontal Pod Autoscaler (HPA):
```bash
kubectl apply -f Docker/k8s/04-falcon-web-deployment.yaml
```

#### 6. Deploy Celery Workers & Beat Scheduler:
```bash
kubectl apply -f Docker/k8s/05-celery-worker-deployment.yaml
```

#### 7. Apply Nginx Ingress Controller (WebSockets + HTTP):
```bash
kubectl apply -f Docker/k8s/06-ingress.yaml
```

---

### Step 3: Verify Deployment & Auto-Scaling

Check that all pods in the `falcon-pms` namespace are in `Running` state:
```bash
kubectl get pods -n falcon-pms -o wide
```

Check the status of services and ingress:
```bash
kubectl get svc,ingress -n falcon-pms
```

Monitor Horizontal Pod Autoscaler (HPA):
```bash
kubectl get hpa -n falcon-pms
```

To view live web logs in Kubernetes:
```bash
kubectl logs -f -l app=falcon-web -n falcon-pms
```

To execute database migrations manually inside Kubernetes:
```bash
kubectl exec -it deployment/falcon-web -n falcon-pms -- python manage.py migrate
```

---

## 🎯 Summary Flowchart

```
[ Local Dev ] --------> docker compose -f Docker/docker-compose.yml up -d
                              │
                              ├── Nginx (Port 80)
                              ├── App-1 & App-2 (Gunicorn/Uvicorn)
                              ├── Celery Worker & Beat
                              ├── PgBouncer (Port 6432)
                              ├── Postgres 16 (Port 5432)
                              └── Redis 7 (Port 6379)

[ Production K8s ] ---> kubectl apply -f Docker/k8s/
                              │
                              ├── Ingress (TLS + WebSockets)
                              ├── Falcon Web (HPA: 3-15 Pods)
                              ├── Celery Worker & Singleton Beat Pod
                              ├── PgBouncer Deployments
                              ├── Redis Pod
                              └── Postgres StatefulSet (20GB PVC)
```
