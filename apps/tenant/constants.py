from django.db import models


class TenantStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'
    SUSPENDED = 'suspended', 'Suspended'
    PENDING = 'pending', 'Pending Approval'
    DELETED = 'deleted', 'Deleted'


class SubscriptionPlan(models.TextChoices):
    TRIAL = 'trial', 'Trial'
    BASIC = 'basic', 'Basic'
    PROFESSIONAL = 'professional', 'Professional'
    ENTERPRISE = 'enterprise', 'Enterprise'


class DomainStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Verification'
    VERIFYING = 'verifying', 'Verifying'
    ACTIVE = 'active', 'Active'
    FAILED = 'failed', 'Failed'
    EXPIRED = 'expired', 'Expired'
    REMOVED = 'removed', 'Removed'


class BackupType(models.TextChoices):
    FULL = 'full', 'Full Backup'
    SCHEMA = 'schema', 'Schema Only'
    DATA = 'data', 'Data Only'
    INCREMENTAL = 'incremental', 'Incremental'


class BackupStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'


class SchemaStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Creation'
    CREATING = 'creating', 'Creating'
    ACTIVE = 'active', 'Active'
    MIGRATING = 'migrating', 'Migrating'
    FAILED = 'failed', 'Failed'
    DELETED = 'deleted', 'Deleted'

class SchemaType(models.TextChoices):
    """Database isolation strategy for tenants"""
    SHARED_SCHEMA = 'shared_schema', 'Shared Schema'
    SEPARATE_SCHEMA = 'separate_schema', 'Separate Schema'
    SEPARATE_DATABASE = 'separate_database', 'Separate Database'
class ResourceType(models.TextChoices):
    USERS = 'users', 'Users'
    STORAGE_MB = 'storage_mb', 'Storage (MB)'
    API_CALLS_PER_DAY = 'api_calls_per_day', 'API Calls Per Day'
    KPIS = 'kpis', 'KPIs'
    DEPARTMENTS = 'departments', 'Departments'
    CONCURRENT_SESSIONS = 'concurrent_sessions', 'Concurrent Sessions'


class ConnectionStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    IDLE = 'idle', 'Idle'
    CLOSED = 'closed', 'Closed'
    ERROR = 'error', 'Error'


class MigrationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    ROLLED_BACK = 'rolled_back', 'Rolled Back'


DEFAULT_TENANT_LIMITS = {
    'max_users': 100,
    'max_storage_mb': 10240,
    'max_api_calls_per_day': 10000,
    'max_kpis': 500,
    'max_departments': 50,
    'max_concurrent_sessions': 5,
}


PLAN_LIMITS = {
    SubscriptionPlan.TRIAL: {
        'max_users': 10,
        'max_storage_mb': 1024,
        'max_api_calls_per_day': 1000,
        'max_kpis': 50,
        'max_departments': 5,
        'max_concurrent_sessions': 2,
    },
    SubscriptionPlan.BASIC: {
        'max_users': 50,
        'max_storage_mb': 5120,
        'max_api_calls_per_day': 5000,
        'max_kpis': 200,
        'max_departments': 20,
        'max_concurrent_sessions': 3,
    },
    SubscriptionPlan.PROFESSIONAL: {
        'max_users': 500,
        'max_storage_mb': 51200,
        'max_api_calls_per_day': 50000,
        'max_kpis': 2000,
        'max_departments': 100,
        'max_concurrent_sessions': 10,
    },
    SubscriptionPlan.ENTERPRISE: {
        'max_users': 10000,
        'max_storage_mb': 512000,
        'max_api_calls_per_day': 500000,
        'max_kpis': 10000,
        'max_departments': 500,
        'max_concurrent_sessions': 50,
    },
}


TENANT_ID_PREFIX = 'tenant_'
TENANT_ID_REGEX = r'^tenant_[a-f0-9]{12}$'

CACHE_KEY_TENANT = 'tenant:{}'
CACHE_KEY_TENANT_CONFIG = 'tenant:config:{}'
CACHE_TENANT_TTL = 300