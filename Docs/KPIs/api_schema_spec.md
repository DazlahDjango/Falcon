# Falcon KPI App: Master Database & API Schema Specification

This document provides a complete technical specification of the database schemas, Django Rest Framework serializers, API view endpoints, validation rules, and real-time WebSocket payloads.

---

## 1. Database Model Schemas

### A. Base Fields (Inherited from `BaseKPIModel` / `BaseStructureModel`)
All core models inherit these tracking fields:
*   `id`: `UUID` (Primary Key, Default: `uuid.uuid4`)
*   `tenant_id`: `UUID` (Indexed, scoped via middleware/context)
*   `created_at`: `DateTimeField` (Auto-filled on create)
*   `updated_at`: `DateTimeField` (Auto-updated on save)
*   `created_by`: `ForeignKey(User, null=True)` (User who created the record)
*   `updated_by`: `ForeignKey(User, null=True)` (User who last edited the record)
*   `is_deleted`: `BooleanField` (Default: `False`, used for soft deletes)

---

### B. Specific KPI Models

#### 1. `KPI` (Table: `kpi_definitions`)
Defines the metrics used to measure performance.
*   `name`: `CharField(max_length=255)` — Name of the KPI.
*   `code`: `CharField(max_length=100)` — Unique identifier within the tenant.
*   `description`: `TextField(blank=True)` — Explanatory details.
*   `category`: `ForeignKey(KPICategory, null=True, blank=True)` — Structural perspective group.
*   `kpi_type`: `CharField(max_length=20, choices)` — Value format (`COUNT`, `PERCENTAGE`, `FINANCIAL`, `MILESTONE`, `TIME`, `IMPACT`).
*   `calculation_logic`: `CharField(choices)` — Directional target strategy (`HIGHER_IS_BETTER`, `LOWER_IS_BETTER`).
*   `measure_type`: `CharField(choices)` — Aggregation method over periods (`CUMULATIVE`, `NON_CUMULATIVE`).
*   `unit`: `CharField(max_length=50, blank=True)` — Display label (e.g. `KES`, `days`, `count`).
*   `decimal_places`: `PositiveSmallIntegerField(default=0)` — Decimal resolution for calculations.
*   `target_min`: `DecimalField(max_digits=20, decimal_places=2, null=True)` — Safe range bottom.
*   `target_max`: `DecimalField(max_digits=20, decimal_places=2, null=True)` — Safe range ceiling.
*   `formula`: `JSONField(default=dict)` — Structured calculation expressions for composed metrics.
*   `owner`: `ForeignKey(User)` — The employee responsible for reporting.
*   `department`: `ForeignKey(Department, null=True)` — Responsible business unit.
*   `is_active`: `BooleanField(default=True)` — Active status flag.
*   `activation_date`: `DateField(null=True)` — Date KPI was enabled.
*   `deactivation_date`: `DateField(null=True)` — Date KPI was disabled.
*   `strategic_objective`: `CharField(max_length=255, blank=True)` — Objective relation tag.
*   `metadata`: `JSONField(default=dict)` — Extension parameters.
*   *Constraints*: Unique together `['tenant_id', 'code']`.
*   *Clean Rules*: `target_min` must be $\le$ `target_max`.

#### 2. `KPICategory` (Table: `kpi_categories`)
Groups KPIs into scorecard dimensions.
*   `name`: `CharField(max_length=100)` — Perspective name.
*   `code`: `CharField(max_length=50)` — Perspective code.
*   `category_type`: `CharField(choices)` — Categories (`FINANCIAL`, `IMPACT`, `OPERATIONAL`, `CUSTOMER`, `INTERNAL`, `GROWTH`, `COMPLIANCE`).
*   `parent`: `ForeignKey(self, null=True)` — Self-referential hierarchy link.
*   `description`: `TextField(blank=True)` — Purpose details.
*   `color`: `CharField(max_length=20, blank=True)` — CSS hex color code.
*   `icon`: `CharField(max_length=50, blank=True)` — Lucide/FontAwesome icon tag.
*   `display_order`: `PositiveIntegerField(default=0)` — Reorder display position.
*   `is_active`: `BooleanField(default=True)` — Active status flag.
*   *Constraints*: Unique together `['tenant_id', 'code']`.

