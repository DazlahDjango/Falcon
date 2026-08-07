# Falcon Enterprise KPI System — Complete Operational & System Flow

## Executive Overview & Organizational Context

This document outlines the complete operational lifecycle, architectural design, data flow, and business logic of the **Falcon KPI Subsystem**. 

To illustrate how every component in your codebase functions in a real-world enterprise setting, this document uses a concrete organizational scenario throughout:

### Organizational Baseline Scenario: "Global Apex Solutions"
* **Total Headcount:** 50 Employees across a single multi-tenant organization (`tenant_id = "tenant-global-apex-2026"`).
* **Annual Corporate Target:** **$100,000,000 USD** ($100M Net Sales Revenue) set for Fiscal Year 2026.
* **Review Cadence:** Monthly actual entries & supervisor approvals, Quarterly performance reviews & trend analyses, Annual year-end target reconciliation.

```
                               ┌─────────────────────────────────────────┐
                               │       Global Apex Solutions (Org)       │
                               │    Executive: Sarah Jenkins (CEO)       │
                               │  Annual Target: $100,000,000 USD Net   │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                                                                     │
                 ▼                                                                     ▼
┌──────────────────────────────────┐                               ┌──────────────────────────────────┐
│   Commercial Division ($60M)     │                               │   Engineering Division ($40M)    │
├──────────────────────────────────┤                               ├──────────────────────────────────┤
│ • Sales Department ($50M)        │                               │ • Software Dev Dept ($25M)        │
│   - Enterprise Unit ($30M)       │                               │   - Core Platform Team           │
│   - SMB Sales Unit ($20M)        │                               │   - Mobile Dev Team              │
│ • Marketing Department ($10M)    │                               │ • DevOps & Cloud Dept ($15M)     │
└──────────────────────────────────┘                               └──────────────────────────────────┘
```

---

### Organizational Role Mapping (`accounts_user` Model Integration)

Your application leverages Django's `User` model (`apps.accounts.models.user`), utilizing specific role flags and manager relationships:

| Role Code | Role Name | Concrete Scenario Person | Key System Responsibilities & Permissions |
| :--- | :--- | :--- | :--- |
| `executive` | Executive / C-Level | **Sarah Jenkins** (CEO) | • Sets top-level corporate targets ($100M).<br>• Accesses Executive Dashboard & Org Health Metrics.<br>• Receives system-wide Red Alerts & High-Risk Predictions. |
| `client_admin` | Client Admin / CFO | **Alex Mercer** (CFO) | • Configures KPI Frameworks & Categories.<br>• Sets operational settings & performance cycle lock dates.<br>• Resolves final escalated validation disputes. |
| `dashboard_champion` | Dashboard Champion | **Elena Rostova** (Operations Lead) | • Monitors organization-wide monthly submission compliance.<br>• Executes bulk CSV/Excel data imports.<br>• Manages calculation triggers & red alert dispatches. |
| `supervisor` | Supervisor / Manager | **Mark Vance** (Sales Manager) | • Manages direct reports via `user.get_direct_reports()`.<br>• Validates monthly actual entries (Approve / Reject).<br>• Accesses Manager Dashboard & Team Scorecards. |
| `staff` | Staff / Employee | **James Wilson** (Enterprise Sales Lead) | • Submits monthly actual values & attaches evidence files.<br>• Tracks personal KPI Scorecards & progress trends.<br>• Requests historical actual adjustments if corrections are needed. |

---

## Complete End-to-End System Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                SYSTEM LIFECYCLE FLOW                                    │
│                                                                                         │
│  [1. KPI Definition] ──► [2. Target Setting] ──► [3. Target Cascading] ──► [4. Monthly Entry]│
│         │                                                                     │         │
│         ▼                                                                     ▼         │
│  [7. Score Engine]  ◄── [6. Supervisor Approval] ◄── [5. Evidence Upload] ◄──┘         │
│         │                                                                               │
│         ▼                                                                               │
│  [8. 4-Tier Rollup] ──► [9. Traffic Lights] ──► [10. Alerts & Predictions] ──► [11. Dashboards]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Strategic KPI Definition & Architecture Configuration

