# Let's divide Falcon PMS into infrastructure tiers
1. Edge / Internet Tier
2. Security Tier
3. Load Balancing Tier
4. Frontend Tier
5. Application Tier
6. Background Processing Tier
7. Caching / Messaging Tier
8. Database Tier
9. Storage / Backup Tier
10. Observability Tier
11. Disaster Recovery Tier

1. Tier 1 — Edge / Internet
The first thing users should reach is not Django.
Instead:
User
 │
 ▼
DNS
 │
 ▼
CDN
 │
 ▼
DDoS protection
 │
 ▼
WAF
 │
 ▼
Load Balancer
 │
 ▼
Falcon PMS
**NOTE**: This protects the application before traffic reaches your servers

1.1. DNS
main: app.falconpms.com
ws: wss://api.falconpms.com/ws/

1.2. CDN
React/Vite's production assets should ideally not be served repeatedly from Django.
Instead:
React
 ↓
Build
 ↓
Static assets
 ↓
Object Storage / CDN
 ↓
Users
**NOTE**: This reduces application-server workload.
1.3. WAF (Web Application Firewall)
Choose a managed WAF (Cloudflare, AWS WAF, Azure WAF) or self-hosted (ModSecurity + Nginx).
It must block:
 - SQL injection
 - XSS
 - malicious HTTP requests
 - bot abuse
 - request flooding
 - known attack signatures


2. Tier 2 — Security
                    SECURITY
                       │
        ┌──────────────┼───────────────┐
        │              │               │
       IAM          Secrets         Encryption
        │              │               │
   Permissions      Vault/KMS          │
        │              │               │
        └──────────────┼───────────────┘
                       │
                  Audit Logs

Identy
Secrets: Never hardcode secrets, instead :
    Application
        │
        ▼
    Secrets Manager / Vault
        │
        ▼
    Secret (API keys, DB passwords, TLS keys, Paystack keys)

Encryption: we want encryption at several levels:
- In Transit
User
 ↓ HTTPS
Load Balancer
 ↓ HTTPS/internal TLS
Application
 ↓ TLS
Database
- At rest
Encrypt:
PostgreSQL
Backups
S3
Volumes
Secrets
Logs containing sensitive data

3. Tier 3 — Load Balancer
                    LOAD BALANCER
                  /       |       \
               APP-01   APP-02   APP-03
3.1. Application servers
Each application server can run:
Linux
Docker/container runtime
Nginx
Daphne
Django
DRF
### For example
APP-01
├── Nginx
├── Daphne
├── Django
└── Falcon API

APP-02
├── Nginx
├── Daphne
├── Django
└── Falcon API

APP-03
├── Nginx
├── Daphne
├── Django
└── Falcon API

3.2. Stateless application servers

Don't store important persistent data inside:

APP-01/local-files
APP-01/session-files
APP-01/uploads

3.3. React/Vite architecture
React should be treated as a separate frontend artifact.
React/Vite
     │
     ▼
npm run build
     │
     ▼
dist/
     │
     ▼
Object Storage / CDN
     │
     ▼
Users

4. Tier 4 — Django application
                    Django
                      │
        ┌─────────────┼──────────────┐
        │             │              │
       DRF         Authentication   WebSockets
        │             │              │
       APIs          JWT/MFA        Daphne
        │
        ├── Accounts
        ├── Tenant
        ├── Structure
        ├── KPI
        ├── Reviews
        ├── Billing
        ├── Dashboard
        ├── Config
        ├── Audit
        ├── Reports
        └── etc.

5. Tier 5 — Celery
Don't run all background work inside Django.
Instead:
Django
   │
   │ creates task
   ▼
Celery Broker
   │
   ▼
Celery Workers

6. Tier 6 — Redis
Redis7
I'd separate Redis conceptually into workloads.
                    REDIS
                      │
        ┌─────────────┼─────────────┐
        │             │             │
       Cache       Celery        Channels
                     Broker       Layer

Redis should be used for:
- Celery message queue
- Caching
- Session storage
- Real-time data
- Rate limiting
- WebSocket connection tracking

6.1. Redis cluster (optional)
For production, consider a Redis cluster with:
- Primary Redis
- Replica Redis
- Redis Sentinel

6.2. Redis persistence
Configure Redis persistence according to your RPO/RTO:

RDB snapshots
AOF logging
Both

7. Tier 7 — PostgreSQL(Database) 
PostgreSQL 18.x
- Primary
- Replica
- Backups
- WAL
- PITR
- Replication
- Encryption
- PgBouncer
- Monitoring

5.1. PostgreSQL cluster
                PostgreSQL
                    │
          ┌─────────┴─────────┐
          │                   │
       PRIMARY              REPLICA
       READ/WRITE           READ
          │                   ▲
          └──── replication ──┘

