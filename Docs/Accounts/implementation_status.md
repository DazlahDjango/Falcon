# Falcon PMS Accounts App — Implementation Status & Security Baseline

**Document purpose:** Security-first assessment of the Accounts app after completing Config stabilization (Phases A–D). Maps platform settings, backend services, API surface, frontend flows, real-time behavior, and CIA alignment. Use this as the blueprint for Accounts Phases A–D (mirror of Config).

**Related docs:** `Docs/Accounts/pendings.mmd` (client training narrative), `Docs/Accounts/architecture.mmd`, `config/settings/base.py`

**Last updated:** May 2026

---

## Executive summary

The Accounts app is **feature-rich and largely production-capable**: JWT auth, Axes lockout, MFA (TOTP + backup codes), RBAC, sessions, audit logs, invitations, tenant preferences, and WebSocket consumers exist. Compared to Config, Accounts lacks a **single canonical settings document**, **unified real-time broadcast from services**, and **consistent CIA enforcement on every mutating action** (e.g. deactivate without session revoke).

| Concern | Backend | Frontend | Real-time |
|--------|---------|----------|-----------|
| Authentication (login/MFA/refresh) | Strong | Implemented | Partial (WS auth consumer) |
| User CRUD & invitations | Strong | Implemented | Polling + notifications WS |
| Profiles & preferences | Strong | Implemented | — |
| Sessions | Strong | SessionList UI | WS + middleware activity |
| Roles & permissions | Strong | PermissionContext | — |
| Audit | Strong | AuditLogs UI | Signals only |
| Tenant security policy | Model exists | TenantSettings UI | Not pushed live |
| Centralized accounts settings API | **Missing** | Redux/local mix | — |

**Strategy:** Security first → Integrity (audit + single source of truth) → Availability (sessions, lockout, recovery) → Confidentiality (RBAC, MFA policy, encryption).

---

## 1. Platform configuration (`config/settings/`)

All Accounts security is configured primarily in **`config/settings/base.py`** (no separate `config/settings/accounts.py` today).

### Authentication & JWT

| Setting | Value / behavior | Training doc claim |
|---------|------------------|-------------------|
| `AUTH_USER_MODEL` | `accounts.User` | — |
| `AUTHENTICATION_BACKENDS` | Axes first, then Django ModelBackend, Guardian | Brute-force protection |
| `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` | Default **60 min** (env: `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`) | Doc says 30 min — **align env or doc** |
| `SIMPLE_JWT.REFRESH_TOKEN_LIFETIME` | 7 days | — |
| `ROTATE_REFRESH_TOKENS` | `True` | Token rotation on refresh |
| `BLACKLIST_AFTER_ROTATION` | `True` | Stolen refresh mitigated |

### Brute force & lockout (Axes + app layer)

| Layer | Configuration |
|-------|----------------|
| **django-axes** | 5 failures → 15 min cooloff; lock by `username` + `ip_address` + `user_agent` |
| **AuthenticationService** | Rate limit check before authenticate; `LoginAttempt` records |
| **User model** | `login_attempts`, `locked_until`, `is_locked()` |

### MFA (django-otp)

| Setting | Value |
|---------|--------|
| `OTP_TOTP_ISSUER` | FalconPMS |
| `OTP_TOTP_DIGITS` | 6 |
| `OTP_TOTP_INTERVAL` | 30 seconds |

User fields: `mfa_enabled`, `mfa_secret`, `mfa_backup_codes`, `MFADevice` M2M, MFA audit logs.

### REST throttles (`REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']`)

Scoped rates include: `login` 5/min, `register` 3/hr, `password_reset` 3/hr, `mfa` 5/min, `mfa_enrollment` 3/hr, `user_creation` 5/hr, `profile_update` 30/hr, `invitation` 20/hr, `admin` 200/hr, `tenant_user_creation` 50/day, etc.

Dedicated classes in `apps/accounts/api/v1/throttles/` (auth, tenant, custom).

### Middleware (request pipeline)

| Middleware | Role |
|------------|------|
| `TenantMiddleware` | JWT `tenant_id` on request; public path allowlist |
| `SessionMiddleware` | Session id from JWT; updates `last_activity`; creates session if missing |
| Additional audit middleware | See `apps/accounts/middleware.py` (full file) |

### OAuth / SSO (configured, optional)

`OAUTH_PROVIDERS` in base.py: Google, Microsoft, GitHub, LinkedIn, Facebook. Services under `apps/accounts/services/sso/` (oauth, saml, ldap).

