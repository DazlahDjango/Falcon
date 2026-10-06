# Falcon PMS: Dashboard Sidebar Audit & Cleanup Recommendations

This document details the complete audit of the **dashboard sidebar architecture** across all subsystems (**Accounts**, **Structure**, **KPI**, **Reviews**, **Reports**, **Billing**, **Tenant**, and **Configuration**) and role permissions (**Super Admin**, **Client Admin**, **Executive**, **Champion**, **Manager / Supervisor**, **Staff / Employee**, and **Read-Only**).

---

## 1. Top Cross-App Duplications & Critical Issues

### 🚨 Issue A: "My Team" & "Reporting Chain" Duplicated in Accounts & Structure
* **Problem**: `My Team` (`/accounts/my-team`) and `My Reporting Chain` (`/accounts/my-reporting-chain`) appear in **both** `accountsNav.js` AND `structureNav.js` for Executive, Manager, and Staff.
* **Impact**: Confuses users about where to view reporting lines vs profile info.
* **Resolution**: **Remove from Accounts sidebar**. People hierarchy, team trees, and supervisor chains belong exclusively in the **Structure App**.

### 🚨 Issue B: Duplicate Root Overview Links in Subsystems
* **Problem**: In `accountsNav.js` and `reportsNav.js`, the first link points to the root platform dashboard (e.g., `/dashboard/super-admin/overview`), while the second link points to the subsystem overview (e.g., `/accounts/dashboard` or `/reports/dashboards`).
* **Impact**: Clicking "Home/Overview" kicks the user completely out of the app context back to the root dashboard.
* **Resolution**: Each app's sidebar should only have one clear "Overview / Home" link scoped to that specific app.

### 🚨 Issue C: Duplicate "Reports Center" / "Reporting" Links
* **Problem**:
  * `accountsNav.js` has `Reporting Center` (`/accounts/reports`) for Super Admin, Client Admin, Executive, and Champion.
  * `kpiNav.js` has `Reports Center` (`/kpi/reports`).
  * `reportsNav.js` is the dedicated Reporting App.
* **Resolution**: Remove `Reporting Center` from Accounts. Keep KPI reports scoped to KPI calculations, and centralize enterprise reporting inside the dedicated Reports app.

---

## 2. App-by-App Audit & Recommended Actions

---

### 👤 Accounts App (`frontend/src/config/navigation/accountsNav.js`)

