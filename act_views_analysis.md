# Exhaustive Analysis & Frontend Integration Guide: `apps/accounts/api/v1/views/`

**Target Directory:** `apps/accounts/api/v1/views/`  
**Files Analyzed (17 Files):** `admin_mfa_views.py`, `admin.py`, `audit.py`, `auth.py`, `base.py`, `mfa.py`, `password.py`, `permission.py`, `preference.py`, `profiles.py`, `reports.py`, `roles.py`, `security_views.py`, `session.py`, `step_up_views.py`, `system_settings_views.py`, `user.py`.

---

## 1. Base Framework & Core Classes (`base.py`)

All API ViewSets in the application inherit from one of three standard base view classes in `base.py`:

```
               +-----------------------------------+
               |        DRF API VIEWSETS           |
               +-----------------------------------+
                                 ||
       +-------------------------++-------------------------+
       ||                        ||                        ||
+---------------+        +---------------+        +-------------------+
|  BaseViewset  |        |BaseModelViewset|       |BaseReadOnlyViewset|
+---------------+        +---------------+        +-------------------+
| - IsAuth      |        | - Auto Tenant |        | - Read-Only       |
| - IsTenantMbr |        |   Isolation   |        | - Auto Tenant     |
| - UserThrottle|        | - Soft Delete |        |   Isolation       |
+---------------+        | - restore/    |        +-------------------+
                         |   hard_delete |
                         +---------------+
```

1. **`BaseViewset`** (`viewsets.ViewSet`):
   - Enforces `IsAuthenticated` and `IsTenantMember` permissions.
   - Applies `UserRateThrottle`.
2. **`BaseModelViewset`** (`viewsets.ModelViewSet`):
   - **Automatic Tenant Scoping:** Non-superusers automatically filtered by `tenant_id = request.user.tenant_id`.
   - **Automatic Creator/Modifier Injections:** Sets `created_by` & `tenant_id` on create, `modified_by` on update.
   - **Soft Delete Behavior:** `destroy()` executes `instance.soft_delete()`.
   - **Default Custom Actions:**
     - `POST /{resource}/{id}/restore/`: Calls `instance.restore()`.
     - `DELETE /{resource}/{id}/hard-delete/`: Superuser-only hard deletion.
3. **`BaseReadOnlyViewset`** (`viewsets.ReadOnlyModelViewSet`):
   - Read-only tenant-isolated viewset with search and ordering filters.

---

## 2. Comprehensive File-by-File View Analysis

### 2.1 Authentication Views (`auth.py`)
- **`LoginView`** (`POST /api/v1/auth/login/`):
  - *Permissions:* `AllowAny` | *Throttle:* `LoginRateThrottle`
  - Validates `email`, `password`, and optional `tenant_id`. Calls `AuthenticationService.authenticate()`.
  - Returns `200 OK` with `{ user, access, refresh, session_id }` or `{ requires_mfa: true, mfa_token }`.
- **`MFAAuthView`** (`POST /api/v1/auth/mfa-verify/`):
  - *Permissions:* `AllowAny` | *Throttle:* `MFARateThrottle`
  - Validates `mfa_token` & `otp`. Calls `AuthenticationService.verify_mfa()`.
- **`MFASetupView`** (`POST /api/v1/auth/mfa-setup/`):
  - Initiates TOTP setup for logged-in user.
- **`RefreshTokenView`** (`POST /api/v1/auth/refresh/`):
  - *Permissions:* `AllowAny` | *Throttle:* `LoginRateThrottle`
  - Verifies refresh token, checks blacklist JTI, issues new token pair.
- **`LogoutView`** (`POST /api/v1/auth/logout/`):
  - Accepts `{ refresh, all_devices?: boolean }`. Blacklists refresh token and revokes sessions.
- **`AuthViewSet`**:
  - Utility ViewSet mapping `login`, `mfa_verify`, `mfa_setup`, `mfa_devices`, `mfa_backup_codes`, `refresh`, and `logout`.

---

### 2.2 User & Invitation Views (`user.py`)
- **`UserViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/users/`):
  - *Permissions:* Custom dynamic permission checking (`CanManageUser`, `CanAccessUser`, `CanAssignRole`).
  - *Actions:*
    - `POST /{id}/assign-role/`: Calls `RBACService.assign_role()`.
    - `POST /{id}/activate/`: Enables user account.
    - `POST /{id}/deactivate/`: Disables user, revokes sessions, and fires WebSocket `AccountsEventBroadcaster.user_deactivated`.
    - `POST /{id}/unlock/`: Clears failed login attempts & lockout.
    - `POST /{id}/verify/`: Sets `is_verified = True`.
    - `GET /{id}/team/` & `GET /{id}/reporting-chain/`: Hierarchical reporting trees.
    - `GET /me/`: Current user profile.
    - `POST /invite/`: Sends invitation email via `InvitationService`.
    - `POST /bulk-import/` & `GET /bulk-export/`: CSV user import/export.
