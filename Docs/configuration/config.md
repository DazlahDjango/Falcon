# Falcon PMS - Complete Configuration Guide (`config/`)

Welcome to the comprehensive, line-by-line configuration guide for **Falcon PMS** (Performance Management System). This document provides an exhaustive, beginner-friendly explanation of every single component, setting, and feature in the `config/` directory—from `settings/base.py` (lines 13 through 1151) to ASGI, WSGI, Channels, and Celery background task routing.

---

## 📂 Executive Summary of `config/` Directory

The `config/` directory acts as the **brain and nervous system** of the Falcon PMS platform. It controls:
1. **Environment Settings**: How Django behaves in Development, Staging, and Production.
2. **URL Routing**: How incoming HTTP requests reach their destination views.
3. **Asynchronous & WebSockets**: How real-time events and WebSocket connections are routed via Channels/Daphne.
4. **Background Task Queue**: How background jobs and automated cron jobs are scheduled and routed via Celery and Redis.

```
config/
├── __init__.py               # Package initializer
├── asgi.py                   # Async Server Gateway Interface (WebSockets + HTTP)
├── wsgi.py                   # Web Server Gateway Interface (Standard HTTP)
├── routing.py                # Django Channels WebSocket Router
├── celery.py                 # Celery Application setup
├── celery_beat.py            # Cron / Scheduled periodic tasks
├── celery_queues.py          # Queue & Exchange definitions
├── celery_routes.py          # Task-to-Queue routing rules
├── settings/                 # Modular Settings Package
│   ├── __init__.py           # Dynamic Environment Loader
│   ├── base.py               # Master Configuration Blueprint (Lines 1 to 1151)
│   ├── development.py        # Local Development Overrides
│   ├── staging.py            # Staging / Pre-Production Overrides
│   ├── production.py         # Hardened Production Overrides
│   └── test.py               # Automated Testing Overrides
└── urls/                     # Modular URL Configuration
    ├── __init__.py           # Package re-exporter
    ├── base.py               # Root URL Dispatcher
    └── api_v1.py             # Versioned API Endpoint Map
```

---

## ⚙️ 1. Settings Package (`config/settings/`)

Falcon PMS uses a **modular settings pattern** to keep settings clean, maintainable, and secure across environments.

### 1.1 `config/settings/__init__.py` (Environment Switcher)
This file is executed whenever Django boots up. It reads the `DJANGO_ENV` environment variable (`development`, `staging`, or `production`) and imports the corresponding settings module.

- **How it works:**
  - If `DJANGO_ENV=production`, it imports `production.py`.
  - If `DJANGO_ENV=development`, it imports `development.py`.
  - In production, it performs strict validation to ensure mandatory environment variables (`DJANGO_SECRET_KEY`, `DB_NAME`, `REDIS_URL`, etc.) are present before booting up.

---

### 1.2 `config/settings/base.py` (Exhaustive Line-by-Line Breakdown: Lines 13 to 1151)

`config/settings/base.py` is the central blueprint of the application containing all shared defaults across all environments. Below is a detailed breakdown of all 23 configuration sections in `base.py`:

#### 1. Logging Formatter & Base Directory Setup (Lines 13-36)
- **`JsonFormatter`**: A custom Python `logging.Formatter` class that converts log messages into structured JSON objects containing `time`, `level`, `module`, and `message`. This enables centralized log analyzers (Datadog, ElasticSearch/ELK) to parse system logs effortlessly.
- **`BASE_DIR`**:
  ```python
  BASE_DIR = Path(__file__).resolve().parent.parent.parent
  ```
  Calculates the absolute path to the project root directory (where `manage.py` and `.env` reside).

