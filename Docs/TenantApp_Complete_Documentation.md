Tenant App — Complete Documentation
====================================

Last updated: 2026-05-28

Table of contents
-----------------

- Overview
- Architecture and Design
- Backend: Models (detailed)
  - Client (Tenant)
  - TenantSchema
  - CustomDomain
  - TenantResource
  - TenantMigration
  - TenantBackup
  - ConnectionPool
- Backend: API Endpoints (routes & behaviors)
- Backend: Services and Helpers
  - Provisioning
  - Schema management
  - Connection manager and router
  - Backup & restore
  - Domain verification and SSL
  - Resource quota service
- Frontend: Pages, Components, and Redux
  - Route mapping and sidebar
  - Pages and component responsibilities
  - Redux slices and selectors
- Data flows and common user workflows
  - Create a tenant (end-to-end)
  - Provisioning flow
  - Adding a custom domain (DNS+SSL)
  - Running a tenant migration
  - Backup and restore
- Operational notes
  - Health checks
  - Connection pooling
  - Monitoring and metrics
  - Celery tasks and scheduling
- Troubleshooting & common issues
- Tests and validation
- File reference map (important files and where to find them)
- Appendix: Example API payloads


Overview
--------

The Tenant App provides the multi-tenant foundation for Falcon PMS. It allows platform operators and client admins to create and manage tenants (clients), isolate tenant data using PostgreSQL schema or separate databases, configure tenant-specific features and limits, provision infrastructure, manage custom domains and SSL, and monitor operational health.

The app is implemented as a Django application (apps/tenant) with a matching frontend module (frontend/src/pages/tenant and components under frontend/src/components/tenant). The backend exposes a REST API (apps/tenant/api/v1) consumed by the React frontend and other platform services.


Architecture and Design
-----------------------

- Multi-tenant isolation strategies supported:
  - SHARED_SCHEMA: Tenants share the default schema; tenant_id column filters applied.
  - SEPARATE_SCHEMA: Each tenant has its own PostgreSQL schema.
  - SEPARATE_DATABASE: Each tenant uses a separate database instance.

- Tenant resolution occurs in middleware (TenantResolutionMiddleware) which sets `request.tenant_id` and `request.tenant` (if available) based on header `X-Tenant-ID`, subdomain, or custom domain mapping.

- Connection routing is handled by a `TenantDatabaseRouter` and `ConnectionManager` which ensure ORM queries go to the correct schema/database and that connection pooling is used.

- Provisioning and long-running tasks are performed asynchronously using Celery. Real-time updates for provisioning and operations are broadcast via Redis + WebSocket channels.


Backend: Models (detailed)
-------------------------

This section lists the primary backend models in `apps/tenant/models` with field descriptions, behaviors, methods, and typical usage.

Client (apps/tenant/models/tenant.py)
------------------------------------

Purpose: The primary tenant entity representing an organization using Falcon.

Key fields:
- `id` (UUID): PK.
- `name` (string): Tenant name used in UI and emails.
- `slug` (string): URL-friendly identifier; used in schema/db naming and links.
- `schema_type` (enum): One of `SHARED_SCHEMA`, `SEPARATE_SCHEMA`, `SEPARATE_DATABASE`.
- `subscription_plan` (enum): `TRIAL`, `BASIC`, `PROFESSIONAL`, `ENTERPRISE` — determines feature flags and limits.
- `status` (enum): Tenant lifecycle states: `PENDING`, `ACTIVE`, `SUSPENDED`, `DELETED`.
- `is_active` (bool): Active flag for login and API access.
- `is_verified` (bool): Whether the tenant was verified after signup.
- `provisioned_at` (datetime): When provisioning completed.
- `contact_email`, `contact_phone`, `address`, `city`, `country` — contact details.
- `logo`, `favicon` — branding assets (file refs to storage).
- `settings` (JSONField): Tenant-specific config keys.
- `features` (JSONField): Feature toggles for the tenant.

