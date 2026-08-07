# 📊 Role Mapping: Dashboard Champion (`dashboard_champion`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Single Organization — Performance Analytics & Dashboard Champion

---

## 1. 📌 Role Definition & Strategic Purpose
The **Dashboard Champion** (`dashboard_champion`) is a specialized organization role designated to build, monitor, and champion performance analytics dashboards and KPI metrics across the tenant.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Scoped to tenant-level analytics. Has view access to performance metrics and department distributions, but cannot manage user credentials or administrative settings.
- **Integrity:** Ensures performance tracking metrics accurately reflect organizational goals.
- **Availability:** Monitors real-time dashboard data streams.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Tenant Check:** Validated against user's registered `tenant_id`.
3. **MFA Verification:** Evaluated against tenant role policies.
4. **Token Generation:** Issued JWT tokens containing `'role': 'dashboard_champion'` and `'tenant_id': '<org-uuid>'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Dashboard Champion:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Champion Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate with tenant scoping. |
| 2 | **Dashboard Access Evaluation** | Model Property Evaluation | [User.is_dashboard_champion](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/user.py#L123) | Grants specialized access to tenant-wide performance dashboard configuration modules. |
| 3 | **Inspect Department Distribution** | `GET /api/v1/accounts/reports/department-distribution/` | [ReportService.get_department_distribution_data](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/reports.py#L60) | Analyze user breakdown across departments for dashboard widget mapping. |
| 4 | **View Role Distribution Analytics** | `GET /api/v1/accounts/reports/role-distribution/` | [ReportService.get_role_distribution_data](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/reports.py#L41) | Inspect organization role proportions for analytical reports. |
| 5 | **Self-Service Profile & Preferences** | `GET, PATCH /api/v1/accounts/profiles/my/`<br>`GET, PATCH /api/v1/accounts/user-preferences/my/` | [ProfileService.update_profile](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L23)<br>[PreferenceService.update_user_preferences](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/preferences.py#L20) | Configure personal dashboard layouts, default landing page, and sidebar preferences. |
| 6 | **Manage Security Credentials** | `POST /api/v1/accounts/auth/change-password/`<br>`POST /api/v1/accounts/auth/mfa-setup/` | [PasswordService.change_password](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/password.py#L22)<br>[MFAService.setup_totp](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa.py#L22) | Maintain personal credentials, password changes, and MFA authenticator devices. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped strictly to `tenant_id`.
- **Assignable Roles:** None.
- **Destructive Rights:** None.
