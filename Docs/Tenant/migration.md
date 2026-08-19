# Falcon Tenant Migration Module Documentation

---

## 1. Executive Summary & Module Overview

The **Migration Module** is the schema DDL orchestration engine of the **Falcon Multi-Tenant Platform**. It handles applying, tracking, previewing, and rolling back database migrations across isolated PostgreSQL schemas for enterprise client organizations.

### Primary Functions:
1. **Schema DDL Isolation**: Executes Django database migrations specifically within target tenant PostgreSQL schemas (`SET search_path TO "org_schema"`).
2. **Concurrency Locking**: Protects database schemas during deployments using PostgreSQL transactional advisory locks (`pg_advisory_xact_lock`).
3. **Migration History Synchronization**: Maintains global visibility into per-tenant migration states (`OrganizationMigration`) while storing localized DDL state in `django_migrations` inside each tenant schema.
4. **Dry-Run SQL Previews**: Generates raw DDL SQL statements (`sqlmigrate`) prior to execution for security and DBA review.
5. **Real-Time Progress Tracking**: Emits live WebSocket events during long-running database schema updates.

---

## 2. Multi-Tenant Schema Migration Lifecycle

When a migration is initiated, the system transitions through well-defined lifecycle states:

```text
  [ PENDING ] ───> [ RUNNING ] ───┬───> [ COMPLETED ] ───(Rollback)───> [ ROLLED_BACK ]
                                   │
                                   └───> [ FAILED ] (Logs Error & Traceback)
```

### State Definitions:
- **`PENDING`**: Migration exists in codebase but has not yet been applied to the tenant schema.
- **`RUNNING`**: DDL queries are actively executing against the tenant's PostgreSQL schema under an advisory lock.
- **`COMPLETED`**: DDL queries succeeded and were verified in `django_migrations`.
- **`FAILED`**: DDL query execution failed; error message and stack trace are captured for debugging.
- **`ROLLED_BACK`**: Schema changes were successfully reverted to a prior migration node.

---

## 3. Concurrency Protection & Advisory Locks

To prevent race conditions when multiple worker processes or admin API calls attempt to migrate the same tenant schema simultaneously:

### Advisory Lock Architecture:
```text
  Organization ID (UUID) ──> Hash Algorithm ──> 31-bit Advisory Lock ID
                                                         │
                                                         ▼
                                          SELECT pg_advisory_xact_lock(lock_id)
```
- **Transaction Scope**: `pg_advisory_xact_lock` automatically releases the lock when the database transaction completes or rolls back.
- **Non-Blocking Safety**: Other processes attempting to migrate the same tenant wait safely for the lock without corrupting the database schema.

---

## 4. Migration Service Core Operations (`MigrationService`)

### A. Migration Synchronization (`sync_tenant_migrations`)
- Scans all tenant domain applications (`['kpi', 'dashboard', 'reviews', 'structure', 'reportplt', 'tasks_module']`).
- Inspects the tenant schema's `django_migrations` table.
- Builds a topological graph of dependencies and updates or creates tracking records in `OrganizationMigration`.

### B. Migration Execution (`apply_migration`)
1. Acquires `pg_advisory_xact_lock`.
2. Connects signal handler to bind `SET search_path TO "tenant_schema"` on database connection creation.
3. Executes `call_command('migrate', app_name, migration_name)`.
4. Performs **Post-Migration Verification**: Queries `django_migrations` to verify the migration record was recorded.
5. Records execution time in milliseconds (`execution_time_ms`).

### C. Dry-Run SQL Preview (`preview_migration_sql`)
- Runs `call_command('sqlmigrate', app_name, migration_name)` against the target tenant schema.
- Returns raw PostgreSQL DDL string without modifying database state.

### D. Safe Rollbacks (`rollback_migration`)
- Dynamically resolves the parent migration node using Django's `MigrationExecutor` graph.
- Reverts database DDL to the target parent node or `'zero'`.
- Marks record status as `ROLLED_BACK` and re-synchronizes migration tracking.

---

## 5. CIA Triad Security Guarantees

| Security Pillar | Implementation Guarantee |
| :--- | :--- |
| **Confidentiality** | **Super-Admin Privilege Gating**: All migration endpoints (`/apply/`, `/rollback/`, `/sync/`, `/preview-sql/`) enforce `IsSuperAdmin` permissions. |
| **Integrity** | **Advisory Locking & Post-Verification**: Transactional advisory locks eliminate DDL race conditions; post-execution verification checks guarantee database schema consistency. |
| **Availability** | **Non-Blocking Operations & Real-Time Monitoring**: WebSockets broadcast live migration progress (`migration_started`, `migration_completed`, `migration_failed`), preventing admin UI timeouts. |

---

## 6. Real-Time WebSockets & API Operations

### CLI Management Commands

#### 1. Tenant DDL Migration Manager (`tenant_migrate`)
Administrators can run batch migrations, check statuses, or preview DDL statements:
```bash
# Apply ALL pending migrations across ALL active tenant organizations in topological order
python manage.py tenant_migrate apply --all-tenants

# Apply ALL pending migrations for a single tenant
python manage.py tenant_migrate apply --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Fake pending migrations (mark as completed without executing DDL statements)
python manage.py tenant_migrate apply --all-tenants --fake

# Apply a specific single migration
python manage.py tenant_migrate apply --org-id c732f915-34d1-489d-8551-3c71bf92a372 --app kpi --migration 0001_initial

# Check migration status across all active tenants
python manage.py tenant_migrate status --all-tenants

# Sync tracking records for all active tenants
python manage.py tenant_migrate sync --all-tenants

# Preview dry-run DDL SQL statements for a specific migration
python manage.py tenant_migrate preview --org-id c732f915-34d1-489d-8551-3c71bf92a372 --app kpi --migration 0001_initial

# Roll back a migration to its parent node
python manage.py tenant_migrate rollback --org-id c732f915-34d1-489d-8551-3c71bf92a372 --app kpi --migration 0001_initial
```

#### 2. Schema Migration History Synchronization (`sync_django_migrations`)
Synchronizes tenant schema `django_migrations` history tables:
```bash
# Sync django_migrations tracking table for a specific tenant schema
python manage.py sync_django_migrations --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Force synchronization of all schema tables
python manage.py sync_django_migrations --all-tenants --force
```

### Operational REST API & WebSockets:
- `POST /api/v1/tenant/migrations/sync/`: Synchronizes tenant migration records.
- `GET /api/v1/tenant/migrations/{id}/preview-sql/`: Returns dry-run DDL SQL preview.
- `POST /api/v1/tenant/migrations/{id}/apply/`: Executes migration DDL on tenant schema.
- `POST /api/v1/tenant/migrations/{id}/rollback/`: Reverts migration DDL to parent node.
- `GET /api/v1/tenant/migrations/stats/`: Summarizes migration status counts per organization.

### WebSockets Channel (`MigrationProgressConsumer`):
Clients connect to channel group `org_{org_id}_migrations` to receive real-time JSON events (`migration_started`, `migration_progress`, `migration_completed`, `migration_failed`, `migration_rolled_back`).
