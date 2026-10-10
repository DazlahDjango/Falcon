### Management Commands For Tenant Management (apps.tenant)

The Tenant (`apps.tenant`) module provides an enterprise-grade multi-tenant architecture for Falcon PMS. It includes management commands for organization lifecycle operations, automated provisioning pipelines, custom domains & SSL automation, database connection pooling, resource quotas, PostgreSQL schema management, topological migrations, isolation verification, and health monitoring.

---

### 1. Organization Lifecycle & Operations (`manage_organization`)

`python manage.py manage_organization <action> [options]`

#### Listing & Catalog Filters
```bash
# List all organizations (supports filtering by --status, --tier, --sector, --search, --limit)
python manage.py manage_organization list
python manage.py manage_organization list --status ACTIVE
python manage.py manage_organization list --tier enterprise --limit 20
python manage.py manage_organization list --search "Acme" --json

# View detailed profile and metadata of a single organization
python manage.py manage_organization info --slug globalapex
python manage.py manage_organization info --org-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
```

#### Creation & Subscription Plan Updates
```bash
# Create a new tenant organization
python manage.py manage_organization create --name "Acme Corporation" --slug acme --tier professional --email admin@acme.com

# Update organization subscription tier
python manage.py manage_organization update --org-id <ORG_UUID> --tier enterprise

# Switch tier and automatically recalculate/sync resource limits
python manage.py manage_organization switch-tier --org-id <ORG_UUID> --tier enterprise --sync-resources
```

#### Status & Lifecycle Control
```bash
# Activate an organization
python manage.py manage_organization activate --org-id <ORG_UUID>

# Suspend an organization with audit reason
python manage.py manage_organization suspend --org-id <ORG_UUID> --reason "Non-payment of subscription"

# Archive and restore an organization
python manage.py manage_organization archive --org-id <ORG_UUID>
python manage.py manage_organization restore --org-id <ORG_UUID>

# Delete organization (soft-delete by default, --hard for permanent purge)
python manage.py manage_organization delete --org-id <ORG_UUID>
python manage.py manage_organization delete --org-id <ORG_UUID> --hard
```

#### Metrics & Statistics
```bash
# View tenant usage metrics and database statistics
python manage.py manage_organization stats --org-id <ORG_UUID>
python manage.py manage_organization stats --json
```

---

### 2. Tenant Provisioning Pipeline (`manage_provisioning` / `provision_organizations`)

`python manage.py manage_provisioning <action> [options]`

#### Provisioning Pipeline Execution
```bash
# View provisioning pipeline status across all organizations or for a single tenant
python manage.py manage_provisioning status
python manage.py manage_provisioning status --org-id <ORG_UUID>
python manage.py manage_provisioning status --json

# Run end-to-end provisioning pipeline for an existing organization
python manage.py manage_provisioning provision --org-id <ORG_UUID>

# Provision with initial admin user credentials
python manage.py manage_provisioning provision --org-id <ORG_UUID> --email admin@acme.com --admin-first-name "John" --admin-last-name "Doe" --admin-password "SecurePassword123!"

# Create and provision a new organization in one step
python manage.py manage_provisioning provision --name "Beta Corp" --slug betacorp --tier enterprise --email admin@betacorp.com

# Force re-provisioning on an already onboarded tenant
python manage.py manage_provisioning provision --org-id <ORG_UUID> --force

# Batch provision all pending organizations
python manage.py manage_provisioning provision-all-pending
```

#### Step-by-Step Execution, Retries & Rollback
```bash
# Execute an isolated step (schema, migrations, seeding, resources, admin_user)
python manage.py manage_provisioning step --org-id <ORG_UUID> --step schema
python manage.py manage_provisioning step --org-id <ORG_UUID> --step migrations
python manage.py manage_provisioning step --org-id <ORG_UUID> --step seeding

# Retry a failed provisioning pipeline
python manage.py manage_provisioning retry --org-id <ORG_UUID>
python manage.py manage_provisioning retry --org-id <ORG_UUID> --force
python manage.py manage_provisioning retry --all-failed

# Rollback and clean up infrastructure for a failed organization
python manage.py manage_provisioning rollback --org-id <ORG_UUID> --force
```

---

### 3. Custom Domains & SSL Certificates (`manage_domain` / `verify_domains` / `renew_ssl_certificates`)

`python manage.py manage_domain <action> [options]`

#### Domain Management
```bash
# List all domains (supports filter by status: active, pending, failed, expired)
python manage.py manage_domain list
python manage.py manage_domain list --status active

# Inspect domain routing, DNS TXT verification token, and SSL certificate info
python manage.py manage_domain info --domain portal.acme.com

# Add a custom domain to a tenant
python manage.py manage_domain add --org-id <ORG_UUID> --domain portal.acme.com
python manage.py manage_domain add --org-id <ORG_UUID> --domain app.acme.com --primary

# Set an existing custom domain as primary
python manage.py manage_domain set-primary --domain portal.acme.com

# Remove a domain (soft-remove or hard delete)
python manage.py manage_domain remove --domain portal.acme.com
python manage.py manage_domain remove --domain portal.acme.com --hard
```

