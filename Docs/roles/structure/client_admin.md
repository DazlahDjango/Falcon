# 🏢 Role Mapping: Client Admin (`client_admin`)
**Application:** Organizational Structure (`apps/structure`)  
**Scope:** Single Organization Tenant Level

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Structure** app (`apps/structure`), the **Client Admin** (`client_admin`) is the primary administrator responsible for defining and configuring the organization's structural blueprint. This includes divisions, departments, sections, units, positions, cost centers, physical office locations, employment assignments, hierarchy versioning, and bulk structural modifications.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Scoped to tenant organization (`tenant_id == request.user.tenant_id`). Protected against cross-tenant structural data exposure.
- **Integrity:** Enforces structural tree integrity (preventing circular parent-child loops via `CycleDetector`), validates headcount caps, budget limits, and audit logs all structural changes.
- **Availability:** Captures hierarchy snapshots (`HierarchyVersion`), supports instant hierarchy version restorations, and rebuilds materialized tree paths.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsTenantMember`, `CanManageDepartment`, `CanManageUnit`, `CanManageReporting`, and `CanPerformBulkOperations` permission classes in `apps/structure/api/v1/permissions/org_permissions.py`.
- **Throttling:** Regulated via `OrgUnitRateThrottle`, `HierarchyWriteThrottle`, `BulkOperationThrottle`, and `EmploymentRateThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Client Admin in the Structure app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Manage Organizational Units (Divisions, Departments, Sections, Units)** | `GET, POST, PUT, PATCH, DELETE /api/v1/structure/divisions/`<br>`/departments/`<br>`/sections/`<br>`/units/` | [DepartmentViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/department_views.py#L17)<br>[DivisionViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/division_views.py#L14) | Full CRUD over organizational entity nodes across all levels (`OrgLevel`). |
| 2 | **Move Department / Re-parent Node** | `POST /api/v1/structure/departments/{id}/move/` | [CycleDetector.validate_assignment](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/hierarchy/cycle_detector.py#L15) | Re-parent a department under a new parent unit; validates cycle prevention before commit. |
| 3 | **Manage Positions & Job Descriptions** | `GET, POST, PUT, PATCH, DELETE /api/v1/structure/positions/` | [PositionViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/position_views.py#L15) | Create job positions (`job_code`, `title`, `level`, `grade`), define reporting relations (`reports_to`), and set max incumbent caps. |
| 4 | **Manage Employment Assignments & Employee Transfers** | `GET, POST, PUT, PATCH /api/v1/structure/employments/`<br>`POST /api/v1/structure/employments/transfer/` | [EmploymentViewSet.transfer_employee](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/employment_views.py#L95) | Assign employees to positions, track employment history, and execute inter-departmental transfers with effective dates. |
| 5 | **Bulk Create/Update Units & Employments** | `POST /api/v1/structure/bulk/departments/`<br>`POST /api/v1/structure/bulk/employments/`<br>`POST /api/v1/structure/bulk/reassign-manager/` | [BulkOperationViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/bulk_views.py#L11) | Atomically create/update up to 100 organizational units or employments, or bulk reassign employees to a new manager. |
| 6 | **Manage Cost Centers & Budgets** | `GET, POST, PUT, PATCH, DELETE /api/v1/structure/cost-centers/` | [CostCenterViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/cost_center_views.py#L14) | Define cost centers (`code`, `name`, `fiscal_year`, `budget_amount`), assign cost center managers, and monitor budget utilization. |
| 7 | **Manage Office Locations & Seating Capacity** | `GET, POST, PUT, PATCH, DELETE /api/v1/structure/locations/`<br>`POST /api/v1/structure/locations/{id}/update-occupancy/` | [LocationViewSet](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/location_views.py#L14) | Maintain physical work locations, identify headquarters, set seating capacities, and track office occupancy. |
| 8 | **Capture Hierarchy Snapshot Version** | `POST /api/v1/structure/hierarchy/capture/` | [TreeBuilder.build_full_tree](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/hierarchy/tree_builder.py#L20) | Freeze current org structure state into an immutable `HierarchyVersion` record with SHA-256 hash. |
| 9 | **Restore Organization Hierarchy Version** | `POST /api/v1/structure/hierarchy/{id}/restore/` | [HierarchyViewSet.restore_version](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/hierarchy_views.py#L95) | Revert organizational hierarchy to a historical snapshot in the event of an erroneous restructure. |
| 10 | **Validate Structural Integrity** | `GET /api/v1/structure/hierarchy/validate/` | [OrgValidatorService.validate_org_integrity](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/validation/org_validator.py#L15) | Execute deep structural integrity audits: check for broken parent pointers, circular references, or orphan employments. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Strict single-tenant restriction (`tenant_id == request.user.tenant_id`).
- **Destructive Rights:** Soft delete divisions, departments, sections, units, positions, cost centers, and locations. Version restoration.