Before targets can be assigned, the structural foundation is configured by the **Client Admin** (**Alex Mercer**):

#### 1. Category Tree Hierarchy (`KPICategory`)
Categories organize KPIs into logical corporate pillars (e.g., Financial Performance, Customer Growth, Operational Efficiency).
* *Example:* Category `"Financial Performance"` (`code="FIN"`) is created. Sub-category `"Revenue & Sales"` (`code="FIN-REV"`) is assigned to parent `"FIN"`.

#### 2. KPI Definition (`KPI` Model)
A distinct KPI is created with strict mathematical parameters:
* **KPI Code & Name:** `REV_001` — *"Net Sales Revenue"*.
* **KPI Type (`kpi_type`):** `FINANCIAL` (Evaluated via `FinancialCalculator`).
* **Calculation Logic (`calculation_logic`):** `HIGHER_IS_BETTER` (Score increases as actual approaches/exceeds target).
* **Measurement Type (`measure_type`):** `CUMULATIVE` (Year-to-Date total accumulating across months).
* **Unit & Precision:** Unit = `"USD"`, Decimal Places = `2`.
* **Owner & Department:** Owned by **Mark Vance** (Sales Department).

#### 3. Individual Weight Allocations (`KPIWeight`)
Employees are evaluated on multiple KPIs. The system enforces that an employee's active KPI weights sum to exactly **100%**:
* *Example for James Wilson (Sales Lead):*
  - `REV_001` (Net Sales Revenue): **60% Weight**
  - `CUST_002` (New Enterprise Accounts Acquired): **30% Weight**
  - `SAT_001` (Customer Satisfaction CSAT): **10% Weight**
  - *Total Allocation:* **100%** (Verified via `KPIWeightViewSet.validate_sum`).

#### 4. Driver/Outcome Dependencies (`KPIDependency`)
KPIs are linked to model operational impact:
* *Example:* Marketing Lead KPI `LEAD_001` (*"Qualified Sales Leads"*) is flagged as an `UPSTREAM_DRIVER` for Sales KPI `REV_001` (*"Net Sales Revenue"*).
* *Circular Dependency Check:* `KPIValidator.validate_circular_dependency()` runs a Depth-First Search (DFS) traversal over `KPIDependency` records. If someone attempts to link `REV_001` back as a driver for `LEAD_001`, the system blocks the creation and returns a circular dependency path error.

#### 5. Strategic Linkage (`StrategicLinkage`)
Links `REV_001` directly to corporate objective *"Expand Market Share in North America"* with a strategic importance weight of $0.85$.

---

### Phase 2: Annual Target Setting & Phasing Engine

#### 1. Organizational Annual Target Setting (`AnnualTarget`)
At the start of Fiscal Year 2026, CEO **Sarah Jenkins** sets the top-level corporate goal:
* **KPI:** `REV_001` (*Net Sales Revenue*).
* **Year:** `2026`.
* **Target Value:** **$100,000,000.00 USD**.

#### 2. Target Phasing Engine (`MonthlyPhasing` & `TargetPhaser`)
The annual target of $100M must be split into 12 monthly operational targets. The system supports three phasing strategies:

1. **Equal Split Strategy (`EqualSplitStrategy`):**
   - Distributes $100M / 12 = **$8,333,333.33 USD** per month.
2. **Seasonal Pattern Strategy (`SeasonalStrategy`):**
   - Applies historical weighting (e.g., Q1 = 15%, Q2 = 25%, Q3 = 25%, Q4 = 35% due to year-end enterprise buying cycles).
   - *Result:* January = $5M, July = $8.33M, December = $15M.
3. **Custom Pattern Strategy (`CustomPatternStrategy`):**
   - Explicit manual target entry for each of the 12 months.

#### 3. Performance Cycle Locking (`PhasingLock` & `TargetLocker`)
Once the performance cycle begins (e.g., January 1, 2026), **Alex Mercer** triggers `TargetLocker.lock_phasing_for_cycle()`. 
* All 12 `MonthlyPhasing` records for 2026 transition `is_locked = True`.
* Any subsequent API attempt by staff or managers to edit monthly target values is blocked with HTTP 403 (`PhasingLockedError`).