Key methods/properties:
- `get_feature(name, default=None)` — read the features JSON.
- `get_setting(name, default=None)` — read settings JSON.
- `is_trial` — true for trial tenants.
- `is_subscription_active` — derived from `subscription_plan` and billing status.
- `schema_name` — compute or return the schema name for separate-schema strategy.
- `can_create_users()` — check TenantResource for `USERS` limit and plan rules.

Usage: Central to all tenant operations. Many related models FK to `Client`.


TenantSchema (apps/tenant/models/schema.py)
-------------------------------------------

Purpose: Track PostgreSQL schemas used when `schema_type = SEPARATE_SCHEMA`.

Key fields:
- `tenant` (OneToOne) — link back to `Client`.
- `schema_name` (string) — unique name for PostgreSQL schema (max 63 chars).
- `status` (enum) — `PENDING`, `CREATING`, `ACTIVE`, `MIGRATING`, `FAILED`, `DELETED`.
- `is_ready` (bool) — whether the schema is operational.
- `created_at_schema` (datetime) — when schema was created in DB.
- `last_migration_at` (datetime), `last_migration_name` — latest migration applied.
- `table_count`, `size_mb` — metrics for usage presentation.
- `error_message` — if creation/migration failed.

Key methods:
- `mark_creating()`, `mark_active()`, `mark_migrating(name)`, `mark_migration_complete()`, `mark_failed(error)`
- `update_stats(table_count, size_mb)` — called by scheduled jobs that inspect DB size.

Usage: Provisioning creates TenantSchema records then the `schema_engine` runs SQL to create schemas and apply migrations.


CustomDomain (apps/tenant/models/domain.py)
------------------------------------------

Purpose: Host tenant's custom domains and manage DNS/SSL verification.

Key fields:
- `domain` (string, unique)
- `tenant` (FK)
- `is_primary` (bool) — ensures only one primary domain per tenant (unique constraint per tenant)
- `status` (enum): `PENDING`, `VERIFYING`, `ACTIVE`, `FAILED`, `EXPIRED`, `REMOVED`
- `verification_token` (uuid) — value to publish as DNS TXT record for verification
- `verified_at` (datetime)
- `ssl_issued_at`, `ssl_expires_at`, `ssl_issuer` — certificate info
- `force_https` (bool)
- `redirect_to` (optional)

Key methods:
- `mark_verified()` — set status, verified_at etc.
- `mark_verification_failed(error)` — log failure and set status = FAILED
- `set_primary()` — ensure only single primary per tenant
- `update_ssl_info(issued, expires, issuer)` — store certificate metadata

Properties:
- `is_active`, `is_verification_pending`, `ssl_is_valid`, `days_until_ssl_expiry`, `verification_dns_record`

