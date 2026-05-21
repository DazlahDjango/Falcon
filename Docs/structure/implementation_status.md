# Falcon PMS Structure App — Implementation Status & Security Baseline

**Document purpose:** Engineering truth for the Organisation Structure app, paired with Tenant stabilization. Covers hierarchy, live org events, reference data, settings, and CIA alignment.

**Related docs:** `Docs/structure/pending.md` (UI backlog), `Docs/structure/architecture.md`, `Docs/Tenant/implementation_status.md`

**Last updated:** May 2026

---

## Executive summary

Structure is **data-rich** (departments, teams, positions, employments, reporting lines, cost centers, locations). Stabilization adds **platform settings**, **Channels-first org events** (alongside legacy Redis publish), **reference-data API**, and **tenant quota sync** when org entities change.

| Area | Backend | Frontend | Real-time |
|------|---------|----------|-----------|
| Org CRUD & hierarchy | Strong | Many pages (see pending.md) | `OrgEventsConsumer` |
| Dashboard overview | Live DB counts | StructureDashboard | Partial |
| Platform settings | **Added** `StructureSystemSettings` | **Operations console** `/app/structure/settings` |
| Event transport | **StructureEventBroadcaster** + EventPublisher | structureWebSocket service | Channels groups `org_events_{tenant}` |
| Tenant quotas | Sync on dept create/delete | — | Triggers `ResourceSyncService` |

---

## 1. Cross-app real data

| Consumer | API | Data |
|----------|-----|------|
| KPI forms | `/api/v1/kpis/reference-data/` | Users + departments |
| Tenant quotas | `ResourceSyncService` | Department counts |
| Structure UI | `GET /api/v1/structure/reference-data/?include=counts,departments,users` | Live tenant-scoped lists |

---

## 2. Platform configuration

- Defaults: `apps/structure/default_structure_system_settings.py`
- Model: `StructureSystemSettings`
- Service: `StructureSettingsService`
- API: `GET/PATCH /api/v1/structure/system-settings/`, `POST .../reset/`
- Command: `python manage.py seed_structure_settings [--reset]`

---

## 3. Real-time

`EventPublisherService` now delegates to `StructureEventBroadcaster` when `sync.publish_org_events` and `realtime.use_channels_primary` are enabled.

| Event | Handler | Trigger |
|-------|---------|---------|
| `department_change` | `department_change` | Department signals |
| `team_change` | `team_change` | Team signals |
| `employment_change` | `employment_change` | Employment signals |

WS routes: `apps/structure/routing.py` (`ws/structure/{tenant_id}/events/`)

---

## 4. CIA alignment

| Pillar | Implementation |
|--------|----------------|
| **Confidentiality** | `HierarchyAccessEnforcer`, `ScopeEnforcerService`, `DataFirewallService` |
| **Integrity** | Cycle detection, block delete with children, versioned settings |
| **Availability** | Cache warmer invalidation; WS org events |

Registry: `structure` in `V1_APP_DEFINITIONS` (priority 2, depends on tenant for quotas).

---

## 5. Tenant dependency

- Department create/update/delete → `ResourceSyncService.sync_tenant` (tenant quota integrity).
- Provisioning may seed structure when `tenant.provisioning.seed_default_structure` is true.

---

## 6. UI backlog

See `Docs/structure/pending.md` for pagination/filters on Team, Position, CostCenter, etc.

---

## 7. Commands

```bash
python manage.py migrate structure
python manage.py seed_structure_settings
```

Note: If structure org tables already exist without migration history, coordinate `migrate` / `--fake-initial` with your DBA before applying `0001_structure_system_settings`.
