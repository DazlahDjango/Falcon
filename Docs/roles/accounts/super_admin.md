# 👑 Role Mapping: Super Admin (`super_admin`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Global System / Multi-Tenant Platform Level

---

## 1. 📌 Role Definition & Strategic Purpose
The **Super Admin** (`super_admin`) is the highest-level system administrator in the Falcon platform. This user operates at the platform level above individual tenant organizations. 

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Bypasses tenant-level boundaries strictly for system administration and emergency impersonation, backed by immutable audit logging.
- **Integrity:** Controls global platform policies, default security settings, system role/permission initializations, and platform database integrity.
- **Availability:** Manages system health checks, cache clearing, tenant activation/suspension, and background policy synchronization to ensure 99.99% system availability.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Service Logic:** [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24)
   - Bypasses account lockout checks and IP rate-limiting rules reserved for regular tenant users.
   - Does not require a `tenant_id` payload (or accepts `tenant_id=None`).
3. **MFA Verification (if configured):** `POST /api/v1/accounts/auth/mfa-verify/` -> [MFAAuthView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L81)
4. **Token Generation:** Issued full JWT bearer access & refresh tokens containing claim `'role': 'super_admin'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Super Admin from initial login to platform management:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **System Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate to gain access to platform administration tools. |
| 2 | **View Platform Health & Stats** | `GET /api/v1/accounts/admin/system/health/`<br>`GET /api/v1/accounts/admin/system/` | [AdminSystemView.health](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/admin.py#L538) | Monitor database connectivity, Redis cache status, total users/tenants, and 24h login metrics. |
| 3 | **Clear Platform Cache** | `POST /api/v1/accounts/admin/system/clear-cache/` | [AdminSystemView.clear_cache](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/admin.py#L529) | Flush stale Redis cache keys during updates or emergency recovery. |
| 4 | **Provision New Organization (Tenant)** | `POST /api/v1/accounts/admin/tenants/create-with-admin/` | [TenantRegistrationService.register_tenant](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/tenant_reqistration.py#L20) | Onboard new client organizations, initialize tenant default preferences, and provision the initial `client_admin`. |
| 5 | **Suspend / Activate Organization** | `POST /api/v1/accounts/admin/tenants/{id}/suspend/`<br>`POST /api/v1/accounts/admin/tenants/{id}/activate/` | [AdminTenantViewSet.suspend](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/admin.py#L369) | Freeze non-compliant or delinquent client accounts, or restore suspended tenants. |
| 6 | **Map User to Organization** | `POST /api/v1/accounts/admin/users/{id}/map-to-organization/`<br>`POST /api/v1/accounts/admin/tenants/{id}/map-user/` | [AdminUserViewSet.map_to_organization](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/admin.py#L250) | Reassign orphan users or adjust user tenant boundaries across `User`, `Profile`, `UserPreference`, and `UserSession`. |
| 7 | **User Impersonation** | `POST /api/v1/accounts/admin/users/{id}/impersonate/` | [AdminUserViewSet.impersonate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/admin.py#L49) | Issue JWT tokens as target user to debug tenant issues directly in production; logs a high-severity audit event. |
| 8 | **Force Password Reset** | `POST /api/v1/accounts/admin/users/{id}/force-password-reset/` | [PasswordService._generate_reset_token](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/password.py#L85) | Trigger an asynchronous password reset email task for compromised accounts. |
| 9 | **Global User Management (CRUD)** | `GET, POST, PATCH, DELETE /api/v1/accounts/admin/users/` | [AdminUserViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/admin.py#L28) | Inspect, create, edit, activate, deactivate, unlock, or hard-delete users across any tenant. |
| 10 | **Bulk User Import / Export (CSV)** | `POST /api/v1/accounts/admin/users/bulk-import/`<br>`GET /api/v1/accounts/admin/users/bulk-export/` | [BulkUserImportService.import_users_from_csv](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/bulk.py#L17) | Perform batch user creation or data backup for any target tenant. |
| 11 | **Initialize System Roles & Permissions** | `POST /api/v1/accounts/admin/roles/init-system-roles/`<br>`POST /api/v1/accounts/admin/permissions/init-permissions/` | [RoleManager.create_system_roles](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/managers/role.py#L64)<br>[PermissionManager.bulk_create_predefined](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/managers/permissions.py#L59) | Seed system defaults (`super_admin`, `client_admin`, `executive`, `supervisor`, `staff`, `read_only`) and predefined permissions. |
| 12 | **Manage System Security Policies** | `GET, PATCH /api/v1/accounts/system-settings/`<br>`POST /api/v1/accounts/system-settings/reset/` | [AccountsPolicyService.update_system_policy](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/policy/accounts_policy_service.py#L57) | Configure platform-wide security defaults (MFA policies, password expiry, session timeouts, lockout limits). |
| 13 | **Synchronize Tenant Security Policies** | `POST /api/v1/accounts/system-settings/sync/` | [AccountsPolicyService.sync_all_tenants](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/policy/accounts_policy_service.py#L170) | Propagate updated global security policies to all existing tenant preferences. |
| 14 | **Admin MFA Overrides** | `POST /api/v1/accounts/admin/mfa/{user_id}/reset/`<br>`DELETE /api/v1/accounts/admin/mfa/{user_id}/clear-device/` | [MFAAdminService.reset_user_mfa](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa_admin_service.py#L15) | Reset lost MFA devices or wipe MFA configurations for locked-out administrators. |
| 15 | **Security Console & Audit Logs** | `GET /api/v1/accounts/audit/`<br>`GET /api/v1/accounts/security/lockout-summary/` | [AuditLogViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/audit.py#L23)<br>[LockoutSummaryView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/security_views.py#L61) | Review system audit logs, track failed login spikes, inspect security anomalies, and export compliance reports. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Unrestricted (cross-tenant visibility).
- **Assignable Roles:** Any role (`super_admin`, `client_admin`, `dashboard_champion`, `executive`, `supervisor`, `staff`, `read_only`).
- **Destructive Rights:** Soft delete, hard delete, user deactivation, cache purging, policy resetting.
