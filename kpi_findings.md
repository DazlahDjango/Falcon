# Comprehensive System Review & Findings: `apps/kpi` (KPI Engine)

## Executive Summary & System Rating

- **App Name**: `apps/kpi` (Performance Management & Strategic Execution Engine)
- **Overall System Rating**: **9.5 / 10** (Production-Grade, Enterprise Engine)
- **Primary Domain**: Business-Level Multi-Tenant Performance Management, Goal Cascading, Phased Target Setting, Supervisor Validation Pipelines, Real-Time Scorecard Calculation & Trend Analytics.

`apps/kpi` is the core backbone of the entire **Falcon Performance Management System (Falcon PMS)**. The application demonstrates exceptional architectural design, strict adherence to multi-tenant isolation, clean separation of concerns, and full alignment with the commercial proposal outlined in `Docs/dep.md`.

---

## 1. Alignment with System Proposal (`Docs/dep.md`)

| Proposal Feature (`Docs/dep.md`) | `apps/kpi` Implementation | Status |
| :--- | :--- | :--- |
| **Multi-Tenant SaaS Isolation** | All models inherit `BaseKPIModel` (`tenant_id`), with unique constraints (`tenant_id`, `code`), and DB index scoping. | ✅ 100% Aligned |
| **Multi-Sector Flexibility** | `SectorType` enum (Commercial, NGO, Public Sector, Consulting) & `CategoryType` enum in `constants.py`. | ✅ 100% Aligned |
| **6 KPI Data Types** | `KPIType`: COUNT, PERCENTAGE, FINANCIAL, MILESTONE, TIME, IMPACT in `constants.py` and `engine/calculators.py`. | ✅ 100% Aligned |
| **Smart Calculation Logic** | `CalculationLogic`: `HIGHER_IS_BETTER` (`Actual / Target * 100`) vs `LOWER_IS_BETTER` (`Target / Actual * 100`) in `engine/formulas.py`. | ✅ 100% Aligned |
| **Cumulative vs Non-Cumulative** | `MeasureType`: `CUMULATIVE` (YTD sum) vs `NON_CUMULATIVE` (latest period) in `engine/formulas.py`. | ✅ 100% Aligned |
| **Target Phasing & Locking** | `AnnualTarget`, `MonthlyPhasing`, `PhasingLock` models with `is_locked` checks in `validators.py` and `signals.py`. | ✅ 100% Aligned |
| **Supervisor Validation & Evidence** | `MonthlyActual` (`PENDING`, `APPROVED`, `REJECTED`, `ADJUSTED`), `ValidationRecord`, `RejectionReason`, `Evidence` (File attachments). | ✅ 100% Aligned |
| **Dashboard Champion Model** | `CascadeMap`, `CascadeRule` target setup, organizational goal cascading down to department and individual levels. | ✅ 100% Aligned |
| **Traffic Lights & Red Alerts** | `TrafficLightEvaluator` (🟢 Green >=90%, 🟡 Yellow 50-89%, 🔴 Red <50%), `TrendAnalyzer`, `RiskPredictor`, Celery red alert tasks. | ✅ 100% Aligned |

---

## 2. Detailed Architectural Review of `apps/kpi` Modules