#### 2. Environment Schema Initialization (`env = environ.Env(...)`) (Lines 37-72)
Uses `django-environ` to read values from the `.env` file with strict data types and default fallback values:
- `DEBUG` (bool, default `False`)
- `DJANGO_ENV` (str, default `'development'`)
- `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` (bool flags for HTTPS)
- `RATELIMIT_ENABLE` (bool, default `True`)
- Feature Flags: `FEATURE_DR_ENABLED`, `FEATURE_BACKUP_ENABLED`, `FEATURE_MAINTENANCE_ENABLED`, `FEATURE_HEALTH_MONITORING_ENABLED`, `FEATURE_ADVANCED_ANALYTICS`.
- Operations Logging Flags: `LOG_BACKUP_OPERATIONS`, `LOG_DR_OPERATIONS`, `LOG_MAINTENANCE_OPERATIONS`, `LOG_HEALTH_CHECKS`.
- `environ.Env.read_env(...)`: Automatically loads key-value pairs from `.env`.

#### 3. Core Security & Admin URL (Lines 73-90)
- **`SECRET_KEY`**: Cryptographic signing key for sessions, CSRF tokens, and password reset tokens. Loaded from `DJANGO_SECRET_KEY`.
- **`DEBUG`**: Toggles Django's debug mode.
- **`ALLOWED_HOSTS`**: List of domain names/IPs allowed to serve requests (defaults to `['localhost', '127.0.0.1', '.ngrok.io']`).
- **`ADMIN_URL`**: Custom Django Admin path (defaults to `'admin/'`). Obfuscated in production for security.

#### 4. Installed Applications (`INSTALLED_APPS`) (Lines 91-162)
Divided into three distinct architecture layers:
- **`DJANGO_APPS`**: Core Django utilities (`admin`, `auth`, `contenttypes`, `sessions`, `messages`, `staticfiles`, `sites`).
- **`THIRD_PARTY_APPS`**: Industry standard extensions:
  - `rest_framework` & `rest_framework_simplejwt`: REST API & JWT Token authentication.
  - `corsheaders`: Handles Cross-Origin Resource Sharing.
  - `django_multitenant` & `django_rls`: Row-Level Security (RLS) and multi-tenancy schema support.
  - `axes`: Brute-force monitoring and lockout.
  - `guardian`: Object-level permissions.
  - `django_otp` & `otp_totp`: Two-Factor/MFA TOTP support.
  - `viewflow`: Business process and workflow engine.
  - `notifications`: User notification system.
  - `django_apscheduler`: In-process background scheduling.
  - `easy_pdf`: PDF report generation.
  - `auditlog`: Model auditing.
  - `drf_yasg` & `drf_spectacular`: OpenAPI/Swagger documentation generators.
  - `channels`: WebSockets & Async layer.
  - `celery`, `django_celery_beat`, `django_celery_results`: Task queue and beat scheduler integration.
  - `health_check`, `health_check.db`, `health_check.cache`: System health monitoring.
- **`PROJECT_APPS`**: Domain micro-apps:
  - `apps.accounts` (User management, authentication, audit)
  - `apps.tenant` (Organization multi-tenancy)
  - `apps.structure` (Org chart, units, positions, employments)
  - `apps.kpi` (KPI scoring, targets, calculations, cascade)
  - `apps.billing` (PayStack subscriptions, invoices, webhooks)
  - `apps.configs` (Disaster recovery, backup orchestrator, maintenance mode)
  - `apps.reviews` (Performance appraisal cycles, 360 feedback, PIPs)
  - `apps.dashboard` (Role-based dashboards & analytics)
  - `apps.reportplt` (Reporting platform & exports)
  - `apps.core` (Core shared utilities & base views)

#### 5. Database Connection Pool Management (Lines 163-179)
Fine-grained pool thresholds to prevent database connection exhaustion under heavy load:
- `ENABLE_CONNECTION_MIDDLEWARE = True`
- `CONNECTION_IDLE_TIMEOUT_MINUTES = 5`: Closes idle connections after 5 minutes.
- `CONNECTION_MAX_LIFETIME_MINUTES = 120`: Maximum lifetime of a pooled connection.
- `CONNECTION_POOL_MAX_SIZE = 20`: Maximum connections per pool.
- `CONNECTION_WAIT_TIMEOUT_SECONDS = 10`: Wait limit when pool is full.
- `CONNECTION_RETRY_COUNT = 3` & `CONNECTION_RETRY_BACKOFF_BASE_SECONDS = 0.2`: Exponential backoff retry logic.
- `CONNECTION_MIDDLEWARE_EXCLUDED_PATHS`: Excludes lightweight paths (`/health/`, `/metrics/`, `/static/`, `/media/`, `/api/v1/auth/`).