5.2. PgBouncer
This is where your "bouncer" comes in.
Do not let 20 application servers each open hundreds of PostgreSQL connections directly.
Instead:
APP-01 ─┐
APP-02 ─┤
APP-03 ─┤
CELERY ─┤
REPORT ─┤
        ▼
   PgBouncer
        │
        ▼
 PostgreSQL
              PgBouncer
             /       \
        Pool-01      Pool-02
             \       /
              PostgreSQL

5.3. PostgreSQL tenant architecture
multiple databases, databases that have multiple schemas:
                    PostgreSQL Cluster
                           │
             ┌─────────────┼─────────────┐
             │             │             │
         Shared DB      Tenant DB 01   Tenant DB 02
             │
       ┌─────┼─────┐
       │     │     │
    schema schema schema
    tenant tenant tenant
**NOTE**: For now we use one db with multiple schemas.(One for every client)

5.4. Row-Level Security
If you're using PostgreSQL RLS, then the architecture can additionally enforce:
Application tenant context
          │
          ▼
PostgreSQL session
          │
          ▼
RLS policy
          │
          ▼
Tenant's data

5.5. PostgreSQL roles(Optional)
Don't use one PostgreSQL superuser for everything.
Instead:
postgres_admin
       │
       ├── migration_role
       ├── application_role
       ├── readonly_role
       ├── reporting_role
       ├── backup_role
       └── monitoring_role

5.6. PostgreSQL extensions
Your final architecture should allow required extensions, depending on the features you actually use.
- uuid-ossp / gen_random_uuid
- pgcrypto
- citext
- btree_gin
- btree_gist
**NOTE**: Install almost all postgres extensions

5.7. PostgreSQL backups
You need multiple backup layers.
                 PostgreSQL
                     │
          ┌──────────┼──────────┐
          │          │          │
       Snapshot     WAL       Logical
       Backup      Archive     Backup

- Snapshot/full backup
For disaster recovery.

- WAL archive
For:
Point-in-time recovery.
Example:

Monday 08:00
Monday 09:00
Monday 10:00
Monday 11:00
      ↓
Database failure at 11:37
      ↓
Restore to 11:35

- Logical backups
For selective restoration/export.

5.8. S3/Object Storage
Don't put backups on the same PostgreSQL server.
Instead:
PostgreSQL
     │
     ▼
Backup engine
     │
     ▼
S3 Object Storage
     │
     ▼
Backup storage policy

5.8.1. S3 architecture
I'd have separate buckets or equivalent logical storage:
FALCON STORAGE
│
├── application-media
├── user-documents
├── generated-reports
├── database-backups
├── audit-archives
├── disaster-recovery
└── deployment-artifacts

5.8.2. S3 lifecycle policy

For example:

keep daily full backups for 7 days

keep weekly backups for 4 weeks

keep monthly backups for 1 year

archive backups to Glacier/cold storage after 90 days

5.8.3. Backup storage location

You should have:

Primary backup storage (S3 bucket A)

Cross-region replication or secondary backup storage (S3 bucket B in another region)

This protects against:

Region failure

Complete bucket corruption

**N/B**:
Versioning
Encryption
Lifecycle policies
Access policies
Object Lock/WORM where appropriate
Cross-region replication

5.8.4. Backup architecture

I would target:
                 PRIMARY DATABASE
                       │
          ┌────────────┼────────────┐
          │            │            │
       Snapshot       WAL        Logical
          │            │            │
          └────────────┼────────────┘
                       ▼
                  S3 BACKUP
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       Same region          DR region


8. Tier 8 — Email
Don't run SMTP infrastructure initially.
Instead:
Falcon
   │
   ▼
Email Service
   │
   ├── Welcome emails
   ├── Password reset
   ├── MFA
   ├── Billing
   ├── Invoices
   ├── Alerts
   ├── Notifications
   └── Reports

## Paystack
Paystack should sit outside your core infrastructure.
                     Falcon PMS
                         │
                         ▼
                     Billing
                         │
                         ▼
                     Paystack
                         │
                         ▼
                     Webhook
                         │
                         ▼
                 Falcon webhook API
                         │
                         ▼
                     Database
Never trust a browser response alone for payment confirmation.
The authoritative payment update should come from validated server-side communication/webhooks.

9. Tier 9 — Monitoring

Enterprise infrastructure needs observability.
                 OBSERVABILITY
                       │
        ┌──────────────┼───────────────┐
        │              │               │
      Metrics         Logs           Traces
        │              │               │
        ▼              ▼               ▼
   Prometheus       Loki/ELK       OpenTelemetry
        │
        ▼
     Grafana
CPU
RAM
Disk
network
requests
latency
DB connections
Redis memory
Celery queues
Django
Nginx
Daphne
PostgreSQL
Redis
Celery
Security
Audit
Request
 ↓
Django
 ↓
service
 ↓
database
 ↓
Redis

10. Tier 10 — Management / Control Plane

This is one of the things that wasn't obvious in the original diagram.
             FALCON CONTROL PLANE
                      │
       ┌──────────────┼──────────────┐
       │              │              │
 Configuration     Health        Administration
       │              │              │
       ▼              ▼              ▼
 Secrets          Monitoring      Operations
 Backups          Metrics         Scaling
 Certificates     Alerts          Recovery

 10.1. CI/CD infrastructure