#### DNS Verification & SSL Automation
```bash
# Trigger DNS TXT verification for a domain
python manage.py manage_domain verify --domain portal.acme.com
python manage.py manage_domain verify --domain portal.acme.com --method manual

# Verify all pending domains in batch
python manage.py manage_domain verify --all-pending

# Inspect SSL certificate status & expiry warnings
python manage.py manage_domain ssl-status
python manage.py manage_domain ssl-status --expiring-days 30

# Provision / renew SSL certificates
python manage.py manage_domain ssl-renew --domain portal.acme.com
python manage.py manage_domain ssl-renew --all-missing
python manage.py manage_domain ssl-renew --all-expiring --days 30
python manage.py renew_ssl_certificates --days 30
```

---

### 4. Database Connection Pooling & Routing (`manage_connection`)

`python manage.py manage_connection <action> [options]`

#### Monitoring & Pool Health
```bash
# Check connection pool status and active database connections
python manage.py manage_connection status
python manage.py manage_connection status --org-id <ORG_UUID>

# View connection metrics (active, idle, peak, error rates)
python manage.py manage_connection metrics
python manage.py manage_connection metrics --json

# Ping and test tenant database routing and search path
python manage.py manage_connection ping --org-id <ORG_UUID>
```

#### Pool Lifecycle & Process Termination
```bash
# Prewarm database connections for active tenants
python manage.py manage_connection prewarm --all
python manage.py manage_connection prewarm --org-id <ORG_UUID>

# Pause / Resume database routing for a tenant
python manage.py manage_connection pause --org-id <ORG_UUID>
python manage.py manage_connection resume --org-id <ORG_UUID>

# Recycle connection pool
python manage.py manage_connection recycle

# Drain the connection pool
python manage.py manage_connection drain

# Terminate idle connections and PostgreSQL backends
python manage.py manage_connection kill-idle --idle-minutes 30
python manage.py manage_connection kill-all --org-id <ORG_UUID>
python manage.py manage_connection terminate-pg --idle-minutes 30
python manage.py manage_connection delete-records --status closed
```

---

### 5. Quotas & Resource Management (`manage_resource`)

`python manage.py manage_resource <action> [options]`

#### Quota Inspection & Configuration
```bash
# List resources and current usage for an organization
python manage.py manage_resource list --org-id <ORG_UUID>

# List all organizations exceeding quota limits
python manage.py manage_resource list --exceeded-only

# View details for a specific resource type (users, storage_mb, api_calls_per_day, departments, kpis)
python manage.py manage_resource info --org-id <ORG_UUID> --type users

# Set a custom resource quota limit
python manage.py manage_resource set-limit --org-id <ORG_UUID> --type users --limit 200 --burst-allowed true

# Sync resource limits against subscription tier baselines
python manage.py manage_resource sync-plan-limits --all-orgs
python manage.py manage_resource sync-plan-limits --org-id <ORG_UUID> --tier enterprise
```

#### Usage Tracking & Historical Snapshots
```bash
# Increment / Decrement current resource usage counter
python manage.py manage_resource increment --org-id <ORG_UUID> --type api_calls_per_day --amount 50
python manage.py manage_resource decrement --org-id <ORG_UUID> --type users --amount 1

# Reset daily resource counters (e.g. daily API quotas)
python manage.py manage_resource reset-daily --all-orgs

# Capture usage snapshot for billing and audit
python manage.py manage_resource snapshot --all-orgs --notes "End-of-month snapshot"

# View historical resource snapshots
python manage.py manage_resource history --org-id <ORG_UUID> --days 30
```

---

### 6. PostgreSQL Schema Management (`manage_schema` & `tenant_schema`)

`python manage.py manage_schema <action> [options]`

#### Schema Lifecycle
```bash
# List tenant PostgreSQL schemas (supports status filter: ACTIVE, PENDING, CREATING, MIGRATING, FAILED)
python manage.py manage_schema list
python manage.py manage_schema list --status ACTIVE

# Inspect schema details by name or organization UUID
python manage.py manage_schema info --schema-name org_globalapex
python manage.py manage_schema info --org-id <ORG_UUID>

# Create and provision a dedicated PostgreSQL schema
python manage.py manage_schema create --org-id <ORG_UUID> --schema-name org_acme
python manage.py manage_schema provision --schema-name org_acme

# Drop a tenant PostgreSQL schema
python manage.py manage_schema drop --schema-name org_acme --cascade --force
```

#### Security & Table Audit
```bash
# Enable Row-Level Security (RLS) on tenant schema tables
python manage.py manage_schema enable-rls --all
python manage.py manage_schema enable-rls --org-id <ORG_UUID>

# Inspect tables, row counts, and indexes in a tenant schema
python manage.py manage_schema inspect-tables --org-id <ORG_UUID>

# View schema storage sizes and statistics across all tenants
python manage.py manage_schema stats --all
```