#### 6. Complete Middleware Pipeline (`MIDDLEWARE`) (Lines 180-242)
Executes sequentially on every request and in reverse on every response:
1. `CorsMiddleware`: Headers for cross-origin request handling.
2. `SecurityMiddleware`: HTTPS enforcement and security header injection.
3. `SessionMiddleware`: Manages HTTP sessions.
4. `CommonMiddleware`: Handles trailing slashes and URL rewriting.
5. `CsrfViewMiddleware`: Protection against Cross-Site Request Forgery.
6. `AuthenticationMiddleware`: Associates requests with authenticated users.
7. `MessageMiddleware`: Flash messaging support.
8. `XFrameOptionsMiddleware`: Clickjacking protection.
9. `OTPMiddleware`: MFA verification step.
10. `AxesMiddleware`: Brute-force attempt tracking.
11. `RatelimitMiddleware`: Rate limiting enforcer.
12. **Accounts Middlewares**: `SessionMiddleware`, `AuditMiddleware`, `SecurityMiddleware`.
13. **Tenant Middlewares**: `OrganizationContextMiddleware`, `OrganizationResolutionMiddleware`, `OrganizationIsolationMiddleware`, `OrganizationPathIsolationMiddleware`, `OrganizationLimitsMiddleware`, `TenantDatabaseRouterMiddleware`, `ConnectionManagementMiddleware`, `FileIsolationMiddleware`.
14. **KPI Middlewares**: `KPIContextMiddleware`, `KPIRequestAuditMiddleware`, `KPIThrottleMiddleware`, `CalculationCacheMiddleware`.
15. **Structure Middlewares**: `StructureContextMiddleware`, `StructureCacheMiddleware`, `StructureAccessEnforcerMiddleware`, `StructureRateLimitMiddleware`.
16. **Billing Middlewares**: `SubscriptionGuardMiddleware`, `BillingAuditMiddleware`, `WebhookRateLimitMiddleware`, `TenantBillingContextMiddleware`.
17. **Config Maintenance Middlewares**: `MaintenanceBlockerMiddleware`, `PartialMaintenanceBlockerMiddleware`, `ConfigAccessMiddleware`, `MaintenanceNoticeInjectorMiddleware`.

#### 7. Templates, WSGI & Database Routing (Lines 243-304)
- **`ROOT_URLCONF`**: Points to `config.urls` as root URL map.
- **`TEMPLATES`**: Configures Django HTML template directory paths (`templates/` and frontend email templates).
- **`WSGI_APPLICATION`**: Points to `config.wsgi.application`.
- **`DATABASES`**: PostgreSQL configuration reading `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT`. Disables server-side cursors (`DISABLE_SERVER_SIDE_CURSORS = True`) to ensure 100% compatibility with **PgBouncer** connection multiplexing on port `6432`.
- **`DATABASE_ROUTERS`**: Uses `OrganizationDatabaseRouter` for multi-tenant database routing.
- **Tenant Schema Caching**: `TENANT_SCHEMA_CACHE_TTL = 300`, `ENABLE_PGBOUNCER_MODE = True`.

#### 8. Frontend URLs (Lines 305-325)
Base URLs used by backend email services to construct clickable links:
- `FRONTEND_URL` (default: `http://localhost:5173`)
- `FRONTEND_VERIFY_URL`: Email verification link endpoint.
- `FRONTEND_RESET_PASSWORD_URL`: Password reset link endpoint.
- `FRONTEND_INVITE_URL`: User invitation link endpoint.

