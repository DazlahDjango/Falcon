# 👁️ Role Mapping: Read-Only / Governance (`read_only`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Single Organization — Non-Operational External Stakeholders (Board of Directors, Shareholders, Auditors)

---

## 1. 📌 Role Definition & Strategic Purpose
The **Read-Only** (`read_only`) role is designed for external stakeholders who require high-level visibility into an organization’s structure, compliance reports, and operational summaries (e.g., Board Members, Financial Auditors, Investors). Read-only users have zero data mutation privileges.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Read-only access to tenant-scoped user listings and compliance reports. Forbidden from accessing sensitive internal security keys or user passwords.
- **Integrity:** Strictly read-only (`BaseReadOnlyViewset`). System rejects all `POST`, `PUT`, `PATCH`, or `DELETE` mutation attempts on organizational data.
- **Availability:** Accesses summary dashboards and reports on demand.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Tenant Check:** Scoped to `tenant_id`.
3. **MFA Verification:** Subject to tenant policy or personal TOTP setup.
4. **Token Generation:** Issued JWT tokens containing `'role': 'read_only'` and `'tenant_id': '<org-uuid>'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Read-Only user:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Governance Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate into read-only governance workspace. |
| 2 | **View User Directory (Read-Only)** | `GET /api/v1/accounts/users/` | [TenantAccessService.can_access_user_data](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/tenant_access.py#L42) | Read organization user directory in read-only mode for audit and governance reviews. |
| 3 | **View Organization Roles (Read-Only)** | `GET /api/v1/accounts/roles/` | [RoleViewSet.get_queryset](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/roles.py#L88) | Inspect defined organization roles and assigned permission codenames. |
| 4 | **View High-Level Reports & Compliance Summaries** | `GET /api/v1/accounts/reports/compliance-summary/`<br>`GET /api/v1/accounts/reports/user-directory/` | [ReportService.get_compliance_summary_data](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/reports.py#L233) | Review high-level compliance status, MFA adoption rates, and organizational metrics. |
| 5 | **Self-Service Profile & Preferences** | `GET, PATCH /api/v1/accounts/profiles/my/`<br>`GET, PATCH /api/v1/accounts/user-preferences/my/` | [ProfileService.update_profile](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L23)<br>[PreferenceService.update_user_preferences](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/preferences.py#L20) | Maintain personal contact details and display preferences. |
| 6 | **Manage Personal Credentials & MFA** | `POST /api/v1/accounts/auth/change-password/`<br>`POST /api/v1/accounts/auth/mfa-setup/` | [PasswordService.change_password](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/password.py#L22)<br>[MFAService.setup_totp](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa.py#L22) | Manage personal login password and TOTP authenticator security devices. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped to tenant organization (`tenant_id`).
- **Assignable Roles:** None.
- **Destructive Rights:** None. Completely read-only across all organizational models.