---

## 2. Accounts actions inventory (backend)

Base API: `/api/v1/accounts/` (via `apps.accounts.urls` → `api/v1/`).

### Authentication & session

| Action | Endpoint / entry | Service | Audit / security notes |
|--------|------------------|---------|------------------------|
| Login | `POST auth/login/` | `AuthenticationService.authenticate` | LoginAttempt + optional MFA branch |
| MFA verify | `POST auth/mfa/verify/` | `AuthenticationService.verify_mfa` | MFA audit log |
| MFA setup | `POST auth/mfa/setup/` | `MFAService` | Enrollment throttled |
| MFA devices CRUD | `auth/mfa/devices/`, ViewSet | `MFAService` | — |
| Backup codes | `POST auth/mfa/backup-codes/` | `MFAService` | Throttled |
| Refresh token | `POST auth/refresh/` | JWT + blacklist | `session_refresh` throttle |
| Logout | `POST auth/logout/` | Session terminate | — |
| Logout all sessions | Session API | `SessionService.terminate_all_sessions` | — |
| Current user | `GET/PATCH me/` | Serializers | Authenticated |

### User lifecycle

| Action | Endpoint | Permissions | Gaps |
|--------|----------|-------------|------|
| Create user | `POST users/` | `CanManageUser` | Audit via signals |
| Update user | `PATCH users/{id}/` | `CanManageUser` | Role change audited |
| Delete user | `DELETE users/{id}/` | `CanManageUser` | pre_delete signal |
| Activate | `POST users/{id}/activate/` | `CanManageUser` | — |
| Deactivate | `POST users/{id}/deactivate/` | `CanManageUser` | **Does not auto-terminate sessions** |
| Unlock account | `POST users/{id}/unlock/` | Admin | Resets login attempts |
| Assign role | `POST users/{id}/assign-role/` | `CanAssignRole` | `RBACService` + audit |
| Change password (admin) | `POST users/{id}/change-password/` | Manager | `PasswordService` |
| Change password (self) | `POST me/change-password/` | Self | — |
| Invite user | `POST users/invite/`, invitations API | `InvitationService` | Throttled |
| Accept invitation | `POST auth/invitation/accept/` | Public + throttle | — |
| Team / reporting chain | `GET users/{id}/team/`, `reporting-chain/` | Hierarchy | `UserManager` |

### Profile & preferences

| Action | Endpoint | Model |
|--------|----------|-------|
| Profile (nested) | `users/{id}/profile/` | `Profile` |
| User preferences | `preferences/users/` | `UserPreference` |
| Tenant preferences | `preferences/tenants/` | `TenantPreference` (MFA roles, session timeout, password expiry, audit retention) |

### RBAC & admin

| Area | ViewSets |
|------|----------|
| Roles | `roles/` |
| Permissions | `permissions/` |
| Admin users/roles/tenants | `admin/users/`, etc. |
| System | `admin/system/`, clear-cache |

### Audit & compliance

| Action | Endpoint | Notes |
|--------|----------|-------|
| List/filter audit | `audit-logs/` | Immutable-style logging via `AuditService` |
| Django signals | `user_logged_in/out/failed` | Auth events |
| MFA audit | `mfa/audit-logs/` | — |

---

## 3. Tenant security policy (`TenantPreference`)

Stored per `client_id` (tenant), not a global singleton like Config’s `ConfigSystemSettings`.

| Field | Purpose | Wired to runtime? |
|-------|---------|-------------------|
| `mfa_required_roles` | Role-based MFA enforcement | `requires_mfa(role)` — **enforce on login path** (verify in auth flow) |
| `session_timeout_minutes` | Default 480 (8h) | Partial — session expiry uses service defaults |
| `password_expiry_days` | Default 90 | Check `PasswordService` |
| `audit_log_retention_days` | Default 365 | Management command `cleanup_audit_logs` |
| `api_rate_limit` | Per-tenant cap | Throttle classes reference tenant scopes |

**Gap:** No `POST .../sync-policy/` or versioned **AccountsSystemSettings** API like Config — tenant prefs updated via ViewSet only.

---

## 4. Real-time & “real operations”

### What works today

