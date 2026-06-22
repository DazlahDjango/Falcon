# Falcon PMS — Production Deployment Tools & Steps Guide

This document lists all software and configuration tools required to deploy Falcon PMS and details the deployment workflow on either a Cloud VPS or a Kubernetes cluster.

---

## 1. Required Deployment Tool Stack

| Tool | Purpose | Installation Command (Ubuntu) |
| :--- | :--- | :--- |
| **Git** | Codebase synchronization & version control | `sudo apt install git -y` |
| **Docker Engine** | Production containerization platform | See Docker Engine script below |
| **Docker Compose** | Multi-container orchestration | `sudo apt install docker-compose-plugin -y` |
| **kubectl** | CLI tool to control Kubernetes clusters | `snap install kubectl --classic` |
| **Helm** | Kubernetes package and deployment manager | `snap install helm --classic` |
| **Certbot** | Automated SSL certification generation | `sudo snap install --classic certbot` |
| **pgAdmin 4** | Web UI tool for remote DB management | See pgAdmin setup below |

---

## 2. Path A: Step-by-Step VPS/VM Deployment (Docker Compose)

A standard deployment path for early stage launch on cloud servers (DigitalOcean, AWS EC2, Linode, Hetzner) running Ubuntu 22.04 LTS.

### Step 1: Server Preparation & Security
1.  **Update packages**:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Configure basic UFW Firewall**:
    ```bash
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw enable
    ```

### Step 2: Install Docker Engine
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

### Step 3: Cloning the Code & Env Configuration
1.  **Clone code to host destination**:
    ```bash
    sudo mkdir -p /opt/falcon-pms
    sudo chown -R $USER:$USER /opt/falcon-pms
    git clone https://github.com/your-username/falcon_pms.git /opt/falcon-pms
    cd /opt/falcon-pms
    ```
2.  **Create production environment variables file (`.env`)**:
    ```bash
    nano .env
    ```
    Add the following variables:
    ```ini
    DB_PASSWORD=your_ultra_secure_postgres_pass
    DJANGO_SECRET_KEY=your_production_secret_django_key_here
    DJANGO_ENV=production
    DJANGO_SETTINGS_MODULE=config.settings.production
    ```

### Step 4: Launch and Migrate
1.  **Launch Docker containers**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```
2.  **Run migrations inside backend container**:
    ```bash
    docker compose -f docker-compose.prod.yml exec backend python manage.py migrate --noinput
    ```
3.  **Collect static files inside backend container**:
    ```bash
    docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
    ```
4.  **Create initial super administrator account**:
    ```bash
    docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
    ```

---

## 3. Path B: Kubernetes Cluster Deployment

For production-grade scalability, load balancing, and high-availability.

### Step 1: Set up Configs & Secrets
1.  **Apply Namespace & ConfigMaps**:
    ```bash
    kubectl apply -f Docs/hub/namespace-config.yaml
    ```
2.  **Inject Secrets cleanly**:
    ```bash
    kubectl create secret generic falcon-secrets \
      --namespace=falcon-pms \
      --from-literal=postgres-password='your_secure_db_pass_here' \
      --from-literal=django-secret-key='your_django_key'
    ```

### Step 2: Deploy Workloads
Apply the resource manifests in logical order (database, caching brokers first, followed by apps):
```bash
# 1. State Workloads
kubectl apply -f Docs/hub/postgres-statefulset.yaml
kubectl apply -f Docs/hub/redis-deployment.yaml

# Wait for DB to be healthy
kubectl wait --namespace=falcon-pms --for=condition=ready pod/postgres-0 --timeout=120s

# 2. App & Queue Workloads
kubectl apply -f Docs/hub/backend-deployment.yaml
kubectl apply -f Docs/hub/celery-deployment.yaml
kubectl apply -f Docs/hub/frontend-deployment.yaml
```

### Step 3: Configure Ingress and SSL (HTTPS)
1.  **Install Ingress Controller via Helm**:
    ```bash
    helm upgrade --install ingress-nginx ingress-nginx \
      --repo https://kubernetes.github.io/ingress-nginx \
      --namespace ingress-nginx --create-namespace
    ```
2.  **Install cert-manager for automatic Let's Encrypt certificates**:
    ```bash
    helm upgrade --install cert-manager jetstack/cert-manager \
      --namespace cert-manager --create-namespace \
      --set installCRDs=true
    ```
3.  **Deploy Ingress resource rules**:
    ```bash
    kubectl apply -f Docs/hub/ingress.yaml
    ```

---

## 4. Troubleshooting Checklist

*   **Check logs for a specific service**:
    ```bash
    # Docker
    docker compose -f docker-compose.prod.yml logs -f backend
    # Kubernetes
    kubectl logs -n falcon-pms deployment/backend --tail=100
    ```
*   **Access container shell**:
    ```bash
    # Docker
    docker compose -f docker-compose.prod.yml exec backend sh
    # Kubernetes
    kubectl exec -n falcon-pms -it deployment/backend -- sh
    ```
