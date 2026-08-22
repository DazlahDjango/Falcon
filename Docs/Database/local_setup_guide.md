# Local Setup & Testing Guide: PostgreSQL + PgBouncer + Redis + Nginx on Windows

This guide provides step-by-step instructions for setting up and testing the **PgBouncer connection pooler**, **PostgreSQL tuning**, **Redis caching**, **Nginx load balancer**, and **Multi-Instance Django application servers** locally on a Windows 10/11 environment (16GB RAM).

---

## Architecture of Local Test Environment

```
                          ┌────────────────────────┐
                          │   Nginx Load Balancer  │  (Port 80 / 8080)
                          └───────────┬────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ↓                                         ↓
   Django App Instance 1                      Django App Instance 2
   (Port 8000)                                (Port 8001)
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ↓ (Port 6432 - Transaction Pooler)
                          ┌────────────────────────┐
                          │   PgBouncer Pooler     │  (bypassed for backups on 5432)
                          └───────────┬────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ↓                                         ↓
   PostgreSQL Primary Server                  Redis Cache Server
   (Port 5432)                                (Port 6379)
```

---

## METHOD A: Docker Desktop Approach (Recommended & Easiest for Windows)

Since PgBouncer and Nginx are native Linux daemons, using Docker Desktop on Windows allows you to run the entire multi-instance architecture with a single command.

### Step 1: Start Docker Desktop
Ensure **Docker Desktop for Windows** is running (WSL 2 backend enabled).

### Step 2: Launch the Infrastructure Stack
In your terminal (`C:\Users\Dazlah Administrator\Desktop\Forward\Falcon`):
```powershell
docker-compose up -d --build
```

### Step 3: Verify Container Health
```powershell
docker-compose ps
```
You should see:
- `falcon-postgres-dev` listening on port `5432`
- `falcon-pgbouncer-dev` listening on port `6432`
- `falcon-redis-dev` listening on port `6379`
- `falcon-backend-dev` listening on port `8000`

---

## METHOD B: Native Windows + WSL / Local Process Setup (No Docker required for DB)

If you prefer using your locally installed Windows **PostgreSQL** and **Redis**, follow these steps:

### Step 1: Configure Local PostgreSQL (`postgresql.conf` & `pg_hba.conf`)

1. Find your PostgreSQL Data Directory on Windows (typically `C:\Program Files\PostgreSQL\16\data\`).
2. Copy [`config/postgresql.conf`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/postgresql.conf) parameters or append to `C:\Program Files\PostgreSQL\16\data\postgresql.conf`:
   ```ini
   max_connections = 200
   shared_buffers = 2GB              # Adjusted for 16GB RAM laptop
   work_mem = 16MB
   max_locks_per_transaction = 128
   ```
3. Copy [`config/pg_hba.conf`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/pg_hba.conf) rules to `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`.
4. Restart the PostgreSQL Windows Service:
   ```powershell
   Restart-Service postgresql-x64-16
   ```

### Step 2: Install & Run PgBouncer on Windows

On Windows, PgBouncer can be run inside **WSL2** (Windows Subsystem for Linux):

1. Open WSL terminal (`wsl` in Powershell):
   ```bash
   sudo apt update && sudo apt install -y pgbouncer
   ```
2. Copy project `pgbouncer.ini` configuration:
   ```bash
   sudo cp /mnt/c/Users/Dazlah\ Administrator/Desktop/Forward/Falcon/config/pgbouncer.ini /etc/pgbouncer/pgbouncer.ini
   ```
3. Start PgBouncer in WSL:
   ```bash
   sudo service pgbouncer start
   ```
4. Verify PgBouncer is listening on port `6432`:
   ```powershell
   netstat -ano | findstr 6432
   ```

---

### Step 3: Install & Configure Nginx for Windows (Load Balancer)

1. Download **Nginx for Windows** zip from [nginx.org/en/download.html](https://nginx.org/en/download.html).
2. Extract to `C:\nginx`.
3. Open `C:\nginx\conf\nginx.conf` and configure the upstream load balancer block:

```nginx
worker_processes 4;  # Number of CPU cores

events {
    worker_connections 4096;
    multi_accept on;
    use select;
}

http {
    include mime.types;
    default_type application/octet-stream;

    # Logging
    access_log logs/access.log;
    error_log logs/error.log;

    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    upstream django_apps {
        # Load balancing - round robin across 3 app instances
        server 127.0.0.1:8000;
        server 127.0.0.1:8001;
        server 127.0.0.1:8002;
        
        # Keep alive connections
        keepalive 32;
    }

    server {
        listen 80;
        server_name localhost;

        # Static files (Wrapped in quotes to handle path spaces safely)
        location /static/ {
            alias "C:/Users/Dazlah Administrator/Desktop/Forward/Falcon/static/";
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Media files (Wrapped in quotes to handle path spaces safely)
        location /media/ {
            alias "C:/Users/Dazlah Administrator/Desktop/Forward/Falcon/media/";
            expires 7d;
        }

        # Django application endpoints
        location / {
            proxy_pass http://django_apps;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 75s;
            proxy_read_timeout 300s;
            proxy_send_timeout 300s;
            
            # Buffering
            proxy_buffering off;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
        }

        # WebSocket support for channels/realtime
        location /ws/ {
            proxy_pass http://django_apps;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 86400;
        }

        # Health check probe
        location /health/ {
            proxy_pass http://django_apps;
            access_log off;
        }

        # Error pages
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root html;
        }
    }
}
```
4. Start Nginx on Windows:
   ```powershell
   cd C:\nginx
   start nginx
   ```

---

### Step 4: Run Multiple Local Django App Instances

To simulate multi-server deployment locally, open **2 separate PowerShell windows** in your project folder:

#### PowerShell Window 1 (App Server Instance 1):
```powershell
$env:DB_PORT="6432"
fasc\Scripts\python.exe manage.py runserver 8000
```

#### PowerShell Window 2 (App Server Instance 2):
```powershell
$env:DB_PORT="6432"
fasc\Scripts\python.exe manage.py runserver 8001
```

---

## Testing & Verifying Your Local Multi-Server Cluster

### 1. Test Connection Pooling Metrics
In a 3rd PowerShell window:
```powershell
fasc\Scripts\python.exe manage.py manage_connections metrics
```

### 2. Test Nginx Load Balancing
Send requests to `http://localhost` (Port 80). Nginx will automatically alternate routing between App Server Instance 1 (Port 8000) and App Server Instance 2 (Port 8001).

### 3. Verify Redis Caching
In PowerShell:
```powershell
redis-cli ping
```
Should return `PONG`. Schema name lookups (`tenant_schema_name:{tenant_id}`) will be cached in Redis with sub-millisecond speeds!