#### 9. Authentication Backends, Password Validators & OAuth (Lines 328-420)
- **Models**: `AUTH_USER_MODEL = 'accounts.User'`, `AUTH_TENANT_MODEL = 'tenant.Organization'`.
- **Authentication Backends**:
  1. `AxesStandaloneBackend` (Brute-force login protection)
  2. `ModelBackend` (Standard Django email/password login)
  3. `ObjectPermissionBackend` (Guardian object-level permissions)
- **Password Validators**: Ensures minimum length (8 characters), similarity checks, common password checks, and numeric checks.
- **SSO OAuth Providers**: Complete OAuth2 provider integration configurations for:
  - **Google**, **Microsoft / Azure AD**, **GitHub**, **LinkedIn**, and **Facebook**.

#### 10. Internationalization, Timezone & Static/Media Files (Lines 422-448)
- `LANGUAGE_CODE = 'en-us'`
- `TIME_ZONE = 'Africa/Nairobi'` (Nairobi / Kenya local time zone)
- `USE_I18N = True`, `USE_TZ = True`
- `STATIC_URL = '/static/'`, `STATIC_ROOT = BASE_DIR / 'staticfiles'`, `STATICFILES_DIRS = [BASE_DIR / 'static']`
- `MEDIA_URL = '/media/'`, `MEDIA_ROOT = BASE_DIR / 'media'`
- `DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'`

#### 11. REST Framework & Extensive Throttle Scopes (Lines 450-545)
Configures Django REST Framework defaults:
- **Authentication**: `TenantAwareJWTAuthentication`, `SessionAuthentication`.
- **Permissions**: `IsAuthenticated`, `IsPasswordChangeCompleted`.
- **Parsers & Renderers**: JSON, MultiPart, FileUpload.
- **Filtering**: DjangoFilterBackend, SearchFilter, OrderingFilter.
- **Comprehensive Throttle Scopes**:
  - Base: `anon: 100/day`, `user: 1000/day`
  - Authentication: `login: 5/min`, `register: 3/hour`, `password_reset: 3/hour`, `email_verification: 2/hour`, `session_refresh: 10/min`
  - MFA: `mfa: 5/min`, `mfa_enrollment: 3/hour`, `mfa_backup: 10/hour`
  - Endpoint & Admin: `sensitive: 30/min`, `admin: 200/hour`, `bulk: 5/hour`, `report: 10/hour`
  - User Management: `user_creation: 5/hour`, `profile_update: 30/hour`, `invitation: 20/hour`
  - Tenant: `tenant: 5000/hour`, `tenant_user_creation: 50/day`, `tenant_api: 10000/day`, `connection_ops: 100/hour`
  - Reviews & PIPs: `review_submission: 10/hour`, `calibration_action: 30/min`, `pip_creation: 2/month`, `pip_action: 20/hour`
  - Config App: `backup: 10/hour`, `restore: 5/hour`, `backup_burst: 2/min`, `dr: 2/hour`, `dr_burst: 1/min`, `maintenance: 20/hour`, `config_read: 100/min`, `config_write: 30/min`

#### 12. Simple JWT Configuration (`SIMPLE_JWT`) (Lines 547-576)
- `ACCESS_TOKEN_LIFETIME`: 30 minutes (configurable via `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`).
- `REFRESH_TOKEN_LIFETIME`: 7 days.
- `ROTATE_REFRESH_TOKENS = True`: Issues a new refresh token whenever one is used.
- `BLACKLIST_AFTER_ROTATION = True`: Blacklists old refresh tokens to prevent reuse replay attacks.
- `ALGORITHM = 'HS256'`, `ISSUER = 'FalconPMS'`.

#### 13. CORS, CSRF, & Session Management (Lines 577-641)
- **CORS**: `CORS_ALLOWED_ORIGINS` loaded from `.env`. Configures allowed headers (e.g., `authorization`, `x-tenant-id`, `x-organization-id`, `x-correlation-id`, `x-idempotency-key`).
- **CSRF**: `CSRF_COOKIE_HTTPONLY = True` (prevents JavaScript token stealing), `CSRF_COOKIE_SAMESITE = 'Lax'`.
- **Sessions**: Uses Redis cache backend (`django.contrib.sessions.backends.cache`). Session cookie age set to 2 weeks (`1209600` seconds). `SESSION_SAVE_EVERY_REQUEST = True`.