---

### 7. Multi-Tenant Database Migrations (`tenant_migrate` & `sync_django_migrations`)

`python manage.py tenant_migrate <action> [options]`

```bash
# Check pending and applied migrations for a tenant schema
python manage.py tenant_migrate status --org-id <ORG_UUID>
python manage.py tenant_migrate status --all-tenants

# Preview SQL statements for pending migrations without executing
python manage.py tenant_migrate preview --org-id <ORG_UUID>

# Apply pending migrations across all tenant schemas
python manage.py tenant_migrate apply --all-tenants

# Apply pending migrations for a specific tenant organization
python manage.py tenant_migrate apply --org-id <ORG_UUID>

# Rollback a specific migration for an organization
python manage.py tenant_migrate rollback --org-id <ORG_UUID> --app kpi --migration-name 0005_auto

# Sync discovered Django migrations into the tenant migration tracking table
python manage.py tenant_migrate sync
python manage.py sync_django_migrations
```

---

### 8. Multi-Tenant Isolation & Security Audit (`manage_isolation`)

`python manage.py manage_isolation <action> [options]`

```bash
# Run comprehensive tenant isolation integrity checks across all tenants
python manage.py manage_isolation verify-isolation --all
python manage.py manage_isolation verify-isolation --org-id <ORG_UUID>

# Verify database routing behavior for a specific Django model
python manage.py manage_isolation test-routing --model apps.kpi.models.KPI --org-id <ORG_UUID>
python manage.py manage_isolation test-routing --model apps.accounts.models.User

# Cross-tenant data leakage audit (detect cross-schema foreign keys or query bleed)
python manage.py manage_isolation check-leakage --org-a <ORG_UUID_1> --org-b <ORG_UUID_2>

# Inspect active PostgreSQL search_path for a tenant context
python manage.py manage_isolation inspect-search-path --org-id <ORG_UUID>

# Audit Row-Level Security (RLS) configuration across all tables
python manage.py manage_isolation rls-audit --all
python manage.py manage_isolation rls-audit --org-id <ORG_UUID>

# Simulate an authenticated request to verify tenant context resolution
python manage.py manage_isolation simulate-request --org-id <ORG_UUID> --email admin@acme.com
```

---

### 9. Tenant Platform Settings (`manage_tenant_settings` / `seed_organization_settings`)

`python manage.py manage_tenant_settings <action> [options]`

```bash
# View all platform tenant settings or a specific section
python manage.py manage_tenant_settings show
python manage.py manage_tenant_settings show --section security
python manage.py manage_tenant_settings show --section isolation

# Read a specific configuration value
python manage.py manage_tenant_settings get --section isolation --key rls_enabled

# Update a configuration value (types: str, int, bool, json)
python manage.py manage_tenant_settings set --section isolation --key rls_enabled --value true --type bool
python manage.py manage_tenant_settings set --section limits --key max_users_default --value 50 --type int

# Update an entire section via JSON payload
python manage.py manage_tenant_settings update-section --section realtime --json-data '{"websocket_enabled": true, "channel_layer": "redis"}'

# Export and import settings configuration
python manage.py manage_tenant_settings export --output settings.json
python manage.py manage_tenant_settings import --input settings.json

# Seed default organization system settings
python manage.py manage_tenant_settings seed
python manage.py seed_organization_settings
python manage.py seed_organization_settings --reset

# Clear cached settings from memory/Redis
python manage.py manage_tenant_settings clear-cache
```

---

### 10. Industry Sectors Management (`manage_sector`)

`python manage.py manage_sector <action> [options]`

```bash
# List all registered industry sectors
python manage.py manage_sector list

# Inspect sector details by code
python manage.py manage_sector info --code TECH

# Create a new industry sector
python manage.py manage_sector create --code TECH --name "Technology & Software" --type COMMERCIAL --color "#3B82F6"

# Update an industry sector
python manage.py manage_sector update --code TECH --name "Technology & Cloud Services"

# Seed default canonical sectors (Finance, Healthcare, Tech, Public Sector, Education, etc.)
python manage.py manage_sector seed

# Assign an organization to an industry sector
python manage.py manage_sector assign --org-id <ORG_UUID> --code TECH

# Delete a sector
python manage.py manage_sector delete --code TECH
python manage.py manage_sector delete --code TECH --hard
```

---

### 11. Health Checks & Maintenance Cleanup (`organization_health_check` & `cleanup_organizations`)

```bash
# Perform operational health check on all organizations
python manage.py organization_health_check --all

# Output health check report in JSON format for automated monitoring / CI
python manage.py organization_health_check --all --json

# Dry run scan for orphaned, stalled, or failed organizations
python manage.py cleanup_organizations --dry-run

# Purge failed/unonboarded organizations older than X days
python manage.py cleanup_organizations --hard-delete --days 14
```
