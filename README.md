# Falcon Performance Management System (Falcon PMS)

[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Broker-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**Falcon PMS** is an enterprise-grade, multi-tenant Performance Management System built with Django 5.2, Django REST Framework, PostgreSQL, Celery, Redis, and Channels WebSockets. It delivers high-scale organization management, Key Performance Indicator (KPI) tracking, automated review cycles, performance calibration, Paystack billing integration, and automated disaster recovery options.

---

## Key Features

* 🏢 **Multi-Tenancy & Isolation**: Organization-level isolation, custom schemas, and path/header-based tenant routing.
* 📈 **KPI & Performance Management**: Goal setting, progress tracking, dynamic calculation caching, and performance review cycles.
* 🛡️ **Hardened Security & Auth**: JWT authentication, TOTP/SMS Multi-Factor Authentication (MFA), django-axes lockout monitoring, and granular RBAC (Guardian).
* 💳 **Billing & Subscriptions**: Paystack & Stripe gateway integrations, subscription tier guarding, tax calculation, and idempotent webhooks.
* ⚡ **Real-Time WebSockets**: Powered by Django Channels & Redis channel layers for dynamic notifications.
* ⚙️ **Modular Settings & Environment Architecture**: Highly structured setting component layout (`config/settings/components/`) and environment component files (`envs/`).
* 🩺 **Disaster Recovery & Monitoring**: Automated backups, encryption, compression, maintenance mode blockers, and internal health probes.

---

## Tech Stack

* **Framework**: Django 5.2.12, Django REST Framework
* **Database**: PostgreSQL with Row-Level Security (RLS) & PgBouncer support
* **Task Queue & Caching**: Celery (Beat & Worker) with Redis
* **WebSockets**: Django Channels with Redis Channel Layer
* **API Documentation**: OpenAPI / Swagger via `drf-spectacular` and `drf-yasg`
* **Security & Auth**: `rest_framework_simplejwt`, `django-otp`, `django-axes`, `django-guardian`

---

## Directory Structure

```text
Falcon/
├── apps/                        # Core domain applications
│   ├── accounts/                # User authentication, profiles, & MFA
│   ├── tenant/                  # Multi-tenant isolation & routing
│   ├── structure/               # Organization hierarchy & departments
│   ├── kpi/                     # KPI targets, tracking, & calculation engine
│   ├── billing/                 # Subscriptions, Paystack, & invoicing
│   ├── configs/                 # Backups, DR, maintenance, & health monitoring
│   ├── reviews/                 # Performance evaluation cycles & PIPs
│   ├── dashboard/               # Metrics aggregation & analytics
│   ├── reportplt/               # Custom PDF reporting templates
│   └── core/                    # Common utilities & views
├── config/                      # Project configuration
│   ├── asgi.py                  # ASGI setup for WebSockets
│   ├── wsgi.py                  # WSGI server entry point
│   ├── urls.py                  # Root URL router
│   └── settings/                # Modular settings package
│       ├── base.py              # Core settings loader (~50 lines)
│       └── components/          # Domain setting modules
│           ├── apps.py          # Installed applications
│           ├── middleware.py    # Middleware processing pipeline
│           ├── default.py       # Templates, Static/Media, Frontend, Email
│           ├── logging.py       # JSON log formatters & handlers
│           ├── documentations.py # OpenAPI & Swagger configurations
│           ├── database.py      # PostgreSQL & PgBouncer connection settings
│           ├── authentication.py# Auth backends, DRF, JWT, & MFA settings
│           ├── security.py      # CORS, CSRF, Axes lockout, & CSP headers
│           ├── cache.py         # Redis CACHES & Session backends
│           ├── celery.py        # Celery task queue & Beat scheduler
│           ├── channels.py      # ASGI & Channels Redis layers
│           ├── billing.py       # Paystack keys & Subscription plans
│           ├── tenant.py        # Tenant limits & isolation rules
│           └── configs.py       # Backups, DR, Maintenance, & Health options
├── envs/                        # Modular environment variables
│   ├── base.env                 # Base Django & general settings
│   ├── database.env             # Database & Redis URLs
│   ├── auth.env                 # JWT keys, MFA parameters, OAuth credentials
│   ├── billing.env              # Paystack/Stripe credentials & plans
│   └── configs.env              # Backups, DR, alerts, & feature flags
├── manage.py                    # Django management CLI
├── docker-compose.yml           # Docker orchestration
├── PA_requirements.txt          # Python dependencies
├── CONTRIBUTING.md              # Contribution guidelines
├── CODE_OF_CONDUCT.md           # Community guidelines
└── LICENSE                      # MIT License
```



## Quick Start Guide

### Option 1: Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/DazlahDjango/Falcon.git
cd Falcon
```

#### 2. Virtual Environment Setup
```bash
# Create virtual environment
python -m venv fasc

# Activate virtual environment (Windows PowerShell)
fasc\Scripts\activate

# Activate virtual environment (Linux/macOS)
source fasc/bin/activate

# Install dependencies
pip install -r PA_requirements.txt
```

#### 3. Run System Checks & Migrations
```bash
# Verify system configuration
python manage.py check

# Apply database migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

---

### Option 2: Docker Setup

```bash
# Copy environment variables
cp .env.example .env

# Build and start services via Docker Compose
docker-compose up -d --build

# Run database migrations in container
docker-compose exec web python manage.py migrate
```

Visit the application at: `http://localhost:8000`

---

## API Documentation

Interactive Swagger and OpenAPI documentation are automatically generated:

* **Swagger UI**: `http://localhost:8000/api/docs/swagger/`
* **ReDoc**: `http://localhost:8000/api/docs/redoc/`
* **OpenAPI Schema**: `http://localhost:8000/api/schema/`

---

## Modular Configuration System

Falcon PMS uses a modern componentized architecture for configuration:

### Settings Components
All settings are cleanly separated in `config/settings/components/` and automatically imported by `config/settings/base.py`:
```python
from .components import *
```

### Environment Modules
Environment variables are organized in `envs/` by domain (`base.env`, `database.env`, `auth.env`, `billing.env`, `configs.env`) and loaded automatically on startup.

---

## Authors & Maintainers

* **Dazlah** ([@DazlahDjango](https://github.com/DazlahDjango))
* **Careen** ([@acareen15](https://github.com/acareen15))

---

## License

This project is licensed under the [MIT License](LICENSE).