#### 3. `AnnualTarget` (Table: `kpi_annual_targets`)
Yearly goals established per KPI per employee.
*   `kpi`: `ForeignKey(KPI)` — Target KPI.
*   `user`: `ForeignKey(User)` — Goal owner.
*   `year`: `PositiveSmallIntegerField` — Cycle year (e.g. `2026`).
*   `target_value`: `DecimalField(max_digits=20, decimal_places=2)` — Target amount.
*   `approved_at`: `DateTimeField(null=True)` — Approval date.
*   `approved_by`: `ForeignKey(User, null=True)` — Approving supervisor.
*   `notes`: `TextField(blank=True)` — Justification details.
*   *Constraints*: Unique together `['tenant_id', 'kpi', 'user', 'year']`.
*   *Clean Rules*: `target_value` must be $\ge 0$.

#### 4. `MonthlyPhasing` (Table: `kpi_monthly_phasing`)
Monthly splits of an `AnnualTarget` goal.
*   `annual_target`: `ForeignKey(AnnualTarget)` — Parent yearly goal.
*   `month`: `PositiveSmallIntegerField` — Calendar month (`1-12`).
*   `target_value`: `DecimalField(max_digits=20, decimal_places=2)` — Phased target.
*   `is_locked`: `BooleanField(default=False)` — Locked cycle flag.
*   `locked_at`: `DateTimeField(null=True)` — Time of lock.
*   `locked_by`: `ForeignKey(User, null=True)` — User who performed lock.
*   *Constraints*: Unique together `['tenant_id', 'annual_target', 'month']`.
*   *Clean Rules*: `month` must be between $1$ and $12$. Locked values must be $\ge 0$.

#### 5. `MonthlyActual` (Table: `kpi_monthly_actuals`)
Monthly performance value entered by the employee.
*   `kpi`: `ForeignKey(KPI)` — Target KPI.
*   `user`: `ForeignKey(User)` — Value owner.
*   `year`: `PositiveSmallIntegerField` — Year.
*   `month`: `PositiveSmallIntegerField` — Month (`1-12`).
*   `actual_value`: `DecimalField(max_digits=20, decimal_places=2)` — Achieved amount.
*   `status`: `CharField(choices)` — Submission status (`PENDING`, `APPROVED`, `REJECTED`, `ADJUSTED`).
*   `submitted_at`: `DateTimeField(auto_now_add=True)` — Submission timestamp.
*   `submitted_by`: `ForeignKey(User, null=True)` — Uploading user.
*   `notes`: `TextField(blank=True)` — Submission explanations.
*   *Constraints*: Unique together `['tenant_id', 'kpi', 'user', 'year', 'month']`.

#### 6. `ValidationRecord` (Table: `kpi_validation_records`)
Tracks validation workflows by supervisors.
*   `actual`: `ForeignKey(MonthlyActual)` — Validation target actual.
*   `status`: `CharField(choices)` — Transition type (`APPROVED`, `REJECTED`, `ESCALATED`).
*   `validated_by`: `ForeignKey(User, null=True)` — Reviewing supervisor.
*   `validated_at`: `DateTimeField(null=True)` — Validation timestamp.
*   `comment`: `TextField(blank=True)` — Validator's explanation.

---

## 2. API Endpoint Route Matrix (V1 API)

