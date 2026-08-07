# 👨‍💻 Role Mapping: Staff (`staff`)
**Application:** Organizational Structure (`apps/structure`)  
**Scope:** Single Organization — Regular Employee Workspace

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Structure** app (`apps/structure`), the **Staff** (`staff`) role provides individual employees with visibility into their assigned organizational unit, current position, personal reporting chain of command, company-wide org chart tree, and office location.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Bounded strictly to their tenant (`tenant_id`). Accesses public organizational unit structures and personal position details without viewing confidential budget or compensation parameters.
- **Integrity:** Self-checks personal position assignment and reporting line accuracy.
- **Availability:** Reads cached organizational chart trees on demand.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsTenantMember` and `CanViewOrgChart` permission classes in `apps/structure/api/v1/permissions/org_permissions.py`.
- **Throttling:** Regulated via `HierarchyReadThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Staff member in the Structure app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **View Personal Current Position & Employment** | `GET /api/v1/structure/employments/by-user/{user_id}/` | [EmploymentViewSet.get_by_user](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/employment_views.py#L77) | Retrieve current position title, assigned unit/department/section, manager, and employment history. |
| 2 | **View Personal Reporting Line / Chain of Command** | `GET /api/v1/structure/reporting-lines/by-employee/{user_id}/` | [ChainService.get_chain_of_command](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/reporting/chain_service.py#L15) | Trace upward reporting line from self to team manager, department head, and executive. |
| 3 | **View Company Org Chart Tree** | `GET /api/v1/structure/org-chart/tree/`<br>`GET /api/v1/structure/org-chart/preview/` | [OrgChartViewSet.get_tree_view](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/org_chart_views.py#L108) | Browse interactive company-wide organizational tree and unit hierarchy. |
| 4 | **Look Up Unit / Department by Code** | `GET /api/v1/structure/departments/by-code/{code}/`<br>`GET /api/v1/structure/units/by-code/{code}/` | [DepartmentViewSet.get_by_code](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/department_views.py#L147) | Search for organizational units or departments using official company codes (e.g., `DEPT-FIN`). |
| 5 | **View Company Headquarters Location** | `GET /api/v1/structure/locations/headquarters/` | [LocationViewSet.get_headquarters](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/location_views.py#L89) | View primary office address, city, country, and headquarters location details. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped to personal record and public tenant org chart (`tenant_id`).
- **Destructive Rights:** None. Read-only access.
