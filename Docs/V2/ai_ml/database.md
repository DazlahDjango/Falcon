# Database Design Document
## Falcon V2 Self-Hosted AI/ML Engine

| Document Metadata | Details |
| :--- | :--- |
| **System** | Falcon Performance Management System (PMS) V2 |
| **Database System** | PostgreSQL 14+ with `pgvector` Extension |
| **Document Type** | Database Schema & Vector Storage Design |

---

## 1. Overview & Vector Extension Configuration

Falcon V2 leverages PostgreSQL with the native `pgvector` extension. Storing vector embeddings within PostgreSQL maintains single-database simplicity, eliminating the need for external vector database services (such as Pinecone or Qdrant) and preserving transactional consistency and multi-tenant schema isolation.

```sql
-- Enable vector extension on primary PostgreSQL instance
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 2. Entity Relationship Diagram (AI Data Models)

```
┌─────────────────────────────────────────┐
│               Tenant                    │
│ ┌─────────────────────────────────────┐ │
│ │ id (UUID)                           │ │
│ │ schema_name (VARCHAR)               │ │
│ └──────────────────┬──────────────────┘ │
└────────────────────┼────────────────────┘
                     │ 1:N
┌────────────────────▼───────────────────────────────────────────────────┐
│                          ai_embedding_knowledge                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ id (BIGINT / Primary Key)                                          │ │
│ │ tenant_id (UUID / FK to Tenant)                                    │ │
│ │ entity_type (VARCHAR: 'kpi', 'review', 'structure', 'policy')      │ │
│ │ entity_id (UUID / Entity PK)                                       │ │
│ │ content_chunk (TEXT)                                               │ │
│ │ embedding (VECTOR(384)) -- SentenceTransformers MiniLM dimensions  │ │
│ │ metadata (JSONB)                                                   │ │
│ │ created_at (TIMESTAMPTZ)                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ 1:N
┌────────────────────▼───────────────────────────────────────────────────┐
│                             ai_audit_log                               │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ id (BIGINT / Primary Key)                                          │ │
│ │ tenant_id (UUID / FK to Tenant)                                    │ │
│ │ user_id (UUID / FK to User)                                        │ │
│ │ prompt_masked (TEXT)                                               │ │
│ │ response_summary (TEXT)                                            │ │
│ │ active_page_url (VARCHAR)                                          │ │
│ │ execution_time_ms (INTEGER)                                        │ │
│ │ tokens_processed (INTEGER)                                         │ │
│ │ anomaly_score (FLOAT)                                              │ │
│ │ created_at (TIMESTAMPTZ)                                           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Schema Definitions & Table Specs

### 3.1 `ai_embedding_knowledge` (Tenant Vector Store)

```sql
CREATE TABLE ai_embedding_knowledge (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenant_organization(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    content_chunk TEXT NOT NULL,
    embedding VECTOR(384) NOT NULL, -- 384 dimensions for all-MiniLM-L6-v2
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Vector Index for ultra-fast Cosine Similarity Search
CREATE INDEX idx_ai_knowledge_embedding_hnsw 
ON ai_embedding_knowledge 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Composite Index for Strict Tenant Isolation
CREATE INDEX idx_ai_knowledge_tenant_entity 
ON ai_embedding_knowledge (tenant_id, entity_type, entity_id);
```

### 3.2 `ai_audit_log` (AI Execution & Security Telemetry)

```sql
CREATE TABLE ai_audit_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenant_organization(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    prompt_masked TEXT NOT NULL,
    response_summary TEXT,
    active_page_url VARCHAR(512),
    execution_time_ms INT NOT NULL,
    tokens_processed INT DEFAULT 0,
    anomaly_score FLOAT DEFAULT 0.0,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_audit_tenant_date ON ai_audit_log (tenant_id, created_at DESC);
CREATE INDEX idx_ai_audit_anomaly ON ai_audit_log (anomaly_score DESC) WHERE anomaly_score > 0.80;
```

---

## 4. Multi-Tenant Vector Query Pattern

When searching vector embeddings, queries **MUST** filter by `tenant_id` at the SQL level to guarantee zero cross-tenant vector bleed:

```sql
-- Scoped Multi-Tenant Cosine Vector Search
SELECT content_chunk, metadata, 1 - (embedding <=> %s) AS similarity
FROM ai_embedding_knowledge
WHERE tenant_id = %s 
  AND entity_type = %s
ORDER BY embedding <=> %s
LIMIT 5;
```