| Role | Redundant / Unnecessary Items | Recommended Action |
| :--- | :--- | :--- |
| **Super Admin** | • **`User Directory`** (`/accounts/users`) AND **`Manage Users`** (`/accounts/admin/users`)<br>• **`Roles`** (`/accounts/roles`) AND **`Manage Roles`** (`/accounts/admin/roles`)<br>• **`Permissions`** (`/accounts/permissions`) AND **`Manage Permissions`** (`/accounts/admin/permissions`)<br>• **`User Sessions`** (`/accounts/sessions`) AND **`Active Sessions`** (`/accounts/active-sessions`) | Consolidate to single master views (`User Directory`, `Roles & Permissions`, `Sessions`). |
| **Executive** | • **`Team Tree`** & **`Reporting Chain`** (Duplicates Structure App)<br>• **`Reporting Center`** (Duplicates Reports App) | Remove `Team Tree`, `Reporting Chain`, and `Reporting Center`. Keep User Directory and Security Audit. |
| **Manager** | • **`My Team`** & **`Reporting Chain`** (Duplicates Structure App)<br>• **`User Directory`** (Global list, out of manager's scope)<br>• **`Activity Log`** | Remove `My Team`, `Reporting Chain`, and global `User Directory`. Keep personal profile & security settings. |
| **Staff** | • **`My Team`** & **`Reporting Chain`** (Duplicates Structure App)<br>• Scattered security items (`Active Sessions`, `MFA Devices`, `Backup Codes`, `My Settings`, `Change Password`) | Remove team/chain duplicates. Group security into a clean single accordion. |
| **Champion** | • **`Reporting Center`** (Duplicates Reports App) | Remove `Reporting Center`. |

---

### 🏢 Structure App (`frontend/src/config/navigation/structureNav.js`)
* **Status**: ✅ **Clean & Refined**.
* **Highlights**:
  * **Super Admin**: Has complete platform architecture tools (Divisions, Departments, Sections, Units, Positions, Employments, Reporting Lines, Span of Control, Interim Assignments, Cost Centers, Locations, Org Charts, and Bulk Tools).
  * **Client Admin**: 5 organized groups (Architecture, Workforce, Reporting, Hierarchy Governance, Resources & Bulk).
  * **Manager & Staff**: Strictly scoped to `My Team & Peers`, `My Reporting Chain`, `My Employment`, and `Department Org Tree`.
  * **Read-Only**: Clean audit views of all structural entities.

---

### 🎯 KPI App (`frontend/src/config/navigation/kpiNav.js`)

| Role | Redundant / Unnecessary Items | Recommended Action |
| :--- | :--- | :--- |
| **Super Admin** | • **`Admin Categories`** under `kpi_admin` and **`Category Tree`** under `kpi_management` | Standardize category link naming. |
| **Client Admin** | • Currently configured with contributor suite (`my_kpi`). | If Client Admin should manage corporate KPIs alongside Champion, expand with `kpi_management`. |
| **Manager & Staff** | • Currently clean, with dedicated `team_kpi` and `my_kpi` groups. | Keep as is. |

---

### 📝 Reviews App (`frontend/src/config/navigation/reviewsNav.js`)

| Role | Structure & Permissions | Status |
| :--- | :--- | :--- |
| **Super Admin & Client Admin** | Full 6-Phase Lifecycle: Foundation, Cycles, Self-Assessments, Manager Appraisals, 360 Calibration, Final Ratings & Outcomes, Analytics/Settings. | ✅ **Clean & Complete** |
| **Executive** | Scoped to Performance Cycle Reports, Leadership Appraisals, Calibration Oversight, Final Ratings, Promotions, Department PIPs, and Executive Analytics. | ✅ **Clean & Focused** |
| **Manager / Supervisor** | Scoped to Manager Overview, Team Self-Assessments, Appraisal Review Queue, 360 Feedback Requests, Team Final Ratings, Direct Reports PIPs, and Promotion Recommendations. | ✅ **Clean & Actionable** |
| **Staff / Employee** | Scoped strictly to My Reviews Dashboard, My Self-Assessment Form & History, 360 Peer Feedback, My Final Ratings, and My Improvement Plan. | ✅ **Secure (No Admin Leakage)** |
| **Read-Only** | Reviews Overview, Review Cycles, and Summary Reports. | ✅ **Clean** |

---

### 📊 Reports App (`frontend/src/config/navigation/reportsNav.js`)

| Role | Redundant / Unnecessary Items | Recommended Action |
| :--- | :--- | :--- |
| **All Roles** | • First item in `reports_main` points to root PMS overview (`/dashboard/.../overview`), while second item points to the Reports Dashboard. | Remove the root overview link so the user stays within the Reports app context. |
| **Client Admin & Champion** | • `Template Library` under Studio AND `Prebuilt Gallery` under Templates. | Consolidate into a single `Template Gallery`. |

---

### 💳 Billing & 🌐 Tenant Apps
* **Billing (`billingNav.js`)**: Scoped strictly to Super Admin and Client Admin. No visibility for Staff or Managers.
* **Tenant (`tenantNav.js`)**: Scoped strictly to Super Admin (Platform infrastructure) and Client Admin (Tenant profile & usage). No visibility for Staff or Managers.

---

## 3. Implementation Checklist for Review

1. [ ] **Accounts App**: Remove `My Team` & `Reporting Chain` links (already available in Structure App).
2. [ ] **Accounts App**: Remove CRUD duplicate links (`Users` vs `Manage Users`, `Roles` vs `Manage Roles`, `Sessions` vs `Active Sessions`).
3. [ ] **Accounts App**: Remove duplicate `Reporting Center` links.
4. [ ] **Reports App**: Fix root dashboard redirects so the Home button stays inside the Reports App.
5. [ ] **Reports App**: Merge `Prebuilt Gallery` and `Template Library` into a unified Templates view.