### A. Data Models (`apps/kpi/models/`)
1. **`KPI` (`definition.py`)**: Core definition model containing `code`, `name`, `kpi_type`, `calculation_logic`, `measure_type`, `unit`, `decimal_places`, `target_min`, `target_max`, `owner`, `department`, `strategic_objective`, `is_active`.
2. **`KPIHistory` & `KPIWeight` (`definition.py`)**: Audit trail for definition changes, and user percentage weight assignments (enforced to sum to 100% per user via `KPIValidator`).
3. **`AnnualTarget` & `MonthlyPhasing` (`target.py`)**: Annual target container and 12-month breakdown with lock enforcement (`is_locked=True`, `locked_at`, `locked_by`).
4. **`MonthlyActual` & `ActualAdjustment` (`actual.py`)**: Real performance figures entered by staff (`status='PENDING'`), approved by supervisors (`status='APPROVED'`). Supports `ActualAdjustment` requests for post-approval edits with full audit trails.
5. **`Evidence` (`actual.py`)**: Supports document uploads (`.pdf`, `.docx`, `.xlsx`, `.jpg`, etc.) attached to monthly actual submissions for validation proof.
6. **`ValidationRecord`, `ValidationComment`, `RejectionReason`, `Escalation` (`validation.py`)**: Structured supervisor approval pipeline, reason categorization, and escalation to higher-level managers/HR.
7. **`CascadeMap`, `CascadeRule`, `CascadeHistory` (`cascade.py`)**: Goal cascading hierarchy linking parent targets to child targets with contribution percentages.
8. **`Score`, `TrafficLight`, `CalculationLog` (`calculation.py`)**: Calculated percentage scores, traffic-light status evaluation, and calculation execution logs.

### B. Calculation & Aggregation Engine (`apps/kpi/engine/`)
- **`formulas.py`**: Clean mathematical formulas for `HigherIsBetterFormula`, `LowerIsBetterFormula`, `CumulativeFormula`, `NonCumulativeFormula`, and `WeightedAverageFormula`. Clamps scores between 0% and 100%.
- **`calculators.py`**: Specialized calculator classes for each of the 6 KPI types (`NumericCalculator`, `PercentageCalculator`, `FinancialCalculator`, `MilestoneCalculator`, `TimeCalculator`, `ImpactCalculator`).
- **`traffic_light.py`**: `TrafficLightEvaluator` maps scores to Green/Yellow/Red. `TrendAnalyzer` computes linear regression slopes over 3 to 6 months. `RiskPredictor` predicts underperformance risk level (LOW, MEDIUM, HIGH, CRITICAL).
- **`aggregator.py`**: `HierarchyAggregator` rolls up individual scores to team, department, and organization levels using weighted averages.
- **`orchestrator.py`**: `CalculationOrchestrator` runs period calculations with distributed lock protection (`calc_lock:{tenant_id}:{year}:{month}`) and maintenance mode checks.

### C. Service Layer (`apps/kpi/services/`)
- **`kpi.py`**: `KPIService` for CRUD, activation, deactivation, and weighting validation.
- **`target.py`**: `TargetService` for setting annual targets, applying phasing strategies (equal split, seasonal, custom), and locking phasing periods.
- **`actual.py`**: `ActualService` for submitting actuals, resubmitting rejected actuals, uploading evidence, and requesting actual adjustments.
- **`validation.py`**: `ValidationService` for supervisor approvals, rejections with category reasons, and escalation triggers.
- **`cascade.py`**: `TargetCascader`, `CascadeMapper`, and `CascadeRollback` for managing target cascading and verifying 100% total contribution integrity.
- **`dashboard.py`**: `DashboardService` generating supervisor team views, individual scorecards, and departmental heatmaps.
- **`notifications.py`**: Handles in-app and email notifications for validation requests, rejections, red alerts, and missing data reminders (5th of each month).

### D. Signals & WebSockets (`signals.py` & `consumers.py`)
- **Signals**: Automates score recalculation when actuals are approved, invalidates dashboard caches, and dispatches Celery background tasks on weight or target updates.
- **WebSockets (`consumers.py`)**: Real-time channels for live dashboard updates, actual submission events, and validation status updates (`KPIEventBroadcaster`).

---

## 3. Cascading & Organizational Structure Integration (`apps/structure`)

`apps/kpi` seamlessly integrates with `apps/structure` to support multi-level goal cascading:

```
[ Organization Target ]
          │
          ▼
  [ Division Target ]
          │
          ▼
[ Department Target ] (apps.structure.models.Department)
          │
          ▼
   [ Section Target ]
          │
          ▼
    [ Unit Target ]
          │
          ▼
[ Individual Target ] (apps.accounts.models.User / Employment)
```

