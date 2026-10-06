Falcon_pms/
│
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── testing.py
│   │   ├── staging.py
│   │   └── production.py
│   │
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   │
│   ├── celery.py
│   ├── routing.py
│   ├── middleware.py
│   ├── permissions.py
│   ├── exceptions.py
│   ├── logging.py
│   └── health.py
│
├── apps/
│   ├── accounts/
│   ├── tenant/
│   ├── structure/
│   ├── kpi/
│   ├── reviews/
│   ├── billing/
│   ├── configs/
│   ├── dashboard/
│   ├── reports/
│   ├── audit/
│   ├── notifications/
│   └── core/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
│
├── infrastructure/
│   │
│   ├── docker/
│   │   ├── backend/
│   │   │   ├── Dockerfile
│   │   │   └── entrypoint.sh
│   │   │
│   │   ├── celery/
│   │   │   ├── Dockerfile
│   │   │   └── entrypoint.sh
│   │   │
│   │   ├── nginx/
│   │   │   ├── nginx.conf
│   │   │   ├── conf.d/
│   │   │   │   ├── falcon-api.conf
│   │   │   │   ├── falcon-websocket.conf
│   │   │   │   └── security.conf
│   │   │   └── snippets/
│   │   │       ├── ssl.conf
│   │   │       ├── security-headers.conf
│   │   │       └── proxy-params.conf
│   │   │
│   │   ├── postgres/
│   │   │   ├── postgresql.conf
│   │   │   ├── pg_hba.conf
│   │   │   └── init/
│   │   │       ├── 001-extensions.sql
│   │   │       ├── 002-roles.sql
│   │   │       └── 003-databases.sql
│   │   │
│   │   ├── pgbouncer/
│   │   │   ├── pgbouncer.ini
│   │   │   ├── userlist.txt.example
│   │   │   └── entrypoint.sh
│   │   │
│   │   └── redis/
│   │       ├── redis.conf
│   │       └── sentinel.conf
│   │
│   ├── compose/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.test.yml
│   │   ├── docker-compose.staging.yml
│   │   └── docker-compose.production.yml
│   │
│   ├── kubernetes/
│   │   │
│   │   ├── base/
│   │   │   ├── namespace.yaml
│   │   │   ├── configmap.yaml
│   │   │   ├── secrets.yaml.example
│   │   │   ├── service-account.yaml
│   │   │   ├── backend-deployment.yaml
│   │   │   ├── backend-service.yaml
│   │   │   ├── celery-deployment.yaml
│   │   │   ├── celery-service.yaml
│   │   │   ├── celery-beat-deployment.yaml
│   │   │   ├── frontend-deployment.yaml
│   │   │   ├── frontend-service.yaml
│   │   │   ├── ingress.yaml
│   │   │   ├── hpa.yaml
│   │   │   ├── pdb.yaml
│   │   │   ├── network-policy.yaml
│   │   │   └── kustomization.yaml
│   │   │
│   │   ├── overlays/
│   │   │   ├── development/
│   │   │   │   └── kustomization.yaml
│   │   │   │
│   │   │   ├── staging/
│   │   │   │   └── kustomization.yaml
│   │   │   │
│   │   │   └── production/
│   │   │       ├── kustomization.yaml
│   │   │       ├── replicas.yaml
│   │   │       ├── resources.yaml
│   │   │       └── ingress-production.yaml
│   │   │
│   │   └── helm/
│   │       └── falcon-pms/
│   │           ├── Chart.yaml
│   │           ├── values.yaml
│   │           ├── values-production.yaml
│   │           ├── values-staging.yaml
│   │           └── templates/
│   │
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── providers.tf
│   │   ├── networking.tf
│   │   ├── compute.tf
│   │   ├── database.tf
│   │   ├── redis.tf
│   │   ├── storage.tf
│   │   ├── load_balancer.tf
│   │   ├── monitoring.tf
│   │   ├── security.tf
│   │   ├── backup.tf
│   │   └── environments/
│   │       ├── staging.tfvars
│   │       └── production.tfvars
│   │
│   ├── scripts/
│   │   ├── deploy.sh
│   │   ├── rollback.sh
│   │   ├── backup.sh
│   │   ├── restore.sh
│   │   ├── migrate.sh
│   │   ├── collectstatic.sh
│   │   ├── healthcheck.sh
│   │   ├── db-health.sh
│   │   ├── redis-health.sh
│   │   ├── celery-health.sh
│   │   └── disaster-recovery.sh
│   │
│   └── systemd/
│       ├── falcon-daphne.service
│       ├── falcon-celery.service
│       ├── falcon-celery-beat.service
│       └── falcon-health.service
│
├── deployment/
│   ├── environments/
│   │   ├── development/
│   │   ├── staging/
│   │   └── production/
│   │
│   ├── secrets/
│   │   └── README.md
│   │
│   ├── certificates/
│   │   └── README.md
│   │
│   └── manifests/
│
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   ├── alerts.yml
│   │   └── rules/
│   │       ├── application.yml
│   │       ├── database.yml
│   │       ├── redis.yml
│   │       └── infrastructure.yml
│   │
│   ├── grafana/
│   │   ├── dashboards/
│   │   └── provisioning/
│   │
│   ├── loki/
│   │   └── loki.yml
│   │
│   └── alertmanager/
│       └── alertmanager.yml
│
├── security/
│   ├── policies/
│   │   ├── security-policy.md
│   │   ├── backup-policy.md
│   │   ├── password-policy.md
│   │   ├── tenant-isolation-policy.md
│   │   └── incident-response.md
│   │
│   ├── firewall/
│   │   └── README.md
│   │
│   └── secrets/
│       └── README.md
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── scripts/
│   │   ├── backup.sql
│   │   ├── restore.sql
│   │   ├── health.sql
│   │   └── maintenance.sql
│   └── policies/
│       ├── rls/
│       ├── roles/
│       └── permissions/
│
├── backups/
│   └── .gitkeep
│
├── logs/
│   ├── django/
│   ├── celery/
│   ├── nginx/
│   ├── security/
│   ├── audit/
│   └── system/
│
├── media/
│   └── .gitkeep
│
├── static/
│   └── .gitkeep
│
├── tmp/
│   └── .gitkeep
│
├── docs/
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── network-architecture.md
│   │   ├── database-architecture.md
│   │   ├── tenant-architecture.md
│   │   ├── security-architecture.md
│   │   ├── disaster-recovery.md
│   │   └── scaling-strategy.md
│   │
│   ├── deployment/
│   │   ├── production-deployment.md
│   │   ├── rollback.md
│   │   └── disaster-recovery.md
│   │
│   └── operations/
│       ├── monitoring.md
│       ├── backups.md
│       ├── incident-response.md
│       └── maintenance.md
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   ├── tenancy/
│   ├── performance/
│   └── load/
│
├── .dockerignore
├── .gitignore
├── .env.example
├── .env.development
├── .env.staging.example
├── .env.production.example
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── manage.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   ├── testing.txt
│   ├── staging.txt
│   └── production.txt
├── requirements.txt
└── README.md