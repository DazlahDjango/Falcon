# Falcon PMS Dashboard App — Implementation Status & Security Baseline

**Document purpose:** Engineering truth for the seven-role PMS dashboard module (Executive, Client Admin, Super Admin, Manager, Staff, Champion, Read-Only). Covers backend services, WebSocket real-time, hierarchy, accounts profile integration, frontend shell (isolated from app root), and CIA alignment via Config registry.

**Related docs:** `Docs/dashboard/pendings.mmd` (client training narrative), `Docs/dashboard/architecture.md`, `apps/dashboard/`, `frontend/src/components/dashboard/`

**Last updated:** May 2026

---

## Executive summary

The Dashboard app is the **role-based performance cockpit** for Falcon PMS. Backend APIs and `DashboardConsumer` exist for all seven personas. Frontend stabilization (May 2026) adds an **isolated Redux store**, **accounts `/users/me/` profile** in chrome, **WebSocket-driven updates**, and **`DashboardShell`** — intentionally **not** wired into `rootReducer`, `providers/index.jsx`, or `routes/index.jsx` until the module is fully signed off.

| Role | Backend API | Frontend pages | Sidebar | Real-time WS |
|------|-------------|----------------|---------|--------------|
| Executive | `ViewSet` `/dashboard/executive/` | Yes | `ExecutiveSidebar` | `ws/dashboard/executive/` |
| Client Admin | `ViewSet` `/dashboard/client-admin/` | Yes | `ClientAdminSidebar` | `ws/dashboard/client_admin/` |
| Super Admin | `ViewSet` `/dashboard/super-admin/` | Yes | `SuperAdminSidebar` | `ws/dashboard/super_admin/` |
| Manager | `APIView` `/dashboard/manager/` | Yes | `ManagerSidebar` | `ws/dashboard/manager/` |
| Staff | `APIView` `/dashboard/staff/` | Yes | `StaffSidebar` | `ws/dashboard/staff/` |
| Champion | `APIView` `/dashboard/champion/` | Yes | `ChampionSidebar` | `ws/dashboard/champion/` |
| Read-Only | `APIView` `/dashboard/read-only/` | Yes | `ReadOnlySidebar` | `ws/dashboard/read_only/` |

**Strategy:** Real data (KPI scores, hierarchy from Accounts + Structure) → Integrity (audit, permissions) → Availability (cache + WS) → Confidentiality (RBAC per dashboard type).

---

## 1. Cross-app real data

| Data | Source | Dashboard usage |
|------|--------|-----------------|
| User profile (name, avatar, role) | **Accounts** `GET /users/me/` | `useDashboardProfile` → header + all sidebars |
| Team / reports | **Accounts** `User.manager_id`, `direct_reports` | `HierarchyService` |
| Department KPIs | **Structure** `Department` FK on KPI | Executive heatmaps, drill-down |
| Scores & traffic lights | **KPI** `ScoreAggregator` | All role dashboards |
| Tenant context | **Tenant** `Client` | Client Admin / Super Admin views |
| Live org changes | **Structure** signals (indirect) | Cache invalidation via KPI/accounts events |

### Hierarchy service

- Restored: `apps/dashboard/services/hierarchy_service.py`
- Team tree, org tree, drill-down, `is_direct_report()` for object permissions
- Depends on `tenant.0003` (not `TenantSystemSettings`) for migration consistency

---

## 2. Backend API surface

Base path: `/api/v1/dashboard/`

| Area | Endpoints |
|------|-----------|
| Executive | `.../executive/data/`, `departments/`, `trends/`, `issues/`, `refresh/` |
| Client Admin | `.../client-admin/data/`, `compliance/`, `pending-approvals/`, `missing-data/`, `user-activity/` |
| Super Admin | `.../super-admin/data/`, `tenants/`, `system-health/`, `platform-metrics/` |
| Manager | `.../manager/`, `approve/`, `reject/` |
| Staff | `.../staff/`, `submit/` |
| Champion | `.../champion/`, `update/` |
| Read-Only | `.../read-only/`, `export/` |
| Shared | `hierarchy/`, `configs/`, `widgets/`, `alerts/`, `exports/`, `comparisons/`, `drill-down/<user_id>/` |

Permissions: `apps/dashboard/api/v1/permissions.py` (role-specific + hierarchy checks).

---

## 3. Real-time

| Component | Path / behavior |
|-----------|-----------------|
| `DashboardConsumer` | `ws/dashboard/<dashboard_type>/` |
| `DashboardNotificationConsumer` | `ws/notifications/` |
| Frontend | `DashboardRealtimeContext` → `dashboardWebSocket` |
| Redux patches | `updateExecutiveData`, `updateManagerData`, etc. |

Actions over WS: `refresh`, `subscribe_kpi`, `approval_action`, `submit_kpi`, `drill_down`.

---

## 4. Frontend module layout (isolated until go-live)

```
frontend/src/
├── components/dashboard/
│   ├── Layout/MainLayout.jsx      # 7 sidebars + Header/Footer
│   ├── Sidebar/*Sidebar.jsx       # One per role
│   ├── common/DashboardShell.jsx  # Providers + MainLayout
│   └── common/SidebarUserPanel.jsx
├── providers/DashboardStoreProvider.jsx  # Isolated Redux
├── contexts/dashboard/
│   ├── DashboardProfileContext.jsx
│   └── DashboardRealtimeContext.jsx
├── store/dashboard/               # Not in rootReducer
├── routes/dashboard.routes.jsx    # Not in routes/index.jsx yet
└── hooks/dashboard/useDashboardProfile.js
```

### Go-live checklist (3 steps)

```jsx
// routes/index.jsx — when ready
import dashboardRoutes from './dashboard.routes';
// ...dashboardRoutes,

// Optional: merge pmsDashboard into rootReducer instead of nested store
```

---

## 5. CIA alignment (Config registry)

| Pillar | Implementation |
|--------|----------------|
| **Confidentiality** | Per-dashboard permission classes; drill-down limited to team |
| **Integrity** | `DashboardAuditLog`, export schedules, comparison snapshots |
| **Availability** | Cache service, `warm_dashboard_caches`, Config app registration |

Registered in `AppRegistry.register_from_definition('dashboard')` on app ready.

---

## 6. Commands & verification

```bash
python manage.py check
python manage.py migrate
# No dedicated seed yet — data from KPI/accounts live DB
```

---

## 7. Remaining / follow-up

- [ ] Wire `dashboardRoutes` into app root router
- [ ] Optional: `DashboardSystemSettings` singleton (parity with Config/KPI/Tenant)
- [ ] Structure `ReportingLine` as primary hierarchy source (today: Accounts `manager_id`)
- [ ] E2E tests per role dashboard
- [ ] Unified `DashboardEventBroadcaster` service (Channels group_send from KPI signals)
- [ ] Manager/staff/champion sub-routes for all nav items in `dashboardRouteConstants.js`
