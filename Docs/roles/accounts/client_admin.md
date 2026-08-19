# 🏢 Role Mapping: Client Admin (`client_admin`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Single Organization (Tenant Level) — Exactly One Active Client Admin per Organization

---

## 1. 📌 Role Definition & Strategic Purpose
The **Client Admin** (`client_admin`) is the primary organization administrator responsible for managing users, roles, security settings, branding, and compliance for a specific tenant organization.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Strictly bounded to their own `tenant_id`. Cannot view or modify data belonging to other organizations.
- **Integrity:** Controls tenant-level role assignments, user lifecycle states, and organizational branding/preferences.
- **Availability:** Oversees user account unlockings, MFA device resets for locked-out employees, and tenant user session management.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Tenant Check:** Validates that caller `tenant_id` matches the user's registered `tenant_id` in [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L48).
3. **MFA Verification:** Required if tenant policy mandates MFA for `client_admin` or if user setup is complete.
4. **Token Generation:** Issued JWT tokens containing `'role': 'client_admin'` and `'tenant_id': '<org-uuid>'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Client Admin within their organization:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Organization Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate as the organization administrator with tenant isolation checks. |
| 2 | **View & Update Organization Settings** | `GET, PATCH /api/v1/accounts/tenant-preferences/my-tenant/` | [PreferenceService.update_tenant_preferences](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/preferences.py#L83) | Configure session timeouts, password expiry days, max concurrent sessions, and feature toggles. |
| 3 | **Configure Tenant Branding** | `PATCH /api/v1/accounts/tenant-preferences/my-tenant/branding/` | [PreferenceService.update_branding](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/preferences.py#L125) | Upload organization logos, favicon URLs, and primary/secondary HSL palette colors. |
| 4 | **Configure Tenant MFA Policy** | `GET, PATCH /api/v1/accounts/system-settings/mfa-policy/tenant/` | [TenantMFAPolicyView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/system_settings_views.py#L91) | Define which organization roles mandatory require MFA (e.g., mandating MFA for `executive` and `supervisor`). |
| 5 | **Set User MFA Override** | `GET, PATCH, DELETE /api/v1/accounts/system-settings/mfa-policy/user/{id}/` | [UserMFAPolicyView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/system_settings_views.py#L168) | Force mandatory MFA on specific sensitive user accounts or clear individual overrides. |
| 6 | **Invite New Organization Users** | `POST /api/v1/accounts/users/invite/` | [InvitationService.send_invitation](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/invitation.py#L22) | Send email invitations to prospective employees with pre-assigned roles and department assignments. |
| 7 | **View Pending Invitations** | `GET /api/v1/accounts/users/invitations/` | [InvitationService.get_pending_invitations](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/invitation.py#L93) | Inspect active invitation links and resend/cancel pending tokens. |
| 8 | **User Lifecycle Management** | `GET, POST, PATCH, DELETE /api/v1/accounts/users/` | [UserViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/user.py#L34) | Create, retrieve, edit, or soft-delete user accounts within their organization. |
| 9 | **Activate / Deactivate / Unlock Users** | `POST /api/v1/accounts/users/{id}/activate/`<br>`POST /api/v1/accounts/users/{id}/deactivate/`<br>`POST /api/v1/accounts/users/{id}/unlock/` | [UserViewSet.deactivate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/user.py#L129) | Manage employee active statuses, unlock accounts after failed attempt lockouts, and terminate active sessions on deactivation. |
| 10 | **Assign Organization Roles** | `POST /api/v1/accounts/users/{id}/assign-role/` | [RBACService.assign_role](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/rbac.py#L13) | Assign roles (`client_admin`, `dashboard_champion`, `executive`, `supervisor`, `staff`, `read_only`). Cannot assign `super_admin`. |
| 11 | **Bulk CSV Import & Export** | `POST /api/v1/accounts/users/bulk-import/`<br>`GET /api/v1/accounts/users/bulk-export/` | [BulkUserImportService.import_users_from_csv](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/bulk.py#L17) | Batch import employee CSV lists or export active user directories. |
| 12 | **Reset User MFA & Devices** | `POST /api/v1/accounts/admin/mfa/{user_id}/reset/`<br>`DELETE /api/v1/accounts/admin/mfa/{user_id}/clear-device/` | [MFAAdminService.reset_user_mfa](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa_admin_service.py#L15) | Assist employees who lost their MFA devices by clearing devices or resetting MFA state. |
| 13 | **Manage Organization Sessions** | `GET /api/v1/accounts/sessions/tenant-active/`<br>`POST /api/v1/accounts/sessions/{id}/terminate/` | [SessionViewSet.tenant_active](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/session.py#L80) | Inspect all live employee sessions within the organization and terminate suspicious active sessions. |
| 14 | **Audit Logs & Security Summaries** | `GET /api/v1/accounts/audit/`<br>`GET /api/v1/accounts/security/lockout-summary/` | [AuditLogViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/audit.py#L23) | Review organizational audit trails, security event alerts, and login failure metrics. |
| 15 | **Generate & Export Organization Reports** | `GET /api/v1/accounts/reports/{type}/` | [ReportService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/reports.py#L13) | Export User Directory, Role Distribution, Department Distribution, Inactive Users, Audit Trails, and Compliance Summaries in CSV, XLSX, PDF, or JSON. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Strict single-tenant restriction (`tenant_id == request.user.tenant_id`).
- **Assignable Roles:** `client_admin`, `dashboard_champion`, `executive`, `supervisor`, `staff`, `read_only` (Forbidden: `super_admin`).
- **Destructive Rights:** Soft delete tenant users, terminate sessions, update policies, reset MFA. Cannot hard-delete database rows.
