# 🦅 Falcon Accounts & Authentication System — Full Technical Findings Report

> **Date:** 2026-07-16  
> **Reviewed By:** Antigravity AI  
> **Scope:** `apps/accounts/` — Models, Managers, Services, Consumers, Middlewares, Signals, Tasks, Validators, Exception Layers, API (v1)
> **Isolation Mechanism:** `tenant_id` UUID field on models, thread-local request context validation, and token claim verification.

---

## Table of Contents
1. [Architecture & Design Overview](#1-architecture--design-overview)
2. [Database & Models Layer](#2-database--models-layer)
3. [Managers & QuerySet Layer](#3-managers--queryset-layer)
4. [Services Layer (Business Logic)](#4-services-layer-business-logic)
5. [Django Channels & WebSocket Consumers](#5-django-channels--websocket-consumers)
6. [Middlewares & Request Lifecycle](#6-middlewares--request-lifecycle)
7. [Signals & Background Tasks (Celery)](#7-signals--background-tasks-celery)
8. [Validators & Core Helper Classes](#8-validators--core-helper-classes)
9. [API Layer (v1 Views, Serializers, & Throttles)](#9-api-layer-v1-views-serializers--throttles)
10. [Ratings Assessment (1 to 10)](#10-ratings-assessment-1-to-10)
11. [Critical Vulnerabilities & Bugs Found](#11-critical-vulnerabilities--bugs-found)
12. [Enterprise Level Recommendations](#12-enterprise-level-recommendations)
13. [My Honest Take](#13-my-honest-take)

---

## 1. Architecture & Design Overview

The `accounts` app serves as the authentication and authorization gateway for the Falcon platform. It provides a multi-layered, multi-tenant RBAC (Role-Based Access Control) structure.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FALCON ACCOUNTS SYSTEM                          │
├─────────────┬─────────────┬─────────────┬──────────────┬───────────────┤
│   models/   │  managers/  │  services/  │   api/v1/    │  consumers/   │
│   (Data)    │  (Queries)  │(Biz Logic)  │  (HTTP API)  │  (WebSockets) │
├─────────────┴─────────────┴─────────────┴──────────────┴───────────────┤
│        middleware.py │ signals.py │ tasks.py │ validators.py            │
│         (Security)   │ (Events)   │ (Celery) │ (Sanity Check)          │
└────────────────────────────────────────────────────────────────────────┘
```

The system follows clean-architecture principles:
*   **Models:** Contain data definitions, database indexes, and basic helper properties.
*   **Managers & QuerySets:** Encapsulate database querying logic, ensuring soft-delete filters and tenant-level filters are applied seamlessly at the query layer.
*   **Services:** Coordinate authorization workflows (RBAC checks, MFA verification, SSO auth, registration, and report exports).
*   **Consumers:** Handle persistent real-time connections (auth token checks, presence broadcasting, and notification counts).
*   **API (v1):** Provides REST-compliant views, custom object/role-based permissions, and throttles.

### Tenant Isolation Workflow
Tenant isolation is enforced dynamically at three levels:
1.  **JWT Claims:** Access tokens embed the user's `tenant_id`.
2.  **Thread-Local Variables:** The request lifecycle context extracts the `tenant_id` from the JWT token and binds it via `set_current_tenant_id()`.
3.  **ORM Filter Injection:** The custom `TenantAwareManager` intercepts database queries (`SELECT`) and automatically appends `.filter(tenant_id=current_tenant_id)`.

---

## 2. Database & Models Layer

The database definitions are located in the `models/` directory:

| Model | Source File | Purpose | Key Details & Indexes |
|---|---|---|---|
| `BaseModel` | [base.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/base.py) | Abstract base class containing standard audit and status fields. | Inherits UUID primary keys, timestamp audit fields, soft-delete flags, and `tenant_id` field. |
| `User` | [user.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/user.py) | Extends `AbstractUser` to support tenant assignments, roles, password policies, and security monitoring. | Indexed on `(email, tenant_id)`, `(role, tenant_id)`, and `(is_active, tenant_id)`. Default `tenant_id` is defined as `uuid.uuid4`. |
| `Role` | [roles.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/roles.py) | Defines roles hierarchy (`parent`) and maps them to Django authorization permissions. | Hierarchical lookup support via `get_all_permissions()` recursion. |
| `Permission` | [permission.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/permission.py) | Maps predefined system permission categories (KPI, review, user, reports) and levels (global, tenant, department, team, self) to standard Django permissions. | One-to-One link with `django.contrib.auth.models.Permission`. |
| `UserSession` | [session.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/session.py) | Tracks active sessions, devices, operating systems, login IPs, and security flags. | Indexes on `(user, status)` and `(ip_address, user, tenant_id)`. |
| `SessionBlacklist` | [session.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/session.py) | Stores blacklisted JWT token identifiers (`jti`) for immediate revocation during logout/token refresh. | Bypasses standard tenant filtering to prevent caching errors during lookup. |
| `MFADevice` | [mfa.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/mfa.py) | Stores user authenticator configurations (TOTP, SMS, email, backup). | Cryptographically encrypts OTP secrets using `cryptography.fernet` and `settings.MFA_ENCRYPTION_KEY`. |
| `MFABackupCode` | [mfa.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/mfa.py) | Stores hashed backup codes. | Uses PBKDF2-HMAC-SHA256 hashing to secure raw backup codes. |
| `MFAAuditLog` | [mfa.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/mfa.py) | Log of MFA enrolment, verification success/failures, and lockouts. | Multi-tenant index on `(created_at, tenant_id)`. |
| `AuditLog` | [audit.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/audit.py) | Immutable log of system transactions, action scopes, IP locations, and old/new value JSON changes. | Throws `PermissionError` on edit/delete. |
| `LoginAttempt` | [login_attempt.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/login_attempt.py) | Tracks authentication attempts by identifier (email/username) and logs results (success, failure, lockout). | Indexed on `(identifier, attempted_at)`. |

> [!WARNING]
> **User model default `tenant_id` risk:** In `models/user.py`, `tenant_id` defaults to `uuid.uuid4`. If a developer creates a user without explicitly specifying a tenant (e.g. during script execution or test setups), a random UUID is generated. This creates a user belonging to a non-existent tenant, resulting in isolation leakage or ghost accounts.

---

## 3. Managers & QuerySet Layer

Managers are placed in the `managers/` directory.

### Inheritance Architecture
```
        BaseQuerySet                 BaseManager
             │                            │
      TenantAwareQuerySet          TenantAwareManager
             │                            │
             ▼                            ▼
      (UserQuerySet, etc.)         SoftDeleteManager
                                          │
                                          ▼
                                     UserManager
```

### Critical Observations in the Query Layer
*   **Automatic Multi-Tenancy:** `TenantAwareManager` resolves tenant contexts dynamically using:
    ```python
    current_tenant = get_current_tenant_id()  # Fetches request thread-local UUID
    ```
    If present, it automatically appends a filter rule `qs.filter(tenant_id=current_tenant)` to all incoming database lookups.
*   **Global Revocation Exception:** `SessionBlacklistManager` overrides `get_queryset()` to bypass tenant-context filtering. This is a critical security design choice: token checks must search globally for blocked JTIs regardless of which tenant is currently loaded in the request cache.
*   **MFA Manager Isolation Gap:** `MFADeviceManager`, `MFABackupCodeManager`, and `MFAAuditLogManager` do not inherit from `TenantAwareManager` or `SoftDeleteManager`. Because they inherit directly from `models.Manager`, calling `MFADevice.objects.all()` does not automatically filter by tenant, creating a tenant isolation gap if they are queried outside a specific user context.

---

## 4. Services Layer (Business Logic)

Services reside under `services/` and encapsulate core orchestration:

### 4.1 Authentication & Tokens (`services/auth/`)
*   **JWT Management:** Handles access/refresh token generation. Safely appends custom user claims (`email`, `role`, `tenant_id`) to token payloads.
*   **SSO Integration (LDAP/OAuth/SAML):** Supports Active Directory/LDAP binds, social logins (OAuth2), and SAML federation.
*   **MFA Services:** Implements TOTP setups, rate-limited attempts, and backup validation.

### 4.2 Authorization (`services/authorization/`)
*   **RBAC Service:** Maps roles to custom system-level permissions and enforces resource constraints using hierarchies.
*   **Tenant Access Service:** Evaluates if a user possesses access permissions for specific target data across tenants or teams.

---

## 5. Django Channels & WebSocket Consumers

WebSockets are located in `consumers/` and routed in `routing/`:

*   `AuthConsumer` ([consumers/auth.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/consumers/auth.py)): Authenticates connections via JWT query parameters, maps the channel connection to groups (`user_<id>` and `tenant_<id>`), and handles ping/pong keepalives.
*   `NotificationConsumer` ([consumers/notification.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/consumers/notification.py)): Emits real-time notification alerts and handles read state updates.
*   `PresenceConsumer` ([consumers/presence.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/consumers/presence.py)): Tracks user presence (online/offline) in cache.

---

## 6. Middlewares & Request Lifecycle

The application defines multiple middlewares inside [middleware.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/middleware.py):

*   `SessionMiddleware`: Automatically tracks active HTTP sessions and updates `last_activity` times.
*   `AuditMiddleware`: Intercepts API requests and logs HTTP transactions (method, path, status, and duration in milliseconds) as immutable logs.
*   `SecurityMiddleware`: Appends security headers (`X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`) and enforces IP-based request throttles on sensitive endpoints.
*   `TenantAccessMiddleware`: Restricts users from accessing URL paths that contain tenant IDs other than their own assigned `tenant_id`.

---

## 7. Signals & Background Tasks (Celery)

### Signals ([signals.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/signals.py))
*   `user_pre_save`: Caches previous user roles, emails, and flags for comparison.
*   `user_post_save`: Automatically constructs related `Profile` and `UserPreference` records when a new user is created. Logs creation audits and triggers `ResourceSyncService` syncing.
*   `user_pre_delete`: Emits warning audits before deletion.

### Celery Tasks ([tasks.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/tasks.py))
*   **Email Deliveries:** Sends welcome emails, password reset requests, tenant registrations, and password expiration warnings.
*   **Background Maintenance:** Cleans up sessions older than 90 days, prunes expired blacklisted tokens, rotates audit logs, and automatically unlocks rate-locked accounts after 15 minutes.

---

## 8. Validators & Core Helper Classes

*   `validators.py` ([validators.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/validators.py)) defines class-based password, domain, phone, username, and role-hierarchy assignment validators.
*   `exceptions.py` ([exceptions.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/exceptions.py)) standardizes error structures (e.g. `AccountLockedError`, `MFAInvalidError`, `RevokedTokenError`).

---

## 9. API Layer (v1 Views, Serializers, & Throttles)

The REST API utilizes standard DRF structures inside `api/v1/`:

*   **Views:** Features custom viewsets for users, preferences, audit logs, and role permissions.
*   **Serializers:** Maps models to serialized fields, managing secure password verification and onboarding structures.
*   **Filters:** Utilizes `django-filters` for precise data querying.
*   **Throttles:** Protects authentication endpoints from brute-force attempts.

---

## 10. Ratings Assessment (1 to 10)

| Strategy | Rating | Description & Rationale |
|---|---|---|
| **1. Solidity** | **7 / 10** | Well-designed layered architecture with clear separation of concerns (API ➔ Service ➔ Manager ➔ Model). The database schemas are highly comprehensive. However, the system suffers from critical integration bugs (e.g. duplicate profile creation) that crash basic user generation. |
| **2. Stability** | **6 / 10** | The backend contains coding syntax flaws (like constructors named `__int__` instead of `__init__`) and recursive save intercept crashes on `AuditLog.delete()` which will result in runtime exceptions. |
| **3. Security** | **4 / 10** | Several high-severity vulnerabilities were identified: complete bypass of SAML response signature verification, incorrect query field mappings in IP-based lockout limits, and a lack of active access-token revocation during logout. |
| **4. CIA Triad** | **5 / 10** | **Confidentiality:** Compromised in the WebSocket presence layer, which leaks online user lists globally across all tenants due to shared cache querying. <br>**Integrity:** High due to DB unique constraints, but logging can crash during soft deletes.<br>**Availability:** Good rate-limiting structure, but easily bypassed on IP lockout. |
| **5. Production Risk** | **8 / 10** | **High Risk.** Deploying this code without modifications will break registration, tenant onboarding, and user invite workflows because profile/preference creation signals conflict with service logic, throwing database IntegrityErrors. |
| **6. Portability & Roles** | **7 / 10** | Well-structured hierarchical permission classes. However, `client_admin` is restricted from assigning any predefined system roles (like `staff` or `supervisor`), which blocks user management for tenants. |
| **7. Enterprise Scaling** | **6 / 10** | Efficient recursive CTE implementations for hierarchy chains. However, bulk user imports process rows sequentially inside a loop (calling `user.save()`), causing poor scaling for large user counts. SSO flows also lack tenant mapping configuration. |

---

## 11. Critical Vulnerabilities & Bugs Found

Here are the critical security issues and bugs discovered during the technical review of the `accounts` codebase:

### ⚠️ Critical Security Vulnerabilities

#### 1. SAML Authentication Signature Bypass (Severity: Critical / 10/10)
In [saml.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/sso/saml.py#L32-L51), the `process_saml_response` method decodes base64 XML assertions and extracts attributes directly without performing any cryptographic signature validation:
```python
    def process_saml_response(self, saml_response: str, tenant_id: str, request=None) -> Tuple[Optional[User], Optional[str]]:
        try: 
            decode = base64.b64decode(saml_response).decode('utf-8')
            root = ET.fromstring(decode)
            ...
            email = user_info.get('email')
            user = self._get_or_create_user(email, user_info, tenant_id)
            return user, None
```
**Impact:** An attacker can craft a fake SAML XML response asserting they possess any email address (e.g. a superadmin), and log in successfully.

#### 2. Cross-Tenant Data Leak in WebSocket Presence (Severity: High / 8.5/10)
In [presence.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/consumers/presence.py#L81-L94), the presence consumer retrieves online users using a global cache pattern match:
```python
    @database_sync_to_async
    def get_online_users(self):
        online_users = []
        keys = cache.keys('user_presence:*') # Fetches all online users globally
        for key in keys:
            ...
        return online_users
```
**Impact:** When a user connects to the presence socket, they receive a list of *all* online users on the server, leaking user IDs and statuses across tenants.

#### 3. Broken IP-Based Rate Limiting (Severity: Medium / 6.5/10)
In [authentication.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L221-L230), the IP-based failed login check queries `LoginAttempt.get_failure_count` using the IP address:
```python
        if LoginAttempt.get_failure_count(ip_address, minutes=window) >= ip_limit:
```
But `LoginAttempt.get_failure_count` is defined as:
```python
    @classmethod
    def get_recent_attempts(cls, identifier, minutes=15):
        return cls.objects.filter(identifier=identifier, attempted_at__gte=cutoff)
```
**Impact:** The query filters the `identifier` column (which stores email/username) by the IP address string, returning zero records. This makes IP-based rate limiting ineffective, allowing brute-force attacks from single IPs.

#### 4. JWT Access Token Revocation Gap (Severity: Medium / 5.5/10)
During logout, `jwt_service.blacklist_token` adds the refresh token's JTI to `SessionBlacklist`. However, access tokens are not revoked or checked against the blacklist during standard request validation, allowing access tokens to remain valid until expiry.

---

### 🛠️ Execution Blocks & Crashes (Bugs)

#### 1. IntegrityError in User Creation, Onboarding, and Bulk Imports
When a user is saved in `UserRegistrationService.register_user` ([user_registration.py:L87](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/user_registration.py#L39-L47)), the `user_post_save` signal ([signals.py:L53-L60](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/signals.py#L53-L60)) is triggered and creates a `Profile` and `UserPreference` via `get_or_create`.
Immediately after, the service executes:
```python
            Profile.objects.create(user=user, tenant_id=tenant_id)
            UserPreference.objects.create(user=user, tenant_id=tenant_id)
```
**Impact:** Since `user` is a `OneToOneField`, attempting to insert a duplicate raises an `IntegrityError` in PostgreSQL. This causes all user signups, tenant registrations, and CSV bulk imports to fail.

#### 2. Class Constructor Typo (`__int__` vs `__init__`)
In [tenant_access.py:L8-L10](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/tenant_access.py#L8-L10):
```python
class TenantAccessService:
    def __int__(self): # Typo! Should be __init__
        self.cache_prefix = 'tenant_access:'
```
**Impact:** Python does not execute this code on instantiation. Any subsequent call to `set_current_tenant` raises `AttributeError: 'TenantAccessService' object has no attribute 'cache_prefix'`.

#### 3. Infinite Recursion / PermissionError in AuditLog Deletion
In [audit.py:L115-L129](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/models/audit.py#L115-L129):
```python
    def save(self, *args, **kwargs):
        if not self._state.adding and self.is_immutable:
            raise PermissionError("Cannot modify immutable audit log")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.is_immutable:
            self.is_deleted = True
            self.save(update_fields=['is_deleted', 'deleted_at']) # Triggers save()
```
**Impact:** Calling `delete()` on an immutable log triggers `save()`, which raises a `PermissionError` because it's not a new record (`adding` is False) and it's marked immutable. This prevents soft deletion of audit logs.

#### 4. Shared Tenant Context Cache Key
In `TenantAccessService.set_current_tenant` ([tenant_access.py:L51-L57](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/authorization/tenant_access.py#L51-L57)), the cache key is set to a static string:
```python
    def set_current_tenant(self, user: User) -> None:
        cache_key = f'{self.cache_prefix}current' # Resolves to 'tenant_access:current'
        cache.set(cache_key, str(user.tenant_id), timeout=3600)
```
**Impact:** If used concurrently, requests will overwrite this shared key, leading to tenant leakage. Request lifecycles should use the thread-local context or request variables instead.

---

## 12. Enterprise Level Recommendations

To make the `accounts` app production and enterprise-ready, implement the following improvements:

### 1. Upgrade SSO Signatures
Integrate a XML security library (like `signxml` or `python3-saml`) to load the tenant's IdP certificate and verify SAML assertion signatures before extracting attributes.

### 2. Streamline Profile Creation
Remove explicit `Profile.objects.create` and `UserPreference.objects.create` statements from the registration, bulk import, and tenant onboarding services. Rely entirely on the `post_save` signals to handle this.

### 3. Implement Database-Level Bulk Imports
Optimize [bulk.py](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/bulk.py) to use `bulk_create` for database inserts:
```python
# Propose using bulk_create and disabling signals temporarily during bulk imports
with transaction.atomic():
    users = User.objects.bulk_create(user_objects)
    Profile.objects.bulk_create([Profile(user=u, tenant_id=tenant_id) for u in users])
    UserPreference.objects.bulk_create([UserPreference(user=u, tenant_id=tenant_id) for u in users])
```

### 4. Secure WebSocket Group Access
Filter online users in `PresenceConsumer.get_online_users` by the user's `tenant_id`:
```python
    @database_sync_to_async
    def get_online_users(self):
        # Only fetch presence keys belonging to users of the same tenant
        # Requires modifying the cache key to include tenant context: user_presence:{tenant_id}:{user_id}
```

### 5. Correct Lockout Queries
Update `get_failure_count` in `LoginAttempt` to query the `ip_address` column when checking IP limits:
```python
    @classmethod
    def get_ip_failure_count(cls, ip_address, minutes=15):
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return cls.objects.filter(ip_address=ip_address, result=cls.FAILURE, attempted_at__gte=cutoff).count()
```

---

## 13. My Honest Take

The `accounts` app is well structured and follows robust security standards (e.g. password histories, MFA lockout, encrypted TOTP secrets, and recursive CTE paths). 

However, the presence of critical bugs (such as SAML validation gaps, class typos, broken IP lockout queries, and duplicate profile creation) suggests the module has not been fully verified through integration tests.

Applying the recommendations outlined in this report will improve the stability, security, and scalability of the Falcon authentication layer for enterprise deployments.
