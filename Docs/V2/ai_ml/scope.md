# Scope Document
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Document Type** | Scope & Boundaries Specification |

---

## 1. Project Boundaries & Objectives

The primary objective of the Falcon V2 AI/ML initiative is to integrate native, self-hosted artificial intelligence capabilities into the Falcon PMS application stack. This document explicitly demarcation what is **In-Scope** for V2 development and what is **Out-of-Scope**.

---

## 2. In-Scope Features & Modules (Falcon V2)

### 2.1 Native Local LLM Execution Engine
* Local deployment and management of quantized open-weight Large Language Models (e.g., Llama 3 8B, Qwen 2.5 7B) using `ollama` or `vLLM` sidecar containers.
* Zero outbound connections to external AI APIs (OpenAI, Gemini, Anthropic, Mistral Cloud).

### 2.2 Frontend Voice & Navigation Interface
* React floating speech widget (`SpeechWidget.jsx`) supporting microphone audio capture.
* Browser-native Speech-to-Text (STT) integration via `window.SpeechRecognition`.
* WebSocket audio streaming fallback to local Whisper STT on Python 3.11/PyTorch.
* Real-time page URL and entity tracking hook (`usePageContext.js`).

### 2.3 RAG & Database Vector Architecture
* PostgreSQL `pgvector` integration within Falcon's database setup.
* Tenant-isolated vector schema storage (ensuring strict `tenant_id` namespace segregation).
* Local embedding generation via `sentence-transformers` (`all-MiniLM-L6-v2` or `bge-small-en-v1.5`).

### 2.4 Application Module Integrations
* **Reviews App Integration:** AI narrative generation for performance reviews, self-assessment summarization, and tone-checking.
* **KPI App Integration:** Automated trend narrative and anomaly explanations grounded in deterministic Pandas calculations.
* **Reporting Platform Integration:** Automated executive summary report generation for multi-unit scorecards.
* **Accounts & Security Integration:** Isolation Forest ML model for real-time anomaly detection and audit logging.

### 2.5 PII & Security Governance
* Client-side and server-side regex + Named Entity Recognition (NER) PII redaction layer prior to model execution.
* Audit trail logging of all AI queries, prompt metadata, and execution latency.

---

## 3. Out-of-Scope (Deferred to Future Releases)

| Feature | Reason for Exclusion in V2 | Future Consideration |
| :--- | :--- | :--- |
| **Cloud Model Fine-Tuning** | Requires external GPU clusters and violates air-gapped security mandate | Local PEFT/LoRA fine-tuning in V3 |
| **Multimodal Video Processing** | High hardware memory consumption, unnecessary for PMS scope | Text/Speech focused V2 |
| **Autonomous Action Execution** | AI must not modify database records without explicit user click/approval | Human-in-the-loop safety |
| **Direct External Web Search** | Air-gapped network mandate prevents external scraping | Local document RAG only |

---

## 4. Assumptions & Constraints

1. **Hardware Constraint:** The host environment must feature at least 1 NVIDIA GPU (12GB+ VRAM) or a modern CPU cluster (16+ cores, 32GB+ RAM) for local GGUF model execution.
2. **Python Environment Constraint:** Backend execution must adhere to Python 3.11 compatibility.
3. **Database Constraint:** PostgreSQL instance must support the `pgvector` extension.