- **`CurrentUserView`** (`GET/PATCH /api/v1/auth/me/`): Current user profile fetch and partial update.
- **`UserProfileView`** (`GET /api/v1/users/{id}/profile/`): User detail profile view.
- **`UserInvitationsView`** (`GET/POST /api/v1/auth/invitations/`): Pending invitation listing and creation.
- **`InvitationAcceptView`** (`POST /api/v1/auth/invitation/accept/`): Validates token, sets password, and logs user in.

---

### 2.3 Password Management Views (`password.py`)
- **`PasswordChangeView`** (`POST /api/v1/auth/me/change-password/`):
  - Enforces `SensitiveEndpointThrottle`. Updates user password & records history.
- **`PasswordResetRequestView`** (`POST /api/v1/auth/password-reset/`):
  - Sends password reset email link with secure token.
- **`PasswordResetConfirmView`** (`POST /api/v1/auth/password-reset/confirm/`):
  - Confirms reset token and updates password.

---

### 2.4 Multi-Factor Authentication Views (`mfa.py` & `admin_mfa_views.py`)
- **`MFADeviceViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/mfa/devices/`):
  - `POST /setup-totp/`: Initiates TOTP setup $\rightarrow$ returns secret & QR code URI.
  - `POST /verify-totp-setup/`: Validates initial code to activate TOTP device.
  - `POST /{id}/verify/`: Verifies device OTP challenge.
  - `POST /verify-backup/`: Validates emergency backup code.
  - `POST /generate-backup-codes/`: Generates 10 single-use emergency backup codes.
  - `GET /backup-codes-status/`: Checks remaining backup code count.
  - `POST /{id}/set-primary/`: Sets primary MFA device.
  - `POST /disable/`: Disables specific or all MFA devices.
  - `GET /status/`: Overview of MFA status (`requires_mfa`, `totp`, `backup_codes`).
  - `GET /activity/` & `GET /failure-rate/`: MFA attempt diagnostics.
- **`MFAAuditLogViewSet`** (`BaseReadOnlyViewset` $\rightarrow$ `/api/v1/mfa/audit-logs/`):
  - Audit trail of MFA enrollment, attempts, failures, and disable events.
  - `GET /summary/`: Success rates today, this week, this month, and top IP addresses.
- **Admin MFA Views (`admin_mfa_views.py`)**:
  - **`AdminMfaResetView`** (`POST /api/v1/admin/mfa/reset/{user_id}/`): Admin-forced MFA reset (removes devices, clears backup codes, notifies user).
  - **`AdminMfaDeviceClearView`** (`DELETE /api/v1/admin/mfa/devices/{user_id}/[{device_id}]/`): Removes targeted user devices.
  - **`AdminMFAStatusView`** (`GET /api/v1/admin/mfa/status/{user_id}/`): Evaluates target user MFA status & policy overrides.

---

### 2.5 Role & Permission Views (`roles.py` & `permission.py`)
- **`RoleViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/roles/`):
  - Filterable by `role_type`, `is_system`, `is_assignable`.
  - Protects system roles (`super_admin`, `client_admin`, etc.) from deletion or permission mutation.
  - `GET /system/`: System roles.
  - `GET /assignable/`: Roles assignable by current logged-in user.
  - `GET /{id}/permissions/` & `POST /{id}/permissions/`: View/assign permissions to custom roles.
- **`PermissionViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/permissions/`):
  - Filterable by `category` (`kpi`, `review`, `user`, `tenant`, `report`, `workflow`, `admin`) and `level` (`global`, `tenant`, `department`, `team`, `self`).
  - `GET /by-category/{category}/` & `GET /by-level/{level}/`.

---

### 2.6 Profile & Preference Views (`profiles.py` & `preference.py`)
- **`ProfileViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/profiles/`):
  - `POST /{id}/avatar/` & `DELETE /{id}/avatar/`: Image upload/removal via `AvatarService`.
  - `POST/PUT/DELETE /{id}/skills/`: Manage skills JSON array.
  - `POST/DELETE /{id}/certifications/`: Manage certifications JSON array.
  - `GET/PATCH /my/`: Current user profile shortcuts.
- **`UserPreferenceViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/preferences/users/`):
  - `GET/PATCH /my/`: User notification channels, sidebar collapse, display settings.
  - `POST /notifications/`: Event-type specific channel routing.