---

### Phase 3: Multi-Level Target Cascading Engine

The top-level $100M organizational target must cascade down the 4-tier hierarchy to divisions, departments, units, and individual staff.

```
Level 4: Organization Target ──► $100,000,000 USD (CEO: Sarah Jenkins)
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼ (WEIGHTED_BY_BUDGET Rule)                               ▼
Level 3: Commercial Dept Target ──► $60,000,000 USD        Engineering Dept ──► $40,000,000 USD
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼ (WEIGHTED_BY_HEADCOUNT Rule)                            ▼
Level 2: Enterprise Sales Unit ──► $30,000,000 USD        SMB Sales Unit ──► $20,000,000 USD
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼ (EQUAL_SPLIT Rule)                                      ▼
Level 1: James Wilson Target ──► $6,000,000 USD           Other Staff Targets (x4) ──► $6M each
```

#### Cascading Rules (`CascadeRule` & `TargetCascader`):
The `CascadeEngine` supports four mathematical distribution rules:

1. **`WEIGHTED_BY_BUDGET`:** Department target = Parent Target $\times \frac{\text{Department Budget}}{\text{Total Division Budget}}$.
   - Commercial Division gets **$60M** ($60\%$), Engineering gets **$40M** ($40\%$).
2. **`WEIGHTED_BY_HEADCOUNT`:** Unit target = Department Target $\times \frac{\text{Unit Headcount}}{\text{Total Department Headcount}}$.
   - Enterprise Sales Unit (5 people) gets **$30M**, SMB Sales Unit (5 people) gets **$20M**.
3. **`EQUAL_SPLIT`:** Divides target equally among all members.
   - $30M Enterprise Sales target split equally among 5 sales leads = **$6,000,000.00 USD annual target per sales lead**.
4. **`CUSTOM`:** Explicit user-specified contribution percentages.

#### Audit & Safety (`CascadeMap` & `CascadeRollback`):
* Every relationship is recorded in `CascadeMap` with `contribution_percentage` tracking.
* If a target reorganization occurs, `CascadeRollback.rollback_cascade()` cleanly reverses the cascade tree within a database transaction without leaving orphaned child targets.

---

### Phase 4: Monthly Actual Entry, Bulk Ingestion & Secure Evidence Upload

#### 1. Monthly Actual Submission (`MonthlyActual` & `ActualEntry`)
At the end of July 2026, **James Wilson** logs into the system to report his July sales actual:
* **KPI:** `REV_001` (*Net Sales Revenue*).
* **Period:** Year `2026`, Month `7` (July).
* **Monthly Target:** $500,000.00 USD.
* **Actual Value Entered:** **$550,000.00 USD**.
* **Status:** Set to `PENDING` (awaiting supervisor validation).

#### 2. Bulk Data Ingestion (`BulkActualUploadView` & Celery Task)
For teams where actuals come from ERP/CRM exports, **Elena Rostova** (Dashboard Champion) uploads a 500-row CSV file:
* **Dry-Run Validation:** Setting `dry_run = True` validates all rows, KPI IDs, and date ranges inside a rollback transaction without committing data to the database.
* **Background Ingestion:** File is saved to temporary workspace storage (`tmp/uploads/`) and processed asynchronously by `process_bulk_upload_task.delay()`.

#### 3. Evidence Attachment & Secure Download Access (`Evidence` Model & `EvidenceViewSet`)
To prove the $550,000 actual, James uploads an enterprise deal closing invoice (`July_Deal_Closure.pdf`):
* File is stored under tenant storage directory.
* **Security & Permission Control:** Raw `/media/uploads/...` URLs are strictly hidden. `EvidenceSerializer.get_file_url()` generates authorized download endpoints:
  `https://api.globalapex.com/api/v1/kpis/evidence/{evidence_id}/download/`.
* When accessed, `EvidenceViewSet.download()` inspects `request.user.tenant_id` and permission flags. If a user from another tenant or unauthorized role requests the URL, access is denied with HTTP 403 Forbidden.

---

