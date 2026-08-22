# Software Requirements Specification (SRS)
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Document Type** | Software Requirements Specification |
| **Target Version** | V2.0-AI |

---

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional software requirements for the Falcon V2 native AI/ML engine. The system provides speech recognition, real-time page context tracking, deterministic KPI math processing, automated report writing, and security anomaly detection without external API calls.

### 1.2 System Overview
The Falcon AI engine is built as an integrated sidecar to Falcon's existing Django multi-tenant REST API backend, React Vite Single Page Application (SPA), and Daphne WebSocket architecture.

---

## 2. Functional Requirements

### FR-01: Hands-Free Voice & Speech Input (STT)
* **FR-01.1:** The frontend UI shall provide an embedded microphone widget allowing users to input prompts via voice.
* **FR-01.2:** Speech-to-Text (STT) shall use browser-native Web Speech API as the primary engine for real-time transcription.
* **FR-01.3:** The backend shall provide a local OpenAI Whisper model fallback (running on Python 3.11/PyTorch) via WebSocket audio stream when Web Speech API is unavailable.
* **FR-01.4:** Transcribed text shall automatically populate the AI input field and trigger execution upon user verbal or manual confirmation.

### FR-02: Real-Time Page Context Awareness
* **FR-02.1:** The React frontend shall track active client state using a custom `usePageContext` hook monitoring `react-router-dom` state.
* **FR-02.2:** Every request sent to the AI engine shall include active metadata: `current_url`, `active_entity_type` (e.g., `kpi`, `review`, `organization`), `active_entity_id`, and `visible_tab`.
* **FR-02.3:** The AI engine shall dynamically resolve the relevant database object based on active page metadata and inject it into the prompt context payload.

### FR-03: Deterministic KPI Operations & Math Processing
* **FR-03.1:** The system shall strictly isolate numeric KPI operations (variance, percentage completion, target delta, weighted averages) from the Large Language Model.
* **FR-03.2:** Python/Pandas and Django ORM aggregators in `apps/kpi/services` shall execute 100% of mathematical operations.
* **FR-03.3:** The LLM shall receive pre-calculated, verified numeric arrays strictly for generating narrative interpretations, executive summaries, and recommendations.

### FR-04: Automated Appraisal & Performance Report Writer
* **FR-04.1:** The system shall generate structured Markdown performance appraisal summaries in `apps/reviews` and `apps/reportplt`.
* **FR-04.2:** Report generation shall support multi-source synthesis: Self-Evaluations, Peer Reviews, Line Manager Ratings, and KPI Scorecard data.
* **FR-04.3:** The generated report must include structured sections: Executive Summary, Key Achievements, Areas for Development, KPI Target Performance, and Action Plan.

### FR-05: Multi-Tenant Data Redaction & PII Anonymization
* **FR-05.1:** All text payloads evaluated by local AI models must pass through an automated PII anonymization pipeline (`apps/core/security/anonymizer.py`).
* **FR-05.2:** Personal Identifiable Information (names, email addresses, phone numbers, national IDs) shall be masked with token placeholders (`[EMPLOYEE_ID_142]`, `[EMAIL_MASKED]`) prior to model prompt construction.
* **FR-05.3:** Unmasking shall occur exclusively on the client side using the user's authenticated session state.

### FR-06: Security Anomaly & Threat Detection
* **FR-06.1:** A background worker (`apps/accounts/security_watcher.py`) shall monitor user action telemetry via Django Signals and Redis event streams.
* **FR-06.2:** The ML engine (using Scikit-learn Isolation Forest) shall detect anomalous behavior patterns:
  * Unusual login timestamps or burst requests.
  * Off-schedule bulk data export queries.
  * Rapid cross-module URL traversal attempts (IDOR probe patterns).
* **FR-06.3:** When anomaly thresholds (>0.85 score) are crossed, the system shall log a security alert, notify tenant admins via WebSocket, and optionally trigger step-up authentication.

---

## 3. External Interface Requirements

### 3.1 User Interfaces (React Vite SPA)
* Floating, draggable AI Copilot drawer with expanding chat view.
* Waveform visualizer active during microphone recording.
* One-click "Apply to Review" action buttons for AI-generated text snippets.

### 3.2 Backend Service Interfaces (Django REST + WebSockets)
* `POST /api/v2/ai/chat/`: Context-aware prompt execution endpoint.
* `POST /api/v2/ai/summarize-kpi/`: KPI scorecard analysis endpoint.
* `POST /api/v2/ai/generate-review/`: Appraisal draft creation endpoint.
* `WS /ws/ai/voice-stream/`: Dual-way audio streaming endpoint for voice processing.

### 3.3 Database Interfaces
* PostgreSQL 14+ with `pgvector` extension for tenant-scoped vector search and retrieval.