Even though we're focusing on hosting, enterprise architecture should account for how new versions reach the servers.
Developer
   │
   ▼
Git Repository
   │
   ▼
CI/CD
   │
   ├── Tests
   ├── Security scanning
   ├── Build
   ├── Migration checks
   └── Container/image creation
          │
          ▼
       Registry
          │
          ▼
Production

10.2. Container architecture

For Falcon, I would strongly consider containers.
Falcon deployment units

┌──────────────────┐
│ Django/Daphne    │
├──────────────────┤
│ Celery Worker    │
├──────────────────┤
│ Celery Beat      │
├──────────────────┤
│ Nginx            │
└──────────────────┘
APP-01
  └── Falcon container

APP-02
  └── Falcon container

APP-03
  └── Falcon container


10.3. Kubernetes?

Now we need to be careful.

Enterprise architecture does not automatically mean Kubernetes.
Kubernetes
│
├── Django pods
├── Celery pods
├── workers
├── services
├── ingress
└── autoscaling

10.4. Network architecture

This is extremely important.

Don't put everything on the public Internet.
Instead
                         INTERNET
                            │
                            ▼
                     PUBLIC NETWORK
                            │
                     WAF / LB / CDN
                            │
                            ▼
                    PRIVATE NETWORK
             ┌──────────────┼──────────────┐
             │              │              │
          APP SUBNET    WORKER SUBNET    DATA SUBNET
             │              │              │
          Django          Celery        PostgreSQL
          Daphne          Redis         PgBouncer
          Nginx                         Storage

PUBLIC SUBNET
│
├── Load Balancer
└── Bastion/management access if required

APPLICATION SUBNET
│
├── APP-01
├── APP-02
└── APP-03

WORKER SUBNET
│
├── CELERY-01
├── CELERY-02
└── CELERY-03

DATABASE SUBNET
│
├── PostgreSQL Primary
├── PostgreSQL Replica
└── PgBouncer

CACHE SUBNET
│
├── Redis-01
├── Redis-02
└── Redis-03

MANAGEMENT SUBNET
│
├── Monitoring
├── Logging
└── CI/CD infrastructure

#### Full Scale Architectur
                              INTERNET
                                  │
                                  ▼
                            ┌───────────┐
                            │    DNS    │
                            └─────┬─────┘
                                  │
                                  ▼
                       ┌────────────────────┐
                       │ CDN + DDoS + WAF   │
                       └─────────┬──────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    LOAD BALANCER        │
                    │                         │
                    │       LB-01 / LB-02     │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
             APP-01           APP-02           APP-03
                │                │                │
                │       Django / DRF /           │
                │       Daphne / WebSocket       │
                │                │                │
                └────────────────┼────────────────┘
                                 │
             ┌───────────────────┼────────────────────┐
             │                   │                    │
             ▼                   ▼                    ▼
       ┌────────────┐      ┌────────────┐      ┌──────────────┐
       │   REDIS    │      │  CELERY    │      │ OBJECT       │
       │   CLUSTER  │◄────►│  CLUSTER   │      │ STORAGE      │
       │            │      │            │      │              │
       │ R01 R02 R03│      │ W01 W02 W03│      │ S3-compatible│
       └─────┬──────┘      └──────┬─────┘      └──────┬───────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │  PGBOUNCER   │
                           │              │
                           │ PGB-01       │
                           │ PGB-02       │
                           └──────┬───────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                         ▼                 ▼
                 ┌──────────────┐   ┌──────────────┐
                 │ PostgreSQL   │   │ PostgreSQL   │
                 │ PRIMARY      │──►│ REPLICA      │
                 │              │   │              │
                 │ 18.x         │   │ 18.x         │
                 │ READ/WRITE   │   │ READ         │
                 └──────┬───────┘   └──────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
         WAL / PITR          FULL BACKUPS
              │                   │
              └─────────┬─────────┘
                        ▼
                 ┌──────────────┐
                 │ S3 STORAGE   │
                 │              │
                 │ Versioning   │
                 │ Encryption   │
                 │ Object Lock  │
                 │ Replication  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ DR REGION    │
                 │              │
                 │ Standby DB   │
                 │ App standby  │
                 │ Backup copy  │
                 └──────────────┘


       ┌─────────────────────────────────────────────────────┐
       │                 OBSERVABILITY                       │
       │                                                     │
       │ Metrics │ Logs │ Traces │ Errors │ Audit │ Alerts │
       └─────────────────────────────────────────────────────┘


       ┌─────────────────────────────────────────────────────┐
       │                    SECURITY                         │
       │                                                     │
       │ IAM │ MFA │ Secrets │ KMS │ TLS │ WAF │ Firewall  │
       │ RLS │ Tenant isolation │ Audit │ SIEM             │
       └─────────────────────────────────────────────────────┘