| Channel | Path | Use case |
|---------|------|----------|
| WebSocket auth | `ws/...` + `AuthConsumer` | Presence, terminate session message, ping |
| WebSocket notifications | `NotificationConsumer` | Unread count, mark read; `group_send` from backend |
| WebSocket presence | `presence.py` | Online/offline |
| Middleware | `SessionMiddleware` | Updates `last_activity` on each request |
| Signals | `post_save` User, auth signals | Audit + profile bootstrap |
| Celery | `apps/accounts/tasks.py` | Cleanup, exports, mail |

### What Config has that Accounts still needs

| Capability | Config | Accounts gap |
|------------|--------|----------------|
| Service-layer `group_send` on state change | `ConfigProgressBroadcaster` | No `AccountsEventBroadcaster` for user/session/MFA events |
| Unified frontend context | `ConfigContext` | Split: AuthContext, NotificationContext, Redux |
| Global banner for security state | Maintenance banner | No “account locked / MFA required” global banner |
| Persisted platform settings UI | `/config/settings` | Tenant settings exist but not same pattern |

### Frontend flows (`frontend/src/`)

| Flow | Components | API service |
|------|------------|-------------|
| Login / MFA | `Login.jsx`, `MFAForm`, `MFAVerify`, `MFASetup` | `api/auth.js` |
| Register / invite accept | `Register.jsx`, `AcceptInvitation.jsx` | registration serializers |
| User list/create/edit | `UserList`, `UserCreate`, `UserEdit`, `UserForm` | `api/users.js` |
| Profile | `ProfileSettings`, `UserProfile` | users + profile |
| Sessions | `SessionList`, `SessionSection` | session API |
| MFA settings | `MFASection` | mfa endpoints |
| Tenant settings | `TenantSettings.jsx` | tenant preferences |
| Admin | `AdminUsers`, `AdminTenants`, etc. | `api/admin.js` |
| Audit | `AuditLogs`, `AuditDetail` | audit API |
| Permissions | `PermissionContext`, `usePermissions` | role checks |

**Storage:** `secureStorage.js` for tokens; refresh via axios interceptors in `api/client.js`.

---

## 5. CIA triad — current vs target

| Pillar | Current state | Target (Accounts Phases A–D) |
|--------|---------------|------------------------------|
| **Confidentiality** | JWT, RBAC permissions, MFA secrets stored on user, encrypted client storage for tokens, Guardian object perms | Central policy API; no secrets in audit metadata; field-level encryption audit; super-admin-only policy writes |
| **Integrity** | AuditService + signals; LoginAttempt trail; Axes | Canonical `default_accounts_policy.py`; sync command; immutable audit export; deactivate→terminate sessions; role change requires audit + optional step-up MFA |
| **Availability** | Axes lockout, session limits (5), refresh rotation, unlock endpoint | Configurable lockout thresholds in policy; session timeout enforced; health of auth endpoints |

---

## 6. Training doc (`pendings.mmd`) vs implementation

| Training topic | Status | Notes |
|----------------|--------|-------|
| JWT short lifespan | **Partial** | 60 min default, not 30 — fix env or doc |
| 5 failures / 15 min lockout | **Achieved** | Axes + User lock |
| MFA TOTP + backup codes | **Achieved** | |
| MFA enforced per role | **Partial** | `TenantPreference.mfa_required_roles` — verify login enforcement |
| Revoke access on leave | **Partial** | Deactivate yes; **session terminate on deactivate** missing |
| Multi-device sessions (max 5) | **Achieved** | `SessionService._enforce_session_limit(5)` |
| Password reset | **Achieved** | `PasswordService` + throttles |
| Seven roles + custom roles | **Achieved** | `RBACService`, Role ViewSet |
| Reporting hierarchy | **Achieved** | `manager` FK, team endpoints |
| Invitations | **Achieved** | Individual; bulk CSV **verify** |
| Active sessions visibility | **Achieved** | Session UI + API |
| Audit immutable 365d | **Achieved** | Model + retention pref |
| Export audit logs | **Partial** | Check `AuditLogExporter` component + API |
| Session timeout configurable | **Achieved** | `TenantPreference.session_timeout_minutes` |
| Failed login visibility | **Achieved** | Audit + `LoginAttempt` |
| Step-up MFA for sensitive actions | **Not found** | Training describes future/configurable |
| Blackout periods (maintenance) | N/A Accounts | Config app topic |
| SMS MFA | **Not implemented** | OAuth/SSO config only |

---

## 7. Recommended Accounts phases (mirror Config)

### Phase A — Security baseline & single source of truth

