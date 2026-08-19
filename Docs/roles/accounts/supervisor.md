# 👥 Role Mapping: Supervisor / Manager (`supervisor`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Single Organization — Direct Team & Departmental Operational Management

---

## 1. 📌 Role Definition & Strategic Purpose
The **Supervisor** (`supervisor`) operates as a line manager within an organization. Supervisors manage direct reports, validate performance entries, oversee team skill sets, and assign staff roles. Their interface is streamlined to focus strictly on direct team management without complex system administration overhead.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Scoped to their tenant and specifically focused on their direct and indirect team reports (`target_user.id in accessing_user.get_team_ids()`).
- **Integrity:** Authorized to validate KPI entries and assign operational roles to `staff` and `read_only` users.
- **Availability:** Ensures team operational continuity and skill coverage.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Tenant Check:** Scoped to `tenant_id`.
3. **MFA Verification:** Subject to tenant role policies or optional user-level TOTP setup.
4. **Token Generation:** Issued JWT tokens containing `'role': 'supervisor'` and `'tenant_id': '<org-uuid>'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Supervisor:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Supervisor Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate with tenant isolation. |
| 2 | **View Direct Reports & Team Members** | `GET /api/v1/accounts/users/me/team/` | [User.get_team_members](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/user.py#L131) | Fetch all active direct and indirect team reports recursively. |
| 3 | **View Personal Reporting Chain** | `GET /api/v1/accounts/users/me/reporting-chain/` | [UserManager.get_reporting_chain](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/managers/user.py#L248) | Inspect upward management hierarchy above the supervisor. |
| 4 | **View Team Skills Distribution** | `GET /api/v1/accounts/profiles/{id}/skills-summary/` | [ProfileService.get_team_skills](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L201) | Aggregates skills, experience levels, and certification counts across team members for resource allocation. |
| 5 | **Assign Staff & Read-Only Roles** | `POST /api/v1/accounts/users/{id}/assign-role/` | [RBACService.assign_role](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/rbac.py#L53) | Assign operational roles (`staff`, `read_only`) to managed team members. |
| 6 | **Validate Team Performance Entries** | Model Property Evaluation | [User.can_validate_entries](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/user.py#L112) | Evaluates authorization property (`True` for `supervisor`) to validate performance review and KPI submissions. |
| 7 | **Self-Service Profile & Avatar Management** | `GET, PATCH /api/v1/accounts/profiles/my/`<br>`POST /api/v1/accounts/profiles/{id}/avatar/` | [ProfileService.update_profile](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L23)<br>[AvatarService.upload_avatar](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/avatar.py#L28) | Maintain personal profile details, job title, avatar photo, and contact information. |
| 8 | **Manage Personal Credentials & MFA** | `POST /api/v1/accounts/auth/change-password/`<br>`POST /api/v1/accounts/auth/mfa-setup/` | [PasswordService.change_password](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/password.py#L22)<br>[MFAService.setup_totp](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa.py#L22) | Update password, set up TOTP authenticator device, and manage active sessions. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped to team members under their direct/indirect hierarchy within `tenant_id`.
- **Assignable Roles:** `staff`, `read_only` (Forbidden: `super_admin`, `client_admin`, `executive`).
- **Destructive Rights:** None. Focused on operational oversight and entry validation.
