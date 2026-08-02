# Falcon KPI Module: API Layer Review & Findings

This document provides a comprehensive, file-by-file technical review of the REST API infrastructure for the KPI module located in `apps/kpi/api/v1/`.

---

## 1. Rate Limiting (`throttles.py`)

Falcon utilizes customized Django Rest Framework (DRF) throttling classes to protect resources and prevent denial of service (DoS) attacks on heavy calculation or export operations.

### Throttle Class Analysis
1.  **`CalculationThrottle`**: Restricts the period calculation view to `10 requests/hour` per authenticated user. Used on the calculate trigger view.
2.  **`RecalculationThrottle`**: Restricts calculations to `20 requests/hour`.
3.  **`ComplexCalculationThrottle`**: Restricts heavy calculation requests to `5 requests/hour`.
4.  **`BulkUploadThrottle`**: Restricts bulk uploads (KPIs, Targets, Actuals) to `5 requests/minute` to mitigate spike loads.
5.  **`DashboardThrottle`**: Restricts dashboard loading to `100 requests/minute`.
6.  **`KPIListThrottle`**: Restricts regular listing views to `60 requests/minute`.
7.  **`AnonKPIThrottle`**: Restricts anonymous operations (if exposed) to `20 requests/hour`.
8.  **`TenantCalculationThrottle`**: Scopes throttling globally per organization:
    *   *Rate*: `50 requests/hour`.
    *   *Mechanism*: Keyed by the requesting user's `tenant_id` fetched from request metadata, ensuring that concurrent bulk calculations from the same organization are restricted system-wide.
9.  **`IPBasedThrottle`**: Filters by client IP address using the `HTTP_X_FORWARDED_FOR` proxy header or falls back to `REMOTE_ADDR` (rate limit: `200 requests/hour`).
10. **`BurstThrottle`**: Limits general usage to `30 requests/minute` for high-frequency views.
11. **`SustainedThrottle`**: Enforces a daily ceiling of `500 requests/day` per user.
12. **`ExportThrottle`**: Restricts PDF, Excel, and CSV exporting endpoints to `10 requests/hour`.

---

## 2. API Authorization & Access Control (`permissions.py`)

A matrix of custom permissions regulates endpoint access based on roles and tenant context:

| Permission Class | Check Type | Target Audience / Constraints |
| :--- | :--- | :--- |
| `IsAuthenticatedAndActive` | Global | Active, authenticated users only. |
| `IsManager` | Role-based | Grants write/access permissions if the user is a Super Admin, Executive, or has active direct reports (`user.get_direct_reports().exists()`). |
| `IsExecutive` | Role-based | Restricted to C-level users (role in `executive`, `ceo`, `director`) or Super Admins. |
| `IsDashboardChampion` | Role-based | Restricts target administration to the `dashboard_champion` role. |
| `CanCascadeTargets` | Role-based | Allows target cascading for Super Admins, Dashboard Champions, cost managers, and user-managers. |
| `CanViewAuditLogs` | Role-based | Restricted to Super Admins, Client Admins, or dedicated `auditor` roles. |
| `CanViewKPIAdminOverview` | Role-based | Restricted to Admins and Executives. |
| `IsTenantMember` | Tenant Isolation | Validates that `request.user.tenant_id` matches the object's `tenant_id`, preventing cross-tenant data leaks. |
| `IsFrameworkAdmin` | Object-level | Restricts write operations to `super_admin` or `client_admin`. SAFE methods are allowed for tenant members. |
| `IsOwnerOrReadOnly` | Ownership | Restricts edits/deletes to the creator (`created_by`), target user (`user`), or owner (`owner`) of a KPI or target. |
| `HasKPIWritePermission` | Role-based | resticts KPI definition writes to executives and admins. |

---

## 3. Query Filters & Search Specifications (`filters.py`)

All filters inherit from `django-filter` sets and expose custom parameter matching:

*   **`KPIListFilter`**: Matches KPIs by name/code (case-insensitive contains), types, calculation logic, category, owner, and department. Includes a custom `search` filter matching against name, code, and description:
    ```python
    def filter_search(self, queryset, name, value):
        return queryset.filter(Q(name__icontains=value) | Q(code__icontains=value) | Q(description__icontains=value))
    ```
*   **`AnnualTargetListFilter`**: Supports filtering annual values by year/range, KPI, user, department, and custom `is_approved` (checks for non-null `approved_by`).
*   **`MonthlyActualListFilter`**: 
    *   `year_month`: Parses values formatted as `YYYY-MM` into discrete integers.
    *   `supervisor`: Custom filter resolving the supervisor's direct reports and returning records matching those users.
    *   `pending_validation`: Filters actuals with status `PENDING`.
    *   `missing_data`: Excludes users who have submitted their actual values for a period to isolate missing entries.
*   **`ScoreListFilter`**: Supports `score_min`/`score_max` ranges, period parsing, and filters by Traffic Light status (e.g. `red_only` maps directly to the `RED` status on related `TrafficLight` records).
*   **`AggregatedScoreListFilter`**: Filters department, unit, and org averages by entity IDs/names, year, and month.

---

