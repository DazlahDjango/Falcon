# Falcon PMS KPI App — Implementation Status & Security Baseline

**Document purpose:** Engineering truth for the KPI app (aligned with Config and Accounts stabilization). Maps backend, API, real-time, frontend, cross-app real data (users, departments, organisation), and CIA alignment.

**Related docs:** `Docs/KPIs/pendings` (client training narrative), `apps/kpi/`, `frontend/src/components/kpi/`

**Last updated:** May 2026

---

## Executive summary

The KPI app is **functionally broad** (definitions, targets, phasing, actuals, validation, scores, cascade, dashboards, WebSocket consumers, Celery tasks). Gaps vs training doc and vs Config/Accounts standard:

| Area | Backend | Frontend | Real-time |
|------|---------|----------|-----------|
| KPI CRUD & frameworks | Strong | Wizard + lists | Partial |
| Targets & phasing | Strong | Implemented | On score/actual signals |
| Actuals & validation | Strong | Queues + forms | Wired (Phase A start) |
| Dashboards (4 roles) | Strong | 4 dashboard UIs | WS consumers exist |
| Users / departments in forms | FK on models | **Was text/fake paths** → **reference-data API** |
| Central KPI system settings | **Added** `KpiSystemSettings` | **Operations console** `/kpi/settings` |
| Unified event broadcaster | **Added** `KPIEventBroadcaster` | Hooks exist (`useScoreUpdates`) |

**Strategy:** Real data first (users, departments from Accounts + Structure) → Integrity (settings + audit) → Availability (realtime broadcaster + WS) → Confidentiality (tenant RBAC).

---

## 1. Cross-app real data (users, departments, organisation)

### Model layer (already correct)

| Entity | KPI usage | Source app |
|--------|-----------|------------|
| `accounts.User` | `KPI.owner`, targets, actuals, scores | Accounts |
| `structure.Department` | `KPI.department` | Structure |
| `structure.Employment` / `ReportingLine` | Manager for validation WS | Structure |
| Tenant | `tenant_id` on all `BaseKPIModel` | Accounts / Tenant |

### Gaps fixed (May 2026)

| Issue | Fix |
|-------|-----|
| KPI create: department was free-text | `useKpiReferenceData` + department `<select>` in `KPICreateStep1` |
| Cascade wizard: `fetch('/organisations/departments/')` | Same hook → `GET /api/v1/kpis/reference-data/?include=departments` |
| `KPIFormFields` department text input | Department dropdown when `departments` prop passed |
| Manager lookup in signals used wrong FK | `_manager_user_id_for_employee()` via `Employment` + `ReportingLine` |

### Reference data API

`GET /api/v1/kpis/reference-data/?include=users,departments`

Returns tenant-scoped active users and departments from live DB (not fixtures).

---

## 2. Platform configuration

### Canonical defaults

`apps/kpi/default_kpi_system_settings.py` — validation deadlines, calculation flags, cascade rules, notifications, realtime toggles.

### Persisted singleton

| Model | API |
|-------|-----|
| `KpiSystemSettings` | `GET/PATCH /api/v1/kpis/system-settings/` |
| Reset | `POST /api/v1/kpis/system-settings/reset/` |

Service: `KpiSettingsService` (cache, merge, version bump).

Command: `python manage.py seed_kpi_settings [--reset]`

---

## 3. Real-time (Phase A — broadcaster)

### `KPIEventBroadcaster`

Sync `group_send` wrapper (no broken `asyncio.create_task` in Django signals).

| Event | Groups | Trigger |
|-------|--------|---------|
| `score_update` | `user_{id}`, `scores_{id}`, `manager_{id}` | `Score` post_save |
| `validation_update` | `user_{id}`, `validation_{supervisor}` | Actual status change |
| `actual_submitted` | manager + user | Actual `PENDING` |
| `organization_health` | `executive_{tenant}` | Analytics tasks (extend) |
| `red_alert` | executive + tenant | Red alert tasks (extend) |

Respects `KpiSettingsService.get_section('realtime')`.

### WebSocket routes (`apps/kpi/routing.py`)

| Path | Consumer |
|------|----------|
| `ws/kpi/dashboard/{user_id}/` | `KPIDashboardConsumer` |
| `ws/kpi/team/{manager_id}/` | `KPITeamConsumer` |
| `ws/kpi/executive/{tenant_id}/` | `KPIExecutiveConsumer` |
| `ws/kpi/validation/{user_id}/` | `KPIValidationConsumer` |
| `ws/kpi/scores/{user_id}/` | `KPIScoreConsumer` |
| `ws/kpi/notifications/{user_id}/` | `KPINotificationConsumer` |

Frontend: `frontend/src/services/websocket/kpi.websocket.js`, hooks under `hooks/kpi/useWebSocket/`.

`RealtimeDashboard` class now delegates to `KPIEventBroadcaster` for backward compatibility.

---

## 4. API surface (inventory)

Base: `/api/v1/kpis/`

| Domain | Key endpoints |
|--------|----------------|
| Framework | `sectors/`, `frameworks/`, `categories/`, `templates/` |
| Definitions | `kpis/`, weights, linkages, dependencies |
| Targets | `targets/`, `monthly-phasing/` |
| Actuals | `actuals/`, `evidence/`, adjustments |
| Validation | `validations/`, `rejection-reasons/`, `escalations/` |
| Scores | `Scores/`, `aggregated-scores/`, `traffic-lights/` |
| Cascade | `cascade-maps/`, `cascade-rules/` |
| Dashboards | `dashboard/individual|manager|executive|champion/` |
| Bulk | `bulk/kpi-upload/`, `actual-upload/`, `target-upload/` |
| Analytics | `kpi-summaries/`, `department-rollups/`, `organization-health/` |
| **New** | `reference-data/`, `system-settings/` |

