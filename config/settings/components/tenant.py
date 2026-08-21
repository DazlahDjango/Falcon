"""
Tenant & Organization Configuration Component

Tenant identification, schema isolation, auto-provisioning, quotas,
maintenance settings, backup retention schedules, domain policies, and limits.
"""

# TENANT APP CONFIGURATION
TENANT_HEADER_NAME = 'X-Tenant-ID'
TENANT_IDENTIFICATION_ORDER = ['header', 'subdomain', 'domain']

# Tenant isolation level
TENANT_ISOLATION_LEVEL = 'schema'  # Options: 'shared', 'schema', 'database'

# Tenant provisioning settings
TENANT_AUTO_CREATE_SCHEMA = True
TENANT_AUTO_RUN_MIGRATIONS = True
TENANT_PROVISIONING_TIMEOUT = 300

# Tenant caching settings
TENANT_CACHE_TTL = 300
TENANT_CACHE_PREFIX = 'tenant_'

# Tenant quota and limits
TENANT_QUOTA_CHECK_ENABLED = True
TENANT_QUOTA_CHECK_INTERVAL = 60

# Tenant maintenance settings
TENANT_MAINTENANCE_ALLOWED_IPS = []
TENANT_MAINTENANCE_RETRY_AFTER = 3600

# Tenant backup settings
TENANT_BACKUP_SCHEDULE = '0 2 * * *'
TENANT_BACKUP_RETENTION_DAYS = 30

# Tenant domain settings
TENANT_DOMAIN_BASE = 'falcon.com'
TENANT_ALLOW_CUSTOM_DOMAINS = True

# Tenant default limits
TENANT_DEFAULT_LIMITS = {
    'max_users': 100,
    'max_storage_mb': 10240,
    'max_api_calls_per_day': 10000,
    'max_kpis': 500,
    'max_departments': 50,
    'max_concurrent_sessions': 5,
}

# Tenant WebSocket events
TENANT_WS_EVENTS_ENABLED = True
