# 👔 Role Mapping: Executive (`executive`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Single Organization — Senior Leadership & C-Suite Oversight

---

## 1. 📌 Role Definition & Strategic Purpose
The **Executive** (`executive`) represents senior organizational leadership (e.g., Chief Executive Officer, Chief Operating Officer, Vice Presidents). Executives require high-level strategic visibility across all departments, reporting chains, and organization performance metrics, alongside manager assignment capabilities.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Scoped to the organization tenant. Granted broad read access to user profiles and reporting structures, but cannot alter global system settings or tenant policies.
- **Integrity:** Authorized to assign roles to lower-tier managers and staff (`executive`, `supervisor`, `staff`, `read_only`).
- **Availability:** Monitors overall organizational activity and reporting trends without administrative system burden.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Tenant Check:** Validated against user's registered `tenant_id`.
3. **MFA Enforcement:** Subject to tenant role-based MFA policies (typically mandated by `client_admin`).
4. **Token Generation:** Issued JWT tokens containing `'role': 'executive'` and `'tenant_id': '<org-uuid>'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by an Executive within their organization:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Executive Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate with tenant scoping and MFA verification. |
| 2 | **View Executive & Team Dashboards** | `GET /api/v1/accounts/users/me/` | [PermissionService.has_module_permissions](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/permissions.py#L76) | Access executive-level dashboard views and aggregated KPI reports. |
| 3 | **Inspect Tenant User Directory** | `GET /api/v1/accounts/users/` | [UserViewSet.get_queryset](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/user.py#L65) | Review all employee records, department assignments, and job titles across the organization. |
| 4 | **Inspect User Profiles** | `GET /api/v1/accounts/profiles/{id}/` | [ProfileViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/profiles.py#L25) | View employee skills, certifications, and professional profiles for talent management. |
| 5 | **View Organization Reporting Chain** | `GET /api/v1/accounts/users/{id}/reporting-chain/` | [UserManager.get_reporting_chain](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/managers/user.py#L250) | Trace recursive management hierarchy lines upward using PostgreSQL CTE queries. |
| 6 | **Inspect Department Team Hierarchies** | `GET /api/v1/accounts/users/{id}/team/` | [UserQuerySet.get_team_hierarchy](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/managers/user.py#L43) | View all direct and indirect reports under any manager or supervisor. |
| 7 | **Assign Manager & Employee Roles** | `POST /api/v1/accounts/users/{id}/assign-role/` | [RBACService.assign_role](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/rbac.py#L50) | Assign operational roles (`executive`, `supervisor`, `staff`, `read_only`) to promote or reassign staff. |
| 8 | **View Management Audit Logs** | `GET /api/v1/accounts/audit/`<br>`GET /api/v1/accounts/audit/compliance-report/` | [AuditLogViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/audit.py#L57) | Authorized via `IsManagement` permission class to review compliance reports and organizational audit trails. |
| 9 | **Self-Service Profile & Avatar Management** | `GET, PATCH /api/v1/accounts/profiles/my/`<br>`POST /api/v1/accounts/profiles/{id}/avatar/` | [ProfileService.update_profile](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L23)<br>[AvatarService.upload_avatar](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/avatar.py#L28) | Manage personal executive profile, executive summary bio, contact phone numbers, and profile photo. |
| 10 | **Manage Personal Security & MFA** | `POST /api/v1/accounts/auth/change-password/`<br>`GET, POST /api/v1/accounts/mfa/devices/` | [PasswordService.change_password](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/password.py#L22)<br>[MFAService.setup_totp](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa.py#L22) | Maintain personal account credentials, passcodes, and TOTP authenticator devices. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Full read visibility across their organization (`tenant_id`).
- **Assignable Roles:** `executive`, `supervisor`, `staff`, `read_only` (Forbidden: `super_admin`, `client_admin`).
- **Destructive Rights:** None. Restricted from deactivating accounts, resetting system settings, or modifying tenant configurations.
