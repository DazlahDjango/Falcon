# 📊 Role Mapping: Dashboard Champion (`dashboard_champion`)
**Application:** Organizational Structure (`apps/structure`)  
**Scope:** Single Organization — Structural Analytics & Metrics Champion

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Structure** app (`apps/structure`), the **Dashboard Champion** (`dashboard_champion`) focuses on organizational structure analytics, unit distribution counts, activation rates, occupancy metrics, cost center budget summaries, and structural reference data pings.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Bounded strictly to tenant organizational metrics (`tenant_id`). View access to aggregated structural numbers without modifying underlying records.
- **Integrity:** Validates accuracy of structural reporting metrics across departments and divisions.
- **Availability:** Monitors cached dashboard summary feeds (`StructureDashboardViewSet.get_overview`).

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsTenantMember` and `CanViewOrgChart` permission classes in `apps/structure/api/v1/permissions/org_permissions.py`.
- **Throttling:** Regulated via `HierarchyReadThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Dashboard Champion in the Structure app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **View Structure Dashboard Overview** | `GET /api/v1/structure/dashboard/overview/` | [StructureDashboardViewSet.get_overview](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/dashboard_views.py#L15) | Fetch aggregated structural counts: total/active units, level distribution breakdown, manager percentage, position occupancy rate, and active locations. |
| 2 | **Inspect Division & Department Statistics** | `GET /api/v1/structure/divisions/stats/`<br>`GET /api/v1/structure/departments/stats/` | [DepartmentViewSet.get_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/department_views.py#L155) | Analyze total vs active department counts, root departments, and maximum hierarchy tree depth. |
| 3 | **Inspect Location Occupancy Analytics** | `GET /api/v1/structure/locations/stats/` | [LocationViewSet.get_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/location_views.py#L104) | Monitor total office locations, country distributions, seating capacity, current occupancy, and overall occupancy percentage. |
| 4 | **Inspect Cost Center Budget Distribution** | `GET /api/v1/structure/cost-centers/stats/` | [CostCenterViewSet.get_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/cost_center_views.py#L108) | View cost center category distribution, shared cost centers, level distribution, and total aggregate budget amount. |
| 5 | **Fetch Live Reference Counts** | `GET /api/v1/structure/reference-data/?include=counts,org_units` | [StructureReferenceDataView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/reference_data.py#L12) | Query real-time entity counts for dashboard widget population. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped to tenant organization (`tenant_id`).
- **Destructive Rights:** None. Read-only analytics access.
