# 🏢 Falcon KPI Subsystem — Real-Data Operational Flow & User Guide

This document presents a comprehensive, real-data step-by-step user guide and operational flow narrative for the **Falcon KPI Subsystem**. It traces concrete data, real user accounts, organizational hierarchy, cascading rules, weight allocations, evidence uploads, validation queues, and role-based dashboard screens for tenant **Global Apex Solutions** (`tenant_id = 275adb1f-8e12-46ee-b394-ea42d41b10c9`).

---

## 🏛️ Real Tenant Organizational Baseline

```text
                               ┌────────────────────────────────────────────────────────┐
                               │             Global Apex Solutions (Tenant)             │
                               │           Executive: Sarah Jenkins (CEO)               │
                               │        Corporate FY2026 Goal: $100,000,000 USD Net    │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
              ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
              ▼                                                                                         ▼
┌─────────────────────────────────────────────┐                           ┌─────────────────────────────────────────────┐
│  Executive Division (DIV_EXEC)              │                           │  Technology & Product Division (DIV_TECH)   │
│  Director: Sarah Jenkins                    │                           │  Director: Wyatt Underwood                  │
├─────────────────────────────────────────────┤                           ├─────────────────────────────────────────────┤
│ • Executive Office (DEP_EXEC)               │                           │ • Engineering & IT (DEP_ENG)                │
│   Manager: Sarah Jenkins (CEO)              │                           │   Manager: Wyatt Underwood                  │
│ • Strategy & Planning (DEP_STRAT)           │                           │   ├─ Software Engineering (SEC_SOFTWARE)    │
│   Manager: Elena Rostova (Dashboard Champ)  │                           │   │  ├─ Core Backend Unit (UNT_BACKEND)     │
└─────────────────────────────────────────────┘                           │   │  │  └─ Staff: Rachel Adams, David Miller │
                                                                          │   │  └─ Frontend & UI Unit (UNT_FRONTEND)   │
                                                                          │   │     └─ Staff: Alexander Wright            │
                                                                          │   └─ DevOps & QA (SEC_DEVOPS)               │
                                                                          │      ├─ Cloud Infra Unit (UNT_INFRA)        │
                                                                          │      │  └─ Staff: Sophia Martinez             │
                                                                          │      └─ QA Auto Unit (UNT_QA_AUTO)            │
                                                                          │         └─ Staff: Evelyn Perez                │
                                                                          │ • Product Management (DEP_PROD)             │
                                                                          │   Manager: Adam Ortega                      │
                                                                          │   ├─ Core Product Dev (SEC_PROD_DEV)        │
                                                                          │   │  ├─ Platform Unit (UNT_PROD_CORE)       │
                                                                          │   │  │  └─ Staff: Nathan Scott, Michael B.  │
                                                                          │   │  └─ Mobile Apps Unit (UNT_PROD_MOBILE)  │
                                                                          │   │     └─ Staff: Thomas Wright           │
                                                                          │   └─ UX & Design (SEC_UX_DESIGN)            │
                                                                          │      └─ UI Design Unit (UNT_UI_DESIGN)        │
                                                                          │         └─ Staff: Kevin White                 │
                                                                          └─────────────────────────────────────────────┘
```

---

## 👥 Real Account & Role Assignments