- **Hierarchy Mapping**: `CascadeMap` supports cascading across all 6 structural levels (`organization_target`, `division_target`, `department_target`, `section_target`, `unit_target`, `individual_target`).
- **Cascade Rules**: `CascadeRule` supports `EQUAL_SPLIT`, `WEIGHTED` (by headcount), `WEIGHTED_BY_BUDGET`, and `CUSTOM` rule configurations.
- **Manager Resolution**: `signals.py` resolves line managers dynamically via `Employment.objects.filter(employee=employment, relation_type='solid')` in `apps/structure`.

---

## 4. Data Entry, Supervisor Validation & Evidence Workflow

The data validation pipeline implements strict separation of duties and evidence verification:

```
Step 1: Employee Submits Actual Data + Evidence Document (.pdf, .xlsx, .png)
                  │
                  ▼
       [ MonthlyActual (status='PENDING') ]
                  │
                  ▼
Step 2: Supervisor Receives Alert (WebSocket + In-App / Email Notification)
                  │
         ┌────────┴────────┐
         ▼                 ▼
   [ APPROVED ]       [ REJECTED ]
         │                 │
         │                 └► Rejection Reason Category (Data Quality, Missing Evidence, etc.)
         │                    Notification sent to Employee to Resubmit
         ▼
Step 3: Score Engine Calculates Official Performance Score & Updates Dashboards
```

- **Post-Approval Edits**: Once approved, actuals can only be modified via `ActualAdjustment` requests which require supervisor/admin re-approval, maintaining an immutable audit log (`ActualHistory`).

---

## 5. Legacy KPI Reporting (`apps/kpi/services/report.py`) vs Central `reportplt` Strategy

- **Current State**: `apps/kpi/services/report.py` contains a self-contained PDF/Excel/CSV generator (765 lines) using ReportLab and OpenPyXL directly within `apps/kpi`.
- **Target Centralization Strategy (`apps/reportplt`)**:
  - Centralize KPI report generation inside `apps/reportplt` by adding a dedicated `KPIDataExtractor` at `apps/reportplt/services/extraction/production/kpi_extractor.py`.
  - Expose specialized tenant-isolated KPI report types in `reportplt`:
    1. `kpi_individual_scorecard`: Individual 12-Month Performance Scorecard
    2. `kpi_departmental_heatmap`: Departmental KPI Rollup & Heatmap Report
    3. `kpi_cascade_tree`: Organizational Target Cascading Audit Report
    4. `kpi_red_alerts`: Underperformance & Red Alert Escalation Audit Report
    5. `kpi_validation_compliance`: Monthly Data Submission & Validation Compliance Report
    6. `kpi_executive_summary`: Tenant KPI Strategic Performance Executive Summary

---

## 6. Security, Isolation & CIA Triad Audit

1. **Confidentiality (Data Isolation)**: Every model includes `tenant_id`. Queries enforce `tenant_id` filters. Permission classes (`api/v1/permissions.py`) verify supervisor access (`is_manager_of`) and tenant membership.
2. **Integrity (Data Accuracy & Locking)**: Targets and monthly phasings are locked after cycle activation (`is_locked=True`). Scores cannot be forged because they are calculated asynchronously by `CalculationOrchestrator`. Weights are validated to sum to exactly 100%.
3. **Availability (Performance & Scaling)**: Distributed locks prevent race conditions during bulk calculation. Materialized cache keys (`invalidate_kpi_cache`, `invalidate_user_dashboards`) ensure high-speed dashboard reads under heavy concurrent loads.

---

## 7. Minor Cleanup / Technical Debt Items

1. **Duplicate Import in `apps/kpi/signals.py`**:
   - Line 9: `from apps.structure.models import Department, Employment, Employment` (duplicate `Employment`).
2. **Legacy `report.py` Refactoring**:
   - Once approved by the user, deprecate standalone `apps/kpi/services/report.py` in favor of `apps/reportplt` real-data KPI extractors.

---

## Conclusion & Next Steps

`apps/kpi` is robust, well-architected, and production-ready. 

**Next Recommended Step**: Upon user approval of this findings report, proceed to integrate real-data KPI reporting into `apps/reportplt`!
