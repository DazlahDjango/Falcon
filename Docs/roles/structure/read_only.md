# 👁️ Role Mapping: Read-Only / Governance (`read_only`)
**Application:** Organizational Structure (`apps/structure`)  
**Scope:** Single Organization — Non-Operational Governance & Audit Review

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Structure** app (`apps/structure`), the **Read-Only** (`read_only`) role enables external governance stakeholders (Board Members, Financial Auditors, HR Compliance Inspectors) to audit an organization's structural hierarchy, position grade distributions, cost center allocations, and historical version comparisons without any data modification rights.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Scoped strictly to `tenant_id`. Read access to organizational structure without modifying position descriptions, budgets, or employee assignments.
- **Integrity:** Enforces strict read-only enforcement (`BaseStructureReadOnlyViewSet`). Rejects all `POST`, `PUT`, `PATCH`, or `DELETE` requests.
- **Availability:** Accesses pre-cached organizational trees and static version diff reports.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsTenantMember` and `CanViewOrgChart` permission classes in `apps/structure/api/v1/permissions/org_permissions.py`.
- **Throttling:** Regulated via `HierarchyReadThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Read-Only user in the Structure app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **View Organizational Units (Read-Only)** | `GET /api/v1/structure/divisions/`<br>`GET /api/v1/structure/departments/`<br>`GET /api/v1/structure/sections/`<br>`GET /api/v1/structure/units/` | [BaseStructureReadOnlyViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/base.py#L76) | Read-only listing of all organizational units within the tenant. |
| 2 | **View Position Grade & Level Distribution** | `GET /api/v1/structure/positions/stats/` | [PositionViewSet.get_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/position_views.py#L114) | Inspect position occupancy rates, vacant counts, and job level distribution breakdown. |
| 3 | **View Cost Center & Budget Allocation Stats** | `GET /api/v1/structure/cost-centers/stats/` | [CostCenterViewSet.get_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/cost_center_views.py#L108) | Review total cost centers, category distributions, level breakdowns, and total budget allocations. |
| 4 | **View Location & Occupancy Statistics** | `GET /api/v1/structure/locations/stats/` | [LocationViewSet.get_stats](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/location_views.py#L104) | Review global office seating capacity, country counts, and overall occupancy rate. |
| 5 | **Compare Hierarchy Version Diff** | `GET /api/v1/structure/hierarchy/{id}/diff/{compare_id}/` | [HierarchyViewSet.compare_versions](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/hierarchy_views.py#L132) | Compare two historical hierarchy versions to verify authorized structural changes. |
| 6 | **View Org Chart Tree** | `GET /api/v1/structure/org-chart/tree/` | [OrgChartViewSet.get_tree_view](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/org_chart_views.py#L108) | View company-wide organizational tree view for governance auditing. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Bounded to tenant organization (`tenant_id`).
- **Destructive Rights:** None. Completely read-only.