## 4. Serializer Implementations (`serializers/`)

Located in the `serializers/` directory, these classes manage validation and representation:

### A. Base Serializers (`base.py`)
*   **`TenantAwareSerializer`**: Declares `tenant_id` as read-only. Automatically injected during creation.
*   **`AuditTrailSerializer`**: Enriches serialization with creator and updater emails (`created_by_email`, `updated_by_email`).

### B. KPI Definitions (`definition.py`)
*   **`KPIListSerializer`**: Standard listing representation displaying FK attributes (category name, owner email, department name) as plain text strings to improve readability.
*   **`KPIDetailSerializer`**: Detail view using child serializers (`KPICategorySerializer`). Includes dynamic computed fields:
    *   `weights_count`: Number of users assigned this KPI.
    *   `actuals_count`: Total historical monthly actual records submitted.
    *   `scores_count`: Total historical calculated score records.
    *   *Validation logic*: Checks that `target_min` <= `target_max` and prevents percentage KPIs from declaring targets exceeding 100%.

### C. Targets & Actuals (`target.py` & `validation.py`)
*   **`AnnualTargetSerializer`**: Checks that the annual target value is strictly positive.
*   **`MonthlyPhasingSerializer`**: Resolves `month_name` (e.g., "Jan", "Feb") and formats locking attributes. Prevents negative monthly targets.
*   **`MonthlyActualSerializer`**: Contains nested `validation_status` showing status, validator user email, and validated datetime of the last approval action.
*   **`EvidenceSerializer`**: Exposes file attachment URLs (`file_url`).
*   **`ActualAdjustmentSerializer`**: Validates adjusted value >= 0. Displays original values side-by-side with proposed values.
*   **`EscalationSerializer`**: Formats escalation status, reasons, resolution summaries, and period descriptors.

### D. Analytics & Dashboards (`dashboard.py` & `analytics.py`)
*   **`IndividualDashboardSerializer`**, **`ManagerDashboardSerializer`**, **`ExecutiveDashboardSerializer`**, and **`ChampionDashboardSerializer`**: Structures data for dashboard grids, wrapping KPI lists, compliance lists, red alert lists, and distribution counts.

### E. Bulk & Calculations (`bulk.py` & `calc.py`)
*   **`BulkUploadResultSerializer`**: Structs responses for batch operations, returning summary metrics (`total_rows`, `created`, `updated`) alongside nested `errors` lists detailing line failures.

---

## 5. ViewSets & Custom Actions (`views/`)

API ViewSets inherit from the customized `BaseKpiViewset` or `ReadOnlyKPIViewset` class:

### A. Base Capabilities (`base.py`)
*   **Tenant Scoping**: All viewsets automatically scope their querysets to the authenticated user's `tenant_id`. Staff role-filtered queries are isolated, while Super Admins skip tenant filtering.
*   **Audit Hooking**: Overrides `perform_create` and `perform_update` to inject `tenant_id`, `created_by`, and `updated_by` without frontend input.
*   **Exception Handler mapping**: Catches `DjangoValidationError`, DRF `ValidationError`, `IntegrityError` (database constraints), `PermissionDeniedError`, and custom `KPIException` to return standardized JSON bodies with clean HTTP status codes (200, 201, 207, 400, 403, 404, 500).

### B. Core Resources ViewSets
*   **`KPIViewSet`** (`kpi.py`):
    *   *Custom Actions*:
        *   `activate` & `deactivate` (POST): Modifies lifecycle dates.
        *   `weights`, `targets`, `scores` (GET): Scopes relationships.
        *   `validate` (GET): Runs three-tier diagnostic scans (completeness, weight summation, and DFS circular dependencies).
*   **`MonthlyActualViewSet`** (`actual.py`):
    *   *Custom Actions*:
        *   `submit` (POST): Submits actuals for validation.
        *   `approve` (POST): Approves actual values (supervisor only).
        *   `reject` (POST): Rejects actual values with reason links.
        *   `resubmit` (POST): Updates rejected values and resets status to PENDING.
*   **`CascadeMapViewSet`** (`cascade.py`):
    *   *Custom Actions*:
        *   `create` (POST): Executes parent organization target cascading down to divisions/departments/individuals.
        *   `cascade_department` (POST): Cascades department targets to individual employees.
        *   `rollback` (DELETE): Reverts target splits, deleting children targets recursively.
        *   `tree` (GET): Recursively builds target hierarchies using contributors caching.
*   **`ValidationRecordViewSet`** (`validation.py`):
    *   *Custom Actions*:
        *   `pending` (GET): Fetches validations awaiting the supervisor's attention.
        *   `pending_summary` (GET): Performs in-memory groupings to return pending validation metrics categorized by KPI, user, and period.
*   **`KPISummaryViewSet` & `DepartmentRollupViewSet`** (`analytics.py`):
    *   Overrides listing endpoints to skip empty database queries on MV tables; instead, queries are routed through the `analytics` service layer to fetch live datasets or materialized view caches.
    *   Includes `PerformanceHeatmapView` and `AnalyticsExportView` to render matrix comparisons of departments against active KPI Definitions.
