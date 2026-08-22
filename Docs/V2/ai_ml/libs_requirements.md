# AI/ML Libraries & Data Requirements Document
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Python Version Target** | Python 3.11 (Fully Tested & Optimized Ecosystem) |
| **Document Type** | Library Dependency & Data Dictionary Specification |

---

## 1. Python 3.11 Compatibility Rationale

Python 3.11 provides substantial performance improvements (10–60% faster execution over 3.10 via specialized CPython bytecode optimizations) while enjoying universal wheel compatibility for all major Machine Learning, Deep Learning, and Vector processing libraries.

---

## 2. Standardized Python 3.11 AI/ML Library Manifest (`requirements/ai_ml.txt`)

```ini
# ===================================================================
# FALCON V2 AI/ML DEPENDENCY MANIFEST (PYTHON 3.11 COMPATIBLE)
# ===================================================================

# --- Core Local LLM & Ollama Interface ---
ollama==0.4.7               # Lightweight local LLM client interface for Ollama sidecar
openai==1.58.0              # OpenAI API format client (pointing to local vLLM/Ollama endpoints)

# --- Vector Database & Embedding Libraries ---
pgvector==0.3.6             # Official PostgreSQL pgvector Python ORM integration
sentence-transformers==3.3.1 # Local CPU/GPU vector embedding generation (all-MiniLM-L6-v2)
torch==2.5.1                # PyTorch 2.5 (Python 3.11 CUDA 12.1 / CPU build)
transformers==4.47.1        # HuggingFace model utilities & tokenizers

# --- Speech Recognition & Audio Processing (Local STT) ---
openai-whisper==20240930    # Local OpenAI Whisper model running on PyTorch for offline STT
soundfile==0.13.0           # Audio file IO processing
librosa==0.10.2.post1       # Audio feature extraction

# --- Data Science, Analytics & Math Computation ---
numpy==2.1.3                # Optimized numerical linear algebra matrix operations
pandas==2.2.3               # Fast dataframe aggregation for KPI scorecards
scikit-learn==1.6.0         # Isolation Forest model for anomaly detection

# --- PII Redaction & Security ---
presidio-analyzer==2.2.355  # Microsoft Presidio PII analyzer engine
presidio-anonymizer==2.2.355# PII masking and tokenization engine
spacy==3.8.3                # Industrial NLP parser used by PII analyzer

# --- Async WebSockets & Task Queue Interfaces ---
channels==4.2.0             # Django Channels async ASGI integration
redis==5.2.1                # Redis client for event streaming & anomaly queues
```

---

## 3. System Data Dictionary (AI Telemetry & Embeddings)

### 3.1 Data Dictionary: `ai_embedding_knowledge`

| Attribute Name | Data Type | Nullable | Description / Business Meaning |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto-incrementing primary key. |
| `tenant_id` | `UUID` | No | Foreign Key referencing `tenant_organization(id)` enforcing isolation. |
| `entity_type` | `VARCHAR(64)` | No | Type of entity: `'kpi'`, `'review'`, `'structure'`, or `'policy'`. |
| `entity_id` | `UUID` | No | UUID of the source record in its respective application app. |
| `content_chunk` | `TEXT` | No | Text chunk extracted for vector embedding search. |
| `embedding` | `VECTOR(384)` | No | 384-dimensional vector produced by `all-MiniLM-L6-v2`. |
| `metadata` | `JSONB` | Yes | Additional JSON attributes (author ID, section title, score ratings). |
| `created_at` | `TIMESTAMPTZ` | No | Creation timestamp. |

### 3.2 Data Dictionary: `ai_audit_log`

| Attribute Name | Data Type | Nullable | Description / Business Meaning |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | Auto-incrementing primary key. |
| `tenant_id` | `UUID` | No | Foreign Key referencing active tenant. |
| `user_id` | `UUID` | No | Foreign Key referencing authenticated user. |
| `prompt_masked` | `TEXT` | No | PII-anonymized input prompt string. |
| `response_summary` | `TEXT` | Yes | Truncated AI summary or generated markdown output. |
| `active_page_url` | `VARCHAR(512)`| Yes | Active browser path (`react-router-dom`) at time of request. |
| `execution_time_ms` | `INTEGER` | No | Total execution latency in milliseconds. |
| `tokens_processed` | `INTEGER` | Yes | Total prompt + generation token count. |
| `anomaly_score` | `FLOAT` | Yes | Isolation Forest security anomaly score (0.0 to 1.0). |
| `created_at` | `TIMESTAMPTZ` | No | Timestamp of log event. |
