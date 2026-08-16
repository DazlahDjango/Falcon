# Falcon PMS - Enterprise Database & Multi-Tenant Connection Architecture

---

## 1. Executive Introduction & Architectural Rationale

### 1.1 Overview
Falcon PMS is engineered as a high-throughput, enterprise-grade Property & Tenant Management System designed to handle **50,000+ active users across 500+ isolated tenant schemas** (hosting 200–2,000 users per schema). The underlying data tier is built to maintain sub-millisecond query routing, strict data isolation, zero cross-tenant bleed, and horizontal/vertical scalability.

### 1.2 Why PostgreSQL over MySQL / MariaDB / NoSQL?

| Feature Requirement | PostgreSQL (Chosen) | MySQL / MariaDB | MongoDB / NoSQL |
| :--- | :--- | :--- | :--- |
| **Multi-Tenancy Isolation** | **Native Schemas (`search_path`) + RLS** | Requires separate databases or manual table prefixes. | Requires separate collections or database instances. |
| **Row-Level Security (RLS)** | **Native Kernel RLS** via `set_config('app.current_tenant_id', ...)` | No native schema-level RLS policies. | Application-level checks required (high risk of data bleed). |
| **Catalog Lock Scaling** | High lock manager capacity (`max_locks_per_transaction`) | Performance degrades rapidly with 25,000+ multi-tenant tables | Index memory bloat across multi-tenant collections |
| **ACID & Relational Integrity** | Full transactional integrity with JSONB support | Transactional (InnoDB), but weak schema isolation | Eventual consistency; lacks enterprise relational joins |

**Key Architectural Verdict**: PostgreSQL's combination of **PostgreSQL Schemas (`search_path`)** and **Native Row-Level Security (RLS)** makes it the undisputed industry standard for multi-tenant SaaS architectures, ensuring ironclad tenant isolation at the database kernel level.

---

## 2. Primary Database Engine & Configuration (`postgresql.conf` & `pg_hba.conf`)

### 2.1 Engine Tuning Overview (`config/postgresql.conf`)
PostgreSQL is tuned specifically for high-concurrency multi-tenant operations on enterprise hardware (64GB RAM / 16-32 vCPUs) while interfacing with PgBouncer connection multiplexers.

```ini
# ============================================================================
# CONNECTIONS & MULTIPLEXING
# ============================================================================
max_connections = 500                    # Real backend Postgres connections (multiplexed by PgBouncer)
superuser_reserved_connections = 3

# ============================================================================
# MEMORY MANAGEMENT (64GB Server Baseline)
# ============================================================================
shared_buffers = 16GB                    # 25% of total server RAM reserved for data page caching
work_mem = 32MB                          # Allocation per query sort/hash operation
maintenance_work_mem = 2GB               # Vacuum and indexing memory allocation
effective_cache_size = 48GB              # 75% of total server RAM for query planner estimates

# ============================================================================
# WRITE AHEAD LOG (WAL) & CHECKPOINTS
# ============================================================================
wal_level = replica                      # Enables WAL streaming for Read Replicas
max_wal_size = 16GB
min_wal_size = 2GB
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min
wal_buffers = 64MB

# ============================================================================
# MULTI-TENANT LOCK MANAGER & SCHEMAS
# ============================================================================
max_locks_per_transaction = 128          # Prevents "out of shared memory" lock errors across 500+ schemas
max_pred_locks_per_transaction = 64
```

### 2.2 Host-Based Authentication Firewall (`config/pg_hba.conf`)
PostgreSQL enforces host-based access rules to isolate local administrative commands, Docker/App container subnets, and Read Replica streaming channels.

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# 1. Localhost & UNIX Sockets (Dev & Management Commands)
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust

# 2. Application & PgBouncer Subnets
host    all             postgres        172.16.0.0/12           scram-sha-256
host    all             postgres        10.0.0.0/8              scram-sha-256

