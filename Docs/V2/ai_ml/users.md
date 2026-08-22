# User Roles & Permissions Document
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **App Mapping** | `apps/accounts` & `apps/tenant` |
| **Document Type** | Role-Based Access Control (RBAC) Specification |

---

## 1. Overview

The Falcon V2 AI engine operates strictly under Falcon's established Role-Based Access Control (RBAC) system defined in `apps/accounts`. The AI assistant inherits the exact security context of the authenticated session making the request.

Under no circumstances can an AI request bypass permission checks or return data that the user would not be able to access via normal REST API endpoints.

---

## 2. Role Permission Matrix for AI Capabilities

| Role Name | System Scope | AI Chat & Voice | KPI Math Narratives | Review Assist | Security Anomaly Alerts | Vector DB Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | Global / Multi-Tenant | ✅ | ✅ | ✅ | ✅ (Global) | ✅ |
| **Tenant Admin** | Single Tenant | ✅ | ✅ | ✅ | ✅ (Tenant) | ❌ |
| **Division Head** | Division Level | ✅ | ✅ | ✅ (Division) | ❌ | ❌ |
| **Line Manager** | Unit / Team Level | ✅ | ✅ | ✅ (Direct Reports) | ❌ | ❌ |
| **Employee** | Self Only | ✅ (Self) | ✅ (Self KPIs) | ✅ (Self Review) | ❌ | ❌ |
| **Auditor / Compliance** | Tenant Read-Only | ✅ | ✅ | ❌ | ✅ (Audit Logs) | ❌ |

---

## 3. Detailed Role Capabilities & Scoping Rules

### 3.1 Super Admin (System Operator)
* **Scope:** System-wide access across all tenant schemas.
* **AI Capabilities:**
  * View overall AI model health, latency, and GPU/CPU resource consumption metrics.
  * Trigger re-indexing of global vector embeddings.
  * Access cross-tenant anomaly detection dashboards.

### 3.2 Tenant Admin (Organization Administrator)
* **Scope:** Restricted strictly to active tenant schema (`tenant_id`).
* **AI Capabilities:**
  * Generate organization-wide KPI summaries and executive reports.
  * View security anomaly logs within their tenant.
  * Enable or disable voice input or specific AI features per tenant configuration.

### 3.3 Line Manager (Appraiser)
* **Scope:** Restricted to assigned organizational unit and direct report employee IDs.
* **AI Capabilities:**
  * Request AI drafting assistance for performance reviews of direct reports.
  * Generate team KPI trend analysis and individual metric breakdown summaries.
  * Cannot view confidential reviews or compensation tiers outside their reporting structure.

### 3.4 Employee (Appraisee)
* **Scope:** Restricted strictly to self-assigned user ID records (`request.user.id`).
* **AI Capabilities:**
  * Request assistance drafting self-appraisal evaluations.
  * Query self-assigned KPI targets, scorecards, and achievement progress.
  * Cannot access manager notes, peer evaluations of others, or division-wide metrics.

---

## 4. Enforcement Architecture in Backend (`apps/accounts`)

```python
# Conceptual Enforcement Pattern in apps/core/ai_service.py

class AIAccessControlGuard:
    @staticmethod
    def enforce_context_permissions(user, active_tenant, query_params):
        """
        Ensures AI queries enforce DB row-level security matching request.user permissions.
        """
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required for AI execution.")
            
        # Scope filters strictly by tenant
        base_filter = {"tenant_id": active_tenant.id}
        
        # Enforce Role-based scoping
        if user.role == "employee":
            base_filter["user_id"] = user.id
        elif user.role == "line_manager":
            base_filter["unit_id__in"] = user.get_managed_unit_ids()
            
        return base_filter
```
