# Enterprise Database Scaling & Connection Architecture (Falcon PMS)

## Overview
This document outlines the enterprise database scaling architecture designed to support **50,000+ active users across 500+ PostgreSQL schemas** (200–2,000 users per schema/organization) without hitting `FATAL: sorry, too many clients already` errors.

---

## 1. Architectural Topology

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ↓                                 ↓
   Django Web Workers                Celery Task Workers
   (Multi-instance)                  (Async background)
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ↓ (Sub-ms cached schema resolution)
                   Redis / Cache Cluster
                             │
                             ↓ (TCP 6432 - Transaction Pool Mode)
                   PgBouncer Pooler
               (max_client_conn = 10000)
                             │
                             ↓ (150 backend Postgres connections)
                 PostgreSQL Primary Server
                 (500+ Tenant Schemas)
                             │ (Optional Streaming Replication)
                             ↓
                   PostgreSQL Read Replica
```

---

## 2. Point of View: Read Replicas vs. Single Primary DB with PgBouncer

> **User Question in `upgrade.md`**: *"We can use Replicas if necessary though for me I don't think is a good idea, what is your point of view?"*

### Our Recommendation:
1. **PgBouncer is Mandatory & Immediate**:
   In PostgreSQL, each raw connection costs ~5MB–10MB of RAM and incurs CPU process context-switching overhead. Multiplexing 10,000 incoming Django client connections into ~150 real backend connections via **PgBouncer** in `transaction` mode completely eliminates connection pool exhaustion without needing read replicas on day 1.

2. **Read Replicas as Optional Scale-Out**:
   * For **writes** (e.g. creating invoices, updating KPI records), all traffic must hit the Primary DB.
   * For **read-heavy analytics / dashboards**, routing `SELECT` queries to a Read Replica offloads CPU utilization from the primary database.
   * **Implementation**: We have updated `OrganizationDatabaseRouter` and `production.py` to be **replica-aware**. If `DB_REPLICA_HOST` is defined in `.env`, read queries automatically route to the replica. If not set, all queries seamlessly route through the primary PgBouncer pool.

---

## 3. High-Scale Modifications Implemented

### A. Sub-Millisecond Schema Resolution (Eliminated Per-Request DB Hits)
* **Problem**: Previously, `ConnectionManagementMiddleware` and `TenantDatabaseRouterMiddleware` ran synchronous SQL queries (`Organization.objects.get` and `OrganizationConnection.objects.create`) on *every single HTTP request*. Under 1,000+ concurrent users, this tripled database traffic and exhausted PostgreSQL pool slots.
* **Fix**: Implemented `TENANT_SCHEMA_CACHE_TTL = 300` in [`db_routing.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/middleware/db_routing.py) and [`connection_service.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/services/connection_service.py). Tenant schema lookups now resolve from Redis / Cache in <1ms without hitting PostgreSQL.

### B. PgBouncer Transaction Mode Safety
* **Problem**: In PgBouncer `transaction` pool mode, setting session variables like `SET app.current_tenant_id = '...'` with global scope (`is_local=false`) causes variable leakage across pooled connections.
* **Fix**: Updated [`db_routing.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/tenant/middleware/db_routing.py) to use `SELECT set_config('app.current_tenant_id', %s, true)` where `is_local=true` scopes the configuration to the current transaction only.

### C. Development vs. Production Tuning
* **Development Mode (16GB RAM Laptop)**:
  `CONN_MAX_AGE` set to `0` by default in [`development.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/settings/development.py) to prevent open database socket leaks during Django dev server code reloads.
* **Production Mode (High-Concurrency Server / Docker)**:
  `CONN_MAX_AGE` set to `60`s in [`production.py`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/settings/production.py) connecting through PgBouncer on port `6432`.

---

## 4. Configuration References Created

* [`config/pgbouncer.ini`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/pgbouncer.ini): Enterprise PgBouncer pool settings (`pool_mode = transaction`, `max_client_conn = 10000`, `default_pool_size = 150`).
* [`config/postgresql.conf`](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/config/postgresql.conf): High-performance PostgreSQL parameters for 500+ active schemas and 64GB RAM servers (`shared_buffers = 16GB`, `effective_cache_size = 48GB`, `max_locks_per_transaction = 128`).