1. Add `apps/accounts/default_accounts_policy.py` (lockout thresholds, session max, MFA defaults, JWT display values, audit retention).
2. Add `AccountsPolicyService` + optional `AccountsTenantPolicy` version field on `TenantPreference`.
3. `python manage.py sync_accounts_policy` for all tenants.
4. Fix **deactivate** → `terminate_all_sessions(user)` + audit.
5. Align JWT lifetime with documentation (30 vs 60 min).
6. Enforce `mfa_required_roles` in login/MFA completion path explicitly.

### Phase B — Accounts Security Console (frontend)

1. Route `/accounts/security` or enhance `/accounts/settings` with tabs: Policy, Sessions, MFA policy, Lockouts.
2. Super Admin write; Client Admin read-only for policy.
3. Live session table with terminate action (real API, not local state).
4. Failed login / lockout dashboard from `LoginAttempt` API.

### Phase C — Real-time security events

1. `AccountsEventBroadcaster` (session revoked, user deactivated, role changed, MFA enabled).
2. Wire consumers; fix WS URL consistency (`token=` query param).
3. `AccountsSecurityContext` in frontend: global toast/banner for lockout, forced logout, MFA required.
4. Remove debug `console.log` from `AuthContext` for production.

### Phase D — Persisted accounts platform settings (optional global)

If some settings are platform-wide (not per tenant):

- `AccountsSystemSettings` singleton (like Config) for defaults new tenants inherit.
- API `GET/PATCH /api/v1/accounts/system-settings/`.
- Frontend save/load with version display.

---

## 8. Operations you might have missed

| Operation | Location |
|-----------|----------|
| Email verify | `VerifyEmail` flow + templates |
| Forgot / reset password | `ForgotPassword`, `ResetPassword` |
| Avatar upload | `AvatarUpload`, `profile/avatar.py` |
| Export users | `management/commands/export_user.py` |
| Backup users | `backup_users` command |
| Unlock accounts CLI | `unlock_accounts` command |
| Sync roles | `sync_roles` command |
| Guardian object permissions | `permissions/objects.py` |
| LDAP/SAML/OAuth services | `services/sso/` |
| Registration tenant flow | `tenant_registration.py` |
| MFA device ViewSet + audit ViewSet | Full MFA admin API |
| Rate limit view | `apps/core/views.rate_limited` |
| Password validators (custom disabled) | Commented in settings — enable Uppercase/SpecialChar validators |

---

## 9. Key file reference

### Settings

- `config/settings/base.py` — AUTH, JWT, REST_FRAMEWORK throttles, Axes, OTP, CORS, email

### Backend core

- `apps/accounts/models/` — user, session, audit, preferences, mfa, login_attempt
- `apps/accounts/services/auth/` — authentication, jwt, mfa, session, password
- `apps/accounts/services/audit/logger.py`
- `apps/accounts/api/v1/views/` — auth, user, mfa, session, profiles, preference, audit, admin
- `apps/accounts/api/v1/permissions/` — roles, tenant, objects
- `apps/accounts/api/v1/throttles/`
- `apps/accounts/middleware.py`
- `apps/accounts/signals.py`
- `apps/accounts/consumers/`

### Frontend core

- `frontend/src/contexts/accounts/`
- `frontend/src/services/accounts/api/`
- `frontend/src/store/accounts/`
- `frontend/src/components/accounts/`

---

## 10. Conclusion

Accounts is **not greenfield** — it is a mature IAM module that needs **standardization and hardening** the same way Config received: one policy source, enforced side effects on security actions, real-time visibility, and documentation that matches runtime (JWT lifetime, deactivate behavior, MFA enforcement).

**Phase A & B (May 2026):** Implemented — `default_accounts_policy.py`, `AccountsPolicyService`, `AccountsSystemSettings`, APIs under `/api/v1/system-settings/` and `/api/v1/security/`, sync commands, deactivate→session revoke, MFA role enforcement, JWT default 30m, Security Console at `/security`.

**Phase C & D (May 2026):** Implemented — `AccountsEventBroadcaster` + `AuthConsumer.security_event`, `AccountsSecurityProvider` + `GlobalSecurityBanner`, `/ws/auth/` real-time (session revoke, deactivate, role change, MFA, policy update). Phase D UI: **Platform policy** tab (super admin) with versioned `GET/PATCH /system-settings/`.

---

## Document history

| Version | Change |
|---------|--------|
| v1 | Initial security assessment post-Config Phases A–D |