| Endpoint | HTTP Method | Perm Class | Throttle | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/kpi/kpis/` | `GET`, `POST` | `IsAuthenticated` | None | Lists, search, and creates KPI definitions. |
| `/api/v1/kpi/kpis/{id}/` | `GET`, `PATCH`, `DELETE` | `IsAuthenticated` | None | Retrieves, updates, and deletes a single KPI. |
| `/api/v1/kpi/categories/` | `GET`, `POST` | `IsAuthenticated` | None | Scorecard perspective structural categories. |
| `/api/v1/kpi/categories/{id}/move/` | `POST` | `IsDashboardChampion` | None | Moves category to new parent node in hierarchy. |
| `/api/v1/kpi/categories/{id}/reorder/` | `POST` | `IsDashboardChampion` | None | Updates category bulk lists display orders. |
| `/api/v1/kpi/targets/annual/` | `GET`, `POST` | `IsAuthenticated` | None | Handles annual goals creation and lists. |
| `/api/v1/kpi/targets/annual/{id}/phase/` | `POST` | `IsAuthenticated` | None | Splits targets (options: `equal`, `seasonal`, `custom`). |
| `/api/v1/kpi/targets/annual/lock-cycle/` | `POST` | `IsDashboardChampion` | None | Globally locks a year performance cycle. |
| `/api/v1/kpi/actuals/` | `GET`, `POST` | `IsAuthenticated` | None | Lists actuals submissions or creates new actual entries. |
| `/api/v1/kpi/actuals/{id}/submit/` | `POST` | `IsAuthenticated` | None | Locks actual and forwards validation to supervisor. |
| `/api/v1/kpi/validations/pending/` | `GET` | `IsAuthenticated` | None | Fetches actuals awaiting review by supervisor. |
| `/api/v1/kpi/validations/{id}/approve/` | `POST` | `IsAuthenticated` | None | Approves a monthly actual submission. |
| `/api/v1/kpi/validations/{id}/reject/` | `POST` | `IsAuthenticated` | None | Rejects monthly actual (requires rejection reason code). |
| `/api/v1/kpi/escalations/` | `GET`, `POST` | `IsAuthenticated` | None | Creates and logs validation escalation tickets. |
| `/api/v1/kpi/analytics/org-health/` | `GET` | `IsAuthenticated` | None | Retrieves executive compliance rates and health KPIs. |
| `/api/v1/kpi/analytics/department-rollups/`| `GET` | `IsAuthenticated` | None | Lists department averages and traffic lights counts. |
| `/api/v1/kpi/bulk/upload-kpi/` | `POST` | `IsDashboardChampion` | `BulkUploadThrottle` | Uploads KPIs via CSV/Excel in the background (Async). |
| `/api/v1/kpi/bulk/upload-actual/` | `POST` | `IsDashboardChampion` | `BulkUploadThrottle` | Uploads actuals via CSV/Excel in the background (Async). |
| `/api/v1/kpi/bulk/upload-target/` | `POST` | `IsDashboardChampion` | `BulkUploadThrottle` | Uploads targets via CSV/Excel in the background (Async). |

---

## 3. DRF Serializers requesting/responding formats

### A. KPI Definition Detail Serializer (`KPIDetailSerializer`)
Used for viewing, creating, and updating KPI instances.

#### Input Fields (JSON POST/PATCH payload)
```json
{
  "name": "Revenue Growth Rate",
  "code": "FIN_002",
  "description": "Monthly revenue growth benchmark compared to previous periods.",
  "category": "c732f915-34d1-489d-8551-3c71bf92a372",
  "kpi_type": "PERCENTAGE",
  "calculation_logic": "HIGHER_IS_BETTER",
  "measure_type": "NON_CUMULATIVE",
  "unit": "%",
  "decimal_places": 2,
  "target_min": "0.00",
  "target_max": "100.00",
  "owner": "3b2d18cb-8e0f-48d2-b6ab-e12345678901",
  "department": "8335eb40-dbc1-47cf-9305-d48051b90b78",
  "strategic_objective": "Increase overall enterprise market share."
}
```

#### Output Fields (JSON Response payload)
Includes full nested objects and audit flags:
```json
{
  "id": "f5f02c63-455b-439f-b98a-5b1234567890",
  "tenant_id": "8335eb40-dbc1-47cf-9305-d48051b90b78",
  "name": "Revenue Growth Rate",
  "code": "FIN_002",
  "description": "Monthly revenue growth benchmark compared to previous periods.",
  "category_detail": {
    "id": "c732f915-34d1-489d-8551-3c71bf92a372",
    "name": "Financial Perspective",
    "category_type": "FINANCIAL"
  },
  "kpi_type": "PERCENTAGE",
  "calculation_logic": "HIGHER_IS_BETTER",
  "measure_type": "NON_CUMULATIVE",
  "unit": "%",
  "decimal_places": 2,
  "target_min": "0.00",
  "target_max": "100.00",
  "owner_detail": {
    "id": "3b2d18cb-8e0f-48d2-b6ab-e12345678901",
    "email": "owner@tenant.com",
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "department_detail": {
    "id": "8335eb40-dbc1-47cf-9305-d48051b90b78",
    "name": "Finance Department",
    "code": "FIN_DEPT"
  },
  "is_active": true,
  "created_at": "2026-07-26T15:53:54Z",
  "updated_at": "2026-07-26T15:54:10Z"
}
```

---

### B. Target Phasing Serializer (`TargetPhasingSerializer`)
Used to distribute annual targets across months.

#### Input Fields
```json
{
  "strategy": "seasonal",
  "custom_splits": {
    "1": "5.00",
    "2": "5.00",
    "3": "10.00",
    "4": "10.00",
    "5": "10.00",
    "6": "10.00",
    "7": "15.00",
    "8": "15.00",
    "9": "10.00",
    "10": "5.00",
    "11": "5.00",
    "12": "5.00"
  }
}
```
*Note*: `strategy` choices must be `equal`, `seasonal`, or `custom`. If custom is selected, `custom_splits` must contain decimal entries for months 1 to 12 summing to exactly 100% (or the annual target amount depending on calculation mode).

---

### C. Monthly Actual Entry Serializer (`MonthlyActualSerializer`)
Used by employees to insert performance data.

#### Input Fields
```json
{
  "kpi": "f5f02c63-455b-439f-b98a-5b1234567890",
  "year": 2026,
  "month": 7,
  "actual_value": "87.50",
  "notes": "Completed high-priority campaign initiatives."
}
```

#### Output Fields
```json
{
  "id": "88e7b12a-0a78-43b2-9d33-d8a123456789",
  "kpi": "f5f02c63-455b-439f-b98a-5b1234567890",
  "actual_value": "87.50",
  "status": "PENDING",
  "year": 2026,
  "month": 7,
  "submitted_at": "2026-07-26T15:53:54.123Z",
  "notes": "Completed high-priority campaign initiatives."
}
```

---

## 4. WebSocket Event Payloads (Channels Broadcast)

Notifications and status alerts are pushed live to client browsers.

### A. Bulk Upload Status Event
Pushed when an async Celery import task resolves.
*   **Group**: `user_{user_id}`
*   **Type**: `notification`
*   **Payload structure**:
    ```json
    {
      "event": "bulk_upload_completed",
      "import_type": "actual",
      "created_count": 145,
      "total_rows": 150,
      "errors_count": 5,
      "dry_run": false,
      "message": "Bulk import for actual completed successfully."
    }
    ```

### B. Validation Status Event
Pushed to validator and reporting user when actual status changes.
*   **Group**: `user_{user_id}` or `validation_{supervisor_id}`
*   **Type**: `validation_update`
*   **Payload structure**:
    ```json
    {
      "actual_id": "88e7b12a-0a78-43b2-9d33-d8a123456789",
      "status": "APPROVED",
      "kpi_id": "f5f02c63-455b-439f-b98a-5b1234567890",
      "user_id": "3b2d18cb-8e0f-48d2-b6ab-e12345678901",
      "pending_count": 3,
      "timestamp": "2026-07-26T15:54:12.813Z"
    }
    ```
