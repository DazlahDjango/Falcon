# Falcon PMS Tenant App — Implementation Status & Security Baseline

**Document purpose:** Engineering truth for the Tenant app (aligned with Accounts, Config, and KPI stabilization). Covers multi-tenancy, live resource sync, real-time, CIA alignment, and Structure dependency.

**Related docs:** `Docs/Tenant/pendings.mmd`, `apps/tenant/`, `apps/structure/`

**Last updated:** May 2026

---

## Executive summary

The Tenant app is **operationally central**: provisioning, isolation, domains, backups, quotas, and WebSocket status. Stabilization adds a **canonical settings singleton**, **live cross-app resource reconciliation**, and **unified Channels broadcasting** (replacing stale counter fields on `Client`).

| Area | Backend | Frontend | Real-time |
|------|---------|----------|-----------|
| Tenant CRUD & provisioning | Strong | Implemented | WS provisioning consumer |
| Resource quotas | TenantResource model | Usage/resources pages | **Live sync** + quota WS |
| Platform settings API | **Added** `TenantSystemSettings` | **Operations console** `/tenants/platform-settings` |
| Cross-app counts | **Added** `ResourceSyncService` | Reference-data API | `TenantEventBroadcaster` |
| CIA registry metadata | In `configs` `V1_APP_DEFINITIONS` | App registry UI | — |

**Strategy:** Real counts first (Users → Accounts, Departments → Structure, KPIs → KPI) → Integrity (settings + versioned policy) → Availability (WS status/quota) → Confidentiality (super-admin settings, tenant isolation).

---

## 1. Cross-app real data (quota integrity)

| Resource | Source app | Sync |
|----------|------------|------|
| `users` | `accounts.User` | `ResourceSyncService.count_live_usage()` |
| `departments` | `structure.Department` | Same + structure signals |
| `kpis` | `kpi.KPI` | Same + KPI create signal |
| `concurrent_sessions` | `accounts.UserSession` | Same |

Triggers: user create/delete (Accounts), department save/delete (Structure), KPI create, `POST .../sync-resources/`, usage-summary read when `reconcile_on_usage_read` is enabled.

API: `GET /api/v1/tenant/reference-data/?tenant_id=&include=users,departments,kpis,sessions`

---

## 2. Platform configuration

- Defaults: `apps/tenant/default_tenant_system_settings.py`
- Model: `TenantSystemSettings` (`tenant_system_settings`)
- Service: `TenantSettingsService` (cache, merge, version)
- API: `GET/PATCH /api/v1/tenant/system-settings/`, `POST .../reset/`
- Command: `python manage.py seed_tenant_settings [--reset] [--sync-resources]`

---

## 3. Real-time (`TenantEventBroadcaster`)

| Event | Group | Trigger |
|-------|-------|---------|
| `tenant_status_changed` | `tenant_{id}_status` | Client status change |
| `quota_warning` | `tenant_{id}_status` | TenantResource ≥ threshold |
| `resource_usage_updated` | `tenant_{id}_status` | After resource sync |
| `policy_updated` | `tenant_system` | System settings PATCH |

WS: `ws/tenant/{tenant_id}/status/` (`TenantStatusConsumer` — now returns `live_counts` + `usage`)

---

## 4. CIA alignment (with Structure)

| Pillar | Tenant | Structure (dependency) |
|--------|--------|------------------------|
| **Confidentiality** | Schema/DB isolation, super-admin settings | Hierarchy access + scope enforcer |
| **Integrity** | Versioned settings, live quota sync | Cycle detection, audit change log |
| **Availability** | Critical tier in app registry; WS status | High tier; org event WS |

Structure changes **must** sync department quotas on tenant dashboards — wired in `apps/structure/signals.py`.

---

## 5. Commands & migrations

```bash
python manage.py migrate tenant
python manage.py seed_tenant_settings
python manage.py seed_tenant_settings --sync-resources
```

Migration: `tenant.0004_tenant_system_settings`

---

## 6. Remaining / follow-up

- [ ] Email notifications for quota (optional `notifications` app)
- [ ] Per-tenant policy overrides (like Accounts `TenantPreference` pattern)
- [ ] Storage MB live sync from object storage metrics
- [ ] Full structure Django migration history if org tables lack migrations in your environment