| Role Code | Role Name | Real Tenant Person & Email | Title & Organizational Placement | Key Frontend Responsibilities & Views |
| :--- | :--- | :--- | :--- | :--- |
| `executive` | Executive / C-Level | **Sarah Jenkins**<br>`sarah.jenkins@globalapex.com` | Chief Executive Officer (CEO)<br>Division: `DIV_EXEC` | • **Executive Dashboard**: Level 4 Org Health (96.5%), Dept Leaderboards, 12-Month Health Line.<br>• **Strategic Targets**: Sets $100M Corporate Target & 4-Tier Target Cascade Map.<br>• **Performance BI**: Performance Heatmap, High-Risk Predictions.<br>• **Exports**: One-click Executive PDF & Excel Reports. |
| `dashboard_champion` | Dashboard Champion | **Elena Rostova**<br>`erostova@globalapex.com` | Strategy & Operations Lead<br>Dept: `DEP_STRAT` | • **Champion Dashboard**: Cross-department submission compliance rates, pending validation bottlenecks.<br>• **KPI System Admin**: Framework & Category tree (`KPICategory`).<br>• **Data Ingestion**: Bulk CSV/Excel actuals upload (`dry_run=true`).<br>• **System Trigger**: Calculation engine triggers & cache warming. |
| `supervisor` | Supervisor / Manager | **Wyatt Underwood**<br>`wunderwood@globalapex.com` | Manager of Engineering & IT<br>Dept: `DEP_ENG` | • **Manager Dashboard**: Team average score, team status breakdown (Green/Yellow/Red).<br>• **Approvals Queue**: Direct reports validation queue (`get_direct_reports()`), Approve/Reject with evidence preview.<br>• **Weight Manager**: Enforces 100% KPI weight sum per employee.<br>• **Adjustment Approvals**: Approves retroactive actual adjustments. |
| `supervisor` | Supervisor / Manager | **Adam Ortega**<br>`aortega@globalapex.com` | Manager of Product Management<br>Dept: `DEP_PROD` | • **Manager Dashboard**: Product team scorecards, pending review count.<br>• **Approvals Queue**: Product department submission approvals & evidence verification. |
| `staff` | Staff / Employee | **Rachel Adams**<br>`rachel.adams@globalapex.com` | Engineering Manager<br>Unit: `UNT_BACKEND` | • **Individual Dashboard**: Personal scorecard (Level 1), achievement badges.<br>• **Monthly Entry**: Submits monthly actual values + uploads evidence PDF (`July_Deal_Closure.pdf`).<br>• **Resubmissions & Escalations**: Resubmits rejected actuals; escalates disputes to Client Admin. |
| `staff` | Staff / Employee | **Alexander Wright**<br>`alexander.wright@globalapex.com` | Frontend Developer<br>Unit: `UNT_FRONTEND` | • **Monthly Entry**: Submits frontend sprint milestone actuals.<br>• **Scorecard**: Tracks personal progress trend lines. |
| `read_only` | Read-Only Auditor | **Internal Auditor** | Global Audit & Compliance | • **Read-Only Access**: View-only access across Executive, Manager, and Staff dashboard views.<br>• **Audit Logs**: Inspects `KPIHistory`, `ActualHistory`, and `TargetHistory` JSON diffs. |

---

## 🎯 Master KPI Definitions & 100% Weight Distribution

The organization evaluates performance using **two core master KPIs**:

1. **`KPI_2026_ENTERPRISE_DIGITAL_REV`** — *Master Enterprise Digital Revenue 2026*
   - **Type**: `FINANCIAL` ($ USD) | **Logic**: `HIGHER_IS_BETTER`
   - **Owner**: Sarah Jenkins (CEO) | **Weight**: **60.00%**
2. **`KPI_2026_CSAT_INDEX`** — *Customer Satisfaction Index (CSAT) 2026*
   - **Type**: `PERCENTAGE` (%) | **Logic**: `HIGHER_IS_BETTER`
   - **Owner**: Sarah Jenkins (CEO) | **Weight**: **40.00%**

### ⚖️ Multi-KPI Weight Allocation Rule (`KPIWeightManager.jsx`)
The system enforces that every active employee's KPI weights sum to **exactly 100%**:
$$\text{Total Weight} = 60.00\% \text{ (Revenue)} + 40.00\% \text{ (CSAT)} = \mathbf{100.00\%}$$
If a manager attempts to save weights summing to $90\%$ or $110\%$, `KPIWeightManager` displays an alert banner blocking submission.

---

## 🌳 4-Tier Target Cascading & Phasing Engine

### 1. Target Cascading Map (`TargetCascadeMap.jsx`)
CEO **Sarah Jenkins** sets the top-level annual corporate target of **$100,000,000.00 USD** for 2026. The `CascadeEngine` distributes the target down the 4-tier structure:

```text
Level 4: Organization Target ──► $100,000,000 USD (CEO: Sarah Jenkins)
                                         │
           ┌─────────────────────────────┴─────────────────────────────┐
           ▼ (WEIGHTED_BY_BUDGET Rule)                                 ▼
Level 3: Technology Division ──► $40,000,000 USD            Executive Division ──► $60,000,000 USD
  (Wyatt Underwood)                                           (Sarah Jenkins)
           │
           ├─────────────────────────────┬─────────────────────────────┐
           ▼ (WEIGHTED_BY_HEADCOUNT)     ▼                             ▼
Level 2: Engineering & IT ──► $25M     Product Management ──► $15M   Software Eng Sec ──► $15M
  (Wyatt Underwood)                      (Adam Ortega)
           │
           ┌─────────────────────────────┴─────────────────────────────┐
           ▼ (EQUAL_SPLIT Rule)                                        ▼
Level 1: Rachel Adams Target ──► $6,000,000 USD            David Miller Target ──► $6,000,000 USD
```

### 2. Monthly Target Phasing & Locked Cycle (`TargetPhasingModal.jsx`)
The $6,000,000 annual target for **Rachel Adams** is phased across 12 months using the **Seasonal Strategy**:
- **Q1 (Jan - Mar)**: 15% ($900,000 total $\rightarrow$ $300,000/mo$)
- **Q2 (Apr - Jun)**: 25% ($1,500,000 total $\rightarrow$ $500,000/mo$)
- **Q3 (Jul - Sep)**: 25% ($1,500,000 total $\rightarrow$ $500,000/mo$)
- **Q4 (Oct - Dec)**: 35% ($2,100,000 total $\rightarrow$ $700,000/mo$)

Once FY2026 begins, CFO **Alex Mercer** locks the phasing cycle. `TargetPhasingModal` displays a prominent `🔒 CYCLE LOCKED` badge, disabling inputs and enforcing target immutability.

---

## 📝 Step-by-Step User Actions & Frontend Flow

### Event 1: Staff Submission & Evidence Upload (Rachel Adams)
1. **Rachel Adams** logs into Falcon and clicks **Tasks & Submissions $\rightarrow$ Submit Actuals** (`/kpi/actuals/submit`) on `StaffSidebar`.
2. Selects KPI: `KPI_2026_ENTERPRISE_DIGITAL_REV` | Period: **July 2026** (Monthly Target: $500,000 USD).
3. Enters Actual Value: **$550,000.00 USD**.
4. Clicks **Attach Evidence File**, selects deal closing document `July_Deal_Closure.pdf`, and enters notes: *"Exceeded Q3 enterprise closing target."*
5. Clicks **Submit Actual Value**. The system sets status to `PENDING` and triggers a notification to manager **Wyatt Underwood**.

---

### Event 2: Supervisor Validation Queue & Evidence Verification (Wyatt Underwood)
1. **Wyatt Underwood** logs into Falcon and sees `1 Pending Approval` on his **`ManagerSidebar` $\rightarrow$ Pending Validations** (`/kpi/validations/pending`).
2. Opens **`ValidationQueue.jsx`**, displaying Rachel Adams's submission card:
   - User: **Rachel Adams** (Engineering Manager)
   - KPI: **Master Enterprise Digital Revenue 2026**
   - Period: **July 2026** | Target: **$500,000** | Actual Entered: **$550,000**
3. Clicks **📄 View Attached Evidence File ↗**, opening the secure download URL `/api/v1/kpis/evidence/{id}/download/`.
4. Inspects invoice details, enters manager comment *"Verified against Q3 deal close record"*, and clicks **Approve**.
5. Status transitions from `PENDING` $\rightarrow$ `APPROVED`. The system calculates Rachel's July KPI score:
   $$\text{Score} = \left(\frac{\$550,000}{\$500,000}\right) \times 100 = \mathbf{110.00\%} \quad (\text{Badge: } 🟢 \text{ Green})$$

---

### Event 3: Supervisor Rejection & Staff Resubmission (Alexander Wright)
1. Staff member **Alexander Wright** submits July actual of **$450,000.00 USD** without attaching proof.
2. Manager **Wyatt Underwood** reviews the queue in `ValidationQueue.jsx`, selects **Reject**, selects reason `MISSING_EVIDENCE`, and enters comment: *"Please attach signed client acceptance document."*
3. Status transitions to `REJECTED`. Alexander Wright receives an automated push alert.
4. Alexander opens **Past Submissions**, attaches the signed acceptance PDF, and clicks **Resubmit**, resetting status back to `PENDING` for re-review.

