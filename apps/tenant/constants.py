from django.db import models


class TenantStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'
    SUSPENDED = 'suspended', 'Suspended'
    PENDING = 'pending', 'Pending Approval'
    PROVISIONING = 'provisioning', 'Provisioning'
    FAILED = 'failed', 'Failed'
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
    ResourceType.USERS: 100,
    ResourceType.STORAGE_MB: 10240,
    ResourceType.API_CALLS_PER_DAY: 10000,
    ResourceType.KPIS: 500,
    ResourceType.DEPARTMENTS: 50,
    ResourceType.CONCURRENT_SESSIONS: 5,
}


PLAN_LIMITS = {
    SubscriptionPlan.TRIAL: {
        ResourceType.USERS: 10,
        ResourceType.STORAGE_MB: 1024,
        ResourceType.API_CALLS_PER_DAY: 1000,
        ResourceType.KPIS: 50,
        ResourceType.DEPARTMENTS: 5,
        ResourceType.CONCURRENT_SESSIONS: 2,
    },
    SubscriptionPlan.BASIC: {
        ResourceType.USERS: 50,
        ResourceType.STORAGE_MB: 5120,
        ResourceType.API_CALLS_PER_DAY: 5000,
        ResourceType.KPIS: 200,
        ResourceType.DEPARTMENTS: 20,
        ResourceType.CONCURRENT_SESSIONS: 3,
    },
    SubscriptionPlan.PROFESSIONAL: {
        ResourceType.USERS: 500,
        ResourceType.STORAGE_MB: 51200,
        ResourceType.API_CALLS_PER_DAY: 50000,
        ResourceType.KPIS: 2000,
        ResourceType.DEPARTMENTS: 100,
        ResourceType.CONCURRENT_SESSIONS: 10,
    },
    SubscriptionPlan.ENTERPRISE: {
        ResourceType.USERS: 10000,
        ResourceType.STORAGE_MB: 512000,
        ResourceType.API_CALLS_PER_DAY: 500000,
        ResourceType.KPIS: 10000,
        ResourceType.DEPARTMENTS: 500,
        ResourceType.CONCURRENT_SESSIONS: 50,
    },
}


TENANT_ID_PREFIX = 'tenant_'
TENANT_ID_REGEX = r'^tenant_[a-f0-9]{12}$'

CACHE_KEY_TENANT = 'tenant:{}'
CACHE_KEY_TENANT_CONFIG = 'tenant:config:{}'
CACHE_TENANT_TTL = 300