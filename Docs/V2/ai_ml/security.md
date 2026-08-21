# Security Requirements Document (CIA Triad & AI Governance)
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Document Type** | Explicit Security & CIA Triad Integration Document |
| **Air-Gap Compliance** | 100% On-Premise / Zero External Data Leakage |

---

## 1. Executive Security Architecture & CIA Triad

The integration of artificial intelligence into an enterprise PMS requires rigorous adherence to cybersecurity fundamentals. The Falcon V2 AI engine enforces the **CIA Triad** (Confidentiality, Integrity, Availability) at every layer of hardware, software, database, and model execution.

```
                  ┌─────────────────────────────────┐
                  │       THE CIA TRIAD FOR AI       │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────┐       ┌────────▼────────┐       ┌────────▼────────┐
│ CONFIDENTIALITY │       │    INTEGRITY    │       │  AVAILABILITY   │
│                 │       │                 │       │                 │
│ • Air-Gapped    │       │ • Decoupled Math│       │ • Async Worker  │
│   Inference     │       │   Calculations  │       │   Throttling    │
│ • Tenant Vector │       │ • Read-Only AI  │       │ • Fallback Web  │
│   Isolation     │       │   Permissions   │       │   Speech STT    │
│ • PII Masking   │       │ • Immutable AI  │       │ • Anomaly Detection│
│   Pipeline      │       │   Audit Trails  │       │   Alerting      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 2. Confidentiality Requirements (Data Isolation & Privacy)

### SEC-CONF-01: 100% Air-Gapped Model Execution
* The local AI inference server (Ollama/vLLM) must bind exclusively to `localhost` (`127.0.0.1`) or an isolated internal docker network interface (`172.18.0.0/16`).
* Outbound firewall rules (Nginx / iptables) must block all external HTTP/S outbound connections initiated by the AI process.

### SEC-CONF-02: Tenant Isolation in Vector Search
* All vector embeddings in `ai_embedding_knowledge` must include the `tenant_id` foreign key.
* All similarity searches (`pgvector`) MUST execute with mandatory SQL filters enforcing `tenant_id = request.tenant.id`.
* Global embedding weights shall NEVER be updated or fine-tuned directly on raw tenant data to eliminate cross-tenant prompt extraction risk.

### SEC-CONF-03: Dynamic PII Masking Engine (`apps/core/security/anonymizer.py`)
Prior to handing prompt strings to the LLM, the PII Redaction module executes regex and entity rules:

| Entity Type | Original Input Example | Masked Token Output |
| :--- | :--- | :--- |
| **Person Name** | *"Appraise John Smith for Q3"* | *"Appraise [PERSON_TOKEN_1] for Q3"* |
| **Email Address** | *"Send to john.smith@acme.com"* | *"Send to [EMAIL_TOKEN_1]"* |
| **Phone Number** | *"+1-555-0199"* | *"[PHONE_TOKEN_1]"* |
| **National ID / SSN**| *"SSN: 000-12-3456"* | *"[NATIONAL_ID_MASKED]"* |

---

## 3. Integrity Requirements (Data Precision & Non-Repudiation)

### SEC-INT-01: Decoupled Mathematical Computation
* To prevent AI hallucinations from corrupting performance records, the LLM is prohibited from performing raw arithmetic operations.
* All mathematical aggregations, formula evaluations, and variance metrics are executed strictly by Django ORM SQL or Python Pandas pipelines in `apps/kpi/services`.
* The LLM is supplied with verified, static calculation outputs for narrative formatting only.

### SEC-INT-02: Human-in-the-Loop Approval Workflow
* The AI engine operates with **Read-Only** system permissions.
* The AI engine cannot directly execute SQL `INSERT`, `UPDATE`, or `DELETE` statements on business records.
* Any AI-generated appraisal draft or target adjustment requires an explicit UI user click to review and save.

### SEC-INT-03: Immutable Cryptographic Audit Logging
* Every AI interaction is logged to the `ai_audit_log` database table with fields: `user_id`, `tenant_id`, `prompt_hash`, `execution_time_ms`, and `anomaly_score`.
* Audit log records are append-only; database roles assigned to the AI service do not possess `DELETE` or `UPDATE` privileges on `ai_audit_log`.

---

## 4. Availability & Threat Monitoring Requirements

### SEC-AVAIL-01: System Resource Throttling & Queue Management
* The AI service must enforce concurrency limits (e.g., maximum 4 simultaneous LLM GPU inference requests) using Redis locks and Django async worker pools.
* Incoming requests beyond capacity shall receive a `429 Too Many Requests` or queued status update, preventing main web server crash or memory starvation.

### SEC-AVAIL-02: Isolation Forest Anomaly Detection
* The backend runs an automated security monitoring service (`apps/accounts/security_watcher.py`).
* Scikit-learn **Isolation Forest** evaluates audit metrics (query rate, night-time logins, rapid endpoint switching) to compute an anomaly score (0.0 to 1.0).
* Scores > 0.85 trigger instant alerts to tenant administrators via WebSockets and optionally lock high-risk actions.
