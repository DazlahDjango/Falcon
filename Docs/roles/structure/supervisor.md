# 👥 Role Mapping: Supervisor / Manager (`supervisor`)
**Application:** Organizational Structure (`apps/structure`)  
**Scope:** Single Organization — Departmental & Direct Team Management

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Structure** app (`apps/structure`), the **Supervisor** (`supervisor`) is focused on line-management tasks: tracking direct reports, monitoring team span of control, managing interim manager assignments (for temporary delegations during leave/travel), inspecting team vacancies, and reviewing departmental employment assignments.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Bounded to their tenant and scoped to their direct/indirect team reporting chain (`ChainService.get_direct_reports`).
- **Integrity:** Authorizes temporary interim management handovers with mandatory `effective_from` and `effective_to` dates, preventing unauthorized delegation gaps.
- **Availability:** Ensures team manager continuity when staff or supervisors are absent on leave.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsTenantMember`, `CanViewOrgChart`, and `CanManageReporting` permission classes in `apps/structure/api/v1/permissions/org_permissions.py`.
- **Throttling:** Regulated via `HierarchyReadThrottle` and `ReportingRateThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Supervisor in the Structure app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **View Team Direct Reports** | `GET /api/v1/structure/reporting-lines/by-manager/{user_id}/` | [ChainService.get_direct_reports](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/reporting/chain_service.py#L25) | Retrieve active employments of all employees reporting directly to the supervisor. |
| 2 | **Check Personal Span of Control** | `GET /api/v1/structure/reporting-lines/span-of-control/{manager_id}/` | [ReportingLineViewSet.get_span_data_dict](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/reporting_views.py#L20) | Inspect direct and indirect report counts, health status, and warning flags. |
| 3 | **Assign Interim Manager (Temporary Delegation)** | `POST /api/v1/structure/interim/assign/` | [InterimManagerService.assign_interim_manager](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/reporting/interim_manager.py#L20) | Delegate managerial authority over an employee to an interim manager for a specified date range. |
| 4 | **End Interim Manager Assignment** | `POST /api/v1/structure/interim/end/` | [InterimManagerService.end_interim_assignment](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/reporting/interim_manager.py#L75) | Terminate an active interim manager assignment upon the primary manager's return. |
| 5 | **Monitor Expiring Interim Assignments** | `GET /api/v1/structure/interim/expiring-soon/?days=7` | [InterimManagerService.get_expiring_soon](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/reporting/interim_manager.py#L110) | List interim assignments scheduled to expire within the next N days. |
| 6 | **Inspect Team Vacant Positions** | `GET /api/v1/structure/positions/vacant/` | [PositionViewSet.get_vacant_positions](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/position_views.py#L87) | Identify unfilled positions (`current_incumbents_count == 0`) within their unit or section. |
| 7 | **View Unit/Section Employment Roster** | `GET /api/v1/structure/sections/{id}/employments/`<br>`GET /api/v1/structure/units/{id}/employments/` | [UnitViewSet.get_employments](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/unit_views.py#L42) | View active incumbent lists, headcount limits, and position titles within managed units. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped to managed department/section/unit and direct team members within `tenant_id`.
- **Destructive Rights:** None. Restricted to temporary interim assignments and team line-management.
