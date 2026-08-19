# Falcon Tenant Connection Module Documentation

---

## 1. Executive Summary & Module Overview

The **Connection Module** is the high-performance database connection management and pool-orchestration engine of the **Falcon Multi-Tenant Platform**. It ensures that every database query is executed against the correct tenant's isolated PostgreSQL database schema, while preventing connection leaks, thread starvation, or cross-tenant data spillage.

### Primary Functions:
1. **Tenant Schema Binding & Switching**: Safely dynamically switches the PostgreSQL `search_path` to the target tenant schema on query execution and resets it back to `public` upon request completion.
2. **Thread-Local Connection Pooling**: Manages per-thread database connection pools to maximize query throughput and minimize connection overhead.
3. **High Availability & Failover**: Supports Read/Write splitting (routing read operations to database replicas) with automatic failover to fallback nodes.
4. **Automated Pool Cleanup & Maintenance**: Runs a background daemon thread to prune idle/expired connections, pre-warm pools on startup, and gracefully drain connections during server shutdown.
5. **Tenant Maintenance Pause/Resume**: Provides fine-grained administrative controls to temporarily pause database access for a specific tenant during maintenance or migrations without affecting other tenants.

---

## 2. Multi-Tenant Connection Lifecycle & Request Flow

When an authenticated user or API client issues a request, the **Connection Management Middleware** manages the database connection lifecycle.

### Lifecycle Architecture Diagram:
```text
  Authenticated HTTP Request
             │
             ▼
[ ConnectionManagementMiddleware ] ──(Skips Anonymous / Public Routes)
             │
             ▼
 1. Acquire Connection Lock (Timeout Protection)
             │
             ▼
 2. Bind Connection & Set Schema Path:
    `SET search_path TO "c732f915_schema", public`
             │
             ▼
 3. Execute View / API Business Logic
             │
             ▼
 4. Process Response & Release Connection:
    `SET search_path TO "public"`
             │
             ▼
 5. Mark Connection Record CLOSED & Clear Thread-Local State
```

### Connection State Machine:
- **`IDLE`**: Connection is initialized and available in the pool.
- **`ACTIVE`**: Connection is actively bound to an HTTP request thread and executing queries.
- **`CLOSED`**: Connection has completed its request lifecycle or was pruned by the cleanup scheduler.
- **`ERROR`**: Connection encountered an unhandled exception or network failure and was safely isolated.

---

## 3. Database Pooling & Resource Optimization

To maintain stability under high enterprise traffic, Falcon implements multiple layers of connection protection:

### Key Pooling Mechanisms:
1. **Thread-Local Scoping**: Connections are bound per worker thread, eliminating cross-thread lock contention.
2. **Tenant Pool Limits**: Enforces a configurable maximum connection ceiling per tenant (`CONNECTION_POOL_MAX_SIZE`) to prevent a single noisy tenant from exhausting global database connections.
3. **Lock Acquisition Timeouts**: Requests waiting for an available connection slot enforce a strict timeout (`CONNECTION_WAIT_TIMEOUT_SECONDS`). If the pool is exhausted, the system raises a clear `ConnectionPoolExhaustedError` rather than hanging worker threads indefinitely.
4. **Stale Connection Recycling**: Connections exceeding maximum lifetime (`CONNECTION_MAX_LIFETIME_MINUTES`) or maximum query uses (`CONNECTION_MAX_USES`) are automatically recycled to prevent memory growth.

---

## 4. High Availability, Failover & Encryption

Falcon's connection service guarantees enterprise reliability at the database transport layer.

### Features:
- **Read/Write Splitting**: Read-only queries are automatically routed to database read replicas (`replica` or `read_only` DB aliases), preserving write-master capacity for transactional operations.
- **Automatic Replica Failover**: If the primary database connection fails during creation, Falcon automatically attempts failover to secondary standby replicas before raising an exception.
- **SSL/TLS Encryption Verification**: When enabled (`CONNECTION_ENFORCE_SSL=True`), Falcon queries PostgreSQL `pg_stat_ssl` to verify that the active socket is encrypted via SSL/TLS.
- **Exponential Backoff with Jitter**: Retries failed database connections with randomized exponential delay to prevent "thundering herd" connection spikes.