### Phase 5: Supervisor Validation & Multi-Stage Approval Workflow

```
[Staff Enters Actual] ──► Status: PENDING
                               │
                               ▼
                    [Supervisor Review Queue]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [Supervisor Approves]                 [Supervisor Rejects]
            │                                     │
            ▼                                     ▼
Status: APPROVED (Immutable)            Status: REJECTED
            │                                     │
            ▼                                     ▼
[Triggers Calculation Engine]           [Notification Sent to Staff]
                                                  │
                                                  ▼
                                        [Staff Resubmits Entry]
```

#### 1. Pending Supervisor Queue (`ValidationRecordViewSet.pending_summary`)
Sales Manager **Mark Vance** logs into his portal. The system queries `request.user.get_direct_reports()` and displays his pending validation queue:
* Pending Count: 5 submissions.
* Oldest Pending: James Wilson (July Actual, 2 days pending).

#### 2. The Approval Path (`ValidationApprover`)
Mark reviews James's $550,000 entry and opens the attached `July_Deal_Closure.pdf`:
* Mark clicks **Approve** with comment *"Verified against Q3 Salesforce report"*.
* `MonthlyActual` status transitions from `PENDING` $\rightarrow$ `APPROVED`.
* **Immutability Enforcement:** Once `APPROVED`, direct edits to `actual_value` are blocked by `HistoricalDataError`.

#### 3. The Rejection & Resubmission Path (`ValidationRejecter` & `ValidationResubmission`)
If another sales lead submits $500,000 without evidence:
* Mark clicks **Reject**, selecting `RejectionReason` = `MISSING_EVIDENCE` with comment *"Please attach customer signed PO"*.
* Status transitions to `REJECTED`. A notification is dispatched to the staff member.
* The staff member attaches the signed PO and calls `ValidationResubmission.resubmit()`, resetting status back to `PENDING` for re-evaluation.

---

### Phase 6: Disputed Escalations & Retroactive Actual Adjustments

#### 1. Validation Dispute Escalations (`Escalation` Model & `ValidationEscalator`)
If a staff member believes their supervisor unfairly rejected a valid submission:
* Staff creates an `Escalation` record routing to **Alex Mercer** (Client Admin / CFO).
* Escalation status becomes `PENDING` / `REVIEWING`.
* Alex reviews the audit trail and calls `ValidationEscalator.resolve_escalation()`, overriding the rejection decision.

#### 2. Retroactive Historical Adjustments (`ActualAdjustment` & `ActualAdjustmentService`)
Three months later (in October), an audit reveals that a July sales contract value was revised from $550,000 down to $520,000 due to a credit memo:
* Because approved actuals are immutable, James cannot edit the July record directly.
* James submits an `ActualAdjustment` request:
  - Original Actual ID: July Record ($550,000).
  - Adjusted Value: $520,000.
  - Reason: *"Post-closing credit memo adjustment"*.
* Manager Mark Vance receives the request and clicks **Approve Adjustment**.
* The system updates the historical July `MonthlyActual`, creates an `ActualHistory` audit snapshot, and triggers periodic score recalculation for July.

---

### Phase 7: Score Calculation Engine & Mathematical Formulas

Once a monthly actual is `APPROVED`, the **Calculation Engine** (`CalculationOrchestrator`) evaluates performance.

#### 1. Strategy Calculators (`calculators.py`)
Depending on `kpi.kpi_type`, the orchestrator instantiates the appropriate calculator:
* `FinancialCalculator`: Handles currency targets & cumulative sums.
* `PercentageCalculator`: Evaluates ratios & percentage metrics.
* `MilestoneCalculator`: Evaluates binary/phase completion ($0\%$ to $100\%$).
* `TimeCalculator`: Evaluates duration/latency metrics.

#### 2. Directional Math Formulas (`formulas.py`)

##### A. Higher-Is-Better Formula (`HigherIsBetterFormula`):
For Revenue (`REV_001`): Target = $500,000, Actual = $550,000.
$$\text{Score} = \left( \frac{\text{Actual}}{\text{Target}} \right) \times 100 = \left( \frac{550,000}{500,000} \right) \times 100 = \mathbf{110.00\%}$$