- **`TenantPreferenceViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/preferences/tenants/`):
  - `GET/PATCH /my-tenant/`: Branding (`logo_url`, `primary_color`, `secondary_color`), security policies (`mfa_required_roles`, `password_expiry_days`), data retention.
  - `PATCH /my-tenant/branding/`: Branding colors & logos shortcut.

---

### 2.7 Session Views (`session.py`)
- **`SessionViewSet`** (`BaseReadOnlyViewset` $\rightarrow$ `/api/v1/sessions/`):
  - `POST /{id}/terminate/`: Terminate specific session by ID.
  - `GET /tenant-active/`: Admin view of all active tenant sessions.
  - `POST /terminate-all/`: Terminate all active sessions except current.
  - `GET /current/`: Current active session details.
  - `GET /active/`: Current user active sessions.

---

### 2.8 Security, Policy, & System Settings Views (`security_views.py`, `system_settings_views.py`, `step_up_views.py`)
- **`LoginAttemptViewSet`** (`BaseReadOnlyViewset` $\rightarrow$ `/api/v1/security/login-attempts/`):
  - Tenant-scoped audit trail of login attempts (result, failure_reason, IP, user_agent).
- **`TenantPolicyView`** (`GET /api/v1/security/policy/`): Returns active tenant security policy.
- **`LockoutSummaryView`** (`GET /api/v1/security/lockout-summary/`): Security dashboard stats (failures in 15m, locked accounts in 24h, top failing IPs).
- **`AccountsSystemSettingsView`** (`GET/PATCH/PUT /api/v1/system-settings/`): Superadmin global security defaults.
- **`AccountsSystemSettingsResetView`** (`POST /api/v1/system-settings/reset/`): Reset platform security defaults.
- **`AccountsSyncPolicyView`** (`POST /api/v1/system-settings/sync-policy/`): Syncs policy across all tenant organizations.
- **`TenantMFAPolicyView`** (`GET/PATCH /api/v1/security/mfa/policy/`): Tenant MFA role requirement management.
- **`UserMFAPolicyView`** (`GET/PATCH/DELETE /api/v1/security/mfa/users/[{user_id}]/`): Per-user MFA requirement overrides.
- **`UserMFAStatusView`** (`GET /api/v1/security/mfa/users/{user_id}/status/`): Detail user MFA device & policy inspection.
- **`StepUpVerifyView`** (`POST /api/v1/auth/step-up/verify/`): Verifies OTP to grant temporary elevated session privileges.

---

### 2.9 System Reports & Superadmin Views (`reports.py` & `admin.py`)
- **`ReportViewSet`** (`ViewSet` $\rightarrow$ `/api/v1/reports/`):
  - Export formats supported: JSON, CSV, XLSX, PDF via `ReportService`.
  - Endpoints: `user-directory`, `role-distribution`, `department-distribution`, `inactive-users`, `recently-added`, `activity-summary`, `audit-trail`, `login-activity`, `password-changes`, `role-changes`, `suspension-log`, `compliance-summary`.
- **`AdminUserViewSet`** (`BaseModelViewset` $\rightarrow$ `/api/v1/admin/users/`):
  - Superadmin user control: `impersonate` (generates JWT for target user), `force-password-reset`, `map-to-organization`, `stats`, `bulk-import`, `bulk-export`.
- **`AdminRoleViewSet`**, **`AdminPermissionViewSet`**, **`AdminTenantViewSet`**:
  - Superadmin management for roles, system permissions initialization (`init-permissions`), tenant suspension, and tenant organization mapping (`map-user`).
- **`AdminSystemView`**:
  - `GET /admin/system/`: System status, DB & Cache health.
  - `POST /admin/system/clear-cache/`: Clears Django cache.
  - `GET /admin/system/health/`: Full health check diagnostic.

---

## 3. Summary Matrix of View Classes & Endpoints

