# 🦅 Falcon Multi-Tenant App Integration Guide (10/10 Enterprise Grade)

This document describes the design, integration points, constants, and execution states of the refactored **Falcon Multi-Tenant System** (covering both Django Backend and React/Vite Frontend). The architecture is optimized to support high-scale multi-tenancy, serving organizations from small-and-medium enterprises (SMEs) up to global conglomerates.

---

## 1. Architectural Blueprint

The Falcon Multi-Tenant system employs a **Database Schema Isolation** strategy using PostgreSQL's dynamic `search_path` routing. In addition, the design includes dynamic connection caching, advisory locking, and plan-based resource quotas.

```
                  ┌──────────────────────────────┐
                  │        HTTP Request          │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ OrganizationContextMiddleware│ (Resolves token/JWT context)
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ TenantDatabaseRouterMiddleware│ (Sets search_path dynamically)
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  PostgreSQL Schema Router    │ (Executes inside tenant schema)
                  │   [org_xxxx, public]         │
                  └──────────────────────────────┘
```

---

## 2. Hardened Multi-Tenancy Core Features (10/10 Backend Updates)

### 2.1 Multi-Tenant Request Lifecycle & Routing
* **JWT / Token Resolution**: [OrganizationContextMiddleware](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/middleware/organization_context.py) extracts organization details from JWT tokens, session user profiles, and fallbacks.
* **Auto-Skip Resolution Middleware**: [OrganizationResolutionMiddleware](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/middleware/organization_resolution.py) checks if a request has already been contextually resolved by authentication, skipping domain or subdomain header verification. Static assets, `/media/`, and `/static/` requests bypass resolution checks.
* **Database Routing Hook**: [TenantDatabaseRouterMiddleware](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/middleware/db_routing.py) reads `request.tenant_id` or `request.current_organization_id` to execute:
  ```sql
  SET search_path TO "org_schema", public;
  ```
  This directs database requests from the user's thread to the isolated schema.

### 2.2 Secure Admin User & Settings Seeding
* **Onboarding & Isolation Leak Resolution**: During onboarding, [ProvisioningService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/provisioning_service.py) creates the global auth user on the `"public"` database schema. The database connection's search path is restored to the organization's tenant schema before creating the user's `Profile` and `UserPreference` records. This keeps all personal credentials and preferences isolated within the tenant's PostgreSQL schema.

### 2.3 Shared User Schema Table Resolution
* **Forcing Public Schema Resolution**: In multi-tenant environments, running migrations inside tenant schemas can sometimes create duplicate empty tables (like `accounts_user`) inside tenant schemas by mistake. When PostgreSQL search path is set to `org_schema, public`, PostgreSQL queries the duplicate table inside `org_schema` instead of the global `public` table. If columns are added to the global table (e.g. `password_change_required`), queries fail on the tenant schema table with `column accounts_user.password_change_required does not exist`.
* **Fix**: Force the User model [user.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/user.py) to always query the public schema by specifying:
  ```python
  class Meta:
      db_table = 'public"."accounts_user'
  ```
  This instructs Django to generate queries targeting `"public"."accounts_user"`, preventing collision with any duplicate tables inside individual tenant schemas.

### 2.4 Safe Tenant Schema Migrations
* **Connection Reconnect Safety**: When applying migrations, [MigrationService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/migration_service.py) attaches a listener to the `connection_created` signal. If Django's connection closes and re-establishes (due to timeout or transient errors), the search path immediately resets to the tenant's schema:
  ```python
  def set_search_path_callback(sender, connection, **kwargs):
      with connection.cursor() as cursor:
          cursor.execute(f'SET search_path TO "{schema_name}", public')
  ```
  This prevents migrations from executing against the `"public"` schema and corrupting shared database tables.

### 2.5 WebSocket Verification & Access
* **Access Control Check**: The WebSocket consumers ([organization_status.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/consumers/organization_status.py), [quota_warnings.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/consumers/quota_warnings.py), [provisioning.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/consumers/provisioning.py)) authenticate and authorize connections checking `user.tenant_id`, matching the active User model.
* **Properties Evaluation Fix**: Quota warning serialization accesses dynamic properties on `OrganizationResource` (`percentage_used`, `is_exceeded`, `is_warning_level`) as property attributes without trailing parentheses `()`, avoiding calling float values.