##### B. Lower-Is-Better Formula (`LowerIsBetterFormula`):
For Customer Churn Rate: Target = 2.0%, Actual = 1.0%.
$$\text{Score} = \left( 2 - \frac{\text{Actual}}{\text{Target}} \right) \times 100 = \left( 2 - \frac{1.0}{2.0} \right) \times 100 = \mathbf{150.00\%}$$

#### 3. Mathematical Precision Safeguards
All score outputs are calculated using Python `Decimal` data types, avoiding IEEE 754 floating-point rounding bugs, and capped according to KPI boundary rules (`target_min`, `target_max`).

---

### Phase 8: 4-Tier Hierarchy Score Aggregation Rollups

Score aggregation operates bottom-up across four organizational tiers (`HierarchyAggregator`):

```
Level 4: Organization Rollup Score ──► 96.50% (Weighted Average across Departments)
                                                ▲
                                                │
Level 3: Department Rollup Score  ──► 98.20% (Headcount-Weighted Avg of Units)
                                                ▲
                                                │
Level 2: Unit Rollup Score        ──► 102.50% (Unweighted Avg of Member Scores)
                                                ▲
                                                │
Level 1: Individual Score         ──► James Wilson overall score: 106.00%
                                      (60% Net Sales + 30% New Accounts + 10% CSAT)
```

1. **Level 1 — Individual Score (`IndividualAggregator`):**
   - James Wilson's Weighted Score = $(110.00\% \times 0.60) + (100.00\% \times 0.30) + (100.00\% \times 0.10) = \mathbf{106.00\%}$.
2. **Level 2 — Unit Rollup (`UnitAggregator`):**
   - Unweighted average of the 5 sales leads in Enterprise Sales Unit = $\mathbf{102.50\%}$.
3. **Level 3 — Department Rollup (`DepartmentAggregator`):**
   - Headcount-weighted average of Enterprise Sales Unit (5 people @ 102.5%) and SMB Sales Unit (5 people @ 93.9%) = $\mathbf{98.20\%}$.
4. **Level 4 — Organization Rollup (`OrganizationAggregator`):**
   - Department-weighted average across Commercial, Engineering, and Operations = $\mathbf{96.50\%}$.

---

### Phase 9: Traffic Lights, Multi-Month Red Alerts & Risk Predictions

#### 1. Traffic Light Evaluation (`TrafficLightEvaluator` & `TrafficLight` Model)
Every score is automatically assigned a visual status badge:

| Score Range | Status | Badge | Description |
| :--- | :---: | :---: | :--- |
| **Score $\ge 90.00\%$** | `GREEN` | 🟢 | Target Achieved / Excellent Performance |
| **$50.00\% \le \text{Score} < 90.00\%$** | `YELLOW` | 🟡 | Target Partially Met / Needs Attention |
| **Score $< 50.00\%$** | `RED` | 🔴 | Critical Underperformance |

#### 2. Consecutive Red Month Alert Trigger
The system tracks `consecutive_red_count`. If a staff member or KPI scores `RED` ($<50\%$) for **2 or more consecutive months**:
* The system flags a **Red Alert** state (`consecutive_red_count >= 2`).
* An automated high-priority notification is immediately generated for Manager Mark Vance and CEO Sarah Jenkins.

#### 3. Trend Analysis & Slope Regression (`TrendAnalyzer`)
Calculates moving averages and performance trajectory across 3 to 12 months:
* `IMPROVING` (Positive slope $> +2.0$)
* `STABLE` (Slope between $-2.0$ and $+2.0$)
* `DECLINING` (Negative slope $< -2.0$)

#### 4. Predictive Risk Machine (`RiskPredictor`)
Uses multi-month historical variance and slope regression to predict future underperformance:
* If an employee's score trajectory indicates a $75\%$ probability of missing next quarter's target, `RiskPredictionsView` highlights the KPI under **High Risk Indicators**.

---

### Phase 10: Automated Notifications & Alert Dispatch Engine

Your `NotificationService` (`apps/kpi/services/notifications.py`) runs automated background schedules:

1. **Red Alert Dispatches:** Triggered immediately when `consecutive_red_count >= 2`. Sends email/in-app alert to Manager and Executive.
2. **Missing Data Reminders:** Scans for users who have not submitted actuals 3 days prior to the monthly cutoff date, sending automated push reminders.
3. **Pending Validation Alerts:** Daily summary email sent to Managers listing unvalidated direct-report submissions.

---

### Phase 11: Role-Based Dashboard Ecosystem

The system provides 5 specialized dashboard API views (`apps/kpi/api/v1/views/dashboard.py`):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                ROLE DASHBOARD VIEWS                                    │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ Individual View   │ Manager View      │ Executive View    │ Champion View              │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ • Personal Score  │ • Team Avg Score  │ • Org Health      │ • Org Submission Rate      │
│ • Progress Bars   │ • Pending Reviews │ • Dept Rankings   │ • Unvalidated Bottlenecks  │
│ • Achievement Badges│ • Status Breakdown│ • Risk Level      │ • Red Alert Overview       │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

1. **Individual Dashboard (`IndividualDashboardView`):**
   - Shows James Wilson his overall score (106.0%), personal KPI scorecards, target vs actual progress bars, and recent approval logs.
2. **Manager Dashboard (`ManagerDashboardView`):**
   - Shows Mark Vance his team average score (98.2%), team status breakdown (3 Green, 2 Yellow, 0 Red), pending validation count, and team ranking.
3. **Executive Dashboard (`ExecutiveDashboardView`):**
   - Shows CEO Sarah Jenkins total Organization Health (96.5%), tenant completion rate, high-risk KPI count, department leaderboard, and 12-month health trend line.
4. **Champion Dashboard (`ChampionDashboardView`):**
   - Shows Operations Lead Elena Rostova cross-department submission compliance rates (e.g., Sales 100%, Marketing 85%), pending escalations, and system bottlenecks.
5. **Admin System Overview (`KPIOverviewDashboardView`):**
   - System-wide statistics on active categories, KPI activation rates, and audit logs.

---

### Phase 12: Performance Heatmaps & Materialized View Caching

#### 1. Performance Heatmap (`PerformanceHeatmapView`)
Generates a two-dimensional grid matrix:
* **Y-Axis:** Departments (Sales, Marketing, Software Dev, DevOps, Finance).
* **X-Axis:** Core KPIs (`REV_001`, `CUST_002`, `SAT_001`).
* **Cells:** Color-coded average score intensity (Green / Yellow / Red), allowing executives to spot organizational weak spots in seconds.

#### 2. Materialized View Caching & Live Fallback (`live_analytics.py`)
To ensure executive dashboards load in $<50\text{ms}$ across large datasets:
* Queries read from PostgreSQL materialized views (`kpi_summary_mv`, `department_rollup_mv`, `organization_health_mv`).
* If materialized views are being refreshed or unavailable, `get_department_rollups(prefer_mv=False)` seamlessly executes live database aggregation fallbacks.

---

### Phase 13: Reporting & Multi-Format Export Engine

The reporting subsystem (`apps/kpi/services/report.py` & `export.py`) produces publication-ready exports:

1. **Executive PDF Reports (`ReportGenerator.generate_pdf_report`):**
   - Generated via **ReportLab**. Includes branded corporate header, Executive Summary, Department Performance Table, and Traffic Light breakdown pie charts.
2. **Excel Analytics Workbooks (`generate_excel_report`):**
   - Generated via **OpenPyXL**. Multi-tab formatted workbooks with conditional formatting (green/yellow/red cell highlights), auto-fitted columns, and formula summaries.
3. **CSV Exports (`KPIExportView` / `ScoreExportView`):**
   - Raw data streams formatted for BI tool ingestion (Tableau, PowerBI).

---

### Phase 14: Multi-Tenancy Isolation, PostgreSQL RLS & Full Audit Trail

