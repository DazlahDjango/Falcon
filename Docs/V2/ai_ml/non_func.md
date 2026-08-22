# Non-Functional Requirements Document (NFR)
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Document Type** | Non-Functional Requirements Specification |

---

## 1. Performance & Latency Requirements

| Metric ID | Performance Metric | Requirement Target | Measurement Method |
| :--- | :--- | :--- | :--- |
| **NFR-PERF-01** | Local Speech-to-Text (Web Speech API) | < 200 ms latency | Client-side event timing |
| **NFR-PERF-02** | Local Whisper STT (Fallback Audio Stream) | < 800 ms response time | WebSocket audio chunk processing latency |
| **NFR-PERF-03** | Vector Similarity Search (`pgvector`) | < 50 ms per top-5 query | PostgreSQL `EXPLAIN ANALYZE` query execution time |
| **NFR-PERF-04** | Local LLM Text Stream First Token (TTFT) | < 1,200 ms | Ollama / vLLM API first-token response event |
| **NFR-PERF-05** | PII Redaction Processing Overhead | < 15 ms per prompt payload | Benchmark execution timer in `anonymizer.py` |

---

## 2. Hardware Resource & Sizing Specifications

### 2.1 Recommended Production Server Hardware Stack

```
+-------------------------------------------------------------------------+
| RECOMMENDED PRODUCTION SERVER (AIR-GAPPED HIGH PERFORMANCE)            |
|                                                                         |
| • CPU: Intel Xeon Silver / AMD EPYC (16 Cores / 32 Threads minimum)    |
| • RAM: 64 GB DDR4/DDR5 ECC RAM                                         |
| • GPU: 1x NVIDIA RTX 4090 (24GB VRAM) OR 1x NVIDIA A10G / L4 (24GB VRAM)|
| • Storage: 1 TB NVMe PCIe 4.0 SSD (Fast model layer & vector index read)|
| • OS: Ubuntu 22.04 LTS / RHEL 9 (Linux Kernel 5.15+)                   |
+-------------------------------------------------------------------------+
```

### 2.2 Minimal CPU-Only Server Hardware Stack (Fallback Mode)

```
+-------------------------------------------------------------------------+
| MINIMAL CPU-ONLY BACKUP SERVER                                          |
|                                                                         |
| • CPU: 8 Cores (Intel i7/i9 or AMD Ryzen 7/9)                          |
| • RAM: 32 GB RAM                                                        |
| • Model Strategy: Quantized 4-bit GGUF models (Llama-3-8B-Q4_K_M)       |
| • Inference Speed: ~10-15 tokens/sec                                   |
+-------------------------------------------------------------------------+
```

---

## 3. Reliability, Availability & Fault Tolerance

* **NFR-REL-01: Graceful Degradation**  
  If the local AI sidecar container (Ollama/vLLM) is offline or undergoing maintenance, Falcon V1 core functions (KPI viewing, manual appraisal writing, reporting) must remain 100% operational without error crashes.
* **NFR-REL-02: Automatic Service Recovery**  
  The Docker Compose / Systemd service manager must automatically restart the AI inference sidecar within 10 seconds of an unexpected crash.
* **NFR-REL-03: System Uptime SLA**  
  Target overall AI subsystem availability of 99.5% during corporate business operational hours.

---

## 4. Portability & Maintainability

* **NFR-MAINT-01: Python 3.11 Environment Standardization**  
  All backend AI services, PyTorch dependencies, and vector generation pipelines must maintain 100% compatibility with Python 3.11.
* **NFR-MAINT-02: Containerized Sidecar Deployment**  
  The entire AI inference stack must be deployable via standardized Docker containers (`deploy/docker/docker-compose.production.yml`).
