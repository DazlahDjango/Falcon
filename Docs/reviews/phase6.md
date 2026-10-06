# Falcon PMS - Reviews Subsystem: Phase 6 Comprehensive Engineering & Integration Report

**Document Scope:** Strategic Organization & Appraisal Reporting Suite, Review Templates Architecture & Cloning, Dynamic Difficulty Coefficients Engine, Live Dashboard Metrics, Global Settings Management, Celery Scheduled Reporting Tasks, and RBAC Enforcement  
**Subsystem:** Performance Management Subsystem (Reviews App)  
**Tenant Context:** `6102e576-12b5-4347-9bb8-4ddae94b8a94` (*Falcon Technologies*)  
**Active Review Cycle:** `Cycle ID: 9` (*FY2026 Falcon Annual Appraisal Cycle*)  
**Target File Location:** `Docs/reviews/phase6.md`  

---

## 📑 Table of Contents
1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Tested Personas & Real-Data Actors](#2-tested-personas--real-data-actors)
3. [Test Suite Execution & Verification (Phase 6 Suite)](#3-test-suite-execution--verification-phase-6-suite)
4. [End-to-End Phase 6 Architecture & Lifecycles](#4-end-to-end-phase-6-architecture--lifecycles)
   - [4.1 Strategic Appraisal & Organizational Reports Engine](#41-strategic-appraisal--organizational-reports-engine)
   - [4.2 Review Templates Architecture, Versioning & Cloning](#42-review-templates-architecture-versioning--cloning)
   - [4.3 Dynamic Difficulty Coefficients Multiplier Engine](#43-dynamic-difficulty-coefficients-multiplier-engine)
   - [4.4 Live Dashboard Metrics & Diagnostics](#44-live-dashboard-metrics--diagnostics)
   - [4.5 Global Subsystem Configuration & Administrative Resets](#45-global-subsystem-configuration--administrative-resets)
   - [4.6 Asynchronous Celery Reporting & Scheduled Maintenance Tasks](#46-asynchronous-celery-reporting--scheduled-maintenance-tasks)
   - [4.7 Role-Based Access Control (RBAC) & Boundary Enforcement](#47-role-based-access-control-rbac--boundary-enforcement)
5. [Frontend Data Contracts & Serialized Payloads](#5-frontend-data-contracts--serialized-payloads)
   - [5.1 Strategic Reports Payloads](#51-strategic-reports-payloads)
   - [5.2 Review Templates Payloads](#52-review-templates-payloads)
   - [5.3 Dynamic Coefficients Payloads](#53-dynamic-coefficients-payloads)
   - [5.4 Live Dashboard Metrics & Settings Reset Payloads](#54-live-dashboard-metrics--settings-reset-payloads)
6. [Potential Edge Cases, Pitfalls & Implemented Guardrails](#6-potential-edge-cases-pitfalls--implemented-guardrails)
7. [API Quick Reference Table](#7-api-quick-reference-table)

---

## 1. Executive Summary & Core Objectives

Phase 6 delivers the organizational governance, strategic appraisal reporting suite, customizable review form templates, difficulty normalization multipliers, live dashboard metrics aggregation, and scheduled background workers for the Falcon Performance Management Subsystem.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PHASE 6 GOVERNANCE & REPORTING ECOSYSTEM                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌─────────────────────────┐  │
│   │  Strategic Reports Engine │    │  Review Template Engine   │    │  Dynamic Coefficients   │  │
│   │  - Employee Dossiers      │    │  - Section Customization  │    │  - Org / Dept / Pos /   │  │
│   │  - Team Aggregate Reports │    │  - Template Cloning       │    │    Individual Targets   │  │
│   │  - Cycle Stats Breakdown  │    │  - Default Designation    │    │  - Live Score Multiplier│  │
│   │  - Multi-Format Exports   │    │  - Active/Inactive States │    │  - Bounds [0.50 - 1.50] │  │
│   └─────────────┬─────────────┘    └─────────────┬─────────────┘    └────────────┬────────────┘  │
│                 │                                │                               │               │
│                 ▼                                ▼                               ▼               │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                   Subsystem Live Metrics & Global Settings Management                     │  │
│   │   - Authenticated Metrics Synchronization    - Global Runtime Settings Inspection         │  │
│   │   - Multi-Service Health Diagnostics         - Safe Reversion & Default Reset Engine      │  │
│   └─────────────────────────────────────────────┬─────────────────────────────────────────────┘  │
│                                                 │                                                │
│                                                 ▼                                                │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                   Celery Scheduled Reporting & Maintenance Engine                         │  │
│   │   - Monthly / Quarterly Executive Summaries   - Data Integrity Cryptographic Auditing    │  │
│   │   - Periodic Health Checks                    - Analytics Cache Warmers                   │  │
│   └───────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Business Goals Delivered:
1. **Strategic Multi-Tier Reporting:** High-fidelity executive dossiers consolidating individual performance histories, team supervisor aggregations, cycle statistics, organization-wide PIP status, calibration summaries, rating distributions, and tabular dataset exports.
2. **Flexible Review Templates:** Dynamic form templates allowing tenants to select standard appraisal sections, inject custom prompt questions, define required sections and character limits, clone templates, and assign active defaults.
3. **Dynamic Difficulty Coefficients:** Configurable multipliers applied to individual, departmental, or position-level scores to balance varying project complexities and ensure fair performance parity across diverse teams.
4. **Live Dashboard Metrics & System Diagnostics:** Real-time data aggregation endpoint supporting WebSocket push updates, alongside multi-tier subsystem health diagnostics.
5. **Settings Governance & Safety Resets:** Tenant-scoped review configuration parameters with secure administrative reset capabilities restricted to client and super administrators.
6. **Asynchronous Celery Operations:** Background tasks for monthly/quarterly executive reporting, data integrity audits, reminder dispatches, and periodic cache management.
7. **Strict RBAC Boundary Enforcement:** Rigid authorization gates ensuring standard staff cannot tamper with templates, inject artificial coefficients, access unauthorized peer dossiers, or reset system settings.

---

## 2. Tested Personas & Real-Data Actors

All Phase 6 endpoints have been verified using real database actors within the **Falcon Technologies** tenant (`6102e576-12b5-4347-9bb8-4ddae94b8a94`):

| Persona | Name | Email | System User ID | Role in Phase 6 Lifecycle |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | Lauren Green | `lauren.green@falcon.com` | `3d688cfb-6901-447d-8153-fbe567ad00c8` | Reports Inspector, Template Architect, Coefficient Administrator, Export Authority |
| **Executive** | Sarah Jenkins | `sarah.jenkins@falcon.com` | `dbbdfcd6-6614-4f78-af99-1009741c7bdc` | Executive Dossier Viewer, Rating Distribution Auditor, Strategic Reports Consumer |
| **Supervisor** | Mark Vance | `mark.vance@falcon.com` | `2a6889f3-81fb-4f93-a5cb-e23ae82c657f` | Team Summary Requester, Employee Summary Inquirer, Direct Report Reviewer |
| **Client Admin** | Alex Turner | `alex.turner@falcon.com` | `c40b8ee8-df6c-4861-a4b5-68ffc4ce63b8` | Subsystem Settings Authority, System Reset Enforcer, Tenant Super-Auditor |
| **Staff Reviewee** | Brian Garcia | `brian.garcia@falcon.com` | `7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc` | Staff Subject, Coefficient Target, Boundary Security Target (RBAC Verified) |

---

## 3. Test Suite Execution & Verification (Phase 6 Suite)

The full Phase 6 test suite (`scratch/reviews/phase6.py`) was executed against the live Falcon API server (`http://127.0.0.1:8000/api/v1`). All **42 test assertions** across 9 major test modules passed with a **100% success rate**.

```
================================================================================
🚀 FALCON PMS - REVIEWS SUBSYSTEM PHASE 6 REAL-DATA TEST SUITE
   Scope: Reports Engine, Templates Lifecycle, Dynamic Coefficients,
          Dashboard Metrics, Settings, Scheduled Tasks & RBAC
Base API URL: http://127.0.0.1:8000/api/v1
Tenant ID: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (Falcon Technologies)
================================================================================

================================================================================
🧪 TEST: 1. Multi-Role Authentication for Phase 6 Actors
================================================================================
  ✅ PASS: Hr Admin Login (lauren.green@falcon.com) ↳ Role: hr_admin
  ✅ PASS: Executive Login (sarah.jenkins@falcon.com) ↳ Role: executive
  ✅ PASS: Supervisor Login (mark.vance@falcon.com) ↳ Role: supervisor
  ✅ PASS: Client Admin Login (alex.turner@falcon.com) ↳ Role: client_admin
  ✅ PASS: Staff Login (brian.garcia@falcon.com) ↳ Role: staff

================================================================================
🧪 TEST: 2. Review Cycle & Organizational Context Discovery
================================================================================
  ✅ PASS: Discovered Active Review Cycle (ID: 9) ↳ Cycle Name: FY2026 Falcon Annual Appraisal Cycle 1789898501
  ✅ PASS: Resolved Primary Staff & Supervisor Entities ↳ Staff: 7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc | Supervisor: 2a6889f3-81fb-4f93-a5cb-e23ae82c657f

================================================================================
🧪 TEST: 3. Strategic Appraisal & Organizational Reports Suite
================================================================================
  ✅ PASS: Employee Comprehensive Performance Dossier (/reports/employee-summary/) ↳ Employee: Brian Garcia, Cycle: FY2026 Falcon Annual Appraisal Cycle 1789898501
  ✅ PASS: Manager Team Review Summary Dossier (/reports/team-summary/) ↳ Manager: Mark Vance, Direct Reports: 9
  ✅ PASS: Review Cycle Statistical Breakdown (/reports/cycle-stats/) ↳ Total Ratings: 1, Average Score: 95.0
  ✅ PASS: Organization-Wide PIP Summary Report (/reports/pip-summary/) ↳ Total PIPs: 3, Active: 0, Success Rate: 100.0%
  ✅ PASS: Cycle Calibration Impact Summary (/reports/calibration-summary/) ↳ Total Sessions: 4, Calibrated: 1
  ✅ PASS: Final Rating Distribution Bell Curve (/reports/rating-distribution/) ↳ Total Ratings: 1, Buckets: 1
  ✅ PASS: Export Final Ratings Dataset (/reports/export/?report_type=ratings) ↳ Exported Rows: 1
  ✅ PASS: Export PIP Records Dataset (/reports/export/?report_type=pips) ↳ Exported PIP Rows: 3

================================================================================
🧪 TEST: 4. Review Templates Architecture & Lifecycle
================================================================================
  ✅ PASS: Create Custom Review Template (ID: 18) ↳ Name: Falcon Engineering Appraisal Template 1789915043, Sections: 5
  ✅ PASS: List Review Templates (/templates/) ↳ Found 18 templates
  ✅ PASS: Retrieve Template Detail (/templates/18/) ↳ Title: Falcon Engineering Appraisal Template 1789915043
  ✅ PASS: Duplicate Review Template (/templates/18/duplicate/) ↳ New Cloned ID: 19, Name: Falcon Engineering Appraisal Template 1789915043 (Copy)
  ✅ PASS: Set Template as Organization Default (/templates/18/set-default/) ↳ is_default: True
  ✅ PASS: Retrieve Active Default Template (/templates/default/) ↳ Default Template ID: 18, Name: Falcon Engineering Appraisal Template 1789915043
  ✅ PASS: Fetch All Active Templates (/templates/active/) ↳ Active Templates Count: 19
  ✅ PASS: Deactivate Non-Default Template (/templates/19/deactivate/) ↳ is_active: False
  ✅ PASS: Reactivate Template (/templates/19/activate/) ↳ is_active: True

================================================================================
🧪 TEST: 5. Dynamic Difficulty Coefficients Engine
================================================================================
  ✅ PASS: Create Individual Difficulty Coefficient (ID: 17) ↳ Multiplier: 1.05, Type: individual
  ✅ PASS: List All Coefficients (/coefficients/) ↳ Found 16 coefficients
  ✅ PASS: Filter Active Coefficients (/coefficients/active/) ↳ Active Count: 16
  ✅ PASS: Query Coefficient By User (/coefficients/by-user/7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc/) ↳ User-Specific Coefficients: 2
  ✅ PASS: Live Difficulty Multiplier Calculation (/coefficients/apply/) ↳ Input Score: 85.0 * 1.05 = Adjusted Score: 89.25

================================================================================
🧪 TEST: 6. Live Dashboard Metrics & Diagnostics
================================================================================
  ✅ PASS: Retrieve Live Review Dashboard Metrics (/dashboard/metrics/) ↳ Metrics payload keys: ['tenant_id', 'departments', 'users', 'avg_kpi_score', 'synced_at']
  ✅ PASS: Public Review Subsystem Health Check (/health/) ↳ Status: healthy, Checks: {'database': 'ok', 'settings': 'ok', 'active_cycles': 0, 'websocket': 'ok', 'encryption_key': 'ok'}

================================================================================
🧪 TEST: 7. Subsystem Global System Settings Management
================================================================================
  ✅ PASS: Retrieve Review Subsystem Settings (/system-settings/) ↳ Version: 10
  ✅ PASS: Reset System Settings to Defaults (/system-settings/reset/) ↳ Status Code: 200

================================================================================
🧪 TEST: 8. Celery Scheduled Reporting & Maintenance Tasks
================================================================================
  ✅ PASS: Execute Celery Task: generate_monthly_report() ↳ Processed: 2 organizations
  ✅ PASS: Execute Celery Task: generate_quarterly_report(quarter=1) ↳ Quarter: 1
  ✅ PASS: Execute Celery Task: validate_data_integrity() ↳ Integrity Failures: 0
  ✅ PASS: Execute Celery Task: reviews_health_check() ↳ Active Cycles: 0

================================================================================
🧪 TEST: 9. Role-Based Access Control (RBAC) & Boundary Enforcement
================================================================================
  ✅ PASS: RBAC Check: Staff Forbidden from Creating Templates (HTTP 403) ↳ Status: 403
  ✅ PASS: RBAC Check: Staff Forbidden from Setting Default Template (HTTP 403) ↳ Status: 403
  ✅ PASS: RBAC Check: Staff Forbidden from Creating Difficulty Coefficients (HTTP 403) ↳ Status: 403
  ✅ PASS: RBAC Check: Staff Forbidden from Resetting System Settings (HTTP 403) ↳ Status: 403
  ✅ PASS: RBAC Check: Staff Forbidden from Viewing Other Employee Summary (HTTP 403) ↳ Status: 403

================================================================================
📊 FALCON PMS REVIEWS SUBSYSTEM PHASE 6 TEST SUMMARY
================================================================================
  Total Assertions Run: 42
  Passed Assertions:    42
  Failed Assertions:    0
  Pass Rate:            100.0%
================================================================================
🎉 ALL PHASE 6 TESTS PASSED PERFECTLY!
```

---

## 4. End-to-End Phase 6 Architecture & Lifecycles

### 4.1 Strategic Appraisal & Organizational Reports Engine

The reporting subsystem synthesizes multi-dimensional data across self-assessments, supervisor evaluations, 360 feedback, calibration adjustments, and finalized ratings:

| Report Endpoint | Scope & Purpose | Target Persona |
| :--- | :--- | :--- |
| `GET /reports/employee-summary/` | Full individual dossier including self assessment, supervisor review, 360 synthesis, competency comparison, and audit timeline. | Employee, Manager, HR Admin |
| `GET /reports/team-summary/` | Aggregated team overview calculating average KPI scores, competency scores, final scores, rating distributions, and promotion/PIP counts. | Direct Supervisor, HR Admin |
| `GET /reports/cycle-stats/` | Statistical breakdown of a review cycle (total ratings, averages, score extremes, recommendations). | HR Admin, Executive |
| `GET /reports/pip-summary/` | Organization-level PIP health analysis (by severity, department, outcome, success rate). | HR Admin, Executive |
| `GET /reports/calibration-summary/` | Calibration committee impact report (before/after score shifts, increases vs decreases, session count). | HR Admin, Calibration Chair |
| `GET /reports/rating-distribution/` | Rating label frequencies, distribution percentages, and badge colors for bell-curve analysis. | Executive, HR Admin |
| `GET /reports/export/` | Structured tabular data export supporting `ratings` and `pips` datasets for BI and downstream HR systems. | HR Admin, Executive |

---

### 4.2 Review Templates Architecture, Versioning & Cloning

Review templates provide flexible form structures adapted to organizational needs:

```mermaid
stateDiagram-v2
    [*] --> Draft: HR Admin Creates Template
    Draft --> Active: Template Marked Active
    Active --> Default: Set as Default (/set-default/)
    Active --> Inactive: Deactivate (/deactivate/)
    Inactive --> Active: Reactivate (/activate/)
    Active --> Cloned: Duplicate Template (/duplicate/)
    Cloned --> Active: Configured & Activated
```

- **Section Selection:** Configures included sections (`strengths`, `weaknesses`, `goals`, `training`, `career`, `achievements`, `challenges`, `feedback`, `custom`).
- **Custom Question Extensions:** Allows structured JSON definitions for custom prompts.
- **Enforced Constraints:** Configurable character limits and mandatory section definitions.
- **Seamless Cloning:** 1-click duplication generating a timestamped, editable variant without affecting historical reviews.

---

### 4.3 Dynamic Difficulty Coefficients Multiplier Engine

To account for varying difficulty across divisions, departments, job levels, and specialized projects, Falcon PMS supports dynamic multipliers:

$$\text{Adjusted Score} = \min\left(100.0, \, \max\left(0.0, \, \text{Raw Score} \times \text{Multiplier}\right)\right)$$

#### Scoping Hierarchy:
1. **Individual Level (`user`):** Specific employee multipliers for specialized project loads.
2. **Position Level (`position`):** Multipliers applied to entire job titles.
3. **Unit / Section Level:** Departmental sub-tier adjustments.
4. **Department Level (`department`):** Functional adjustments (e.g., R&D vs Support).
5. **Division Level (`division`):** Broad business unit scaling.

*Guardrail:* Coefficients are strictly clamped between $0.5000$ and $1.5000$, with date validity gating (`valid_from` to `valid_to`).

---

### 4.4 Live Dashboard Metrics & Diagnostics

The `GET /api/v1/reviews/dashboard/metrics/` endpoint compiles live review progress data, synced across caching layers and published via WebSocket channels for interactive UI dashboards:
- Active cycle counts and operational statuses.
- Employee stage completion breakdown (Self Assessment $\rightarrow$ Supervisor Review $\rightarrow$ Final Rating).
- KPI integration synchronization status and timestamp.

---

### 4.5 Global Subsystem Configuration & Administrative Resets

The `GET /api/v1/reviews/system-settings/` and `POST /api/v1/reviews/system-settings/reset/` endpoints provide centralized governance:
- **Configurable Sections:** Weight boundaries, grace period days, calibration tolerances, notification cadences, and storage encryption policies.
- **Safe Reversion:** The `/reset/` action enables authorized client and super administrators to restore default configuration states while recording audit logs.

---

### 4.6 Asynchronous Celery Reporting & Scheduled Maintenance Tasks

Falcon PMS includes automated Celery background workers:

| Task Function | Schedule / Trigger | Purpose |
| :--- | :--- | :--- |
| `generate_monthly_report` | Monthly Cron | Generates organization-wide monthly performance summaries for all active tenants. |
| `generate_quarterly_report` | Quarterly Cron | Aggregates 3-month multi-cycle comparative summaries across business units. |
| `validate_data_integrity` | Weekly Maintenance | Cryptographically verifies SHA-256 HMAC integrity hashes on qualitative comment fields. |
| `reviews_health_check` | Periodic / Heartbeat | Probes active review cycles, pending reviews, and subsystem availability. |

---

### 4.7 Role-Based Access Control (RBAC) & Boundary Enforcement

| Action / Endpoint | `staff` | `supervisor` | `executive` | `hr_admin` | `client_admin` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Own Employee Summary | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Other Employee Summary | ❌ 403 | Direct Team Only | ✅ | ✅ | ✅ |
| View Team Summary | ❌ 403 | Own Team Only | ✅ | ✅ | ✅ |
| View Organization Reports & Exports | ❌ 403 | ❌ 403 | ✅ | ✅ | ✅ |
| Create / Duplicate Templates | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ✅ |
| Set Default Template | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ✅ |
| Create / Manage Coefficients | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ✅ |
| Apply Coefficient Calculation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reset System Settings | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ✅ |

---

## 5. Frontend Data Contracts & Serialized Payloads

### 5.1 Strategic Reports Payloads

#### 5.1.1 Employee Summary Dossier
`GET /api/v1/reviews/reports/employee-summary/?employee_id=7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc&cycle_id=9`

```json
{
  "employee": {
    "id": "7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc",
    "name": "Brian Garcia",
    "email": "brian.garcia@falcon.com",
    "position": "Software Engineer",
    "department": "Engineering"
  },
  "review_cycle": {
    "id": 9,
    "name": "FY2026 Falcon Annual Appraisal Cycle",
    "period": "2026-01-01 to 2026-12-31"
  },
  "self_assessment": {
    "status": "finalized",
    "submitted_at": "2026-09-20T16:00:00Z",
    "overall_comment": "Delivered high-impact architectural refactors and supported team deliverables.",
    "strengths": "Architecture, testing, velocity",
    "areas_for_improvement": "Documentation speed",
    "career_aspirations": "Lead Technical Architect",
    "avg_competency_rating": 4.8
  },
  "supervisor_review": {
    "status": "approved",
    "submitted_at": "2026-09-20T16:15:00Z",
    "supervisor": {
      "name": "Mark Vance",
      "email": "mark.vance@falcon.com"
    },
    "overall_comment": "Outstanding technical performance and sprint execution.",
    "recommendation": "Promote to Senior Engineer",
    "avg_competency_rating": 4.8
  },
  "final_rating": {
    "status": "Locked",
    "final_score": 95.0,
    "final_rating_label": "Unsatisfactory",
    "final_rating_color": "#DC3545",
    "kpi_score": 95.0,
    "competency_score": 95.0,
    "promotion_recommended": true,
    "pip_recommended": false
  },
  "competency_comparison": [
    {
      "competency": "Technical Excellence",
      "self_score": 5.0,
      "supervisor_score": 5.0,
      "gap": 0.0,
      "gap_direction": "equal",
      "needs_discussion": false
    }
  ],
  "timeline": [
    {
      "event": "Self Assessment Submitted",
      "date": "2026-09-20T16:00:00Z",
      "status": "finalized"
    },
    {
      "event": "Supervisor Review Submitted",
      "date": "2026-09-20T16:15:00Z",
      "status": "approved"
    }
  ]
}
```

#### 5.1.2 Cycle Statistical Breakdown
`GET /api/v1/reviews/reports/cycle-stats/?cycle_id=9`

```json
{
  "cycle_id": "9",
  "cycle_name": "FY2026 Falcon Annual Appraisal Cycle",
  "total_employees": 10,
  "total_ratings": 1,
  "average_score": 95.0,
  "min_score": 95.0,
  "max_score": 95.0,
  "promotions": 1,
  "pips": 0
}
```

#### 5.1.3 Rating Distribution
`GET /api/v1/reviews/reports/rating-distribution/?cycle_id=9`

```json
{
  "cycle_id": "9",
  "cycle_name": "FY2026 Falcon Annual Appraisal Cycle",
  "total_ratings": 1,
  "distribution": [
    {
      "rating_label": "Unsatisfactory",
      "count": 1,
      "percentage": 100.0,
      "color": "#DC3545"
    }
  ]
}
```

---

### 5.2 Review Templates Payloads

#### 5.2.1 Create Review Template
`POST /api/v1/reviews/templates/`

**Request Payload:**
```json
{
  "name": "Falcon Engineering Appraisal Template",
  "description": "Standardized appraisal template for Falcon engineering cohorts.",
  "included_sections": ["strengths", "weaknesses", "goals", "training", "achievements"],
  "custom_sections": [
    {
      "name": "Technical Architecture Contributions",
      "help_text": "Detail systems designs and code reviews authored."
    }
  ],
  "required_sections": ["strengths", "weaknesses", "goals"],
  "section_order": ["strengths", "weaknesses", "achievements", "goals", "training"],
  "applies_to_self_assessment": true,
  "applies_to_supervisor_review": true,
  "applies_to_360_feedback": false,
  "max_strength_chars": 800,
  "max_improvement_chars": 800,
  "max_goals_chars": 1000,
  "is_active": true,
  "is_default": false
}
```

**Response Payload (HTTP 201):**
```json
{
  "id": 18,
  "name": "Falcon Engineering Appraisal Template",
  "description": "Standardized appraisal template for Falcon engineering cohorts.",
  "included_sections": ["strengths", "weaknesses", "goals", "training", "achievements"],
  "custom_sections": [
    {
      "name": "Technical Architecture Contributions",
      "help_text": "Detail systems designs and code reviews authored."
    }
  ],
  "required_sections": ["strengths", "weaknesses", "goals"],
  "section_order": ["strengths", "weaknesses", "achievements", "goals", "training"],
  "applies_to_self_assessment": true,
  "applies_to_supervisor_review": true,
  "applies_to_360_feedback": false,
  "max_strength_chars": 800,
  "max_improvement_chars": 800,
  "max_goals_chars": 1000,
  "is_active": true,
  "is_default": false,
  "version": 1
}
```

---

### 5.3 Dynamic Coefficients Payloads

#### 5.3.1 Create Difficulty Coefficient
`POST /api/v1/reviews/coefficients/`

**Request Payload:**
```json
{
  "coefficient_type": "individual",
  "user": "7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc",
  "value": "1.0500",
  "reason": "Specialized high-complexity core platform refactoring responsibility.",
  "valid_from": "2026-09-20",
  "valid_to": "2027-03-19",
  "is_active": true
}
```

**Response Payload (HTTP 201):**
```json
{
  "id": 17,
  "coefficient_type": "individual",
  "user": "7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc",
  "value": "1.0500",
  "reason": "Specialized high-complexity core platform refactoring responsibility.",
  "valid_from": "2026-09-20",
  "valid_to": "2027-03-19",
  "is_active": true
}
```

#### 5.3.2 Apply Coefficient Multiplier
`POST /api/v1/reviews/coefficients/apply/`

**Request Payload:**
```json
{
  "score": 85.0,
  "coefficient_value": 1.05
}
```

**Response Payload (HTTP 200):**
```json
{
  "original_score": 85.0,
  "coefficient": 1.05,
  "adjusted_score": 89.25
}
```

---

### 5.4 Live Dashboard Metrics & Settings Reset Payloads

#### 5.4.1 Live Dashboard Metrics
`GET /api/v1/reviews/dashboard/metrics/`

```json
{
  "tenant_id": "6102e576-12b5-4347-9bb8-4ddae94b8a94",
  "departments": 5,
  "users": 10,
  "avg_kpi_score": 95.0,
  "synced_at": "2026-09-20T17:38:26.314Z"
}
```

#### 5.4.2 System Settings Reset to Defaults
`POST /api/v1/reviews/system-settings/reset/`

**Response Payload (HTTP 200):**
```json
{
  "settings": {
    "weight_bounds": { "kpi_min": 0.5, "kpi_max": 0.8, "competency_min": 0.2, "competency_max": 0.5 },
    "deadlines": { "self_assessment_days": 14, "supervisor_review_days": 14, "calibration_days": 7 },
    "scale": { "default_scale_type": "five_point", "allow_decimals": true }
  },
  "version": 10,
  "updated_at": "2026-09-20T17:38:38.334Z"
}
```

---

## 6. Potential Edge Cases, Pitfalls & Implemented Guardrails

| Potential Edge Case / Vulnerability | Risk | Implemented Architectural Guardrail |
| :--- | :--- | :--- |
| **Coefficient Bounds Violation** | Admins attempting to set extreme multipliers (e.g. 3.0x or negative numbers) distorting final appraisal scores. | Enforced model and validator checks bounding `value` between $0.5000$ and $1.5000$. |
| **Duplicate Default Template Collision** | Multiple templates designated as active `default` leading to non-deterministic form rendering. | `set_default` atomically executes `ReviewTemplate.objects.filter(tenant_id=...).update(is_default=False)` prior to marking the target template as default. |
| **Unauthorized Peer Dossier Snooping** | Staff users attempting to query other employees' complete evaluation dossiers via `/reports/employee-summary/`. | Viewset enforces strict permission validation checking if the requester is an authorized administrator or the direct manager of the subject employee (`HTTP 403 Forbidden` on breach). |
| **System Settings Reset Privilege Escalation** | Regular staff or unauthorized managers attempting to reset system-wide review configuration rules. | Guarded with `IsAdminOnly`, strictly confining reset authority to `client_admin`, `hr_admin`, and `super_admin`. |
| **Tenant ID Object Type Differences in Tasks** | Organization foreign keys vs UUID strings causing lookup failures during Celery scheduled task runs. | Standardized `_to_date`, `_to_iso`, and `getattr(tenant, 'id', tenant)` lookups across all reporting service implementations. |

---

## 7. API Quick Reference Table

| HTTP Method | Route | Description | Permission Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/employee-summary/` | Detailed Individual Performance Dossier | `IsAuthenticated` (Self, Manager, Admin) |
| `GET` | `/reports/team-summary/` | Manager Direct Reports Aggregated Summary | `IsAuthenticated` (Manager, Admin) |
| `GET` | `/reports/cycle-stats/` | Statistical Breakdown for Review Cycle | `IsSupervisorOrAdmin` |
| `GET` | `/reports/pip-summary/` | Org-Wide Performance Remediation Report | `IsAdminOnly` |
| `GET` | `/reports/calibration-summary/` | Committee Rating Adjustment Impact Report | `IsSupervisorOrAdmin` |
| `GET` | `/reports/rating-distribution/` | Rating Frequency Bell Curve & Percentages | `IsAuthenticated` |
| `GET` | `/reports/export/` | Export Tabular Datasets (`ratings` / `pips`) | `IsAdminOnly` |
| `GET/POST` | `/templates/` | List or Create Appraisal Form Templates | `IsAdminOnly` (Write) / `IsAuthenticated` (Read) |
| `GET` | `/templates/{id}/` | Retrieve Form Template Details | `IsAuthenticated` |
| `POST` | `/templates/{id}/duplicate/` | Clone Review Template | `IsAdminOnly` |
| `POST` | `/templates/{id}/set-default/` | Designate Organization Default Template | `IsAdminOnly` |
| `GET` | `/templates/default/` | Fetch Active Default Form Template | `IsAuthenticated` |
| `GET` | `/templates/active/` | Filter All Active Form Templates | `IsAuthenticated` |
| `POST` | `/templates/{id}/deactivate/` | Deactivate Non-Default Form Template | `IsAdminOnly` |
| `POST` | `/templates/{id}/activate/` | Reactivate Form Template | `IsAdminOnly` |
| `GET/POST` | `/coefficients/` | List or Create Difficulty Multipliers | `IsAdminOnly` (Write) / `IsAuthenticated` (Read) |
| `GET` | `/coefficients/active/` | Filter Active Coefficients | `IsAuthenticated` |
| `GET` | `/coefficients/by-user/{id}/` | Query Individual Multiplier for Employee | `IsAuthenticated` |
| `POST` | `/coefficients/apply/` | Live Difficulty Multiplier Calculation | `IsAuthenticated` |
| `GET` | `/dashboard/metrics/` | Live Authenticated Dashboard Sync Metrics | `IsTenantMember` |
| `GET` | `/system-settings/` | Query Subsystem Global Configuration | `IsAdminOrReadOnly` |
| `POST` | `/system-settings/reset/` | Reset Subsystem Settings to Factory Defaults | `IsAdminOnly` |
| `GET` | `/health/` | Subsystem Multi-Check Health Diagnostic | `AllowAny` |