#### 14. Redis Cache Configuration (`CACHES`) (Lines 643-667)
Configures `django_redis.cache.RedisCache`:
- Connects to `REDIS_URL`.
- Uses `BlockingConnectionPool` with max 50 connections.
- Key prefix: `falcon`, default timeout: 300 seconds (5 minutes).

#### 15. Celery & WebSockets Channels Settings (Lines 668-697)
- **Celery**: Broker & Backend point to Redis (`CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`). `CELERY_TASK_TIME_LIMIT = 1800` (30 minutes). Beat scheduler uses `DatabaseScheduler`.
- **Channels**: `ASGI_APPLICATION = 'config.asgi.application'`. Uses `channels_redis.core.RedisChannelLayer` with symmetric secret key encryption, capacity 1000, expiry 60s.

#### 16. Logging Pipeline (`LOGGING`) (Lines 698-771)
Defines formatters (`verbose`, `simple`, `json`), log handlers (`console`, `file`, `audit`), and logger categories:
- `django`: Handles standard app logs (INFO).
- `django.security`: Captures security warnings (WARNING).
- `django.db.backends`: Database query logs (DEBUG in dev, WARNING in prod).
- `auditlog`: Logs security audit events into `logs/audit.log`.
- `celery`: Captures Celery task execution logs.

#### 17. Axes Brute-Force & MFA Security Rules (Lines 773-825)
- **Axes**: `AXES_ENABLED = True`, `AXES_FAILURE_LIMIT = 5`, `AXES_COOLOFF_TIME = 15 mins`. `AXES_LOCKOUT_PARAMETERS = [['username', 'ip_address', 'user_agent']]`.
- **MFA Settings**:
  - Requires `MFA_ENCRYPTION_KEY` in production.
  - TOTP Issuer: `FalconPMS`, 6 digits, 30s interval.
  - Backup codes: 10 codes, 90-day expiry.
  - Session timeout: 15 minutes, Remember Device: 30 days.
  - Enforcement: Mandatory for Admin and Executive roles.

#### 18. Auditlog, Rate Limiting, Email & Swagger (Lines 827-890)
- `RATELIMIT_ENABLE = True`, `RATELIMIT_USE_CACHE = 'default'`.
- `SITE_ID = 1`.
- **Email**: Configures SMTP connection (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `DEFAULT_FROM_EMAIL`).
- **OpenAPI / Swagger**: `SPECTACULAR_SETTINGS` and `SWAGGER_SETTINGS` for API schema documentation with Bearer token authentication UI.