---

### Event 4: Disputed Escalation to Client Admin / CFO (Dispute Path)
1. If Alexander Wright believes his submission was unfairly rejected, he clicks **Escalate Dispute** on his submission card.
2. **`EscalationFormModal.jsx`** opens. Alexander enters escalation reason: *"Client PO signed on July 30th is attached; supervisor rejected due to timezone lag."*
3. Clicks **Submit to CFO Review**. The escalation routes directly to **Alex Mercer** (Client Admin / CFO) for override resolution.

---

### Event 5: Dashboard Champion Compliance Monitoring (Elena Rostova)
1. **Elena Rostova** logs in and clicks **`ChampionSidebar` $\rightarrow$ KPI Overview** (`/kpi/dashboard/champion`).
2. Views **Cross-Department Submission Compliance**:
   - Executive Division (`DIV_EXEC`): **100% Submission Rate**
   - Technology Division (`DIV_TECH`): **98% Submission Rate**
3. Notice 2 unvalidated submissions pending over 48 hours in DevOps, and dispatches an automated reminder alert to manager **Wyatt Underwood**.
4. Clicks **Bulk Operations $\rightarrow$ Bulk Upload** (`/kpi/bulk`), uploads ERP monthly actuals CSV with `dry_run = True`, verifies zero validation errors, and executes background ingestion.

---

### Event 6: Executive Organization Health & Heatmap Review (Sarah Jenkins)
1. CEO **Sarah Jenkins** logs in and opens **`ExecutiveSidebar` $\rightarrow$ Executive Overview** (`/kpi/dashboard/executive`).
2. Reviews **Level 4 Organization Health Score**: **96.50%** (🟢 Green).
3. Opens **Performance BI $\rightarrow$ Performance Heatmap** (`/kpi/analytics/heatmap`):
   - Grid matrix displays Departments (Executive, Strategy, Engineering, Product) vs Master KPIs (`Revenue`, `CSAT`).
   - Engineering Department displays **102.5%** score (🟢 Green).
4. Clicks **Executive Reports $\rightarrow$ Download Executive PDF**, generating a publication-ready ReportLab PDF scorecard with corporate header, pie charts, and department rankings.

---

### Event 7: Read-Only Audit Inspection (Internal Auditor)
1. The **Internal Auditor** logs in with `read_only` access.
2. **`ReadOnlySidebar.jsx`** displays a prominent `👁️ Read-Only Mode` badge.
3. Opens **Audit Logs** (`/kpi/audit-logs`), inspecting immutable audit trail entries in `KPIHistory`, `ActualHistory`, and `TargetHistory` with full JSON diffs, user IDs, and timestamps.
4. All edit and action buttons are disabled across all screens, guaranteeing read-only compliance.

---

## 📊 Summary of Role-Based Screen Interactions

| Role | Primary Sidebar Route | Key Component Used | Action Result |
| :--- | :--- | :--- | :--- |
| **Executive** | `/kpi/dashboard/executive` | `ExecutiveDashboardView`, `PerformanceHeatmap` | Views $96.5\%$ Org Health & downloads Executive PDF report. |
| **Champion** | `/kpi/dashboard/champion` | `ChampionDashboardView`, `BulkUploadPage` | Monitors 98% submission rate & executes dry-run CSV imports. |
| **Manager** | `/kpi/validations/pending` | `ValidationQueue.jsx`, `KPIWeightManager.jsx` | Previews evidence PDF, approves $550k actual, enforces 100% weight sum. |
| **Staff** | `/kpi/actuals/submit` | `SubmitActualModal`, `EscalationFormModal` | Submits $550k July actual with `July_Deal_Closure.pdf` evidence file. |
| **Read-Only** | `/kpi/audit-logs` | `AuditLogsPage`, `ReadOnlySidebar.jsx` | Inspects immutable audit history JSON diff logs in read-only mode. |

---

This document represents the exact real-data operational flow of your Falcon KPI Subsystem!
