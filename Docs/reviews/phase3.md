# Falcon PMS - Reviews Subsystem: Phase 3 Comprehensive Engineering & Integration Report

**Document Scope:** Calibration Committee Sessions, Bell Curve & Rating Distribution Normalization, Outlier Detection, Deliberation Comments & Consensus Auditing  
**Subsystem:** Performance Management Subsystem (Reviews App)  
**Tenant Context:** `6102e576-12b5-4347-9bb8-4ddae94b8a94` (*Falcon Technologies*)  
**Active Review Cycle:** `Cycle ID: 9` (*FY2026 Falcon Annual Appraisal Cycle*)  
**Target File Location:** `Docs/reviews/phase3.md`  

---

## 📑 Table of Contents
1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Tested Personas & Real-Data Actors](#2-tested-personas--real-data-actors)
3. [Test Suite Execution & Verification (Phase 3 Suite)](#3-test-suite-execution--verification-phase-3-suite)
4. [End-to-End Phase 3 Workflow & Architecture](#4-end-to-end-phase-3-workflow--architecture)
5. [Frontend Data Contract & Serialized Payloads](#5-frontend-data-contract--serialized-payloads)
   - [5.1 Pre-Calibration Intelligence: Outlier Detection & Recommendations](#51-pre-calibration-intelligence-outlier-detection--recommendations)
   - [5.2 Calibration Session Lifecycle & Scheduling](#52-calibration-session-lifecycle--scheduling)
   - [5.3 Deliberation Rating Adjustments & Score Overrides](#53-deliberation-rating-adjustments--score-overrides)
   - [5.4 Committee Deliberation Comments & Threaded Notes](#54-committee-deliberation-comments--threaded-notes)
   - [5.5 Direct FinalRating Calibration & Recalibration](#55-direct-finalrating-calibration--recalibration)
   - [5.6 Session Reports & Cycle Calibration Summary Analytics](#56-session-reports--cycle-calibration-summary-analytics)
6. [Potential Edge Cases, Pitfalls & Implemented Guardrails](#6-potential-edge-cases-pitfalls--implemented-guardrails)
7. [API Quick Reference Table](#7-api-quick-reference-table)

---

## 1. Executive Summary & Core Objectives

Phase 3 introduces **Rating Calibration and Distribution Normalization** to the Falcon PMS Reviews Subsystem. After supervisors complete Section V evaluations in Phase 2, manager grading biases, subjective leniency, or harsh grading discrepancies can distort organizational parity. Phase 3 equips HR executives and departmental leadership with data-driven calibration tools to normalize ratings against target bell curves and ensure equitable appraisals.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PHASE 3 CALIBRATION PIPELINE                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│   [ Supervisor Ratings (Phase 2) ] ───► Outlier Detection & System Recommendations Engine        │
│                                                   │                                              │
│                                                   ▼                                              │
│   [ HR Facilitator ] ────────► Schedules Calibration Session (Scoped by Dept / Division)         │
│                                                   │                                              │
│                                                   ▼                                              │
│   [ Calibration Committee ] ──► Starts Session (draft ➔ under_review)                            │
│                                                   │                                              │
│                                ├────── Deliberation Discussion & Audit Threading                 │
│                                ├────── Adjusts Scores (before_score ➔ after_score)               │
│                                └────── Records Consensus Evidence & Rationale                    │
│                                                   │                                              │
│                                                   ▼                                              │
│   [ Session Finalization ] ───► Completes Session (under_review ➔ completed)                     │
│                                 Writes Calibrated Scores & Deltas to FinalRating Models          │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Business Goals Delivered:
1. **Automated Outlier Detection:** Identifies statistical outliers using Z-score deviations from departmental averages, critical low thresholds (<40%), and critical high thresholds (>95%).
2. **Manager Bias Identification:** Detects managers whose rating averages significantly diverge (±15%) from company-wide benchmarks.
3. **Collaborative Deliberation Sessions:** Formal committee session lifecycle (`draft` $\rightarrow$ `under_review` $\rightarrow$ `completed` / `cancelled`) with facilitators, committee members, scoped departments, and agendas.
4. **Transparent Rating Adjustments:** Auditable before-and-after score adjustments with mandatory justification text and consensus tracking.
5. **Threaded Deliberation Notes:** Multi-tier comment hierarchies allowing facilitators and executive chairs to record meeting minutes, rationale, and sign-offs.
6. **Calibration Impact Analytics:** Comprehensive reports comparing pre-calibration vs. post-calibration distributions, quota shifts, and net score changes.

---

## 2. Tested Personas & Real-Data Actors

All Phase 3 APIs and workflows have been verified against the live Falcon Technologies organization hierarchy:

| Persona | Real Email | Role Identifier | Responsibilities in Phase 3 |
| :--- | :--- | :--- | :--- |
| **HR Admin / Facilitator** | `lauren.green@falcon.com` | `hr_admin` | Schedules sessions, leads deliberation, starts/completes sessions, inputs adjustments |
| **Executive / Committee Chair** | `sarah.jenkins@falcon.com` | `executive` | Reviews outliers, provides high-level organizational oversight, endorses score adjustments |
| **Supervisor / Member** | `mark.vance@falcon.com` | `supervisor` | Defends team evaluations, deliberates cross-departmental parity, views assigned sessions |
| **Client Admin** | `alex.turner@falcon.com` | `client_admin` | Global governance, oversight of calibration compliance and system settings |
| **Staff Member (Reviewee)** | `brian.garcia@falcon.com` | `staff` | Subject of calibration adjustments; strictly forbidden from accessing calibration controls |

---

## 3. Test Suite Execution & Verification (Phase 3 Suite)

The automated integration test suite (`scratch/reviews/phase3.py`) validates **43 comprehensive assertions** across 13 test stages with **100% pass rate**:

```text
================================================================================
🚀 FALCON PMS - REVIEWS SUBSYSTEM PHASE 3 REAL-DATA TEST SUITE
   Scope: Calibration Sessions, Deliberations, Outliers & Normalization
Base API URL: http://127.0.0.1:8000/api/v1
Tenant ID: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (Falcon Technologies)
================================================================================
📊 FALCON PMS REVIEWS SUBSYSTEM PHASE 3 TEST SUMMARY
================================================================================
  Total Assertions Run: 43
  Passed Assertions:    43
  Failed Assertions:    0
  Pass Rate:            100.0%
================================================================================
🎉 ALL PHASE 3 CALIBRATION & NORMALIZATION TESTS PASSED PERFECTLY!
```

### Breakdown of Verified Test Stages:

```
├── 1. Multi-Role Authentication for Calibration Committee Actors & Staff (5/5 PASS)
├── 2. Active Cycle Discovery & Reviewee Final Rating Resolution (2/2 PASS)
├── 3. Pre-Calibration Outlier Detection & System Recommendations (3/3 PASS)
├── 4. Calibration Session Lifecycle: Creation & Scheduling (Draft State) (2/2 PASS)
├── 5. Calibration Session Queries, Scoping & Nested Route Retrieval (5/5 PASS)
├── 6. Calibration Session Execution: State Transition (Draft -> Under Review) (2/2 PASS)
├── 7. Committee Deliberations & Rating Adjustments (Before/After Calibration) (4/4 PASS)
├── 8. Committee Discussion Threads & Consensus Deliberation Comments (4/4 PASS)
├── 9. Direct FinalRating Calibration & Recalibration Endpoints (2/2 PASS)
├── 10. Comprehensive Calibration Reporting & Quota Distribution Analytics (3/3 PASS)
├── 11. Calibration Session Finalization (Under Review -> Completed) (3/3 PASS)
├── 12. Secondary Session Cancellation Lifecycle (Draft -> Cancelled) (3/3 PASS)
└── 13. Role-Based Access Control (RBAC) & Security Boundary Enforcement (5/5 PASS)
```

---

## 4. End-to-End Phase 3 Workflow & Architecture

### Step 1: Pre-Calibration Intelligence & Outlier Analysis
Before convening a committee, the HR facilitator analyzes rating distributions across departments and flags anomalies:
1. HR calls `GET /api/v1/reviews/calibration-sessions/outliers/?cycle_id={cycle_id}` to compute statistical deviations (Z-scores $> 1.5$ standard deviations) and identify extreme grades.
2. HR calls `GET /api/v1/reviews/calibration-sessions/calibration-recommendations/?cycle_id={cycle_id}` to receive system-generated priority queues (`high_priority`, `medium_priority`, `low_priority`) and identify manager bias.

### Step 2: Calibration Session Scheduling & Scoping
1. HR calls `POST /api/v1/reviews/calibration-sessions/` specifying:
   - `review_cycle`: The active cycle ID.
   - `name`: E.g., *"FY2026 Engineering & Operations Calibration Session"*.
   - `session_type`: `initial`, `mid_cycle`, `final`, or `adhoc`.
   - `facilitator`: Assigned HR Admin.
   - `participants`: List of Committee Members (Department Heads, Executives).
   - `departments_included`: Target departments under evaluation.
   - `scheduled_date`, `agenda`, `notes`.
2. Session is created in `draft` state with outcome `pending`.
3. Committee members discover their scheduled sessions via `GET /api/v1/reviews/calibration-sessions/my/`.

### Step 3: Session Launch & Deliberation Execution
1. When the committee convenes, the facilitator starts the session via `POST /api/v1/reviews/calibration-sessions/{id}/start/` with `{"start": true}`.
2. State transitions from `draft` to `under_review`, timestamping `actual_start_time`.
3. Committee members review reviewees and deliberate score adjustments:
   - Facilitator posts rating adjustment: `POST /api/v1/reviews/calibration-sessions/{id}/add-rating/` specifying `final_rating`, `before_score`, `after_score`, `adjustment_reason`, and `supporting_evidence`.
   - The backend automatically updates `FinalRating.final_score = after_score`, `FinalRating.calibration_adjustment = after_score - before_score`, and `FinalRating.status = 'calibrated'`.
4. Committee members record notes or consensus decisions via `POST /api/v1/reviews/calibration-sessions/{id}/add-comment/` (supporting threaded nested replies).

### Step 4: Distribution Impact Analysis & Final Sign-Off
1. The facilitator and executive chair review the updated bell curve and impact metrics:
   - `GET /api/v1/reviews/calibration-sessions/{id}/report/`: Individual session audit summary.
   - `GET /api/v1/reviews/reports/calibration-summary/?cycle_id={cycle_id}`: Cycle-wide calibration metrics.
   - `GET /api/v1/reviews/reports/rating-distribution/?cycle_id={cycle_id}`: Real-time normalized tier breakdown.
2. Facilitator finalizes the session via `POST /api/v1/reviews/calibration-sessions/{id}/complete/` with `decisions` and `notes`.
3. Status transitions to `completed`, `outcome = 'completed'`, and `actual_end_time` is recorded.

---

## 5. Frontend Data Contract & Serialized Payloads

This section provides the exact JSON structures received and sent by the frontend UI for all Phase 3 screens.

### 5.1 Pre-Calibration Intelligence: Outlier Detection & Recommendations

#### Outlier Detection Endpoint
- **URL:** `GET /api/v1/reviews/calibration-sessions/outliers/?cycle_id=9`
- **Response Structure (HTTP 200):**
```json
{
  "cycle_id": "9",
  "cycle_name": "FY2026 Falcon Annual Appraisal Cycle",
  "outliers": [
    {
      "employee": "brian.garcia@falcon.com",
      "department": "Engineering",
      "manager": "mark.vance@falcon.com",
      "score": 95.0,
      "rating_id": "4",
      "reasons": [
        "Score deviates 1.8 standard deviations from department average",
        "Score is exceptionally high (>95%)"
      ]
    }
  ],
  "count": 1
}
```

#### Calibration Recommendations Endpoint
- **URL:** `GET /api/v1/reviews/calibration-sessions/calibration-recommendations/?cycle_id=9`
- **Response Structure (HTTP 200):**
```json
{
  "cycle_id": "9",
  "cycle_name": "FY2026 Falcon Annual Appraisal Cycle",
  "recommendations": {
    "high_priority": [
      {
        "type": "manager_bias",
        "manager": "mark.vance@falcon.com",
        "deviation": 16.5,
        "recommendation": "Manager's average rating +16.5% from company average. Review all ratings from this manager."
      }
    ],
    "medium_priority": [],
    "low_priority": []
  }
}
```

---

### 5.2 Calibration Session Lifecycle & Scheduling

#### Create Calibration Session (Draft)
- **URL:** `POST /api/v1/reviews/calibration-sessions/`
- **Request Payload:**
```json
{
  "review_cycle": 9,
  "name": "FY2026 Engineering & Operations Calibration Session",
  "description": "Cross-departmental calibration session to normalize performance ratings and evaluate promotion candidates.",
  "session_type": "final",
  "scheduled_date": "2026-09-22T14:48:42.000Z",
  "facilitator": "c4f6b057-e415-4037-ada7-535e5e33c22c",
  "participants": [
    "34f3e4be-b3cb-4c63-95b3-cf101fb33456",
    "a0ed5cac-4dfc-424c-95c8-236f4f6e9c83",
    "92acd723-9cd1-424c-a56d-16a617cd99ad"
  ],
  "departments_included": [
    "7a16b9d8-4378-4c5f-adcf-3a9e62e1fb01",
    "8b27c9e9-5489-5d6a-beca-4b0f73f2ac02"
  ],
  "agenda": "1. Review Bell Curve Distribution\n2. Evaluate High Performers & Outliers\n3. Deliberate & Approve Rating Adjustments\n4. Final Consensus Sign-off",
  "notes": "Ensure alignment with Q3 performance benchmarks and normalized curve standards."
}
```
- **Response Payload (HTTP 201):**
```json
{
  "id": "7",
  "review_cycle": 9,
  "review_cycle_name": "FY2026 Falcon Annual Appraisal Cycle",
  "name": "FY2026 Engineering & Operations Calibration Session",
  "description": "Cross-departmental calibration session to normalize performance ratings and evaluate promotion candidates.",
  "session_type": "final",
  "session_type_display": "Final Calibration",
  "scheduled_date": "2026-09-22T14:48:42Z",
  "actual_start_time": null,
  "actual_end_time": null,
  "facilitator": "c4f6b057-e415-4037-ada7-535e5e33c22c",
  "facilitator_name": "Lauren Green",
  "participants": [
    "34f3e4be-b3cb-4c63-95b3-cf101fb33456",
    "a0ed5cac-4dfc-424c-95c8-236f4f6e9c83",
    "92acd723-9cd1-424c-a56d-16a617cd99ad"
  ],
  "participants_count": 3,
  "departments_included": [
    "7a16b9d8-4378-4c5f-adcf-3a9e62e1fb01",
    "8b27c9e9-5489-5d6a-beca-4b0f73f2ac02"
  ],
  "departments_count": 2,
  "agenda": "1. Review Bell Curve Distribution\n2. Evaluate High Performers & Outliers\n3. Deliberate & Approve Rating Adjustments\n4. Final Consensus Sign-off",
  "notes": "Ensure alignment with Q3 performance benchmarks and normalized curve standards.",
  "decisions": "",
  "status": "draft",
  "status_display": "Draft",
  "outcome": "pending",
  "outcome_display": "Pending",
  "follow_up_required": false,
  "follow_up_date": null,
  "is_upcoming": true,
  "is_in_progress": false,
  "created_at": "2026-09-20T14:48:46Z",
  "updated_at": "2026-09-20T14:48:46Z"
}
```

#### Start Calibration Session
- **URL:** `POST /api/v1/reviews/calibration-sessions/7/start/`
- **Request Payload:** `{"start": true}`
- **Response Payload (HTTP 200):**
```json
{
  "id": "7",
  "name": "FY2026 Engineering & Operations Calibration Session",
  "status": "under_review",
  "status_display": "Under Review",
  "actual_start_time": "2026-09-20T14:49:10Z",
  "is_in_progress": true
}
```

---

### 5.3 Deliberation Rating Adjustments & Score Overrides

#### Add Rating Adjustment to Session
- **URL:** `POST /api/v1/reviews/calibration-sessions/7/add-rating/`
- **Request Payload:**
```json
{
  "final_rating": "4",
  "before_score": 95.0,
  "after_score": 88.5,
  "adjustment_reason": "Cross-functional calibration consensus: Brian demonstrated outstanding technical leadership in Q3 platform scalability project.",
  "supporting_evidence": "Peer reviews and quarterly sprint metrics confirm high velocity and zero defect rate."
}
```
- **Response Payload (HTTP 201):**
```json
{
  "id": "2",
  "calibration_session": "7",
  "final_rating": "4",
  "employee_name": "Brian Garcia",
  "adjusted_by": "c4f6b057-e415-4037-ada7-535e5e33c22c",
  "adjusted_by_name": "Lauren Green",
  "before_score": "95.00",
  "after_score": "88.50",
  "adjustment_amount": -6.5,
  "adjustment_reason": "Cross-functional calibration consensus: Brian demonstrated outstanding technical leadership in Q3 platform scalability project.",
  "supporting_evidence": "Peer reviews and quarterly sprint metrics confirm high velocity and zero defect rate.",
  "adjusted_at": "2026-09-20T14:49:20Z"
}
```

---

### 5.4 Committee Deliberation Comments & Threaded Notes

#### Add Top-Level Facilitator Comment
- **URL:** `POST /api/v1/reviews/calibration-sessions/7/add-comment/`
- **Request Payload:**
```json
{
  "comment": "Committee consensus: Brian Garcia's calibration adjustment of -6.50% accepted unanimously across Engineering and QA leadership."
}
```
- **Response Payload (HTTP 201):**
```json
{
  "id": "5",
  "calibration_session": "7",
  "author": "c4f6b057-e415-4037-ada7-535e5e33c22c",
  "author_name": "Lauren Green",
  "author_email": "lauren.green@falcon.com",
  "comment": "Committee consensus: Brian Garcia's calibration adjustment of -6.50% accepted unanimously across Engineering and QA leadership.",
  "created_at": "2026-09-20T14:49:37Z"
}
```

#### Add Executive Threaded Reply
- **URL:** `POST /api/v1/reviews/calibration-sessions/7/add-comment/`
- **Request Payload:**
```json
{
  "comment": "Executive Committee endorses this calibration adjustment. Standout contribution.",
  "parent_comment_id": "5"
}
```
- **Response Payload (HTTP 201):**
```json
{
  "id": "6",
  "calibration_session": "7",
  "author": "34f3e4be-b3cb-4c63-95b3-cf101fb33456",
  "author_name": "Sarah Jenkins",
  "author_email": "sarah.jenkins@falcon.com",
  "comment": "Executive Committee endorses this calibration adjustment. Standout contribution.",
  "created_at": "2026-09-20T14:49:42Z"
}
```

---

### 5.5 Direct FinalRating Calibration & Recalibration

#### Direct Calibrate Action on FinalRating
- **URL:** `POST /api/v1/reviews/final-ratings/4/calibrate/`
- **Request Payload:**
```json
{
  "adjusted_score": 88.5,
  "reason": "Direct calibration update ratified by Calibration Committee."
}
```
- **Response Payload (HTTP 200):**
```json
{
  "id": "4",
  "employee": "7d16e9d8-4378-4c5f-adcf-3a9e62e1fbcc",
  "employee_name": "Brian Garcia",
  "review_cycle": 9,
  "final_score": "88.50",
  "final_rating_label": "Exceeds Expectations",
  "calibration_adjustment": "0.00",
  "calibration_adjustment_reason": "Direct calibration update ratified by Calibration Committee.",
  "status": "calibrated",
  "status_display": "Calibrated"
}
```

#### Recalibrate Action (Reset to Pending)
- **URL:** `POST /api/v1/reviews/final-ratings/4/recalibrate/`
- **Response Payload (HTTP 200):**
```json
{
  "id": "4",
  "final_score": "88.50",
  "calibration_adjustment": null,
  "calibration_adjustment_reason": "",
  "status": "pending",
  "status_display": "Pending"
}
```

---

### 5.6 Session Reports & Cycle Calibration Summary Analytics

#### Calibration Session Detailed Audit Report
- **URL:** `GET /api/v1/reviews/calibration-sessions/7/report/`
- **Response Payload (HTTP 200):**
```json
{
  "session": {
    "id": "7",
    "name": "FY2026 Engineering & Operations Calibration Session",
    "type": "Final Calibration",
    "scheduled_date": "2026-09-22T14:48:42+00:00",
    "actual_start_time": "2026-09-20T14:49:10+00:00",
    "actual_end_time": "2026-09-20T14:50:22+00:00",
    "status": "Completed",
    "outcome": "Completed",
    "facilitator": "lauren.green@falcon.com"
  },
  "participants": [
    {
      "id": "34f3e4be-b3cb-4c63-95b3-cf101fb33456",
      "name": "Sarah Jenkins",
      "email": "sarah.jenkins@falcon.com"
    },
    {
      "id": "a0ed5cac-4dfc-424c-95c8-236f4f6e9c83",
      "name": "Mark Vance",
      "email": "mark.vance@falcon.com"
    },
    {
      "id": "92acd723-9cd1-424c-a56d-16a617cd99ad",
      "name": "Alex Turner",
      "email": "alex.turner@falcon.com"
    }
  ],
  "adjustments": {
    "total": 1,
    "average_adjustment": -6.5,
    "max_increase": -6.5,
    "max_decrease": -6.5,
    "list": [
      {
        "employee": "Brian Garcia",
        "before_score": 95.0,
        "after_score": 88.5,
        "adjustment": -6.5,
        "reason": "Cross-functional calibration consensus: Brian demonstrated outstanding technical leadership in Q3 platform scalability project.",
        "adjusted_by": "lauren.green@falcon.com",
        "adjusted_at": "2026-09-20T14:49:20.844000+00:00"
      }
    ]
  },
  "departments_included": [
    "Engineering",
    "Operations"
  ],
  "notes": "Ensure alignment with Q3 performance benchmarks and normalized curve standards.",
  "decisions": "All rating adjustments ratified and finalized. High-potential talent pool updated for promotion review."
}
```

#### Cycle-Wide Calibration Impact Summary
- **URL:** `GET /api/v1/reviews/reports/calibration-summary/?cycle_id=9`
- **Response Payload (HTTP 200):**
```json
{
  "review_cycle": {
    "id": "9",
    "name": "FY2026 Falcon Annual Appraisal Cycle"
  },
  "sessions": {
    "total": 1,
    "completed": 1,
    "cancelled": 0,
    "list": [
      {
        "id": "7",
        "name": "FY2026 Engineering & Operations Calibration Session",
        "date": "2026-09-22T14:48:42+00:00",
        "status": "Completed",
        "adjustments_count": 1
      }
    ]
  },
  "calibration_impact": {
    "total_ratings_calibrated": 1,
    "total_ratings_in_cycle": 1,
    "percentage_calibrated": 100.0,
    "average_before_score": 95.0,
    "average_after_score": 88.5,
    "average_change": -6.5,
    "total_adjustments": 1,
    "increases": 0,
    "decreases": 1,
    "no_change": 0
  }
}
```

---

## 6. Potential Edge Cases, Pitfalls & Implemented Guardrails

### 1. Guarding Session State Machine Transitions
- **Problem:** Attempting to start an already running session, or completing a session that is still in `draft` mode.
- **Backend Guardrail:** 
  - `start` action enforces `if session.status != 'draft': return HTTP 400 Bad Request`.
  - `complete` action enforces `if session.status != 'under_review': return HTTP 400 Bad Request`.
  - `cancel` action enforces `if session.status not in ['draft', 'under_review']: return HTTP 400 Bad Request`.

### 2. Safeguarding Direct Calibration Calculations Against Division-by-Zero & Undefined Averages
- **Problem:** When a cycle contains zero calibrated adjustments or direct ratings without adjustment records, summary reports could trigger `ZeroDivisionError` or `NameError`.
- **Backend Guardrail:** `CalibrationReportService.get_cycle_calibration_summary` safely defaults both `avg_before` and `avg_after` to `0` when scores are empty, avoiding runtime exceptions.

### 3. Strict RBAC Isolation for Staff and Non-Admin Actors
- **Problem:** Non-committee reviewees or staff members attempting to view confidential deliberations or alter calibrated ratings.
- **Backend Guardrail:** 
  - `create`, `update`, `destroy`, `start`, `complete`, `add_rating`, `cancel` require `IsAdminOnly` (HR Admin / Client Admin / Super Admin).
  - Staff attempts to invoke any calibration mutation endpoint return immediate **HTTP 403 Forbidden**.

### 4. Idempotent Nested & Standalone Comment Retrieval
- **Problem:** UI components query comments either via parent nested router (`/calibration-sessions/{id}/comments/`) or directly (`/calibration-comments/for-session/{id}/`).
- **Backend Guardrail:** Both endpoints are registered in `apps/reviews/api/v1/urls.py` and filter top-level discussion roots, maintaining parent/child relationship pointers.

---

## 7. API Quick Reference Table

| Method | Endpoint | Description | Permitted Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reviews/calibration-sessions/` | List calibration sessions with pagination | Authenticated |
| `POST` | `/api/v1/reviews/calibration-sessions/` | Schedule new calibration session | `hr_admin`, `client_admin` |
| `GET` | `/api/v1/reviews/calibration-sessions/{id}/` | Get detailed calibration session | Authenticated |
| `POST` | `/api/v1/reviews/calibration-sessions/{id}/start/` | Start deliberation (`draft` $\rightarrow$ `under_review`) | `hr_admin`, `client_admin` |
| `POST` | `/api/v1/reviews/calibration-sessions/{id}/complete/` | Complete deliberation (`under_review` $\rightarrow$ `completed`) | `hr_admin`, `client_admin` |
| `POST` | `/api/v1/reviews/calibration-sessions/{id}/cancel/` | Cancel session (`draft`/`under_review` $\rightarrow$ `cancelled`) | `hr_admin`, `client_admin` |
| `POST` | `/api/v1/reviews/calibration-sessions/{id}/add-rating/` | Add rating override adjustment | `hr_admin`, `client_admin` |
| `POST` | `/api/v1/reviews/calibration-sessions/{id}/add-comment/` | Add committee deliberation comment / reply | `hr_admin`, `executive`, `client_admin` |
| `GET` | `/api/v1/reviews/calibration-sessions/outliers/` | Detect rating outliers across cycle | `hr_admin`, `executive`, `client_admin` |
| `GET` | `/api/v1/reviews/calibration-sessions/calibration-recommendations/` | System calibration recommendations | `hr_admin`, `executive`, `client_admin` |
| `GET` | `/api/v1/reviews/calibration-sessions/{id}/report/` | Get session adjustment summary report | Authenticated |
| `GET` | `/api/v1/reviews/calibration-sessions/my/` | Get upcoming sessions where user is participant | Authenticated |
| `GET` | `/api/v1/reviews/calibration-sessions/for-cycle/{cycle_id}/` | Get all sessions for specific cycle | Authenticated |
| `GET` | `/api/v1/reviews/calibration-ratings/for-session/{session_id}/` | List rating adjustments for session | Authenticated |
| `GET` | `/api/v1/reviews/calibration-sessions/{session_id}/ratings/` | Nested route for session ratings | Authenticated |
| `GET` | `/api/v1/reviews/calibration-comments/for-session/{session_id}/` | List top-level discussion comments | Authenticated |
| `GET` | `/api/v1/reviews/calibration-sessions/{session_id}/comments/` | Nested route for session comments | Authenticated |
| `POST` | `/api/v1/reviews/final-ratings/{id}/calibrate/` | Direct calibrate action on FinalRating | `hr_admin`, `client_admin` |
| `POST` | `/api/v1/reviews/final-ratings/{id}/recalibrate/` | Reset calibration on FinalRating to pending | `hr_admin`, `client_admin` |
| `GET` | `/api/v1/reviews/reports/calibration-summary/` | Cycle-wide calibration impact report | Supervisor, Exec, Admin |
| `GET` | `/api/v1/reviews/reports/rating-distribution/` | Normalized rating distribution bell curve | Supervisor, Exec, Admin |