### 2.6 Real-Time Enterprise Resource Quotas
* **KPI Quotas Defined**: The `KPIS` type is added to [constants.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/constants.py) and mapped in `DEFAULT_ORGANIZATION_LIMITS` and `TIER_LIMITS` (Free: 10, Basic: 50, Professional: 200, Enterprise: 1000). Newly provisioned tenants can build and scale KPIs under their plans.
* **Dynamic API Rate Limits**: [OrganizationApiThrottle](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/api/v1/throttles/organization_throttles.py) passes the HTTP request context down to all inner sub-throttle instances, checking plan types (Free, Basic, Professional, Enterprise) and enforcing settings rates instead of falling back to default basic tiers.

### 2.7 Background Tasks Scheduling
* **Celery Beat Schedules**: The daily maintenance, daily api reset, hourly snapshot, quota checks, and predictive resource exhaustion forecast background tasks are registered in the global [celery_beat.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/celery_beat.py) configuration schedule.

---

## 3. Hardened Multi-Tenancy Frontend Updates (10/10 Frontend Updates)

### 3.1 Store Middleware Paths Fix
The relative slice imports inside all active Redux listener and utility middlewares (`tenantContext.middleware.js`, `cache.middleware.js`, `pagination.middleware.js`, `errorHandler.middleware.js`) are fixed to point to the correct `../slice/` paths, ensuring a clean, zero-compile-error production build.

### 3.2 WebSocket Routing Realignment
WebSocket path helpers in [websocketApiConstants.js](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/frontend/src/config/constants/websocketApiConstants.js) are updated to match Django Channels routing regex, preventing client-side connection drops:
* **Tenant Status**: `/ws/organizations/${orgId}/status/`
* **Provisioning Progress**: `/ws/organizations/${orgId}/provisioning/`
* **Domain Verification**: `/ws/organizations/${orgId}/domain-verification/`
* **Resource Quota Alerts**: `/ws/organizations/${orgId}/quota/`
* **Migration Stream**: `/ws/organizations/${orgId}/migrations/`

### 3.3 Subscription Plan Alignments
The [tenantConstants.js](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/frontend/src/config/constants/tenantConstants.js) file is updated to define `free`, `basic`, `professional`, and `enterprise` tiers, matching backend constants. The KPI resource limits are integrated in the configurations to prevent layouts from showing missing features.

### 3.4 Backend-Driven System Health Check
The [HealthCheck.jsx](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/frontend/src/components/tenant/health/HealthCheck.jsx) component is reconfigured to display the backend's real metrics—Database health, Schema count status, and Organization records count—removing hardcoded offline cache/celery status checks. All page hooks are cleanly routed through the Redux state, resolving legacy import crashes.

---

## 4. Operations & Diagnostic Commands

Run these utilities from the workspace directory to verify the health of the multi-tenant system:

### A. Django System Diagnostics
Verify that all settings, middlewares, models, and celery beat task hooks are registered and compiled:
```bash
.\fasc\Scripts\python.exe manage.py check
```

### B. Multi-Tenant Integration Tests
Run the project's health tests to check database connections, active tenant counts, and active PostgreSQL schemas:
```bash
.\fasc\Scripts\python.exe debug_tenant.py
```

Expected output:
```json
Django setup completed
Organization model imported okay
Organization table exists: organizations
AdminOrganizationViewSet imported okay
HealthCheckService imported okay
System health: {
  "timestamp": "2026-07-15T07:54:51.042247+00:00", 
  "database": {"status": "healthy", "database": "connected"}, 
  "schemas": {"status": "healthy", "schemas": 10}, 
  "organizations": {"status": "healthy", "organizations": 11}
}
=== All tests passed ===
```

### C. Frontend Production Build
To build and verify the frontend application:
```bash
cd frontend
npm run build
```
Expected output:
```bash
vite v5.4.21 building for production...
✓ built in 1m 29s
```
