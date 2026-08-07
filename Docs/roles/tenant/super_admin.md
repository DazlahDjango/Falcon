# 👑 Role Mapping: Super Admin (`super_admin`)
**Application:** Tenant (`apps/tenant`)  
**Scope:** Global Platform Level / Multi-Tenant Infrastructure Management

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Tenant** app (`apps/tenant`), the **Super Admin** (`super_admin`) acts as the master platform infrastructure administrator. The Super Admin is responsible for multi-tenant database schema provisioning, PostgreSQL connection pooling management, row-level security (RLS) enforcement, database migrations, backup rollbacks, sector reference data, global tenant resource quotas, and platform health monitoring.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Enforces strict PostgreSQL tenant schema isolation (`tenant_<slug>`) and configures PostgreSQL Row-Level Security (RLS) policies to prevent cross-tenant data leaks.
- **Integrity:** Controls database schema migrations, SQL previewing, migration rollbacks, and schema dropping operations.
- **Availability:** Manages database connection pool recycling, connection draining, idle connection cleanup, global health checks, and Celery-based tenant provisioning tasks.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsSuperAdmin` permission class across administrative viewsets in `apps/tenant/api/v1/views/`.
- **Throttling:** Regulated via `AdminOperationThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Super Admin in the Tenant app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Global Super Admin Tenant Dashboard** | `GET /api/v1/tenant/dashboard/super_admin/` | [OrganizationStatsService.get_super_admin_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/stats_service.py#L18) | Aggregates global tenant counts, active/suspended ratios, database schema health, total storage consumption, and provisioning queues. |
| 2 | **Create & Onboard New Tenant** | `POST /api/v1/tenant/organizations/`<br>`POST /api/v1/tenant/organizations/{id}/onboard/` | [OrganizationService.trigger_provisioning](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/organization_service.py#L90) | Create organization record and trigger Celery-driven multi-step tenant database schema provisioning. |
| 3 | **Force Suspend / Activate Organization** | `POST /api/v1/tenant/admin/organizations/{id}/force_suspend/`<br>`POST /api/v1/tenant/admin/organizations/{id}/force_activate/` | [OrganizationService.suspend_organization](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/organization_service.py#L145) | Administratively freeze or reactivate non-compliant tenant organizations. |
| 4 | **Force Delete Organization (Hard Delete)** | `DELETE /api/v1/tenant/admin/organizations/{id}/force_delete/` | [OrganizationService.delete_organization](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/organization_service.py#L180) | Permanently purge organization database schema, storage files, and meta records from disk. |
| 5 | **Monitor Provisioning Lifecycle** | `GET /api/v1/tenant/provisioning/`<br>`GET /api/v1/tenant/provisioning/failed/`<br>`GET /api/v1/tenant/provisioning/in-progress/` | [ProvisioningViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/api/v1/views/provisioning_views.py#L49) | Inspect real-time provisioning queues, step-by-step progress metadata, and failed tenant setups. |
| 6 | **Trigger / Retry / Rollback Provisioning** | `POST /api/v1/tenant/provisioning/{id}/trigger/`<br>`POST /api/v1/tenant/provisioning/{id}/retry/`<br>`POST /api/v1/tenant/provisioning/{id}/rollback/` | [OrganizationService.retry_provisioning](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/organization_service.py#L210)<br>[OrganizationService.rollback_provisioning](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/organization_service.py#L240) | Retry failed database setup steps or execute emergency rollbacks (dropping partial PostgreSQL schemas). |
| 7 | **Provision & Drop Tenant Database Schemas** | `POST /api/v1/tenant/schemas/{id}/provision/`<br>`POST /api/v1/tenant/schemas/{id}/drop/` | [SchemaService.provision_schema](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/schema_service.py#L25)<br>[SchemaService.drop_schema](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/schema_service.py#L80) | Manually create or drop isolated PostgreSQL schemas (`CREATE SCHEMA tenant_<slug>`). |
| 8 | **Enable Row-Level Security (RLS)** | `POST /api/v1/tenant/schemas/{id}/enable-rls/` | [SchemaService.enable_rls](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/schema_service.py#L110) | Apply PostgreSQL Row-Level Security policies to protect shared database tables. |
| 9 | **Database Connection Pool Actions** | `POST /api/v1/tenant/connections/action/` | [ConnectionService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/connection_service.py#L45) | Execute actions: `close`, `close_all_idle`, `reset`, `recycle`, `pause`, `resume`, `prewarm`, `drain`. |
| 10 | **Connection Metrics & Stack Debug Traces** | `GET /api/v1/tenant/connections/metrics/`<br>`GET /api/v1/tenant/connections/debug/` | [ConnectionService.get_connection_metrics](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/connection_service.py#L210) | Monitor active connection counts, query latency, connection pool utilization, and inspect thread stack traces. |
| 11 | **Sync & Apply Tenant Migrations** | `POST /api/v1/tenant/migrations/sync/`<br>`POST /api/v1/tenant/migrations/{id}/apply/`<br>`POST /api/v1/tenant/migrations/{id}/rollback/` | [MigrationService.apply_migration](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/migration_service.py#L60)<br>[MigrationService.rollback_migration](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/migration_service.py#L110) | Synchronize Django migrations across all tenant schemas, apply pending SQL scripts, or rollback migrations. |
| 12 | **Preview Migration SQL** | `GET /api/v1/tenant/migrations/{id}/preview-sql/` | [MigrationService.preview_migration_sql](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/migration_service.py#L160) | Inspect raw SQL commands generated by Django migration steps before executing on production schemas. |
| 13 | **Global Infrastructure Health Checks** | `GET /api/v1/tenant/health/`<br>`GET /api/v1/tenant/health/organizations/` | [HealthCheckService.full_health_check](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/health_service.py#L15) | Perform full-stack diagnostic ping checks across PostgreSQL, Redis, Celery workers, and all tenant database connections. |
| 14 | **Manage Organization Sectors** | `GET, POST, PATCH, DELETE /api/v1/tenant/sectors/`<br>`POST /api/v1/tenant/sectors/{id}/toggle_active/` | [SectorViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/api/v1/views/sector_views.py#L13) | Maintain industry sectors (Healthcare, Finance, Education, Retail, Construction) used during tenant onboarding. |
| 15 | **Manage Tenant Quotas & Exceeded Hard Limits** | `GET, POST /api/v1/tenant/resources/`<br>`GET /api/v1/tenant/resources/exceeded/`<br>`POST /api/v1/tenant/resources/reset_daily_limits/` | [ResourceService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/resource_service.py#L30) | Override resource limits (`USERS`, `DEPARTMENTS`, `STORAGE_MB`, `API_CALLS_PER_DAY`), review hard-limit violations, and trigger daily limit resets. |
| 16 | **Verify Custom Tenant Domains** | `POST /api/v1/tenant/domains/{id}/verify/`<br>`POST /api/v1/tenant/domains/{id}/set_primary/` | [DomainService.verify_domain](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/domain_service.py#L35) | Validate DNS TXT/CNAME verification records for tenant custom domains and assign primary hostnames. |
| 17 | **Global Tenant System Settings** | `GET, PATCH /api/v1/tenant/system-settings/`<br>`POST /api/v1/tenant/system-settings/reset/` | [TenantSettingsService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/settings_service.py#L12) | Update global platform defaults, provisioning timeouts, and system-wide isolation parameters. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Full global platform level visibility across all tenant schemas.
- **Destructive Rights:** Schema provision/drop, migration apply/rollback, force delete tenant, pool recycle, and connection draining.