---

## 5. Automated Background Cleanup & Maintenance Controls

### The `ConnectionCleanupScheduler` Daemon Thread
Registered during application startup (`apps.py`), a background daemon thread executes continuous pool maintenance:
- **Startup Cleanup**: Marks any stale connection records left behind by abrupt server crashes as `CLOSED`.
- **Pool Pre-Warming**: Pre-establishes database connections for active tenant organizations on startup to eliminate initial request latency.
- **Periodic Pruning**: Periodically scans for connections that have been idle past `CONNECTION_IDLE_TIMEOUT_MINUTES` or expired past max lifetime and safely closes them.
- **Graceful Draining on Shutdown**: During app server shutdown, `drain_connections()` waits for active queries to complete before closing sockets cleanly.

### Tenant Maintenance Controls (Pause & Resume)
Administrators can isolate individual tenants for maintenance:
- **Pause (`pause_connection(org_id)`)**: Blocks new connection acquisitions for a specific organization, returning a maintenance response.
- **Resume (`resume_connection(org_id)`)**: Instantly restores connection processing once maintenance is complete.

---

## 6. CIA Triad Security Guarantees

| Security Pillar | Implementation Guarantee |
| :--- | :--- |
| **Confidentiality** | **Schema Reset Guard**: Always resets `search_path` back to `public` upon request release to prevent accidental cross-tenant data leakage in reused connections. Anonymous requests are rejected prior to pool allocation. |
| **Integrity** | **SSL Transport Validation & Schema Enforcement**: Ensures all connection sockets are verified encrypted and explicitly validated against the target tenant's assigned schema. |
| **Availability** | **Self-Healing Pools & Exhaustion Prevention**: Daemon thread idle pruning, lock acquisition timeouts, max connection ceilings, and pre-warming prevent pool exhaustion and thread hang crashes. |

---

## 7. Monitoring, Metrics & Real-Time Events

### CLI Management Commands

#### 1. Connection Pool Management (`manage_connections`)
Administrators can monitor metrics, pause/resume tenant database access, or recycle connections:
```bash
# View global connection pool metrics (lock wait times, active/idle/closed counts)
python manage.py manage_connections metrics

# Check thread-local connection pool status for a specific tenant
python manage.py manage_connections status --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Pause database connection acquisition for a tenant (Maintenance Mode)
python manage.py manage_connections pause --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Resume database connection acquisition for a tenant
python manage.py manage_connections resume --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Close active connections for a tenant
python manage.py manage_connections close --org-id c732f915-34d1-489d-8551-3c71bf92a372

# Recycle all thread connections across the pool
python manage.py manage_connections recycle

# Pre-warm connection pool for active tenant organizations
python manage.py manage_connections prewarm

# Gracefully drain connection pool during server shutdown
python manage.py manage_connections drain
```

#### 2. Stale Organization & Connection Cleanup (`cleanup_organizations`)
Clean up failed organization setup records and stale database connections:
```bash
# Preview stale organizations failed for >7 days (dry run)
python manage.py cleanup_organizations --days 7 --dry-run

# Soft delete stale organizations failed for >14 days
python manage.py cleanup_organizations --days 14

# Hard delete stale organizations permanently
python manage.py cleanup_organizations --days 30 --hard-delete
```

### Operational REST API & WebSockets Monitoring:
- **Metrics API (`/api/v1/tenant/connections/metrics/`)**: Provides real-time metrics on total connections, active/idle counts, lock wait times, local acquisitions, and recycles.
- **Debug Stack Trace Inspector (`/api/v1/tenant/connections/debug/`)**: Allows super-admins to inspect real-time Python stack traces for active database connections to identify slow queries or deadlocks.
- **Health Check Endpoint (`/api/v1/tenant/connections/health_check/`)**: Runs synthetic `SELECT 1` health probes across tenant database connections.
- **Real-Time WebSocket Events**: The `ConnectionEventConsumer` broadcasts real-time pool events (`connection_created`, `connection_closed`, `connection_error`, `pool_health`) over WebSockets to administrative dashboards.
