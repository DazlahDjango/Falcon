# Falcon PMS — Pre-Deployment & Database Checklist

This document details critical actions that must be completed **before** launching Falcon PMS in production. This includes setting up PostgreSQL multi-tenant Row Level Security (RLS), preparing databases in pgAdmin/psql, and configuring cloud static/media storage.

---

## 1. Enabling PostgreSQL Row Level Security (RLS)

Falcon PMS uses a multi-tenant database strategy. To enforce absolute isolation between tenants, we implement PostgreSQL Row Level Security (RLS) at the database layer. This acts as a secondary firewall—preventing data leaks even if an application-layer bug queries across schemas.

### Step 1: Core Concept
*   Each tenant-sensitive table has an active security policy.
*   The application establishes a database session variable `app.current_tenant_id` at the start of each request middleware.
*   PostgreSQL filters rows matching `tenant_id = current_setting('app.current_tenant_id')`.
*   Superusers/Super Admins bypass RLS (`BYPASS RLS` role attribute) to aggregate data.

### Step 2: DDL Migration Script
Execute the following SQL DDL commands in pgAdmin or psql to activate RLS on critical multi-tenant tables:

```sql
-- 1. Enable RLS on Tenant-sensitive tables
ALTER TABLE apps_tenant_tenant FORCE ROW LEVEL SECURITY;
ALTER TABLE apps_accounts_user FORCE ROW LEVEL SECURITY;
ALTER TABLE apps_kpi_kpi FORCE ROW LEVEL SECURITY;
ALTER TABLE apps_kpi_target FORCE ROW LEVEL SECURITY;
ALTER TABLE apps_kpi_actual FORCE ROW LEVEL SECURITY;
ALTER TABLE apps_kpi_score FORCE ROW LEVEL SECURITY;

-- 2. Define Tenant Isolation Security Policies
CREATE POLICY tenant_isolation_policy ON apps_accounts_user
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON apps_kpi_kpi
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON apps_kpi_target
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON apps_kpi_actual
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_policy ON apps_kpi_score
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- 3. Ensure the active database user is NOT a superuser (to prevent policy bypass)
-- Standard app role:
ALTER ROLE falcon_app_user NOBYPASSRLS;
```

---

## 2. Database & pgAdmin Preparation

Before starting migrations or running the container build:

### Step 1: DDL Checklist inside psql / pgAdmin Query Tool
Connect to your PostgreSQL host as `postgres` (superuser) and run the following setup commands:

```sql
-- 1. Create the production database
CREATE DATABASE falcon_pms;

-- 2. Create a secure, isolated application user role
CREATE USER falcon_app_user WITH PASSWORD 'choose_ultra_secure_password';

-- 3. Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE falcon_pms TO falcon_app_user;

-- 4. Enable UUID Extension (required for multi-tenant UUID keys)
\c falcon_pms
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Step 2: Configure Connection Pooling (PgBouncer)
For high-traffic, asynchronous applications utilizing Celery:
*   Standard Postgres connections are resource-intensive.
*   **Recommendation**: Run **PgBouncer** in `transaction` mode on port `6432`.
*   Point `DB_PORT` in your `.env` to `6432` to leverage efficient connection recycling.

---

## 3. Static & Media Files Storage

In production container environments (like Docker and Kubernetes), local container storage is ephemeral (wiped out on restarts). We must configure static and media storage correctly.

### 1. Static Assets (`collectstatic`)
Static assets (React builds, CSS, core JS, system icons) are consolidated during deployment:
*   **Command**: `python manage.py collectstatic --noinput`
*   In the provided production compose file, static assets collect inside the `falcon-static-vol` shared volume.
*   Nginx maps requests targeting `/static/` directly to this volume—preventing Django from handling static asset traffic.

### 2. Media Uploads (AWS S3 or Google Cloud Storage)
User media uploads (avatars, PDF reports, KPI evidence files) should be stored in secure Cloud Object Storage.

#### Step 1: Install Python Storage Client
```bash
pip install django-storages boto3
```

#### Step 2: Django Settings configuration (`config/settings/production.py`)
```python
INSTALLED_APPS += ['storages']

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
```

#### Step 3: Required CORS Rules on S3 Bucket
Enable the following CORS rules on your S3 bucket configuration to prevent font/image rendering issues in frontend dashboards:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["https://falcon-pms.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