#### 19. Security Headers & PayStack Billing (Lines 892-940)
- **Security Headers**: `SECURE_BROWSER_XSS_FILTER = True`, `SECURE_CONTENT_TYPE_NOSNIFF = True`, `X_FRAME_OPTIONS = 'DENY'`, `SECURE_REFERRER_POLICY = 'same-origin'`, Content Security Policy (`CSP_*`).
- **PayStack Integration**: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_BASE_URL`, `PAYSTACK_WEBHOOK_SECRET`.
- **Billing Core**: `BILLING_CURRENCY = 'KES'`, `BILLING_TAX_RATE = 0.16` (16% VAT), invoice prefix `'FALCON-'`.
- **Subscription Plans**:
  - `basic`: KES 5,000 / mo
  - `professional`: KES 25,000 / mo
  - `enterprise`: KES 100,000 / mo
- `BILLING_IDEMPOTENCY_TTL_HOURS = 24`.

#### 20. Tenant App Configuration (Lines 942-990)
- `TENANT_HEADER_NAME = 'X-Tenant-ID'`.
- Identification order: Header → Subdomain → Domain.
- Isolation level: `'schema'`.
- Auto-provisioning: `TENANT_AUTO_CREATE_SCHEMA = True`, `TENANT_AUTO_RUN_MIGRATIONS = True`.
- Tenant limits: Max 100 users, 10GB storage, 10,000 daily API calls, 500 KPIs, 50 departments.

#### 21. Backup Storage, Encryption & Compression (Lines 992-1060)
- Storage engines: `s3`, `local`, `gcs`, `azure`, `nfs`.
- Backup Encryption: AES-256-GCM encryption with master key support and HashiCorp Vault / AWS KMS integration (`ENCRYPTION_DEFAULT_KEY_SOURCE = 'aws_kms'`).
- Compression: Zstandard (`zstd`), level 3 compression.
- Backup Retention: 30-day default, 4-week full retention, 12-month archive retention.

#### 22. Disaster Recovery, Maintenance & Health Monitoring (Lines 1062-1107)
- **Disaster Recovery (DR)**: RTO = 240 mins (4 hours), RPO = 60 mins (1 hour). Auto-failover & auto-failback flags, standby endpoint configuration.
- **Maintenance**: Auto-approval flags, lead time notifications (1,440 mins / 24 hours), max 3 concurrent maintenance windows.
- **Health Checks**: 300s interval, 10s timeout, response time thresholds (Warning: 2000ms, Critical: 5000ms).

#### 23. Quotas, Audit Export, Feature Flags & Debug (Lines 1108-1151)
- Quota alerts at 80% warning and 95% critical thresholds.
- Audit export: Retention 365 days, optional S3 export (`AUDIT_EXPORT_PATH`).
- Feature flags: `FEATURE_DR_ENABLED`, `FEATURE_BACKUP_ENABLED`, `FEATURE_MAINTENANCE_ENABLED`, `FEATURE_HEALTH_MONITORING_ENABLED`.
- Operations logging toggles: `LOG_BACKUP_OPERATIONS`, `LOG_DR_OPERATIONS`, `LOG_MAINTENANCE_OPERATIONS`, `LOG_HEALTH_CHECKS`.

---

### 1.3 `config/settings/development.py` (Local Development)
- `DEBUG = True`: Displays full Python tracebacks in browser for easy debugging.
- `CORS_ALLOW_ALL_ORIGINS = True`: Permits frontend requests from local dev servers (`localhost:5173`).
- `CELERY_TASK_ALWAYS_EAGER = True`: Executes Celery tasks synchronously inline during local development so you don't need worker containers running.
- Includes `debug_toolbar` and `django_extensions`.

---

### 1.4 `config/settings/production.py` (Production Hardening)
- `DEBUG = False`: Disables verbose errors.
- **Security Headers**: Enables HTTPS SSL Redirect, HSTS (`SECURE_HSTS_SECONDS = 31536000`), `X-Frame-Options: DENY`, and strict Content Security Policy (CSP).
- **PgBouncer Pooling**: Connects via PgBouncer multiplexer port `6432` with support for optional read replicas (`DB_REPLICA_HOST`).
- **AWS S3 File Storage**: Switches static and user media uploads to AWS S3 (`storages.backends.s3boto3.S3Boto3Storage`).
- **Sentry Integration**: Real-time error tracking with custom `filter_sensitive_data` interceptor to redact passwords, JWT tokens, and CSRF tokens before sending traces.

---

## 🌐 2. URL Routing Package (`config/urls/`)

### 2.1 `config/urls/base.py` (Root Dispatcher)
The main entry point for all incoming web requests.
- `path('', home_view)`: Root landing page.
- `path('health/', include('health_check.urls'))`: Load balancer health check probe.
- `path('api/docs/')`, `path('api/redoc/')`: Interactive Swagger and ReDoc API documentation.
- `path('api/v1/...')`: Direct app endpoints for legacy/frontend compatibility.
- `path('api/', include('config.urls.api_v1'))`: Modular versioned API routing.

### 2.2 `config/urls/api_v1.py` (Versioned API Map)
Grouped endpoints cleanly under `/api/v1/`:
- `auth/` → `apps.accounts.urls`
- `tenant/` → `apps.tenant.api.v1.urls`
- `structure/` → `apps.structure.urls`
- `kpis/` → `apps.kpi.urls`
- `billing/` → `apps.billing.api.v1.urls`
- `reviews/` → `apps.reviews.urls`
- `config/` → `apps.configs.api.v1.urls`
- `dashboard/` → `apps.dashboard.api.v1.urls`
- `reportplt/` → `apps.reportplt.api.v1.urls`

---

## ⚡ 3. Asynchronous & WebSockets System

### 3.1 `config/wsgi.py` (Standard HTTP)
- Entrypoint for WSGI application servers (like Gunicorn). Handles standard synchronous HTTP request-response cycles.

### 3.2 `config/asgi.py` & `config/routing.py` (Async & WebSockets)
- `config/asgi.py` initializes the ASGI environment and passes control to `config/routing.py`.
- `config/routing.py` uses `ProtocolTypeRouter` to split traffic:
  - `http`: Handled by standard Django ASGI application.
  - `websocket`: Wrapped inside `AuthMiddlewareStack` and `WebSocketAuthMiddleware` for real-time WebSocket connection handling across all apps (`/ws/`).

---

## 🔄 4. Background Tasks & Celery System

Falcon PMS relies on **Celery** and **Redis** for asynchronous processing (sending emails, running heavy computations, generating reports, backups).

### 4.1 `config/celery.py`
- Instantiates the Celery app (`falcon_pms`).
- Automatically discovers tasks across all installed Django apps.
- Configures task rate limits, soft time limits (25 min), hard time limits (30 min), and automatic worker connection retries.

### 4.2 `config/celery_queues.py` (Queue Declarations)
Defines isolated Kombu queues to prevent heavy tasks (like report exports) from clogging fast tasks (like emails):
- `default`: Default fallback queue.
- `email`: Instant email notifications.
- `calculations` & `aggregation`: Heavy KPI score calculation tasks.
- `notifications`: Alerts and reminders.
- `billing` & `webhooks`: Payment processing & PayStack webhooks.
- `reportplt_export`, `reportplt_scheduler`, `reportplt_cleanup`: Report platform tasks.
- `organization`: Tenant management tasks.

### 4.3 `config/celery_routes.py` (Routing Rules)
Maps task names to specific queues using pattern matching:
- `'accounts.send_*'` → `email` queue.
- `'billing.tasks.process_webhook'` → `webhooks` queue.
- `'apps.kpi.tasks.calculations.*'` → `calculations` queue.
- `'dashboard.*'` → `dashboard` queue.

### 4.4 `config/celery_beat.py` (Automated Cron Schedules)
Contains automated scheduled jobs (`crontab`) that run periodically:
- `cleanup-expired-sessions`: Runs every hour.
- `calculate-scores-daily`: Runs daily at 02:00 AM.
- `daily-database-backup`: Runs daily at 01:00 AM.
- `process-due-renewals`: Runs daily at 02:00 AM for billing renewals.
- `health-check-all-apps`: Runs every 5 minutes.

---

## 🎯 Summary Checklist for Beginners

| Component | File Path | Main Purpose |
| :--- | :--- | :--- |
| **Settings Switcher** | `config/settings/__init__.py` | Chooses dev vs prod settings based on `DJANGO_ENV` |
| **Master Settings** | `config/settings/base.py` | Complete blueprint (Lines 1–1151) for DB, Apps, Middleware, JWT, Throttling, DR, Backup |
| **Production Settings** | `config/settings/production.py` | Security hardening, SSL, S3 storage, Sentry error logs |
| **Root URLs** | `config/urls/base.py` | Main URL dispatcher & Swagger docs |
| **API v1 URLs** | `config/urls/api_v1.py` | Modular API endpoint routes |
| **WSGI Entry** | `config/wsgi.py` | Synchronous HTTP server entrypoint |
| **ASGI / WebSockets** | `config/asgi.py` & `config/routing.py` | Real-time WebSocket connection router |
| **Celery Core** | `config/celery.py` | Asynchronous task manager |
| **Celery Beat** | `config/celery_beat.py` | Periodic cron job scheduler |