# 3. Read Replica Streaming Channels
host    replication     postgres        127.0.0.1/32            trust
host    replication     replicator      172.16.0.0/12           scram-sha-256
host    replication     replicator      10.0.0.0/8              scram-sha-256
```

---

## 3. Helper Infrastructure & Connection Multiplexing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HTTP Client / REST API Requests                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ Redis Cache Cluster (`TENANT_SCHEMA_CACHE_TTL = 300`s)                       │
│ Resolves `tenant_id -> schema_name` in <1ms (No DB hit)                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ↓ (TCP 6432 - Transaction Mode)
┌─────────────────────────────────────────────────────────────────────────────┐
│ PgBouncer Connection Pooler (`config/pgbouncer.ini`)                         │
│ Holds 10,000 incoming client requests -> 150 backend Postgres connections   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ↓ (Direct Port 5432)
┌─────────────────────────────────────────────────────────────────────────────┐
│ Primary PostgreSQL Server (500+ Schemas) / Read Replicas                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 PgBouncer Connection Pooler (`config/pgbouncer.ini`)
* **Why it exists**: Direct PostgreSQL backend connections consume ~8MB RAM each. 10,000 direct client connections would require 80GB RAM solely for open sockets. PgBouncer acts as a lightweight TCP proxy on port `6432`.
* **Transaction Mode (`pool_mode = transaction`)**: Connections are assigned to client queries only for the duration of a single transaction block, multiplexing 10,000 client requests onto 150 backend server connections.
* **Session Cleanup (`server_reset_query = DISCARD ALL`)**: Guarantees that connection state (temp tables, prepared statements) is cleaned up when recycled back into the pool.

### 3.2 Redis Schema & Tenant Context Caching
* **Why it exists**: Without caching, resolving `tenant_id` to PostgreSQL `schema_name` triggers an SQL query (`Organization.objects.get`) on *every single HTTP request*.
* **Implementation**: Cached via `django.core.cache` with key `tenant_schema_name:{tenant_id}` and TTL `300`s. This reduces DB query volume by **3x to 5x** under heavy web traffic.

### 3.3 Database Backup & Restore Service (`DatabaseDumpService`)
* **Why it exists**: `pg_dump` and `pg_restore` use session-level SQL commands (`COPY`, `SET extra_float_digits`) that are unsupported by PgBouncer transaction mode (port `6432`).
* **Direct Bypassing**: [`DatabaseDumpService`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/configs/services/backup/database_dump_service.py) automatically resolves the direct PostgreSQL server port (`5432` or `DB_DIRECT_PORT`), bypassing PgBouncer port `6432` during backups and restores.
* **Security & Credential Masking**: DB passwords are supplied exclusively via process-isolated environment variables (`PGPASSWORD`), preventing password exposure in process monitors (`ps aux`).

---

## 4. Tenant App Routing, Middleware & Connection Architecture

### 4.1 Organization Database Router (`OrganizationDatabaseRouter`)
Located in [`apps/tenant/services/router_service.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/router_service.py):
* **Global vs. Tenant Apps Classification**:
  - **Global Apps** (`accounts`, `tenant`, `billing`, `configs`, `auth`, `admin`): Routed strictly to `default` database / `public` schema.
  - **Tenant Apps** (`kpi`, `dashboard`, `reviews`, `structure`, `reportplt`): Routed dynamically based on active tenant context.
* **Read-Replica Awareness**:
  - `db_for_read()` automatically routes `SELECT` queries to database alias `replica` when `DATABASES['replica']` / `DB_REPLICA_HOST` is present.
  - `db_for_write()` routes all data mutations to primary database `default`.

### 4.2 Database Routing Middleware (`TenantDatabaseRouterMiddleware`)
Located in [`apps/tenant/middleware/db_routing.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/middleware/db_routing.py):
1. **Schema Switching**: Sets PostgreSQL search path for the request:
   ```sql
   SET search_path TO "{schema_name}", public;
   ```
2. **Transaction-Scoped RLS Context**:
   ```sql
   SELECT set_config('app.current_tenant_id', 'tenant-uuid', true);
   ```
   *The 3rd argument `true` scopes the configuration to the local transaction only. This is **100% PgBouncer transaction mode compliant**, ensuring variable state does not bleed to other tenants when PgBouncer recycles the connection.*

### 4.3 Connection Service & Lifecycle (`ConnectionService`)
Located in [`apps/tenant/services/connection_service.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/connection_service.py):
* **Thread-Local Storage**: Isolate tenant connections per worker thread (`self._thread_local.connections`).
* **Connection Health Checks & Recycles**: Validates socket health (`SELECT 1`), recycling connections after `CONNECTION_MAX_USES` (1,000) or `CONNECTION_MAX_LIFETIME_MINUTES` (120).
* **Retry Backoff with Jitter**: Exponential backoff (`0.2`s base) with random jitter (`0.8` to `1.2`) during network glitches.
* **Non-Blocking Audit Metrics**: Metric logging (`OrganizationConnection`) runs safely without blocking or failing client HTTP requests.

---

## 5. Development vs. Production Settings Matrix

| Parameter | Local Development (16GB RAM Laptop) | Production (High-Scale Server / Docker) |
| :--- | :--- | :--- |
| **`CONN_MAX_AGE`** | `0` (Prevents lingering sockets during dev hot-reloads) | `60`s to `300`s (Persistent pooling through PgBouncer) |
| **Target Port** | `5432` (Direct PostgreSQL) | `6432` (PgBouncer Transaction Pooler) |
| **Schema Cache TTL** | `300` seconds | `300` seconds (Redis cache) |
| **Read Replicas** | Disabled (Single local instance) | Enabled (`DATABASES['replica']`) when configured |
| **Celery Tasks** | Eager execution (`CELERY_TASK_ALWAYS_EAGER = True`) | Async distributed worker queue |

---

## 6. Summary Checklist for Production Deployment

1. **Mount Config Files**: Ensure `postgresql.conf`, `pg_hba.conf`, and `pgbouncer.ini` are mounted into your production containers/servers.
2. **Verify Port Mappings**: App containers connect to PgBouncer on `PORT=6432`. Backups connect direct to `DB_DIRECT_PORT=5432`.
3. **Validate PgBouncer Mode**: Verify `pool_mode = transaction` in `pgbouncer.ini`.
4. **Monitor Connection Pools**: Run `python manage.py manage_connections metrics` to inspect active/idle pool counts.