```
                        ┌────────────────────────────────────────┐
                        │         Incoming API Request           │
                        └───────────────────┬────────────────────┘
                                            │
                                            ▼
                  ┌────────────────────────────────────────────────────┐
                  │          OrganizationContextMiddleware             │
                  │   Extracts Tenant ID & sets Thread-Local Context   │
                  └─────────────────────────┬──────────────────────────┘
                                            │
                                            ▼
                  ┌────────────────────────────────────────────────────┐
                  │           TenantDatabaseRouterMiddleware           │
                  │  1. SET search_path TO "org_tenant_schema", public │
                  │  2. SET app.current_tenant_id = 'tenant-uuid'      │
                  └─────────────────────────┬──────────────────────────┘
                                            │
                                            ▼
                  ┌────────────────────────────────────────────────────┐
                  │    PostgreSQL Engine Row-Level Security (RLS)      │
                  │   Filters database rows at native engine layer     │
                  └─────────────────────────┬──────────────────────────┘
                                            │
                                            ▼
                  ┌────────────────────────────────────────────────────┐
                  │      Django ORM Default TenantScopedManager        │
                  │ Automatically appends .filter(tenant_id=tenant_id) │
                  │     & excludes soft-deleted records (is_deleted)   │
                  └─────────────────────────┬──────────────────────────┘
```

#### 1. Native PostgreSQL Row-Level Security (RLS)
* `TenantDatabaseRouterMiddleware` executes `set_config('app.current_tenant_id', tenant_id)` on every database session.
* PostgreSQL RLS policies automatically filter table rows at the database engine layer. Even if raw SQL is executed, cross-tenant data leakage is physically impossible.

#### 2. ORM Defense-in-Depth (`TenantScopedManager`)
* Every KPI model's default `objects` manager automatically injects `tenant_id` filtering and excludes `is_deleted=True` soft-deleted records.

#### 3. Enterprise Audit Trail (`KPIHistory`, `ActualHistory`, `TargetHistory`)
* Every change, update, target adjustment, or validation decision writes an immutable snapshot to audit history tables, capturing the user ID, timestamp, old value, new value, JSON diff, and reason text.

---

## Summary Matrix: Operational Scenario Reference

| Scenario Step | Actor | Action Performed | System Model / Class Involved | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **1. Target Setting** | Sarah Jenkins (CEO) | Sets $100M annual corporate target | `AnnualTarget`, `TargetSetter` | $100M target stored for 2026. |
| **2. Phasing & Locking** | Alex Mercer (CFO) | Phases target into 12 months & locks cycle | `MonthlyPhasing`, `TargetPhaser`, `TargetLocker` | Target locked ($8.33M/mo or seasonal). |
| **3. Cascading** | System Engine | Cascades target to departments & staff | `CascadeEngine`, `CascadeRule`, `CascadeMap` | James Wilson assigned $6M annual target. |
| **4. Monthly Submission** | James Wilson (Staff) | Submits July actual ($550k) + uploads PDF invoice | `MonthlyActual`, `Evidence`, `ActualEntry` | Entry created with status `PENDING`. |
| **5. Evidence Security** | System API | Generates permission-checked download URL | `EvidenceSerializer`, `EvidenceViewSet.download` | Download URL secured via API endpoint. |
| **6. Validation** | Mark Vance (Manager) | Reviews & approves July actual | `ValidationRecord`, `ValidationApprover` | Status becomes `APPROVED` (Immutable). |
| **7. Calculation** | Orchestrator | Calculates score for July ($550k / $500k) | `CalculationOrchestrator`, `FinancialCalculator` | Score = **110.00%**, Traffic Light = 🟢. |
| **8. Aggregation** | Hierarchy Aggregator | Rolls up scores to Unit, Dept, and Org | `HierarchyAggregator`, `AggregatedScore` | Org Health Score updated to **96.50%**. |
| **9. Red Alert Check** | Alert Engine | Checks consecutive red month counts | `TrafficLightEvaluator`, `NotificationService` | 🟢 Green status (No alert triggered). |
| **10. Executive Review** | Sarah Jenkins (CEO) | Opens Executive Dashboard & downloads PDF | `ExecutiveDashboardView`, `ReportGenerator` | Interactive dashboard & PDF report generated. |

---

This complete system flow reflects the full capabilities and architectural excellence of your Falcon KPI Subsystem!
