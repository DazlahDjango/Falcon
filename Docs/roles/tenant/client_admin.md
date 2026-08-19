# 🏢 Role Mapping: Client Admin (`client_admin`)
**Application:** Tenant (`apps/tenant`)  
**Scope:** Single Organization Tenant Level

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Tenant** app (`apps/tenant`), the **Client Admin** (`client_admin`) manages their organization's tenant configuration, resource quotas, custom domains, SSL certificates, database backups, and restoration workflows.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Strictly restricted to their organization's tenant context (`organization_id == request.user.tenant_id`). Cannot access or inspect database connections, backups, or custom domains belonging to other organizations.
- **Integrity:** Authorized to create database backups, initiate data restorations, and update organization contact information and domain settings.
- **Availability:** Monitors real-time resource quota consumption, tracks storage thresholds, requests SSL renewals, and creates scheduled database backups to guarantee business continuity.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `CanManageOrganization`, `CanManageDomain`, `CanViewResource`, and `IsTenantAdmin` permission classes in `apps/tenant/api/v1/permissions.py`.
- **Throttling:** Regulated via `OrganizationApiThrottle` and `TenantApiThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Client Admin in the Tenant app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Client Admin Tenant Dashboard** | `GET /api/v1/tenant/dashboard/client_admin/` | [OrganizationStatsService.get_client_admin_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/stats_service.py#L65) | View organization overview metrics: total active users, storage used, domain verification status, and quota usage gauge. |
| 2 | **Inspect & Update Organization Details** | `GET, PATCH /api/v1/tenant/organizations/{id}/` | [OrganizationViewSet.get_object](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/api/v1/views/organization_views.py#L48) | Retrieve full organization details, contact email, address, and phone numbers. |
| 3 | **Inspect Resource Quotas & Warnings** | `GET /api/v1/tenant/organizations/{id}/usage_summary/`<br>`GET /api/v1/tenant/resources/summary/?organization_id={id}` | [ResourceService.get_usage_summary](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/resource_service.py#L120) | Monitor usage percentages for `USERS`, `DEPARTMENTS`, `STORAGE_MB`, and `API_CALLS_PER_DAY` against warning thresholds (80%). |
| 4 | **Analyze Resource Time-Series Trends** | `GET /api/v1/tenant/resources/analytics/?organization_id={id}&resource_type=USERS` | [ResourceService.get_usage_analytics](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/resource_service.py#L170) | Inspect resource consumption trends, peak usage days, and projected exhaustion dates. |
| 5 | **Fetch Live Quota Reference Data** | `GET /api/v1/tenant/reference-data/?include=users,departments,kpis,sessions` | [ResourceSyncService.count_live_usage](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/monitoring/resource_sync.py#L18) | Query live cross-app database counts to verify real-time quota compliance. |
| 6 | **Manage Organization Custom Domains** | `GET, POST, PATCH /api/v1/tenant/domains/` | [DomainService.create_domain](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/domain_service.py#L15) | Request custom domain additions (e.g., `portal.acme.com`), retrieve DNS verification TXT tokens, and set primary domain. |
| 7 | **Renew Custom Domain SSL Certificate** | `POST /api/v1/tenant/domains/{id}/renew_ssl/` | [DomainService.renew_ssl](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/domain_service.py#L90) | Trigger Let's Encrypt / ACME SSL certificate renewals for active custom domains. |
| 8 | **Create Organization Database Backup** | `POST /api/v1/tenant/backups/` | [BackupManager.create_backup](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/backup/backup_manager.py#L22) | Trigger manual SQL dump backups for the tenant's isolated PostgreSQL database schema. |
| 9 | **Restore Organization from Backup** | `POST /api/v1/tenant/backups/{id}/restore/` | [RestoreService.restore_from_backup](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/backup/restore_service.py#L18) | Restore tenant database schema state from a previously generated backup file. |
| 10 | **Download Backup SQL File** | `GET /api/v1/tenant/backups/{id}/download/` | [BackupViewSet.download](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/api/v1/views/backup_views.py#L94) | Securely download generated `.sql` database backup dumps for offsite disaster recovery storage. |
| 11 | **Check Organization Database Connection** | `POST /api/v1/tenant/connections/{id}/status/` | [ConnectionService.get_status](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/connection_service.py#L150) | Check database connection status, connection latency, and active session count for own tenant. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Bounded to caller's `tenant_id`.
- **Destructive Rights:** Backup creation, backup restoration, domain modification, SSL renewal request. Restricted from dropping schemas or altering global platform policies.
