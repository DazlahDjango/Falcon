# 🦅 Falcon KPI System — Full Technical Findings Report
> **Date:** 2026-07-14  
> **Reviewed By:** Antigravity AI  
> **Scope:** `apps/kpi/` — Models, Managers, Engine, Services, Consumers, Tasks, Signals, API (v1)  
> **Isolation Mechanism:** `tenant_id` UUID field on every model (BaseKPIModel)

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Database & Models](#2-database--models)
3. [Managers Layer](#3-managers-layer)
4. [Engine Layer](#4-engine-layer)
5. [Services Layer](#5-services-layer)
6. [Signals](#6-signals)
7. [Tasks (Celery)](#7-tasks-celery)
8. [WebSocket Consumers](#8-websocket-consumers)
9. [API Layer (v1)](#9-api-layer-v1)
10. [Module Flow Diagrams](#10-module-flow-diagrams)
    - [KPI Module Flow](#101-kpi-module-flow)
    - [Categories Flow](#102-categories-flow)
    - [Cascading Flow](#103-cascading-flow)
    - [Targets & Validations Flow](#104-targets--validations-flow)
    - [Calculations Flow](#105-calculations-flow)
    - [Analytics Flow](#106-analytics-flow)
11. [User Role Flows](#11-user-role-flows)
    - [Staff Flow](#111-staff-flow)
    - [Supervisor / Manager Flow](#112-supervisor--manager-flow)
    - [Executive Flow](#113-executive-flow)
    - [Dashboard Champion Flow](#114-dashboard-champion-flow)
12. [Security Ratings](#12-security-ratings)
13. [Enterprise Readiness Assessment](#13-enterprise-readiness-assessment)
14. [Issues, Gaps & Bugs Found](#14-issues-gaps--bugs-found)
15. [My Honest Take](#15-my-honest-take)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FALCON KPI SYSTEM                         │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  models/ │managers/ │  engine/ │services/ │   api/v1/       │
│  (DB)    │  (QS)    │  (CALC)  │  (BIZ)   │ (HTTP/WS)       │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│             signals.py │ tasks/ │ consumers.py               │
│         (Event Bus)    │(Async) │ (WebSocket)                │
└────────────────────────────────────────────────────────────-┘
```

The system follows a clean layered architecture:
- **Models** — define the data, constraints, and DB indexes
- **Managers** — encapsulate all queryset logic (tenant-aware at base level)
- **Engine** — pure calculation logic (calculators, aggregators, cascade engine, traffic lights, trend analyzer)
- **Services** — orchestrate cross-model business operations (KPI CRUD, target management, validation workflow, dashboards)
- **Signals** — react to model lifecycle events (cache invalidation, trigger async tasks, broadcast WebSocket events)
- **Tasks** — async Celery workers for calculations, notifications, reports, backups
- **Consumers** — Django Channels WebSocket consumers (per role)
- **API** — DRF REST API with nested routers, permissions, throttles, filters

**Tenant Isolation** is done using a UUID `tenant_id` column that is:
- On every model via `BaseKPIModel`
- Enforced at manager level via `TenantAwareManager.get_queryset()` using `threading.current_thread().current_tenant_id`
- Validated in engine methods (e.g., `CascadeEngine.cascade_organization_target` uses `.get(id=..., tenant_id=self.tenant_id)`)
- Validated explicitly in `validators.py` via `validate_tenant_isolation()`

---

## 2. Database & Models

### 2.1 BaseKPIModel (`models/base.py`)
Every KPI model inherits this abstract base:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUIDField (PK) | Non-sequential, safe, non-guessable |
| `tenant_id` | UUIDField (indexed) | Tenant isolation key |
| `created_at` | DateTimeField | Audit |
| `updated_at` | DateTimeField | Audit |
| `created_by` | FK → User | Who created |
| `updated_by` | FK → User | Who last updated |

Also defined: `SoftDeleteModel` (is_deleted, deleted_at, deleted_by) and `TimeStampedModel`.

---

### 2.2 `KPICategory` (`models/framework.py`)
- Hierarchical (self-referential FK: `parent`)
- 7 category types: FINANCIAL, IMPACT, OPERATIONAL, CUSTOMER, INTERNAL, GROWTH, COMPLIANCE
- Unique: `[tenant_id, code]`
- Managed by `KPICategoryManager`
- Tree-fetching via `get_tree()` with `prefetch_related('children__children')`

---

### 2.3 `KPI` (`models/definition.py`) — Core Entity

| Field | Notes |
|---|---|
| `name`, `code` | Code must be unique per tenant |
| `kpi_type` | COUNT, PERCENTAGE, FINANCIAL, MILESTONE, TIME, IMPACT |
| `calculation_logic` | HIGHER_IS_BETTER / LOWER_IS_BETTER |
| `measure_type` | CUMULATIVE (YTD) / NON_CUMULATIVE (period only) |
| `formula` | JSONField — extensible |
| `owner` | FK to `accounts.User` — protected on delete |
| `department` | FK to `structure.Department` |
| `target_min` / `target_max` | Range guard with `clean()` validation |
| `metadata` | JSONField — general purpose |

Related models on definition.py:
- `KPIHistory` — full snapshot of every change (action, snapshot JSON, changes diff)
- `KPIWeight` — per-user KPI weight (0-100%) with date range + approver
- `StrategicLinkage` — connects KPIs to strategic objectives (PRIMARY/SECONDARY/INDICATOR/LAGGING)
- `KPIDependency` — maps DRIVER, OUTCOME, CORRELATED, CONSTRAINT relationships between KPIs

**`clean()` validation** is present for target_min > target_max and weight out of range. 

> ⚠️ **Bug Found:** `activate()` method: `self.updated_at = user` — should be `self.updated_by = user`. `updated_at` is auto-managed and should not be set manually.

---

### 2.4 `AnnualTarget` & `MonthlyPhasing` (`models/target.py`)

| Model | Purpose |
|---|---|
| `AnnualTarget` | Annual target per (KPI + User + Year) — unique per tenant |
| `MonthlyPhasing` | Monthly breakdown of annual target (1-12), with lock mechanism |
| `PhasingLock` | Locks entire fiscal cycle from modification |
| `TargetHistory` | Full audit log of target changes |

`MonthlyPhasing.is_locked` gate-keeps score calculation — the orchestrator **only picks up locked phasing targets**, which is the correct design choice.

---

### 2.5 `MonthlyActual` & Evidence (`models/actual.py`)

| Model | Purpose |
|---|---|
| `MonthlyActual` | Monthly actual data per (KPI + User + Year + Month) — PENDING → APPROVED/REJECTED/ADJUSTED |
| `ActualHistory` | Change log |
| `ActualAdjustment` | Adjustment request with its own approval flow |
| `Evidence` | Files/links/notes attached to actuals |

> ⚠️ **Bug Found:** `ActualAdjustment.approve()` calls `MonthlyActual.objects.create(...)` even when an APPROVED actual already exists. This will **violate the `unique_together` constraint** `[tenant_id, kpi, user, year, month]` since a record for that period already exists. Should use `update_or_create` or update the existing record's `actual_value` directly.

---

### 2.6 `ValidationRecord`, `Escalation` (`models/validation.py`)

| Model | Purpose |
|---|---|
| `ValidationRecord` | Supervisor's verdict on an actual: APPROVED / REJECTED / ESCALATED |
| `ValidationComment` | Threaded comments on validations (with `is_private` flag for supervisor-only visibility) |
| `RejectionReason` | Predefined rejection reason catalog |
| `Escalation` | Escalation chain: PENDING → REVIEWING → RESOLVED → CLOSED |

All linked to `MonthlyActual`. Escalation has `escalated_by` → `escalated_to` FKs for clean chain-of-command.

---

### 2.7 `Score`, `TrafficLight`, `Trend`, `AggregatedScore` (`models/calculation.py`)

| Model | Purpose |
|---|---|
| `Score` | Calculated score (0-100) per (KPI + User + Month + Year) |
| `TrafficLight` | GREEN (≥90) / YELLOW (≥50) / RED (<50), with `consecutive_red_count` |
| `Trend` | IMPROVING / DECLINING / STABLE / VOLATILE with 3-month and 6-month averages |
| `AggregatedScore` | Rollup at TEAM / DEPARTMENT / ORGANIZATION level |
| `CalculationLog` | Full calculation audit trail: duration_ms, traceback, records_affected |

---

### 2.8 Analytics Models (`models/analytics.py`)

| Model | Type | Purpose |
|---|---|---|
| `KPISummary` | `managed=False` | Backed by PostgreSQL materialized view `kpi_summary_mv` |
| `DepartmentRollup` | `managed=False` | Backed by `department_rollup_mv` |
| `OrganizationHealth` | `managed=False` | Backed by `organization_health_mv` |
| `RefreshTracker` | Regular model | Tracks when materialized views were last refreshed |

> ⚠️ **Risk:** Materialized views (`managed=False`) are referenced but their creation/refresh SQL is not in any migration visible from the code. If the database migrations don't include the raw SQL to create these views, a fresh deploy will have broken analytics.

---

### 2.9 `CascadeMap` & `CascadeRule` (`models/cascade.py`)

- `CascadeMap` links all levels: Organization → Division → Department → Section → Unit → Individual
- Has explicit `parent_target` / `child_target` generic FK pair for flexible cascades
- `CascadeRule` has 4 types: EQUAL_SPLIT, WEIGHTED (headcount), WEIGHTED_BY_BUDGET, CUSTOM
- `CascadeHistory` logs every cascade action with rollback support

---

## 3. Managers Layer

### Base Chain: `BaseManager → TenantAwareManager → SoftDeleteManager`

```
BaseManager
  └─ TenantAwareManager           # Auto-filters by tenant_id from thread-local
       └─ SoftDeleteManager       # Auto-filters is_deleted=False
            └─ KPIManager         # KPI-specific queries
            └─ ScoreManager       # Score analytics queries
            └─ AggregatedScoreManager
            └─ CascadeMapManager
            └─ CascadeRuleManager
            └─ AnnualTargetManager
            └─ MonthlyActualManager
            └─ ValidationRecordManager
            └─ EscalationManager
```

**Tenant isolation is thread-local** — the current tenant ID is set by middleware on the thread via `threading.current_thread().current_tenant_id`. This means every queryset, everywhere in the system, is automatically scoped to the current tenant without needing to pass `tenant_id` manually to every query.

**`KPIManager`** notable methods:
- `for_user_hierarchy(user)` — returns KPIs for user + their direct reports + their departments
- `with_recent_actuals(year, month)` — eager prefetch with `Prefetch`
- `needs_attention()` — KPIs not updated in X days

**`ScoreManager`** has sophisticated analytics:
- `get_top_performers()` / `get_bottom_performers()`
- `get_score_distribution()` — excellent/good/average/poor buckets
- `calculate_weighted_user_score()` — weighted average across KPI weights

> ⚠️ **Bug in `ScoreManager.calculate_weighted_user_score()`**: Filter uses `kpi__weights__for_user=user_id` — this field doesn't exist. Should be `kpi__weights__user_id=user_id`. Also `efective_from` is a typo for `effective_from`. This method will silently return 0 due to an empty queryset.

---

## 4. Engine Layer

### 4.1 `CalculationOrchestrator` (`engine/orchestrator.py`)
The central calculation controller. Entry point is `calculate_all_for_period(tenant_id, year, month, force)`:

```
calculate_all_for_period()
  → acquire Redis distributed lock (calc_lock:{tenant_id}:{year}:{month})
  → fetch all active users for tenant
  → for each user:
      calculate_user_period()
        → get user's KPIs with weights (date-range-aware)
        → for each KPI:
            → get locked monthly phasing target
            → get APPROVED monthly actual
            → select calculator by KPI type
            → calculate score (0-100)
            → upsert Score record
            → evaluate traffic light (GREEN/YELLOW/RED)
            → count consecutive RED months
  → aggregate period scores (team → dept → org)
  → log result to CalculationLog
```

**Distributed lock** uses `cache.add()` (Redis SET NX) with 300s timeout. Proper.

---

### 4.2 Calculators (`engine/calculators.py`)

| Calculator | Logic |
|---|---|
| `NumericCalculator` | `(actual/target) * 100` or `(target/actual) * 100`, clamped 0-100 |
| `PercentageCalculator` | Normalizes <1 values to %, clamped to 100 |
| `FinancialCalculator` | Allows scores > 100 for over-achievement |
| `MilestoneCalculator` | Binary: if actual ≥ 1 → 100%, else 0 |
| `TimeCalculator` | Lower actual = better. Penalizes over-target |
| `ImpactCalculator` | Scale-aware (adjusts for target ≤ 10) |

All extend `BaseCalculator` with ABC interface. Clean pattern.

> ⚠️ **Gap:** `PercentageCalculator` silently caps at 100. For some KPIs over-achievement is valid. Should be configurable like `FinancialCalculator`.

---

### 4.3 `TrafficLightEvaluator` (`engine/traffic_light.py`)
- Default thresholds: GREEN ≥ 90, YELLOW ≥ 50, RED < 50
- `TrendAnalyzer` — 3-month and 6-month moving averages with slope detection (linear regression manually implemented)
- `RiskPredictor` — rule-based risk scoring (HIGH/MEDIUM/LOW) with recommendations. `ml_enabled = False` — placeholder for future ML.

---

### 4.4 `HierarchyAggregator` (`engine/aggregator.py`)
Bottom-up aggregation: Individual → Unit → Department → Organization
- Uses weighted average for individual scores
- Falls back to simple average for teams/depts when no weights
- Detects consecutive RED via `TrafficLight` history per KPI per user

---

### 4.5 Cascade Engine (`engine/cascade/`)
- `CascadeEngine.cascade_organization_target()` — cascades from Org → Division → Dept → Section → Unit → Individual
- Supports 4 split rules: Equal, Weighted, Budget-Weighted, Custom
- Full rollback support: `rollback_cascade()` deletes all child targets + logs history
- Validates total contribution percentages via `CascadeValidator`

---

## 5. Services Layer

| Service File | Responsibility |
|---|---|
| `services/kpi.py` | KPICreator, KPIUpdater, KPIActivator, KPIDeactivator, bulk import |
| `services/target.py` | TargetService — create annual targets, manage phasing, phase lock |
| `services/actual.py` | ActualService — submit, approve, reject, adjust actuals |
| `services/validation.py` | ValidationService — validate, escalate, bulk approve |
| `services/calculation.py` | Wraps orchestrator, triggers calculations |
| `services/cascade.py` | Wraps CascadeEngine, triggers cascade tasks |
| `services/dashboard.py` | IndividualDashboard, ManagerDashboard, ExecutiveDashboard |
| `services/analytics/` | Live analytics, trends, health scores |
| `services/realtime/` | KPIEventBroadcaster — sends events to WebSocket groups |
| `services/report.py` | Report generation (CSV/PDF/Excel) |
| `services/audit.py` | Audit trail logging |
| `services/notifications.py` | Notification delivery (email, in-app, push) |
| `services/sync.py` | External data sync |
| `services/validator.py` | KPIValidator — cross-model validation |

**`KPIEventBroadcaster`** pushes real-time events to channel layer groups:
- `actual_submitted` → notifies manager group
- `validation_updated` → notifies user group
- `score_updated` → notifies user + manager groups

---

## 6. Signals

Signals wire model lifecycle events to async behavior cleanly:

| Signal | Model | Effect |
|---|---|---|
| `post_save` | `KPI` | Invalidates cache, syncs tenant, triggers recalculation if deactivated |
| `pre_save` | `KPI` | Captures `_changed_fields` diff for audit |
| `post_save/delete` | `KPIWeight` | Invalidates user dashboard cache, recalculates score, validates weight sum |
| `post_save` | `AnnualTarget` | Invalidates target cache, triggers aggregation update on approval |
| `post_save` | `MonthlyPhasing` | Triggers recalculation when phasing is locked |
| `post_save` | `MonthlyActual` | If APPROVED → triggers score calculation + red alert check. If PENDING → sends validation notification + real-time WS event |
| `post_save` | `ActualAdjustment` | Notifies on request; triggers recalc on approval |
| `post_save` | `ValidationRecord` | Sends notification, refreshes materialized views via `on_commit` |
| `post_save` | `Escalation` | Sends notification on create and on resolve |
| `post_save` | `Score` (×2) | Triggers traffic light update + aggregate update + WS broadcast; calculates trend and caches |
| `post_delete` | `KPI` | Cache invalidation + score/target cache pattern delete |
| `post_delete` | `MonthlyActual` | Triggers score recalculation |

> ⚠️ **Risk:** `cache.delete_pattern(f"kpi:score:{instance.id}:*")` — `delete_pattern` is a Redis-specific extension not supported by all cache backends. In a LocMemCache or Memcache environment this silently fails. Should be guarded.

> ⚠️ **Design Concern:** `score_post_save_trend_handler` — runs on every Score save (not just `created=True`). Heavy analysis on every recalculation cycle.

---

## 7. Tasks (Celery)

The task inventory is comprehensive. Organized into modules:

### Calculation Tasks (`tasks/calculations.py`)
- `calculate_kpi_score_task(user_id, year, month, force)` — per-user calculation
- `calculate_period_scores_task(tenant_id, year, month)` — full-period batch
- `update_traffic_light_task(score_id)` — updates single traffic light
- `update_aggregated_scores_task(tenant_id, year, month)` — rollup

### Notification Tasks (`tasks/notifications.py`) — 13 tasks
- Validation notifications (submitted, approved, rejected)
- Red alert checks (3+ consecutive RED months → escalation)
- Missing data reminders
- Threshold breach alerts
- Scheduled daily/weekly digests
- Bulk notifications
- Report generation (periodic, monthly, custom)
- External data sync
- Data quality validation
- Anomaly detection

### Dashboard Tasks (`tasks/dashboard.py`)
- `refresh_materialized_views_task` — refreshes PostgreSQL materialized views
- `precompute_dashboard_cache_task` — warm up caches

### Cascade Tasks (`tasks/cascade.py`)
- `cascade_organization_target_task` — async cascade execution

### Cleanup Tasks (`tasks/cleanup.py`)
- `cleanup_old_calculation_logs_task`
- `cleanup_expired_cache_task`

### Schedule Tasks (`tasks/schedules.py`)
- `scheduled_calculation_task` — runs on a cron
- `scheduled_reminder_task`
- `scheduled_red_alert_task`
- `create_in_app_notification_task`

### Backup Tasks (`tasks/backup.py`)
- `daily_backup_task`, `full_backup_task`, `archive_backup_task`, `cleanup_old_backups_task`

---

## 8. WebSocket Consumers

8 Consumers built with Django Channels (`AsyncWebsocketConsumer`):

| Consumer | Auth Gate | Channel Groups | Purpose |
|---|---|---|---|
| `KPIDashboardConsumer` | Authenticated user | `user_{id}`, `manager_{id}`, `tenant_{id}` | Main dashboard WS, role-aware |
| `KPIAdminConsumer` | `is_staff or is_superuser` | `kpi_admin` | System metrics stream (polls every 10s) |
| `KPITeamConsumer` | Manager of the team | `team_{manager_id}` | Team KPI feed for managers |
| `KPIExecutiveConsumer` | `EXECUTIVE/CEO/DIRECTOR` | `executive_{tenant_id}` | Org-wide feed |
| `KPINotificationConsumer` | Self or superuser | `notifications_{user_id}` | Notification push |
| `KPIScoreConsumer` | Self only | `scores_{user_id}` | Live score updates |
| `KPIValidationConsumer` | Self only | `validation_{user_id}` | Validation status |
| `KPIReportConsumer` | Self, superuser, or same tenant | `report_{report_id}` | Report generation progress |
| `KPIAnalyticsConsumer` | `EXECUTIVE/CEO/DIRECTOR` | `analytics_{tenant_id}` | Analytics stream (polls every 30s) |
| `KPIAlertsConsumer` | `MANAGER/EXECUTIVE/DASHBOARD_CHAMPION` | `alerts_{tenant_id}` | Red alerts + escalations |

> ⚠️ **Critical Bug in `KPIAdminConsumer.start_metrics_stream()`:** Uses `while True` with `asyncio.sleep(10)` inside the connect handler. This runs an **infinite loop that never exits** even after disconnection. Any exception breaks out, but a clean disconnect does NOT stop this loop. Will leak coroutines.

> ⚠️ **Same bug in `KPIAnalyticsConsumer.start_analytics_stream()`:** Same `while True` / `asyncio.sleep(30)` problem.

> ⚠️ **Security Note:** `KPINotificationConsumer` checks `str(self.user.id) != self.user_id and not self.user.is_superuser`. If `self.user` is unauthenticated (anonymous), accessing `.id` will raise `AttributeError`. Should check authentication first.

---

## 9. API Layer (v1)

### URL Structure
Full REST API with 139 lines of URL config, 30+ ViewSets, and nested routers:

```
/api/v1/kpi/
  categories/
  kpis/
  kpi-weights/
  strategic-linkages/
  kpi-dependencies/
  targets/
  monthly-phasing/
  actuals/
  evidence/
  actual-adjustments/
  validations/
  rejection-reasons/
  escalations/
  scores/
  aggregated-scores/
  traffic-lights/
  cascade-maps/
  cascade-rules/
  kpi-summaries/
  department-rollups/
  organization-health/
  kpi-history/
  actual-history/
  target-history/
  users/{user_pk}/kpis/
  users/{user_pk}/targets/
  users/{user_pk}/scores/
  users/{user_pk}/actuals/
  dashboard/individual/
  dashboard/manager/
  dashboard/executive/
  dashboard/champion/
  admin/overview/
  bulk/kpi-upload/
  bulk/actual-upload/
  bulk/target-upload/
  calculations/trigger/
  calculations/status/{task_id}/
  export/kpis/
  export/scores/
  export/reports/
  analytics/insights/
  analytics/predictions/
  analytics/export/
  analytics/heatmap/
  reports/custom/
  reference-data/
  system-settings/
  system-settings/reset/
  notifications/preferences/
```

### Permissions System

| Permission Class | Who It Allows |
|---|---|
| `IsAuthenticatedAndActive` | Any authenticated, active user |
| `IsManager` | superuser, super_admin, client_admin, executive, ceo, director, dashboard_champion, OR has direct reports |
| `IsExecutive` | superuser, executive, ceo, director |
| `IsDashboardChampion` | superuser, dashboard_champion, super_admin, client_admin |
| `CanCascadeTargets` | superuser, dashboard_champion, admin, OR has direct reports |
| `CanViewAuditLogs` | superuser, super_admin, client_admin, auditor |
| `IsFrameworkAdmin` | superuser, super_admin, client_admin |
| `IsOwnerOrReadOnly` | Owner of object (or read-only) |
| `HasKPIWritePermission` | executive, ceo, director, admins for writes; all for reads |
| `IsTenantMember` | User whose tenant_id matches request tenant |

> ⚠️ **Inconsistency:** `IsManager` grants manager-level access to `dashboard_champion` and `executive`, but the `has_permission` check uses `role.lower()` and `role.upper()` comparison on the same field — this could pass on both but redundant. Also: `IsManager` grants access to `dashboard_champion` while `IsDashboardChampion` is a separate class. This means `dashboard_champion` has manager-level API access which may be broader than intended.

### Filters
- `KPIListFilter` — name, code, type, logic, measure, category, owner, department, search
- `MonthlyActualListFilter` — filter by supervisor (auto-resolves direct reports), pending validation, missing data
- `ScoreListFilter` — filter by traffic light color
- `AnnualTargetListFilter` — filter by approval status

### Throttles (`api/v1/throttles.py`)
Present — rate limiting per role is defined.

---

## 10. Module Flow Diagrams

### 10.1 KPI Module Flow

```
[Admin/Executive/Champion]
        │
        ▼
  POST /api/v1/kpi/kpis/
        │
        ▼
  KPIViewSet → KPICreator.create()
        │
        ├─ validate_kpi_code()
        ├─ validate_kpi_name()
        ├─ validate_target_range()
        ├─ Check uniqueness [tenant_id + code]
        │
        ▼
  KPI.objects.create() → DB insert
        │
        ▼
  post_save signal → kpi_post_save_handler()
        │
        ├─ invalidate_kpi_cache(kpi_id)
        └─ ResourceSyncService.sync_tenant()
```

---

### 10.2 Categories Flow

```
  KPICategory (hierarchical, self-FK parent)
       │
       ├─ root_categories() → only parent=None
       ├─ get_tree() → prefetch children 2 levels
       └─ 7 type choices: FINANCIAL, IMPACT, OPERATIONAL, CUSTOMER, INTERNAL, GROWTH, COMPLIANCE

  Every KPI → ForeignKey(KPICategory, on_delete=SET_NULL)
```

---

### 10.3 Cascading Flow

```
[Dashboard Champion]
        │
        ▼
  POST /api/v1/kpi/cascade-maps/
        │
        ▼
  CascadeService → CascadeEngine.cascade_organization_target()
        │
        ├─ Fetch org AnnualTarget [tenant-scoped]
        ├─ Fetch CascadeRule (EQUAL_SPLIT/WEIGHTED/BUDGET/CUSTOM)
        ├─ CascadeValidator.validate_cascade()
        │       ├─ Verify contribution totals ≤ 100%
        │       └─ Verify entities exist
        │
        ├─ For each target entity:
        │       ├─ Calculate target_value via SplitRules
        │       └─ AnnualTarget.objects.create()
        │
        ├─ CascadeMap.objects.create() [maps hierarchy level]
        ├─ CascadeHistory.objects.create()
        └─ Return cascade_maps

  Rollback:
        cascade_engine.rollback_cascade(map_id)
          → deletes all child targets in a transaction
          → logs CascadeHistory(action='ROLLBACK')
```

---

### 10.4 Targets & Validations Flow

```
TARGETS:
[Champion/Admin]
  → POST /targets/ → AnnualTarget created
  → POST /monthly-phasing/ → MonthlyPhasing (12 months)
  → PATCH /monthly-phasing/{id}/lock/ → is_locked=True
     → Signal triggers score calculation

ACTUAL SUBMISSION:
[Staff]
  → POST /actuals/ → MonthlyActual (status=PENDING)
  → Signal: send_validation_notification_task.delay()
  → Signal: KPIEventBroadcaster.actual_submitted() → WS to manager

VALIDATION:
[Supervisor]
  → POST /validations/ → ValidationRecord (APPROVED/REJECTED/ESCALATED)
  → If APPROVED:
      → MonthlyActual.status = 'APPROVED'
      → Signal: calculate_kpi_score_task.delay()
      → Signal: send_red_alert_check_task.delay()
      → Signal: refresh_materialized_views_task.delay()
  → If REJECTED:
      → MonthlyActual.status = 'REJECTED'
      → Notification sent to staff
  → If ESCALATED:
      → Escalation.objects.create()
      → Escalation chain: escalated_by → escalated_to

ADJUSTMENT:
[Staff requests, Supervisor approves]
  → POST /actual-adjustments/ → ActualAdjustment(status=PENDING)
  → Supervisor PATCH → status=APPROVED
  → New MonthlyActual created with adjusted value [BUG: may violate unique]
  → Score recalculated
```

---

### 10.5 Calculations Flow

```
TRIGGER (Celery or Signal):
  calculate_kpi_score_task(user_id, year, month)
        │
        ▼
  CalculationOrchestrator.calculate_user_period()
        │
        ├─ Check if already calculated (skip unless force=True)
        ├─ Get active KPIWeights (date-range filtered)
        ├─ For each KPI+Weight:
        │       ├─ Get locked MonthlyPhasing target
        │       ├─ Get APPROVED MonthlyActual
        │       ├─ Select Calculator by kpi_type
        │       ├─ calculator.calculate(actual, target) → score (0-100)
        │       ├─ Score.objects.update_or_create()
        │       └─ TrafficLight.objects.update_or_create()
        │
        └─ Aggregate: Individual → Unit → Dept → Org
                └─ AggregatedScore.objects.update_or_create()

TRAFFIC LIGHT:
  score ≥ 90 → GREEN
  score ≥ 50 → YELLOW
  score < 50 → RED
  count consecutive RED → triggers escalation recommendations

TREND:
  Score.post_save signal → TrendAnalyzer.analyze([6 months of scores])
    → Moving average (3m and 6m)
    → Linear regression slope
    → Direction: IMPROVING / DECLINING / STABLE / VOLATILE
    → Cached: kpi:trend:{kpi_id}:{user_id} for 24h
```

---

### 10.6 Analytics Flow

```
[Materialized Views] ← refreshed by refresh_materialized_views_task
  kpi_summary_mv     → KPISummary model
  department_rollup_mv → DepartmentRollup model
  organization_health_mv → OrganizationHealth model

[Live Analytics Service]
  get_kpi_summaries() → reads from materialized views
  get_department_rollups()
  get_organization_health()

[Risk Predictions]
  RiskPredictor.predict_risk(kpi_id, user_id, scores)
    → rule-based: current score < 50 = red flag
    → 3 consecutive RED = HIGH risk
    → Returns: risk_level, probability, factors, recommendations

[Heatmap]
  PerformanceHeatmapView → Score data by month grid

[Export]
  KPIExportView → CSV/Excel export of KPIs
  ScoreExportView → Score data export
  ReportExportView → Full formatted reports
```

---

## 11. User Role Flows

### 11.1 Staff Flow

```
Staff User (role='staff')
      │
      ├─ Can see: Own KPIs, Own actuals, Own scores, Own dashboard
      │
      ├─ WebSocket: KPIDashboardConsumer (individual mode)
      │               KPIScoreConsumer
      │               KPIValidationConsumer
      │               KPINotificationConsumer
      │
      ├─ API access:
      │   GET  /dashboard/individual/       → IndividualDashboard
      │   POST /actuals/                    → Submit actual values
      │   GET  /actuals/?user=self          → View own actuals
      │   GET  /scores/?user=self           → View own scores
      │   GET  /targets/?user=self          → View own targets
      │   POST /evidence/                   → Upload evidence files
      │   GET  /kpis/                       → View assigned KPIs
      │   POST /actual-adjustments/         → Request value adjustment
      │
      └─ Cannot: Create/edit KPIs, Set targets, View others' data,
                 Access cascade, Access analytics, Access reports
```

---

### 11.2 Supervisor / Manager Flow

```
Supervisor (role='supervisor', has direct_reports)
      │
      ├─ Can see: Own + all direct reports' data
      │
      ├─ WebSocket: KPIDashboardConsumer (manager mode)
      │               KPITeamConsumer
      │               KPIAlertsConsumer
      │
      ├─ API access:
      │   GET  /dashboard/manager/           → ManagerDashboard
      │   GET  /actuals/?supervisor={id}     → All pending actuals (direct reports)
      │   POST /validations/                 → Approve/reject actuals
      │   POST /escalations/                 → Escalate to exec
      │   GET  /scores/?department={dept}    → Team scores
      │   GET  /traffic-lights/              → RED alerts for team
      │   GET  /users/{id}/actuals/          → Nested user actuals
      │   GET  /users/{id}/scores/           → Nested user scores
      │   GET  /kpi-history/                 → KPI change log
      │
      └─ Cannot: Create KPIs, Set org-level targets, Access executive analytics,
                 Cascade targets (unless also has cascadeTargets permission)
```

---

### 11.3 Executive Flow

```
Executive (role='executive'/'ceo'/'director')
      │
      ├─ Can see: Full organization — all users, all KPIs, all scores
      │
      ├─ WebSocket: KPIExecutiveConsumer
      │               KPIAnalyticsConsumer
      │               KPIAlertsConsumer
      │
      ├─ API access:
      │   GET  /dashboard/executive/         → ExecutiveDashboard
      │   GET  /organization-health/         → Org health scores
      │   GET  /department-rollups/          → Dept-level aggregates
      │   GET  /kpi-summaries/               → KPI-wide performance
      │   GET  /analytics/insights/          → Live analytics
      │   GET  /analytics/predictions/       → Risk predictions
      │   GET  /analytics/heatmap/           → Performance heatmap
      │   POST /kpis/                        → Create KPIs (HasKPIWritePermission)
      │   GET  /admin/overview/              → KPI admin overview
      │   GET  /export/*/                    → All exports
      │
      └─ Cannot: System settings, Super admin operations, User management
```

---

### 11.4 Dashboard Champion Flow

```
Dashboard Champion (role='dashboard_champion')
      │
      ├─ This is the KPI Operations role — owns the KPI framework
      │
      ├─ WebSocket: KPIAlertsConsumer
      │
      ├─ API access:
      │   GET  /dashboard/champion/          → ChampionDashboard
      │   POST /cascade-maps/                → CASCADE org targets down hierarchy
      │   POST /cascade-rules/               → Create cascade rules
      │   POST /monthly-phasing/{id}/lock/   → Lock phasing cycles
      │   GET  /kpi-history/                 → Full KPI audit trail
      │   GET  /actual-history/              → Actual change history
      │   GET  /target-history/              → Target change history
      │   GET  /system-settings/             → View KPI system settings
      │   POST /bulk/kpi-upload/             → Bulk KPI import
      │   POST /bulk/target-upload/          → Bulk target upload
      │   POST /calculations/trigger/        → Manual calculation trigger
      │
      └─ This role IS also granted IsManager access (as coded in IsManager perm)
         — Meaning they can also see team dashboards. Review if this is intentional.
```

---

## 12. Security Ratings

### Summary Table

| Security Dimension | Score | Rating |
|---|---|---|
| **Authentication** | 8/10 | 🟢 Strong |
| **Authorization / RBAC** | 7/10 | 🟡 Good but inconsistencies |
| **Tenant Isolation** | 8/10 | 🟢 Strong |
| **Input Validation** | 7/10 | 🟡 Good, gaps in model methods |
| **Audit Trail** | 9/10 | 🟢 Very Strong |
| **CIA — Confidentiality** | 7/10 | 🟡 Good |
| **CIA — Integrity** | 7/10 | 🟡 Good, some bugs |
| **CIA — Availability** | 6/10 | 🟡 Risks present |
| **WebSocket Security** | 6/10 | 🟡 Bugs present |
| **Secrets / Config** | N/A | Not reviewed (no source in scope) |

---

### Detailed Ratings

#### 🔐 Security: 7.5 / 10
**Strengths:**
- UUID primary keys — non-guessable, non-sequential
- Tenant isolation via `TenantAwareManager` (thread-local) + explicit DB-level constraints
- `tenant_id` on every model, unique_together includes `tenant_id`
- Role-based permissions with 10+ granular permission classes
- Audit trail: KPIHistory, ActualHistory, TargetHistory, CascadeHistory, CalculationLog — comprehensive
- Distributed lock on calculation prevents race conditions
- Soft delete preserves data
- Evidence file validation (type, size)
- WebSocket consumers authenticate on connect before accepting

**Weaknesses:**
- `TenantAwareManager` tenant isolation relies on thread-local state — if middleware fails to set it, ALL data leaks across tenants (silent failure)
- `IsManager` grants access to `dashboard_champion` — unexpected cross-role privilege escalation
- `KPINotificationConsumer` may AttributeError on anonymous WebSocket attempt
- `delete_pattern` cache operation not guarded against non-Redis backends

---

#### 🏛️ CIA Triad: 7 / 10

**Confidentiality (7/10):**
- Tenant isolation is architectural — good
- Role gates prevent cross-user data access
- WS consumers self-isolate by user group
- Risk: Thread-local tenant ID is global state on the thread — not request-local. Under async (ASGI) this could theoretically bleed if not set per-request correctly.

**Integrity (7/10):**
- DB constraints: unique_together on all key combinations, FK protected, clean() validators
- Transaction.atomic() used in cascade, orchestrator, adjustments
- `on_commit()` used correctly for post-transaction tasks
- Bug: `ActualAdjustment.approve()` can create duplicate actuals (integrity violation)
- Bug: `ScoreManager.calculate_weighted_user_score()` has typo — silently returns 0 instead of correct weighted score
- Bug: `KPI.activate()` sets `self.updated_at = user` (wrong field assignment)

**Availability (6/10):**
- Redis distributed lock prevents double-calculation ✅
- Materialized views exist for analytics performance ✅
- WS consumers have infinite `while True` loops that can leak coroutines ❌
- No retry policy documented for failed Celery tasks in scope
- Materialized view DDL may not be in migrations — fresh deploy risk

---

#### 🛡️ Stability: 7 / 10
- Solid foundation: clean layering, separation of concerns, typed function signatures
- Good error handling in orchestrator (try/except, logs traceback)
- `BulkOperationManager` handles batch failures gracefully (continue on error)
- Multiple discovered bugs that could manifest silently in production

---

#### 💎 Solidity: 7.5 / 10
- Rich feature set: 6 KPI types, cascading, phasing, validation workflow, escalation, trend analysis, risk prediction, materialized views
- Factory/strategy pattern in calculators (clean extensibility)
- `on_commit()` properly defers tasks to after transaction success
- `RefreshTracker` model monitors materialized view health
- Missing: test coverage assessment (tests.py exists but not deeply reviewed)

---

#### 🔥 Ease to Break in Deployment/Production: **Medium-High Risk (4 / 10 — 10 = hardest to break)**

| Risk | Likelihood | Impact |
|---|---|---|
| Thread-local tenant ID not set in async context | Medium | Critical (data leak) |
| Materialized views not created on fresh deploy | High | High (analytics broken) |
| `ActualAdjustment.approve()` duplicate unique violation | Medium | High (500 error) |
| WS coroutine leak under load | High | Medium (memory/CPU) |
| `delete_pattern` fails on non-Redis cache | Medium | Low (silent cache miss) |
| ScoreManager weighted calc returns 0 silently | High | Medium (wrong scores) |
| Redis not available → lock fails → double calculations | Low | Medium |

---

## 13. Enterprise Readiness Assessment

### Overall Rating: **7.8 / 10 — Solid B+**

```
Feature Completeness    ████████░░  8/10
Architecture Quality    ████████░░  8/10  
Code Quality            ███████░░░  7/10
Security                ███████░░░  7.5/10
Scalability             ███████░░░  7/10
Observability           ████████░░  8/10
Test Coverage           █████░░░░░  5/10 (estimated, limited review)
Deployment Readiness    ██████░░░░  6/10
```

**This IS an enterprise-grade system in design intent.** The architecture is sophisticated — multi-tenant, role-based, event-driven, WebSocket-enabled, with full audit trails, cascading targets, materialized views, and distributed locks. Few open-source KPI systems go this deep.

**But:** Several bugs have made it to the codebase that will bite in production. The weighted score typo alone means performance scores for users with multiple KPIs are wrong. The adjustment approval bug is a 500 error waiting to happen. The WS infinite loop is a resource leak.

---

## 14. Issues, Gaps & Bugs Found

| # | Severity | Location | Issue |
|---|---|---|---|
| 1 | 🔴 HIGH | `models/definition.py:71` | `self.updated_at = user` in `activate()` — wrong field, should be `updated_by` |
| 2 | 🔴 HIGH | `models/actual.py:111` | `ActualAdjustment.approve()` calls `MonthlyActual.objects.create()` — violates unique_together |
| 3 | 🔴 HIGH | `managers/score.py:83-84` | `kpi__weights__for_user` field doesn't exist; also typo `efective_from`. `calculate_weighted_user_score()` silently returns 0 |
| 4 | 🟠 MEDIUM | `consumers.py:233-245` | `KPIAdminConsumer.start_metrics_stream()` infinite `while True` — coroutine leak on disconnect |
| 5 | 🟠 MEDIUM | `consumers.py:609-621` | `KPIAnalyticsConsumer.start_analytics_stream()` same infinite loop bug |
| 6 | 🟠 MEDIUM | `signals.py:317-318` | `cache.delete_pattern()` not supported by all cache backends — should be guarded |
| 7 | 🟠 MEDIUM | `models/analytics.py` | Materialized views (`managed=False`) DDL may not be in migrations — fresh deploy risk |
| 8 | 🟡 LOW | `api/v1/permissions.py:22` | `IsManager` grants `dashboard_champion` access — may be broader than intended |
| 9 | 🟡 LOW | `consumers.py:423` | `KPINotificationConsumer` access `.id` on potentially anonymous user without auth check |
| 10 | 🟡 LOW | `signals.py:292` | `score_post_save_trend_handler` runs on every save, not just creation — performance impact |
| 11 | 🟡 LOW | `engine/calculators.py:43-44` | `PercentageCalculator` hard-caps at 100 — may not suit all use cases |
| 12 | 🟡 INFO | `managers/base.py:81-82` | `BulkOperationManager` silently ignores batch errors — no error reporting |

---

## 15. My Honest Take

You have built something genuinely impressive. Most Django KPI systems I encounter are CRUD apps wrapped in a spreadsheet metaphor. **This is not that.**

What you've done right:
- The **cascade engine** with rollback is production-level thinking
- The **event-driven architecture** (signal → task → WebSocket) is clean
- The **tenant isolation** strategy is architecturally sound
- The **calculator strategy pattern** is textbook correct
- The **materialized views** for analytics performance show you understand database at a deeper level
- The **role hierarchy** is business-domain aware (Champion, Executive, Supervisor, Staff are real KPI system roles)
- The **CalculationLog** with `traceback` stored — that's what a production engineer does

What needs fixing before you call it enterprise-ready:
1. Fix the 3 HIGH bugs — they are code correctness issues, not design issues (an hour of work)
2. Fix the WS infinite loop — this is a production reliability risk under load
3. Confirm materialized view DDL is in migrations or has a documented setup script
4. Write integration tests for the validation → calculation → scoring pipeline
5. Add a guard that checks `thread.current_tenant_id` is set early in middleware and raises a hard error (not a silent passthrough) if it's not

The bones are enterprise. The code needs one more hardening pass and you'll be able to deploy this to a real organization with confidence.

---

*Report generated by Antigravity AI — 2026-07-14*  
*File: `kpi_findings.md` — Falcon KPI System Audit*
