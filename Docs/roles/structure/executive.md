# 👔 Role Mapping: Executive (`executive`)
**Application:** Organizational Structure (`apps/structure`)  
**Scope:** Single Organization — Executive Leadership & Strategic Structure Oversight

---

## 1. 📌 Role Definition & Strategic Purpose
In the **Structure** app (`apps/structure`), the **Executive** (`executive`) uses high-level structural visualization, reporting chain analytics, span of control diagnostics, version diff comparisons, and multi-format org chart exports (Visio VDX, CSV, JSON, ASCII) to maintain strategic organizational alignment and evaluate corporate restructuring plans.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Bounded to tenant context (`tenant_id`). Granted full visibility into all organizational units, positions, and executive reporting lines.
- **Integrity:** Inspects structural health metrics, span of control overload alerts, and hierarchy validation results to safeguard corporate reporting clarity.
- **Availability:** Accesses cached hierarchy trees (`TreeBuilder`) and exports vector org charts for board meetings and strategic planning.

---

## 2. 🔑 Authentication & Access Control
- **Permissions:** Enforced via `IsTenantMember` and `CanViewOrgChart` permission classes in `apps/structure/api/v1/permissions/org_permissions.py`.
- **Throttling:** Regulated via `HierarchyReadThrottle` and `OrgChartExportThrottle`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by an Executive in the Structure app:

| # | Action Name | HTTP Method & API Endpoint | Backend Service Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Inspect Full Organization Tree** | `GET /api/v1/structure/tree/full/`<br>`GET /api/v1/structure/org-chart/tree/` | [TreeBuilder.build_full_tree](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/hierarchy/tree_builder.py#L20) | Retrieve complete multi-level nested organizational tree (divisions -> departments -> sections -> units). |
| 2 | **Inspect Departmental Subtrees & Branches** | `GET /api/v1/structure/tree/branch/{dept_id}/`<br>`GET /api/v1/structure/tree/subtree/{dept_id}/` | [SubtreeExtractor.extract_department_subtree](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/hierarchy/subtree_extractor.py#L15) | Isolate specific organizational branches or subtrees for deep-dive department reviews. |
| 3 | **Find Lowest Common Ancestor (LCA)** | `GET /api/v1/structure/tree/lca/?dept_a={id}&dept_b={id}` | [LCAByIdFinder.find_department_lca](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/hierarchy/lca_finder.py#L18) | Identify common management intersection points between two different departments or units. |
| 4 | **View Organization-Wide Span of Control** | `GET /api/v1/structure/reporting-lines/organization-span/` | [ChainService.get_all_reports](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/reporting/chain_service.py#L40) | Evaluate direct/indirect report ratios across all managers; flags managers with >15 direct reports as overloaded. |
| 5 | **Monitor Structural Health Score** | `GET /api/v1/structure/dashboard/hierarchy-health/` | [StructureDashboardViewSet.get_hierarchy_health](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/dashboard_views.py#L105) | Review calculated organizational health index (0–100 score based on cycles, broken paths, and span overload). |
| 6 | **Analyze Structural Evolution Trends** | `GET /api/v1/structure/dashboard/trends/?months=6` | [StructureDashboardViewSet.get_trends](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/dashboard_views.py#L140) | Track organizational growth trends and unit count fluctuations over a 6-month historical period. |
| 7 | **Compare Hierarchy Versions (Diff)** | `GET /api/v1/structure/hierarchy/{id}/diff/{compare_id}/` | [HierarchyViewSet.compare_versions](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/api/v1/views/hierarchy_views.py#L132) | Compare two hierarchy snapshot versions to highlight added, removed, or modified organizational units. |
| 8 | **Export Org Chart to Microsoft Visio (VDX)** | `GET /api/v1/structure/org-chart/visio/` | [VisioExporterService.generate_visio_xml](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/export/visio_exporter.py#L12) | Export company organizational structure directly into XML format compatible with Microsoft Visio diagramming software. |
| 9 | **Export Org Chart to CSV / JSON / ASCII Text** | `GET /api/v1/structure/org-chart/csv/`<br>`GET /api/v1/structure/org-chart/json/`<br>`GET /api/v1/structure/org-chart/text/` | [CSVExporterService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/export/csv_exporter.py#L15)<br>[OrgChartGeneratorService](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/structure/services/export/org_chart_generator.py#L20) | Download spreadsheet CSV exports, full JSON structures, or formatted ASCII tree diagrams for board presentations. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Full organizational read visibility within `tenant_id`.
- **Destructive Rights:** None. Completely read-only structural analytics and export rights.