Usage: Admins create domain entries; the system automates DNS checks, issues certs (Let's Encrypt or other), and configures routing.


TenantResource (apps/tenant/models/resource.py)
-----------------------------------------------

Purpose: Track per-tenant resource quotas and usage.

Key fields:
- `tenant` (FK)
- `resource_type` (enum): `USERS`, `STORAGE_MB`, `API_CALLS_PER_DAY`, `KPIS`, `DEPARTMENTS`, `CONCURRENT_SESSIONS`.
- `limit_value` (integer)
- `current_value` (integer default 0)
- `warning_threshold` (integer percent default 80)
- `last_reset_at` (datetime)

Key methods:
- `increment(amount=1)` — assert `can_increment()` and add
- `decrement(amount=1)`
- `reset()` — reset counters when scheduled
- `can_increment(amount=1)` — guard for limit enforcement

Properties:
- `percentage_used` — `current_value / limit_value * 100`
- `is_exceeded`, `is_warning_level`

Usage: Signals and service code update TenantResource when users are created/removed, files uploaded, API counts incremented.


TenantMigration (apps/tenant/models/migration.py)
-------------------------------------------------

Purpose: Track migrations applied per-tenant (very important for separate-schema / separate-db).

Key fields:
- `tenant`, `app_name`, `migration_name`
- `status` (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `ROLLED_BACK`)
- `started_at`, `completed_at`
- `error_message`, `error_traceback`
- `execution_time_ms`
- `is_rollback`, `rolled_back_from`

Key methods:
- `mark_started()`
- `mark_completed(execution_time_ms)`
- `mark_failed(msg, traceback)`
- `mark_rolled_back()`

Usage: The migration runner writes entries here to allow audit and retry/rollback flows.


TenantBackup (apps/tenant/models/backup.py)
-------------------------------------------

Purpose: Manage backups and retention for tenants.

Key fields:
- `tenant` (FK)
- `backup_type` (`FULL`, `SCHEMA`, `DATA`, `INCREMENTAL`)
- `status` (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`)
- `backup_file` (path or URL)
- `file_size_mb`
- `started_at`, `completed_at`
- `error_message`
- `retention_days` (default 30)
- `expires_at`

Key methods:
- `mark_started()`
- `mark_completed(file, size_mb)`
- `mark_failed(error)`
- `set_expiry()`

Properties: `is_completed`, `is_failed`, `is_expired`

Usage: Backup tasks (Celery) create backups, push to object storage (S3 or equivalent), and update records.


ConnectionPool (apps/tenant/models/connection.py)
-------------------------------------------------

Purpose: Track live DB connections per tenant for monitoring and pooling.

Key fields:
- `connection_id` (unique)
- `tenant` (FK)
- `status` (`ACTIVE`, `IDLE`, `CLOSED`, `ERROR`)
- `database_name`, `schema_name`
- `connected_at`, `last_used_at`, `closed_at`
- `error_message`

Key methods:
- `mark_active()`, `mark_idle()`, `mark_closed()`, `mark_error(msg)`
- `use()` — update `last_used_at` and ensure `status=ACTIVE`

Properties: `is_active`, `is_idle`, `idle_duration_seconds`

Usage: `ConnectionManager` updates this table when allocating and releasing connections.


Backend: API Endpoints (routes & behaviors)
-------------------------------------------

The API is implemented under `apps/tenant/api/v1`. Important files:
- `apps/tenant/api/v1/urls.py` — registers viewsets and nested routers
- `views.py` and submodules for specialized views

Main endpoints (CRUD + actions):

- `GET /api/v1/tenant/tenants/` — list tenants (paginated)
- `POST /api/v1/tenant/tenants/` — create tenant
- `GET /api/v1/tenant/tenants/{id}/` — tenant detail
- `PATCH /api/v1/tenant/tenants/{id}/` — update tenant
- `POST /api/v1/tenant/tenants/{id}/suspend/` — suspend tenant
- `POST /api/v1/tenant/tenants/{id}/activate/` — reactivate tenant

Nested resources (via `rest_framework_nested`):
- `GET /api/v1/tenant/tenants/{tenant_pk}/domains/` — list domains
- `POST /api/v1/tenant/tenants/{tenant_pk}/domains/` — add domain
- `POST /api/v1/tenant/tenants/{tenant_pk}/domains/{id}/verify/` — verify domain
- `GET /api/v1/tenant/tenants/{tenant_pk}/backups/` — backup list
- `POST /api/v1/tenant/tenants/{tenant_pk}/backups/` — create backup
- `GET /api/v1/tenant/tenants/{tenant_pk}/migrations/` — migration history
- `GET /api/v1/tenant/tenants/{tenant_pk}/schemas/` — schema info

Standalone endpoints:
- `GET /api/v1/tenant/health/` — app health
- `GET /api/v1/tenant/health/tenants/` — aggregate tenant health
- `GET /api/v1/tenant/system-settings/` — platform-level tenant system settings

Behavior notes:
- Views perform permission checks using tenant-aware permission classes (e.g., `IsTenantMember`). Be mindful of earlier discovered inversion bugs in `IsTenantMember.has_object_permission()`.
- Responses use standard DRF patterns; nested routers ensure tenant-scoped resources are accessible via `/tenants/{id}/...`.


Backend: Services and Helpers
----------------------------

Provisioning services (apps/tenant/services/provisioning):
- `provisioner.py` orchestrates steps: allocate DB/schema → run migrations → seed initial data → create default resources → mark tenant as provisioned.
- Each step records status in `TenantSchema` and `TenantMigration` models.
- Long-running steps run in Celery with `task.apply_async()` and progress updates published via Redis.

Schema management:
- `schema_engine.py` contains functions to create schemas, grant roles, and run SQL necessary for schema preparation.
- It uses `psycopg2` or Django database connections set to `AUTOCOMMIT` for DDL operations.

Connection manager and router:
- `ConnectionManager` maintains connection pools per tenant and logs to `ConnectionPool` model.
- `TenantDatabaseRouter` inspects `request.tenant` or thread-local tenant context to direct ORM queries.

Backup & restore:
- `backup_service.py` runs dumps (pg_dump, or schema-only dumps), uploads to object storage, and records `TenantBackup` objects.
- Restore operations are manual or Celery-driven.

Domain verification and SSL:
- `domain_service.py` handles DNS TXT checks by polling DNS, and triggers certificate issuance with ACME/Let's Encrypt integrations. Results are persisted on `CustomDomain`.

Resource quota service:
- `quota_service.py` centralizes increments/decrements and enforces `TenantResource` limits. It provides atomic updates and raises exceptions when limits are exceeded.


Frontend: Pages, Components, and Redux
-------------------------------------

Route mapping is implemented in `frontend/src/routes/tenant.routes.js` with lazy-loaded pages. Key pages:
- `TenantListPage` — `/tenants` — list, search, filters
- `TenantDashboardPage` — `/tenants/dashboard` — operational overview
- `TenantDetailPage` — `/tenants/{tenantId}` — detailed actions
- `TenantCreatePage` — `/tenants/create`
- `TenantResourcesPage` — `/tenants/{tenantId}/resources`
- `TenantProvisioningPage` — `/tenants/{tenantId}/provisioning`
- `TenantDomainsPage` — `/tenants/{tenantId}/domains`
- `TenantBackupsPage` — `/tenants/{tenantId}/backups`
- `TenantMigrationsPage` — `/tenants/{tenantId}/migrations`
- `TenantSchemaPage` — `/tenants/{tenantId}/schema`
- `TenantConnectionsPage` — `/tenants/{tenantId}/connections`

Sidebar and navigation:
- Sidebar items are defined in `frontend/src/config/navigation/platformAdminNav.js` and rendered by `frontend/src/components/dashboard/Sidebar/*` (e.g., `StaffSidebar.jsx`, `SuperAdminSidebar.jsx`). Menu groups include "Tenants", "Connections", "Backups", etc.

Redux slices:
- `tenantSlice.js` — core tenant state (create/fetch/update/delete)
- `tenantResourceSlice.js` — resource usage and limits
- `tenantProvisioningSlice.js` — provisioning progress and logs
- `tenantDomainSlice.js`, `tenantBackupSlice.js`, `tenantMigrationSlice.js`, `tenantSchemaSlice.js`, `tenantAuditSlice.js`, `connectionSlice.js`, etc.

Selectors:
- Ensure selectors return safe defaults (e.g., `selectResources` returns `[]` not `null`) to avoid UI crashes.
- Provisioning selectors should default to `{ steps: {}, current_step: null, message: '' }`.

Components:
- Many components are grouped under `frontend/src/components/tenant/` (lists, forms, modals, dashboards)
- Reusable UI modules live under `frontend/src/components/dashboard` for common layout, sidebar, and panels.


Data flows and common user workflows
----------------------------------

Create a tenant (end-to-end):
1. Admin fills `TenantCreateForm` → frontend dispatches `createTenant` thunk.
2. API `POST /api/v1/tenant/tenants/` creates `Client` record (status PENDING).
3. Backend enqueues provisioning Celery task to create schema/db, run migrations, seed data.
4. `TenantSchema` is created and updated as steps progress. Provisioning updates are emitted over WebSocket.
5. On success, tenant status is set to `ACTIVE`, `provisioned_at` set, and admin can invite users.

Provisioning flow (detailed):
- Steps: allocate resources → create schema/database → run migrations → seed data → create default TenantResource entries (limits) → create default domain entries (if provided) → mark `provisioned_at`.
- Each step records progress to DB and optionally to a `provisioning_log` table; frontend polls or receives WebSocket events.

Adding a custom domain:
1. Admin posts domain via frontend.
2. Backend creates `CustomDomain` with `status=PENDING` and generates `verification_token`.
3. System asks admin to add DNS TXT record `falcon-verify={verification_token}`.
4. Domain service polls DNS; when TXT found, `mark_verified()` called.
5. SSL issuance triggered. On success, `status=ACTIVE` and `ssl_issued_at` recorded.

Running a tenant migration:
- Migration runner uses `TenantMigration` record to track execution. If failure occurs, runner records the traceback and marks `FAILED`. Rollback actions set `is_rollback` and link `rolled_back_from`.

Backup and restore:
- Backups are stored externally (S3/GCS). `TenantBackup` records the metadata; restore is a restricted operation requiring operator approval.


Operational notes
-----------------

Health checks:
- Standalone endpoints in `apps/tenant/api/v1/urls.py`: `/health/` and `/health/tenants/` provide per-tenant and aggregate health metrics.

Connection pooling:
- `ConnectionManager` reuses connections; idle connections are logged and closed if idle too long. The pool integrates with Postgres settings to avoid too many connections.

Monitoring & metrics:
- The platform integrates with Prometheus (metrics exporters) and uses logs to record provisioning/migration failures. Alerts notify on errors (e.g., provisioning failures, SSL expiration).

Celery tasks & scheduling:
- Long-running work (provisioning, backups, migration runs) is performed by Celery; beat scheduler handles recurring jobs (daily quota resets, backup retention cleanup).


Troubleshooting & common issues
-------------------------------

1. Circular imports when using `tenant_context`: Fix by lazy-importing `get_tenant_from_context` inside methods (already applied to `accounts/managers/base.py`).
2. Permission inversion (IsTenantMember): If authenticated users are being denied, check `apps/accounts/api/v1/permissions/tenant.py` for logic inversion.
3. KPI endpoints returning 500: Ensure DRF `NotAuthenticated` and `AuthenticationFailed` exceptions are mapped in KPI viewset's `handle_exception()`.
4. Redis connection refused: Verify Redis is running on configured host/port and Celery/Channels are pointed at the same instance.
5. Missing Tenant record for a user: Create `Client` with the expected UUID to match tests or adjust test fixtures.
6. UI crashes due to null selectors: Always return safe defaults from selectors.


Tests and validation
--------------------

- Unit tests exist under `tests/` and specific `apps/tenant/tests/`. Focus on:
  - Model methods (TenantSchema.mark_active, Resource.increment)
  - API endpoints (CRUD, nested routes)
  - Provisioning tasks (simulate failure and success)

- Integration tests:
  - Full tenant creation + provisioning flow with a mocked DB or ephemeral test DB
  - Domain verification flows mock DNS responses


File reference map
------------------

- Backend models: `apps/tenant/models/*.py` (tenant.py, schema.py, domain.py, resource.py, migration.py, backup.py, connection.py)
- API: `apps/tenant/api/v1/urls.py`, `apps/tenant/api/v1/views/*`
- Services: `apps/tenant/services/*` (provisioning, schema_engine, domain_service, quota_service)
- Frontend routes: `frontend/src/routes/tenant.routes.js`
- Frontend pages: `frontend/src/pages/tenant/*`
- Frontend components: `frontend/src/components/tenant/*`
- Redux slices: `frontend/src/store/tenant/slice/*`


Appendix: Example API payloads
-----------------------------

Create tenant (POST /api/v1/tenant/tenants/):

{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "subscription_plan": "TRIAL",
  "schema_type": "SEPARATE_SCHEMA",
  "contact_email": "admin@acme.example",
  "domains": ["pms.acme.example"]
}

Add domain (POST /api/v1/tenant/tenants/{id}/domains/):

{
  "domain": "pms.acme.example",
  "force_https": true
}

Create backup (POST /api/v1/tenant/tenants/{id}/backups/):

{
  "backup_type": "FULL",
  "retention_days": 30
}


---

End of document.