Nested users: `/api/v1/kpis/users/` (read-only user KPI data).

Structure org data: use `/api/v1/structure/departments/` (not `/organisations/...`).

Accounts users: `/api/v1/users/` or KPI `reference-data`.

---

## 5. Training doc (`pendings`) vs code — snapshot

| Topic | Status | Notes |
|-------|--------|-------|
| 6 KPI types | Achieved | Model `KPI.KPI_TYPES` |
| 3-step wizard | Achieved | `KPICreate` steps; department now real |
| Frameworks / sectors / categories | Achieved | API + fixtures |
| Monthly phasing | Achieved | `MonthlyPhasing`, lock on cycle |
| Target cascade | Achieved | `TargetCascader`; departments from API |
| Validation workflow | Achieved | Approve/reject/escalate |
| Real-time dashboards | Partial | WS + signals; ensure Redis/channels in prod |
| Bulk CSV import | Achieved | Bulk views |
| 40+ reports | Partial | Core exports + analytics live; see `report_catalog.py` registry |
| Mobile / offline | Not verified | Out of scope unless PWA exists |
| MFA / SSO | Accounts app | KPI inherits auth only |

---

## 6. CIA triad

| Pillar | Current | Target |
|--------|---------|--------|
| **Confidentiality** | Tenant middleware, KPI permissions, JWT | Field-level export controls; audit on settings change |
| **Integrity** | History models, validation before approve, phasing lock | `KpiSystemSettings` versioning; no post-lock target edits |
| **Availability** | Celery calc queue, WS dashboards | Broadcaster + health; degrade gracefully if channel layer down |

---

## 7. Recommended phases (mirror Config / Accounts)

### Phase A — Baseline (started May 2026)

- [x] `default_kpi_system_settings.py` + `KpiSystemSettings` + `KpiSettingsService`
- [x] `KPIEventBroadcaster` + signal wiring (score, actual)
- [x] `GET /kpis/reference-data/` for users + departments
- [x] Frontend: real department selects (create, cascade, form fields)
- [ ] `python manage.py migrate kpi` on all environments
- [ ] Wire remaining events (cascade complete, red alert, KPI definition change)

### Phase B — KPI Operations Console (May 2026)

- [x] Route `/kpi/settings` — validation, calculation/cascade, realtime toggles (super admin)
- [x] `useKpiSystemSettings` + `settings.service.js` → `GET/PATCH /kpis/system-settings/`
- [x] Sidebar link “KPI Operations” for super admin
- [ ] Tenant KPI policy overrides (optional `KpiTenantSettings`)
- [x] Validation queue live refresh via `KPIRealtimeProvider` + `validationRefreshToken`

### Phase C — Real-time hardening (May 2026)

- [x] `KPIRealtimeProvider` in `providers/index.jsx` (dashboard + validation + notifications WS on `/kpi/*`)
- [x] `kpiRealtimeSlice` + `GlobalKpiBanner` in `MainLayout`
- [x] `GET /kpis/validations/pending-summary/` + `pending_count` on validation WS payloads
- [x] Dashboard/validation queue refresh on WS events; `IndividualDashboard` uses shared context scores
- [ ] Fix `KPIAdminConsumer` metrics stream (optional)

### Phase D — Reports & analytics truth (May 2026)

- [x] `LiveAnalyticsService` (`apps/kpi/services/analytics/live_analytics.py`) — live rollups/health when MVs empty; department names from `structure.Department`
- [x] `PHASE_D_REPORT_REGISTRY` (`report_catalog.py`) — maps training-doc report names to endpoints
- [x] Executive dashboard: `build_executive_dashboard()` + fixed `tenant_id` in `ExecutiveDashboardView` (was passing `user.id`)
- [x] `GET /kpis/organization-health/` + `.../current/` — live-backed health for executives
- [x] Department rollups API enriches MV rows; live fallback when `department_rollup_mv` empty
- [x] KPI summaries live fallback from scores when `kpi_summary_mv` empty
- [x] Report export: `pdf`/`excel` performance + `csv` (`validation_compliance`, `red_alerts`, `department_summary`)
- [x] Frontend: `executiveDashboardMapper`, real export downloads, KPI report `health_status` filter fix
- [ ] Scheduled email reports / Power BI connectors (out of scope)

---

## 8. Key file reference

| Area | Path |
|------|------|
| Defaults | `apps/kpi/default_kpi_system_settings.py` |
| Settings service | `apps/kpi/services/settings/kpi_settings_service.py` |
| Broadcaster | `apps/kpi/services/realtime/event_broadcaster.py` |
| Live analytics | `apps/kpi/services/analytics/live_analytics.py` |
| Report registry | `apps/kpi/services/report_catalog.py` |
| Reference API | `apps/kpi/api/v1/views/reference_data.py` |
| Signals | `apps/kpi/signals.py` |
| Consumers | `apps/kpi/consumers.py` |
| Frontend hook | `frontend/src/hooks/kpi/useReferenceData.js` |
| WS client | `frontend/src/services/websocket/kpi.websocket.js` |

---

## 9. Operations

```bash
python manage.py seed_kpi_settings
python manage.py migrate kpi
python manage.py check kpi
```

Ensure **Redis** (or configured channel layer) is running for WebSocket push in development and production.

---

## Document history

| Version | Change |
|---------|--------|
| v1 | Initial KPI assessment + Phase A foundation (settings, broadcaster, reference data) |
| v2 | Phase B operations console + Phase C realtime provider, banner, pending summary API |
| v3 | Phase D live analytics, executive health truth, department names, report export registry |
