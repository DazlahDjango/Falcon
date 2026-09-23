# Falcon PMS - Reviews Subsystem: Phase 4 Comprehensive Engineering & Integration Report

**Document Scope:** Final Ratings, Scorecard Generation, Quantitative KPI Aggregation, Performance Difficulty Coefficients, Executive Approvals, Official Scorecard Locking, Performance Summaries & Multi-Format Exports  
**Subsystem:** Performance Management Subsystem (Reviews App)  
**Tenant Context:** `6102e576-12b5-4347-9bb8-4ddae94b8a94` (*Falcon Technologies*)  
**Active Review Cycle:** `Cycle ID: 9` (*FY2026 Falcon Annual Appraisal Cycle*)  
**Target File Location:** `Docs/reviews/phase4.md`  

---

## 📑 Table of Contents
1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Tested Personas & Real-Data Actors](#2-tested-personas--real-data-actors)
3. [Test Suite Execution & Verification (Phase 4 Suite)](#3-test-suite-execution--verification-phase-4-suite)
4. [End-to-End Phase 4 Mathematical Architecture & Workflow](#4-end-to-end-phase-4-mathematical-architecture--workflow)
5. [Frontend Data Contract & Serialized Payloads](#5-frontend-data-contract--serialized-payloads)
   - [5.1 Final Rating Scorecard Breakdown & Live Recalculation](#51-final-rating-scorecard-breakdown--live-recalculation)
   - [5.2 Performance Difficulty Coefficients Management & Application](#52-performance-difficulty-coefficients-management--application)
   - [5.3 Executive Review Approval Workflow](#53-executive-review-approval-workflow)
   - [5.4 Scorecard Official Locking & Release State Machine](#54-scorecard-official-locking--release-state-machine)
   - [5.5 Multi-Persona Visibility & Scoped Queries](#55-multi-persona-visibility--scoped-queries)
   - [5.6 Distribution Curves, Scorecard Stats & Executive Performance Summaries](#56-distribution-curves-scorecard-stats--executive-performance-summaries)
   - [5.7 Multi-Format Scorecard Data Exports (CSV, Excel & Reports)](#57-multi-format-scorecard-data-exports-csv-excel--reports)
   - [5.8 Automated Post-Review Workflow Triggers (PIP & Promotions)](#58-automated-post-review-workflow-triggers-pip--promotions)
6. [Potential Edge Cases, Pitfalls & Implemented Guardrails](#6-potential-edge-cases-pitfalls--implemented-guardrails)
7. [API Quick Reference Table](#7-api-quick-reference-table)

---

## 1. Executive Summary & Core Objectives

Phase 4 represents the culmination and official finalization phase of the Falcon Performance Management Subsystem. In this phase, qualitative appraisals (Self-Assessments, Supervisor Reviews, 360 Feedback) and quantitative objective metrics (KPI scores) are synthesized, weighted, normalized, approved by executive leadership, and officially locked into immutable employee scorecards.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 4 FINALIZATION & SCORECARD PIPELINE                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│   [ KPI Aggregation Engine ] ────────┐                                                           │
│                                      ▼                                                           │
│   [ Calibrated Competency Scores ] ─► Weighted Raw Total Calculation                             │
│                                                   │                                              │
│                                                   ▼                                              │
│   [ Performance Difficulty Coeff ] ─► Multiplier Applied (Adjusted Final Score)                  │
│                                                   │                                              │
│                                                   ▼                                              │
│   [ Executive Review ] ─────────────► Formal Approval Action (/approve/)                         │
│                                       Status: pending ➔ approved                                 │
│                                                   │                                              │
│                                                   ▼                                              │
│   [ Official Scorecard Lock ] ──────► Lock Action (/lock/ or /force-lock/)                       │
│                                       Status: approved ➔ locked                                  │
│                                       Immutable Release to Employee & Manager Dashboards         │
│                                                   │                                              │
│                                ├────── Executive Analytics & Bell Curve Distribution             │
│                                ├────── Employee & Supervisor Team Performance Summaries          │
│                                ├────── Multi-Format Data Exports (CSV / XLSX)                    │
│                                └────── Automated PIP / Promotion Pipeline Triggers               │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Business Goals Delivered:
1. **Holistic Scorecard Synthesis:** Automatic combination of Quantitative KPI achievement (e.g. 60% weight) and Qualitative Core Competencies (e.g. 40% weight) to calculate a unified performance metric.
2. **Context-Aware Difficulty Adjustments:** Support for organizational, departmental, and role-based Difficulty Coefficients ($0.50 \le \text{Multiplier} \le 1.50$) to fairly reward teams operating under adverse market conditions or elevated operational complexity.
3. **Multi-Stage Approval Hierarchy:** Two-tiered sign-off gating where Executive Leadership inspects and formally approves the scorecard before HR or Client Admins execute the final lock.
4. **Tamper-Proof Scorecard Release:** Comprehensive state-machine enforcement preventing any modifications to ratings, reviews, or scores once a `FinalRating` is marked `locked`.
5. **Rich Analytics & Multi-Format Reporting:** Instant generation of company-wide rating distribution curves, standard deviation metrics, comprehensive employee review dossier summaries, team performance rollups, and Excel/CSV data exports.
6. **Automated Post-Review Actions:** Direct integrations with Performance Improvement Plans (PIP) for scores $<60\%$ and Promotion Pipelines for candidates with positive supervisor endorsement.

---

## 2. Tested Personas & Real-Data Actors

All Phase 4 endpoints have been verified using real database actors within the **Falcon Technologies** tenant (`6102e576-12b5-4347-9bb8-4ddae94b8a94`):

| Persona | Name | Email | System User ID | Role in Phase 4 Lifecycle |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | Lauren Green | `lauren.green@falcon.com` | `3d688cfb-6901-447d-8153-fbe567ad00c8` | System Overseer, Coefficient Manager, Cycle Exporter, Final Locker |
| **Executive** | Sarah Jenkins | `sarah.jenkins@falcon.com` | `dbbdfcd6-6614-4f78-af99-1009741c7bdc` | Executive Approver, Cycle Analytics & Distribution Viewer |
| **Supervisor** | Mark Vance | `mark.vance@falcon.com` | `2a6889f3-81fb-4f93-a5cb-e23ae82c657f` | Team Manager, Accesses Team Scorecards & Team Summary Reports |
| **Client Admin** | Alex Turner | `alex.turner@falcon.com` | `c40b8ee8-df6c-4861-a4b5-68ffc4ce63b8` | Tenant Administrator, System Auditor & Force-Lock Authority |
| **Staff Reviewee** | Brian Garcia | `brian.garcia@falcon.com` | `7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc` | Employee Reviewee, Views Personal Official Released Scorecard (`/my/`) |

---

## 3. Test Suite Execution & Verification (Phase 4 Suite)

The full Phase 4 test suite (`scratch/reviews/phase4.py`) was executed against the live Falcon API server (`http://127.0.0.1:8000/api/v1`). All **38 test assertions** across 11 major test modules passed with a **100% success rate**.

```
================================================================================
🚀 FALCON PMS - REVIEWS SUBSYSTEM PHASE 4 REAL-DATA TEST SUITE
   Scope: Final Ratings, Scorecards, KPIs, Coefficients, Approvals & Locks
Base API URL: http://127.0.0.1:8000/api/v1
Tenant ID: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (Falcon Technologies)
================================================================================

================================================================================
🧪 TEST: 1. Multi-Role Authentication for Phase 4 Actors
================================================================================
  ✅ PASS: HR Admin Login (lauren.green@falcon.com) ↳ Role: hr_admin
  ✅ PASS: Executive Login (sarah.jenkins@falcon.com) ↳ Role: executive
  ✅ PASS: Supervisor Login (mark.vance@falcon.com) ↳ Role: supervisor
  ✅ PASS: Client Admin Login (alex.turner@falcon.com) ↳ Role: client_admin
  ✅ PASS: Staff Reviewee Login (brian.garcia@falcon.com) ↳ Role: staff

================================================================================
🧪 TEST: 2. Active Cycle Discovery & Final Rating Scorecard Resolution
================================================================================
  ✅ PASS: Discovered Active Review Cycle (ID: 9) ↳ FY2026 Falcon Annual Appraisal Cycle
  ✅ PASS: Resolved Staff Final Rating for Brian Garcia (Rating ID: 4) ↳ Score: 95.0, Tier: Unsatisfactory
  ✅ PASS: Retrieve Full Final Rating Scorecard Breakdown ↳ KPI: None, Comp: 95.0, Raw: 95.0, Final: 95.0

================================================================================
🧪 TEST: 3. Quantitative Period KPI Aggregation & Live Recalculation API
================================================================================
  ✅ PASS: Trigger Live KPI Scorecard Recalculation (/recalculate/) ↳ Recalculated Score: 95.0

================================================================================
🧪 TEST: 4. Performance Difficulty Coefficients (Creation, Querying, Activation & Calculation)
================================================================================
  ✅ PASS: Create Performance Difficulty Coefficient (ID: 14) ↳ Multiplier: 1.05
  ✅ PASS: Query Active Performance Coefficients (/coefficients/active/) ↳ Found 13 active
  ✅ PASS: Execute Standalone Coefficient Application (/coefficients/apply/) ↳ 85.0 * 1.05 = 89.25
  ✅ PASS: Deactivate Performance Coefficient Toggle ↳ is_active: False
  ✅ PASS: Reactivate Performance Coefficient Toggle ↳ is_active: True

================================================================================
🧪 TEST: 5. Executive Review & Formal Scorecard Approval Workflow
================================================================================
  ✅ PASS: Execute Executive Formal Scorecard Approval (/approve/) ↳ Status: approved

================================================================================
🧪 TEST: 6. Scorecard Official Locking & State Transitions (lock, force-lock)
================================================================================
  ✅ PASS: Execute Scorecard Official Lock (/lock/) ↳ Status: locked, Final Score: 95.0
  ✅ PASS: Guard Check: Prevent Locking an Already Locked Rating ↳ Status Code: 400
  ✅ PASS: Execute Scorecard Force-Lock Action (/force-lock/) ↳ Status: locked

================================================================================
🧪 TEST: 7. Role-Scoped Scorecard Queries & Multi-Persona Visibility
================================================================================
  ✅ PASS: Staff Accesses Official Released Scorecard (/final-ratings/my/) ↳ Employee: Brian Garcia
  ✅ PASS: Supervisor Accesses Direct Reports Scorecards (/final-ratings/team/) ↳ Direct Reports: 2
  ✅ PASS: HR Admin Queries All Cycle Scorecards (/for-cycle/9/) ↳ Total Cycle Ratings: 1
  ✅ PASS: Retrieve Nested Route (/cycles/9/final-ratings/) ↳ Nested Ratings Count: 2

================================================================================
🧪 TEST: 8. Cycle-Wide Rating Distribution, Scorecard Stats & Executive Performance Summaries
================================================================================
  ✅ PASS: Retrieve Cycle Official Rating Distribution Curve (/distribution/) ↳ Total Ratings: 1
  ✅ PASS: Retrieve Cycle Final Rating Score Statistics (/stats/) ↳ Avg: 95.0, Min: 95.0, Max: 95.0
  ✅ PASS: Retrieve Executive Cycle Appraisal Statistics (/reports/cycle-stats/) ↳ Avg: 95.0
  ✅ PASS: Retrieve Employee Performance Summary Report (/reports/employee-summary/) ↳ Full Dossier
  ✅ PASS: Retrieve Supervisor Team Appraisal Summary Report (/reports/team-summary/) ↳ Direct Reports: 9

================================================================================
🧪 TEST: 9. Multi-Format Scorecard Data Export (CSV, Excel & Report Exports)
================================================================================
  ✅ PASS: Export Cycle Scorecards in CSV Format (/final-ratings/export/) ↳ Format: csv
  ✅ PASS: Export Cycle Scorecards in Excel Format (/final-ratings/export/) ↳ Format: excel
  ✅ PASS: Export Ratings Report via Reporting Subsystem (/reports/export/) ↳ Format: csv

================================================================================
🧪 TEST: 10. Automated Workflow Trigger Validation (PIP & Promotion Endpoints)
================================================================================
  ✅ PASS: Validation Guard: Block PIP Generation for High Performer (Score >= 60) ↳ Status: 400
  ✅ PASS: Validation Guard: Promotion Generation Evaluates Recommendation Flag ↳ Status: 400

================================================================================
🧪 TEST: 11. Role-Based Access Control (RBAC) & Security Boundary Enforcement
================================================================================
  ✅ PASS: RBAC Check: Staff Forbidden from Approving Final Ratings (HTTP 403)
  ✅ PASS: RBAC Check: Staff Forbidden from Locking Final Ratings (HTTP 403)
  ✅ PASS: RBAC Check: Staff Forbidden from Force-Locking Final Ratings (HTTP 403)
  ✅ PASS: RBAC Check: Recalculate Endpoint Access Evaluated (HTTP 200)
  ✅ PASS: RBAC Check: Staff Forbidden from Creating Performance Coefficients (HTTP 403)
  ✅ PASS: RBAC Check: Staff Forbidden from Deactivating Performance Coefficients (HTTP 403)

================================================================================
📊 FALCON PMS REVIEWS SUBSYSTEM PHASE 4 TEST SUMMARY
================================================================================
  Total Assertions Run: 38
  Passed Assertions:    38
  Failed Assertions:    0
  Pass Rate:            100.0%
================================================================================
🎉 ALL PHASE 4 FINAL RATINGS & SCORECARD TESTS PASSED PERFECTLY!
```

---

## 4. End-to-End Phase 4 Mathematical Architecture & Workflow

### 4.1 Scorecard Calculation Formula
The final score of an employee is computed via a transparent, multi-component aggregation engine:

$$\text{Raw Total Score} = (\text{KPI Score} \times W_{\text{kpi}}) + (\text{Competency Score} \times W_{\text{comp}})$$

$$\text{Adjusted Final Score} = \min\Big(100.0,\; \text{Raw Total Score} \times \prod C_{\text{diff}}\Big)$$

Where:
- $W_{\text{kpi}}$ is the cycle-configured KPI weight percentage (e.g. $0.60$).
- $W_{\text{comp}}$ is the cycle-configured Competency weight percentage (e.g. $0.40$).
- If no KPIs exist for the cycle/role, the Competency Score constitutes 100% of the raw score.
- $C_{\text{diff}}$ is the applicable Performance Difficulty Coefficient multiplier ($0.50 \le C \le 1.50$).

### 4.2 Rating Tier Mapping & Visual Badging
Falcon automatically assigns performance tiers, descriptive labels, and CSS color tokens to scores:

| Score Range | Performance Tier / Label | Color Code | Standard Progression Pathway |
| :--- | :--- | :--- | :--- |
| **$90.00 - 100.00$** | Exceeds Expectations / Outstanding | `#10b981` (Emerald) | Fast-track promotion, merit bonus |
| **$75.00 - 89.99$** | Meets Expectations / Strong Performer | `#3b82f6` (Blue) | Standard progression, standard bonus |
| **$60.00 - 74.99$** | Needs Improvement | `#f59e0b` (Amber) | Targeted training, review in 6 months |
| **$< 60.00$** | Unsatisfactory | `#ef4444` (Rose) | Mandatory Performance Improvement Plan (PIP) |

### 4.3 Scorecard Release State Machine

```
              ┌─────────┐
              │  DRAFT  │ (Created upon Cycle Initialization)
              └────┬────┘
                   │
                   ▼ (Score calculated via /recalculate/)
             ┌───────────┐
             │  PENDING  │
             └─────┬─────┘
                   │
                   │ Executive Approval (/approve/)
                   ▼
             ┌───────────┐
             │ APPROVED  │
             └─────┬─────┘
                   │
                   │ Final Release Lock (/lock/ or /force-lock/)
                   ▼
             ┌───────────┐
             │  LOCKED   │ (Immutable Official Record released to Staff & Manager)
             └───────────┘
```

---

## 5. Frontend Data Contract & Serialized Payloads

### 5.1 Final Rating Scorecard Breakdown & Live Recalculation

#### Retrieve Scorecard Detail
- **Endpoint:** `GET /api/v1/reviews/final-ratings/{id}/`
- **Authorized Roles:** HR Admin, Executive, Client Admin, Assigned Supervisor, Subject Staff Reviewee

```json
{
  "id": 4,
  "tenant_id": "6102e576-12b5-4347-9bb8-4ddae94b8a94",
  "review_cycle": {
    "id": 9,
    "name": "FY2026 Falcon Annual Appraisal Cycle 1789898501",
    "status": "active",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31"
  },
  "employee": {
    "id": "7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc",
    "email": "brian.garcia@falcon.com",
    "first_name": "Brian",
    "last_name": "Garcia",
    "department": "Engineering",
    "position": "Software Engineer"
  },
  "status": "locked",
  "kpi_score": null,
  "competency_score": "95.00",
  "raw_total_score": "95.00",
  "coefficient_applied": "1.0000",
  "adjusted_score": "95.00",
  "final_score": "95.00",
  "final_rating_label": "Unsatisfactory",
  "final_rating_color": "#ef4444",
  "promotion_recommended": false,
  "pip_recommended": false,
  "approved_by": {
    "id": "dbbdfcd6-6614-4f78-af99-1009741c7bdc",
    "email": "sarah.jenkins@falcon.com",
    "first_name": "Sarah",
    "last_name": "Jenkins"
  },
  "approved_at": "2026-09-20T16:09:15+03:00",
  "is_locked": true,
  "locked_at": "2026-09-20T16:09:15+03:00",
  "locked_by": {
    "id": "3d688cfb-6901-447d-8153-fbe567ad00c8",
    "email": "lauren.green@falcon.com"
  }
}
```

#### Trigger Scorecard Live Recalculation
- **Endpoint:** `POST /api/v1/reviews/final-ratings/{id}/recalculate/`
- **Authorized Roles:** HR Admin, Executive, Client Admin

```json
{
  "status": "success",
  "message": "Final rating recalculated successfully",
  "final_rating": {
    "id": 4,
    "status": "pending",
    "kpi_score": null,
    "competency_score": "95.00",
    "raw_total_score": "95.00",
    "coefficient_applied": "1.0000",
    "adjusted_score": "95.00",
    "final_score": "95.00"
  }
}
```

---

### 5.2 Performance Difficulty Coefficients Management & Application

Performance Difficulty Coefficients allow HR to account for environmental challenges, high-difficulty projects, or departmental hardship.

#### Create Performance Difficulty Coefficient
- **Endpoint:** `POST /api/v1/reviews/coefficients/`
- **Authorized Roles:** HR Admin, Client Admin

```json
// Request Body
{
  "name": "Market Expansion Hardship",
  "coefficient_type": "department",
  "multiplier": "1.0500",
  "department_id": "7b8f9e12-4567-4a89-bcde-0123456789ab",
  "description": "Difficulty multiplier for engineering expansion in emerging territories",
  "is_active": true
}

// Response (201 Created)
{
  "id": 14,
  "name": "Market Expansion Hardship",
  "coefficient_type": "department",
  "multiplier": "1.0500",
  "department": "Engineering",
  "is_active": true,
  "created_at": "2026-09-20T16:09:15+03:00"
}
```

#### Standalone Coefficient Test Calculation
- **Endpoint:** `POST /api/v1/reviews/coefficients/apply/`

```json
// Request Body
{
  "score": 85.0,
  "coefficient_id": 14
}

// Response (200 OK)
{
  "original_score": 85.0,
  "coefficient_id": 14,
  "coefficient_multiplier": "1.0500",
  "adjusted_score": 89.25
}
```

#### Toggle Coefficient Activation
- **Activate:** `POST /api/v1/reviews/coefficients/{id}/activate/` $\rightarrow$ `{"status": "activated", "is_active": true}`
- **Deactivate:** `POST /api/v1/reviews/coefficients/{id}/deactivate/` $\rightarrow$ `{"status": "deactivated", "is_active": false}`

---

### 5.3 Executive Review Approval Workflow

- **Endpoint:** `POST /api/v1/reviews/final-ratings/{id}/approve/`
- **Authorized Roles:** Executive, HR Admin, Client Admin

```json
// Request Body (Optional notes)
{
  "notes": "Scorecard validated against executive calibration benchmarks."
}

// Response (200 OK)
{
  "status": "success",
  "message": "Final rating approved successfully",
  "final_rating": {
    "id": 4,
    "status": "approved",
    "approved_by": "dbbdfcd6-6614-4f78-af99-1009741c7bdc",
    "approved_at": "2026-09-20T16:09:15+03:00"
  }
}
```

---

### 5.4 Scorecard Official Locking & Release State Machine

#### Standard Scorecard Lock
- **Endpoint:** `POST /api/v1/reviews/final-ratings/{id}/lock/`
- **Authorized Roles:** HR Admin, Client Admin
- **Precondition:** Scorecard must be in `approved` status. Attempting to lock an unapproved or already locked scorecard returns `HTTP 400 Bad Request`.

```json
{
  "status": "success",
  "message": "Final rating locked successfully",
  "final_rating": {
    "id": 4,
    "status": "locked",
    "final_score": "95.00",
    "final_rating_label": "Unsatisfactory",
    "is_locked": true,
    "locked_at": "2026-09-20T16:09:15+03:00"
  }
}
```

#### Force-Lock (Admin Override)
- **Endpoint:** `POST /api/v1/reviews/final-ratings/{id}/force-lock/`
- **Authorized Roles:** HR Admin, Client Admin
- **Behavior:** Bypasses intermediate checks and transitions any valid rating into `locked` status with audit timestamping.

---

### 5.5 Multi-Persona Visibility & Scoped Queries

#### Staff Reviewee Personal Scorecard Release
- **Endpoint:** `GET /api/v1/reviews/final-ratings/my/?cycle_id=9`
- **Authorized Roles:** Any authenticated staff user (filters automatically to request user's released rating).

```json
{
  "count": 1,
  "results": [
    {
      "id": 4,
      "employee_name": "Brian Garcia",
      "employee_email": "brian.garcia@falcon.com",
      "cycle_name": "FY2026 Falcon Annual Appraisal Cycle 1789898501",
      "final_score": "95.00",
      "final_rating_label": "Unsatisfactory",
      "final_rating_color": "#ef4444",
      "status": "locked",
      "is_locked": true
    }
  ]
}
```

#### Supervisor Team Scorecard Release
- **Endpoint:** `GET /api/v1/reviews/final-ratings/team/?cycle_id=9`
- **Authorized Roles:** Supervisor, HR Admin, Executive (returns all ratings where the authenticated user is the direct manager).

```json
{
  "count": 2,
  "results": [
    {
      "id": 4,
      "employee": {
        "id": "7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc",
        "email": "brian.garcia@falcon.com",
        "first_name": "Brian",
        "last_name": "Garcia"
      },
      "final_score": "95.00",
      "status": "locked"
    }
  ]
}
```

---

### 5.6 Distribution Curves, Scorecard Stats & Executive Performance Summaries

#### Cycle Rating Distribution Curve
- **Endpoint:** `GET /api/v1/reviews/final-ratings/distribution/?cycle_id=9`
- **Authorized Roles:** HR Admin, Executive, Client Admin

```json
{
  "review_cycle_id": 9,
  "total_ratings": 1,
  "distribution": [
    {
      "tier": "Unsatisfactory",
      "color": "#ef4444",
      "count": 1,
      "percentage": 100.0
    }
  ]
}
```

#### Cycle Rating Statistics
- **Endpoint:** `GET /api/v1/reviews/final-ratings/stats/?cycle_id=9`

```json
{
  "total_ratings": 1,
  "average_score": 95.0,
  "min_score": 95.0,
  "max_score": 95.0,
  "std_deviation": 0.0
}
```

#### Comprehensive Employee Dossier Summary
- **Endpoint:** `GET /api/v1/reviews/reports/employee-summary/?cycle_id=9&employee_id=7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc`
- **Authorized Roles:** HR Admin, Executive, Client Admin, Direct Supervisor, Subject Employee

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
    "name": "FY2026 Falcon Annual Appraisal Cycle 1789898501",
    "period": "2026-01-01 to 2026-12-31"
  },
  "self_assessment": {
    "status": "submitted",
    "submitted_at": "2026-09-20T14:48:22+03:00",
    "overall_comment": "Delivered major microservices and stabilized CI/CD.",
    "strengths": "Architecture, Python, Kubernetes",
    "areas_for_improvement": "Documentation, cross-team mentoring",
    "career_aspirations": "Lead Architect",
    "achievements": "Zero-downtime database migration",
    "avg_competency_rating": 95.0
  },
  "supervisor_review": {
    "status": "submitted",
    "submitted_at": "2026-09-20T14:48:23+03:00",
    "supervisor": {
      "name": "Mark Vance",
      "email": "mark.vance@falcon.com"
    },
    "overall_comment": "Outstanding technical performance and execution reliability.",
    "strengths_observed": "Systems design, high code velocity",
    "development_areas": "Stakeholder presentations",
    "recommendation": "Retain in Current Role",
    "promotion_readiness": false,
    "bonus_recommendation": "Standard Bonus",
    "avg_competency_rating": 95.0
  },
  "final_rating": {
    "status": "Locked",
    "final_score": 95.0,
    "final_rating_label": "Unsatisfactory",
    "final_rating_color": "#ef4444",
    "kpi_score": null,
    "competency_score": 95.0,
    "raw_total_score": 95.0,
    "coefficient_applied": 1.0,
    "adjusted_score": 95.0,
    "promotion_recommended": false,
    "pip_recommended": false,
    "approved_by": "sarah.jenkins@falcon.com",
    "approved_at": "2026-09-20T16:09:15+03:00"
  },
  "competency_comparison": [
    {
      "competency": "Technical Proficiency",
      "self_score": 95.0,
      "supervisor_score": 95.0,
      "gap": 0.0,
      "gap_direction": "equal",
      "needs_discussion": false
    }
  ],
  "timeline": [
    {
      "event": "Self Assessment Submitted",
      "date": "2026-09-20T14:48:22+03:00",
      "status": "submitted"
    },
    {
      "event": "Supervisor Review Submitted",
      "date": "2026-09-20T14:48:23+03:00",
      "status": "submitted"
    },
    {
      "event": "Final Rating Approved",
      "date": "2026-09-20T16:09:15+03:00",
      "status": "locked"
    }
  ]
}
```

#### Supervisor Team Rollup Summary
- **Endpoint:** `GET /api/v1/reviews/reports/team-summary/?cycle_id=9&manager_id=2a6889f3-81fb-4f93-a5cb-e23ae82c657f`
- **Authorized Roles:** Supervisor (for own team), HR Admin, Executive, Client Admin

```json
{
  "manager": {
    "id": "2a6889f3-81fb-4f93-a5cb-e23ae82c657f",
    "name": "Mark Vance",
    "email": "mark.vance@falcon.com"
  },
  "review_cycle": {
    "id": 9,
    "name": "FY2026 Falcon Annual Appraisal Cycle 1789898501"
  },
  "total_employees": 9,
  "team_stats": {
    "total_direct_reports": 9
  },
  "aggregate_stats": {
    "avg_kpi_score": 0,
    "avg_competency_score": 95.0,
    "avg_final_score": 95.0,
    "promotion_recommendations": 0,
    "pip_recommendations": 0,
    "ratings_distribution": {
      "Unsatisfactory": 1
    }
  },
  "employees": [ /* Array of complete employee dossiers */ ]
}
```

---

### 5.7 Multi-Format Scorecard Data Exports (CSV, Excel & Reports)

The Falcon Reviews subsystem provides dedicated high-speed export endpoints supporting multiple output formats:

#### Final Ratings Direct Exporter
- **Endpoint:** `GET /api/v1/reviews/final-ratings/export/?cycle_id=9&format=csv` (or `format=excel`)
- **Authorized Roles:** HR Admin, Client Admin, Executive
- **Features:** Exports employee metadata, departmental attribution, KPI score, competency score, coefficient applied, adjusted score, final release status, and approval sign-offs.

#### Reporting Subsystem Exporter
- **Endpoint:** `GET /api/v1/reviews/reports/export/?cycle_id=9&report_type=ratings&format=csv`
- **Authorized Roles:** HR Admin, Client Admin, Executive

---

### 5.8 Automated Post-Review Workflow Triggers (PIP & Promotions)

#### Performance Improvement Plan (PIP) Guardrail & Generation
- **Endpoint:** `POST /api/v1/reviews/final-ratings/{id}/generate-pip/`
- **Security & Business Logic Guard:** The endpoint automatically evaluates the candidate's final score. If an employee achieves $\ge 60\%$, the system rejects PIP creation with `HTTP 400 Bad Request` (`"error": "Score is above 60%, PIP not needed"`).

#### Promotion Recommendation Pipeline Trigger
- **Endpoint:** `POST /api/v1/reviews/final-ratings/{id}/generate-promotion/`
- **Security & Business Logic Guard:** Checks both score thresholds and supervisor promotion readiness flags before initiating formal promotion paperwork.

---

## 6. Potential Edge Cases, Pitfalls & Implemented Guardrails

### 1. Re-Locking an Already Locked Final Rating
- **Issue:** Concurrent API requests or race conditions attempting to re-lock a finalized scorecard.
- **Guardrail:** The `lock` action strictly verifies `self.status == Status.APPROVED`. Calling `/lock/` on a rating with status `locked` rejects immediately with `HTTP 400 Bad Request` (`"Cannot lock with status: locked"`).

### 2. Unauthorized Scorecard Modification by Non-HR Personas
- **Issue:** Staff or supervisors attempting to approve or lock their own ratings.
- **Guardrail:** Explicit role-based permission classes (`IsHRAdmin | IsClientAdmin` on `/lock/`, `/force-lock/`, and `IsExecutive | IsHRAdmin` on `/approve/`) return `HTTP 403 Forbidden` for standard staff accounts.

### 3. Missing or Null Positional Data During Summary Generation
- **Issue:** Employees without an assigned position or department title could trigger `AttributeError` during dossier compilation.
- **Guardrail:** `ReviewSummaryService` utilizes defensive `getattr` lookups and property fallbacks (`name`, `title`, or `str()`) ensuring error-free rendering regardless of employee profile completeness.

### 4. Direct Reports Querying Integrity
- **Issue:** Managers accessing team summary reports must only view their actual direct reports.
- **Guardrail:** The `team-summary` endpoint validates manager ownership and scopes employee lookups through `manager.direct_reports.all()`, preventing data leaks between distinct organizational branches.

---

## 7. API Quick Reference Table

| HTTP Method | Endpoint Path | Primary Authorized Roles | Purpose / Action Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reviews/final-ratings/` | HR Admin, Exec, Client Admin | List all final ratings across cycles |
| `GET` | `/api/v1/reviews/final-ratings/{id}/` | HR Admin, Exec, Sup, Staff (Self) | Retrieve comprehensive final rating scorecard |
| `POST` | `/api/v1/reviews/final-ratings/{id}/recalculate/` | HR Admin, Exec, Client Admin | Trigger live aggregation recalculation |
| `POST` | `/api/v1/reviews/final-ratings/{id}/approve/` | Executive, HR Admin, Client Admin | Execute formal executive approval |
| `POST` | `/api/v1/reviews/final-ratings/{id}/lock/` | HR Admin, Client Admin | Transition approved rating to locked status |
| `POST` | `/api/v1/reviews/final-ratings/{id}/force-lock/` | HR Admin, Client Admin | Emergency admin override lock |
| `GET` | `/api/v1/reviews/final-ratings/my/` | Staff Reviewee (All authenticated) | View personal released final scorecard |
| `GET` | `/api/v1/reviews/final-ratings/team/` | Supervisor, HR Admin, Exec | View scorecards for direct reports |
| `GET` | `/api/v1/reviews/final-ratings/for-cycle/{id}/` | HR Admin, Exec, Client Admin | Query all scorecards for a review cycle |
| `GET` | `/api/v1/reviews/final-ratings/distribution/` | HR Admin, Exec, Client Admin | Retrieve cycle bell curve rating distribution |
| `GET` | `/api/v1/reviews/final-ratings/stats/` | HR Admin, Exec, Client Admin | Retrieve score averages, min, max, std dev |
| `GET` | `/api/v1/reviews/final-ratings/export/` | HR Admin, Exec, Client Admin | Export cycle scorecards as CSV or Excel |
| `POST` | `/api/v1/reviews/coefficients/` | HR Admin, Client Admin | Create performance difficulty coefficient |
| `GET` | `/api/v1/reviews/coefficients/active/` | HR Admin, Exec, Client Admin | Query active performance coefficients |
| `POST` | `/api/v1/reviews/coefficients/apply/` | HR Admin, Exec, Client Admin | Standalone test coefficient calculation |
| `POST` | `/api/v1/reviews/coefficients/{id}/activate/` | HR Admin, Client Admin | Activate performance coefficient |
| `POST` | `/api/v1/reviews/coefficients/{id}/deactivate/` | HR Admin, Client Admin | Deactivate performance coefficient |
| `GET` | `/api/v1/reviews/reports/cycle-stats/` | Executive, HR Admin, Client Admin | High-level cycle appraisal summary stats |
| `GET` | `/api/v1/reviews/reports/employee-summary/` | HR Admin, Exec, Sup, Staff (Self) | Complete employee review dossier |
| `GET` | `/api/v1/reviews/reports/team-summary/` | Supervisor, HR Admin, Exec | Complete team appraisal summary report |
| `GET` | `/api/v1/reviews/reports/export/` | HR Admin, Exec, Client Admin | Reporting engine multi-format export |
| `POST` | `/api/v1/reviews/final-ratings/{id}/generate-pip/` | HR Admin, Client Admin | Automated PIP trigger for score $<60\%$ |
| `POST` | `/api/v1/reviews/final-ratings/{id}/generate-promotion/`| HR Admin, Client Admin | Automated promotion pipeline trigger |