| View Class Name | Source File | Base Type | Router / Route Path | Key Permissions Required |
| :--- | :--- | :--- | :--- | :--- |
| `LoginView` | `auth.py` | `APIView` | `/auth/login/` | `AllowAny` |
| `MFAAuthView` | `auth.py` | `APIView` | `/auth/mfa-verify/` | `AllowAny` |
| `RefreshTokenView` | `auth.py` | `APIView` | `/auth/refresh/` | `AllowAny` |
| `LogoutView` | `auth.py` | `APIView` | `/auth/logout/` | `IsAuthenticated` |
| `UserViewSet` | `user.py` | `BaseModelViewset` | `/users/` | Dynamic (`CanManageUser`, `CanAccessUser`) |
| `CurrentUserView` | `user.py` | `APIView` | `/auth/me/` | `IsAuthenticated` |
| `PasswordChangeView` | `password.py` | `APIView` | `/auth/me/change-password/` | `IsAuthenticated` |
| `PasswordResetRequestView`| `password.py` | `APIView` | `/auth/password-reset/` | `AllowAny` |
| `PasswordResetConfirmView`| `password.py` | `APIView` | `/auth/password-reset/confirm/`| `AllowAny` |
| `MFADeviceViewSet` | `mfa.py` | `BaseModelViewset` | `/mfa/devices/` | `IsAuthenticated` / `IsOwner` |
| `MFAAuditLogViewSet` | `mfa.py` | `BaseReadOnlyViewset`| `/mfa/audit-logs/` | `IsAuthenticated` |
| `AdminMfaResetView` | `admin_mfa_views.py`| `APIView` | `/admin/mfa/reset/{user_id}/` | `IsAuthenticated`, `IsClientAdmin` |
| `AdminMfaDeviceClearView`| `admin_mfa_views.py`| `APIView` | `/admin/mfa/devices/{user_id}/`| `IsAuthenticated`, `IsClientAdmin` |
| `AdminMFAStatusView` | `admin_mfa_views.py`| `APIView` | `/admin/mfa/status/{user_id}/` | `IsAuthenticated`, `IsClientAdmin` |
| `RoleViewSet` | `roles.py` | `BaseModelViewset` | `/roles/` | `IsAuthenticated`, `IsClientAdmin`/`IsSuperAdmin` |
| `PermissionViewSet` | `permission.py` | `BaseModelViewset` | `/permissions/` | `IsAuthenticated`, `IsClientAdmin` |
| `ProfileViewSet` | `profiles.py` | `BaseModelViewset` | `/profiles/` | `IsAuthenticated`, `IsOwner`/`CanAccessProfile` |
| `UserPreferenceViewSet` | `preference.py` | `BaseModelViewset` | `/preferences/users/` | `IsAuthenticated`, `IsOwner` |
| `TenantPreferenceViewSet`| `preference.py` | `BaseModelViewset` | `/preferences/tenants/` | `IsAuthenticated`, `IsClientAdmin` |
| `SessionViewSet` | `session.py` | `BaseReadOnlyViewset`| `/sessions/` | `IsAuthenticated` |
| `AuditLogViewSet` | `audit.py` | `BaseReadOnlyViewset`| `/audit-logs/` | `IsAuthenticated`, `IsManagement` |
| `LoginAttemptViewSet` | `security_views.py` | `BaseReadOnlyViewset`| `/security/login-attempts/` | `IsSecurityConsoleAccess` |
| `TenantPolicyView` | `security_views.py` | `APIView` | `/security/policy/` | `IsSecurityConsoleAccess` |
| `LockoutSummaryView` | `security_views.py` | `APIView` | `/security/lockout-summary/` | `IsSecurityConsoleAccess` |
| `StepUpVerifyView` | `step_up_views.py` | `APIView` | `/auth/step-up/verify/` | `IsAuthenticated` |
| `ReportViewSet` | `reports.py` | `ViewSet` | `/reports/` | `IsAuthenticated`, `IsClientAdmin`/`IsSuperAdmin` |
| `AdminUserViewSet` | `admin.py` | `BaseModelViewset` | `/admin/users/` | `IsAuthenticated`, `IsSuperAdmin` |
| `AdminRoleViewSet` | `admin.py` | `BaseModelViewset` | `/admin/roles/` | `IsAuthenticated`, `IsSuperAdmin` |
| `AdminPermissionViewSet` | `admin.py` | `BaseModelViewset` | `/admin/permissions/` | `IsAuthenticated`, `IsSuperAdmin` |
| `AdminTenantViewSet` | `admin.py` | `BaseModelViewset` | `/admin/tenants/` | `IsAuthenticated`, `IsSuperAdmin` |
| `AdminSystemView` | `admin.py` | `ViewSet` | `/admin/system/` | `IsAuthenticated`, `IsSuperAdmin` |
| `AccountsSystemSettingsView`| `system_settings_views.py`| `APIView` | `/system-settings/` | `IsSuperAdminOrReadOnly` |
| `AccountsSyncPolicyView`| `system_settings_views.py`| `APIView` | `/system-settings/sync-policy/`| `IsSuperAdmin` |
| `TenantMFAPolicyView` | `system_settings_views.py`| `APIView` | `/security/mfa/policy/` | `IsAuthenticated`, `IsClientAdmin` |
| `UserMFAPolicyView` | `system_settings_views.py`| `APIView` | `/security/mfa/users/` | `IsAuthenticated`, `IsClientAdmin` |
| `UserMFAStatusView` | `system_settings_views.py`| `APIView` | `/security/mfa/users/{id}/status/`| `IsAuthenticated`, `IsClientAdmin` |
