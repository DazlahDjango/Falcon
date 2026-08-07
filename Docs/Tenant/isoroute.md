# Falcon Tenant Isolation & Routing Module Documentation

---

## 1. Executive Summary & Module Overview

The **Isolation & Routing Module** provides the core **Zero-Trust Multi-Tenant Boundary** for the **Falcon Platform**. It ensures that no tenant can read, modify, cross-reference, or access another tenant's database records, API endpoints, thread context, or media storage files.

### Primary Functions:
1. **Multi-Tenant Request Context Propagation**: Captures the tenant identity early in the HTTP lifecycle and injects it into thread-local storage (`apps.tenant.context`).
2. **Database Query Routing**: Intercepts Django ORM queries to route global platform apps (like users, authentication, and billing) to the shared `default` database, and tenant domain apps (KPIs, reviews, structure, reports) to isolated tenant schemas.
3. **Strict Zero-Trust Access Enforcement**: Blocks cross-organization data leakage in API requests, ORM querysets, model relations, and cross-object references.
4. **URL Path & Media Storage Protection**: Enforces organization isolation across URL routes (`/api/v1/organizations/{org_id}/...`) and file downloads (`/media/organizations/{org_id}/...`).

---

## 2. Multi-Tenant Middleware Execution Chain

Falcon enforces isolation through a pipeline of specialized middleware running in strict sequential order:

```text
 Client Request ──> [ 1. OrganizationResolutionMiddleware ] ──(Resolves Tenant via Host / Header)
                                   │
                                   ▼
                    [ 2. OrganizationContextMiddleware ] ──(Sets Thread-Local & Request Context)
                                   │
                                   ▼
                    [ 3. TenantDatabaseRouterMiddleware ] ──(Executes SET search_path TO "org_schema")
                                   │
                                   ▼
                    [ 4. OrganizationIsolationMiddleware ] ──(Validates User Org Membership)
                                   │
                                   ▼
                 [ 5. OrganizationPathIsolationMiddleware ] ──(Validates URL Path Parameters)
                                   │
                                   ▼
                        [ 6. FileIsolationMiddleware ] ──(Protects Media File Downloads)
                                   │
                                   ▼
                        Target DRF View / API Handler
```

---

## 3. Database Routing Architecture (`OrganizationDatabaseRouter`)

The database router classifies all Django applications into two distinct categories:

### A. Global Applications (Shared `default` Database)
Models belonging to core system functionality reside in the central public database:
- **Core System**: `django.contrib.admin`, `auth`, `contenttypes`, `sessions`, `staticfiles`
- **Falcon Platform Apps**: `apps.accounts`, `apps.core`, `apps.configs`, `apps.tenant`, `apps.billing`
- **Routing Decision**: `db_for_read()` and `db_for_write()` always return `'default'`.

### B. Tenant Domain Applications (Isolated Schema Data)
Models carrying tenant business data reside in isolated schema space:
- **Tenant Business Apps**: `apps.kpi`, `apps.dashboard`, `apps.reviews`, `apps.structure`, `apps.reportplt`, `apps.tasks_module`
- **Routing Decision**: Dynamically checks thread-local tenant context to route queries to the active tenant schema.

### C. Relation Guard (`allow_relation`)
To prevent data contamination, Django ORM foreign keys between objects in different organizations are explicitly blocked:
- Returns `False` if `object1.organization_id != object2.organization_id`.

---

## 4. Isolation Enforcement Engine (`IsolationEnforcer`)

The `IsolationEnforcer` service acts as a programmatic security guard used throughout service layers and API views.

### Core Security Checks:
1. **User Membership Validation (`validate_access`)**: Ensures the authenticated user belongs to the organization they are requesting data for.
2. **Cross-Operation Protection (`validate_cross_operation`)**: Blocks any operation attempting to transfer or operate on data across different organization IDs (`source_org_id != target_org_id`).
3. **Queryset Scope Enforcement (`enforce_query_filter`)**: Dynamically appends `filter(organization_id=organization_id)` to Django ORM querysets if not already present.
4. **Object Context Assertion (`assert_org_context`)**: Raises an `IsolationError` if an object's tenant ownership does not match expected request context.
5. **Safe Reference Check (`is_safe_reference`)**: Validates foreign reference pairs before saving related models.

---

## 5. Media & Storage File Isolation (`FileIsolationMiddleware`)

Falcon isolates uploaded files (such as avatar images, document attachments, performance reports, and invoice PDFs) on the disk.

### File Path Isolation Rules:
- All tenant media files are saved under `/media/organizations/{organization_id}/...`.
- When a user attempts to view or download a file matching `/media/organizations/{file_org_id}/...`:
  1. The middleware checks the request header (`X-Tenant-ID` or `X-Organization-ID`).
  2. If `request_org_id != file_org_id`, access is rejected immediately with **`403 Forbidden`**.
  3. Super-admin users bypass this check with audit logging.

---

## 6. CIA Triad Security Guarantees

| Security Pillar | Implementation Guarantee |
| :--- | :--- |
| **Confidentiality** | **Multi-Layer Defense**: Combines header inspection, JWT claim verification, URL path pattern checks, and disk path validation so unauthorized tenants cannot access foreign data. |
| **Integrity** | **Blocked Cross-Tenant Foreign Keys**: `allow_relation` blocks cross-tenant ORM links, preventing foreign key corruptions or unauthorized cross-tenant data references. |
| **Availability** | **Thread-Local Context Safety**: Context is set per-request (`set_current_tenant_id`) and reliably wiped in `process_response` (`clear_current_tenant_id`) to prevent memory leaks or context bleed across async workers. |

---

## 7. Operational Troubleshooting & CLI Tooling

### CLI Management Command (`organization_health_check`)
Run automated schema connectivity and isolation health checks across active tenant databases:
```bash
# Run database schema health check for a specific organization
python manage.py organization_health_check --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Run health probes across all active tenant databases
python manage.py organization_health_check --all-tenants
```

### Error Responses & Exception Handling:
- **`400 Bad Request`**: Raised when a tenant-scoped request or file access attempt omits required organization identification headers.
- **`403 Forbidden`**: Raised when a user attempts to access a path, resource, or media file belonging to another organization.
- **`IsolationError`**: Internal exception raised by `IsolationEnforcer` when service-level cross-org violations are detected.
