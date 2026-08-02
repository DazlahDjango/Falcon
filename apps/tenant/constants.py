from django.db import models


class OrganizationStatus(models.TextChoices):
    """Canonical organization lifecycle statuses (stored uppercase in DB)."""
    PENDING = 'PENDING', 'Pending'
    PROVISIONING = 'PROVISIONING', 'Provisioning'
    ACTIVE = 'ACTIVE', 'Active'
    SUSPENDED = 'SUSPENDED', 'Suspended'
    ARCHIVED = 'ARCHIVED', 'Archived'
    FAILED = 'FAILED', 'Failed'
    INACTIVE = 'INACTIVE', 'Inactive'
    DELETED = 'DELETED', 'Deleted'


TenantStatus = OrganizationStatus


class SubscriptionTier(models.TextChoices):
    FREE = 'free', 'Free'
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


class SchemaStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Creation'
    CREATING = 'creating', 'Creating'
    ACTIVE = 'active', 'Active'
    MIGRATING = 'migrating', 'Migrating'
    FAILED = 'failed', 'Failed'
    DELETED = 'deleted', 'Deleted'


class SchemaType(models.TextChoices):
    SHARED_SCHEMA = 'shared_schema', 'Shared Schema'
    SEPARATE_SCHEMA = 'separate_schema', 'Separate Schema'
    SEPARATE_DATABASE = 'separate_database', 'Separate Database'


class ResourceType(models.TextChoices):
    USERS = 'users', 'Users'
    STORAGE_MB = 'storage_mb', 'Storage (MB)'
    API_CALLS_PER_DAY = 'api_calls_per_day', 'API Calls Per Day'
    DEPARTMENTS = 'departments', 'Departments'
    CONCURRENT_SESSIONS = 'concurrent_sessions', 'Concurrent Sessions'
    KPIS = 'kpis', 'KPIs'


class ConnectionStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    IDLE = 'IDLE', 'Idle'
    CLOSED = 'CLOSED', 'Closed'
    ERROR = 'ERROR', 'Error'


class MigrationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    ROLLED_BACK = 'rolled_back', 'Rolled Back'


DEFAULT_ORGANIZATION_LIMITS = {
    ResourceType.USERS: 100,
    ResourceType.STORAGE_MB: 10240,
    ResourceType.API_CALLS_PER_DAY: 10000,
    ResourceType.DEPARTMENTS: 50,
    ResourceType.CONCURRENT_SESSIONS: 5,
    ResourceType.KPIS: 100,
}


TIER_LIMITS = {
    SubscriptionTier.FREE: {
        ResourceType.USERS: 10,
        ResourceType.STORAGE_MB: 1024,
        ResourceType.API_CALLS_PER_DAY: 1000,
        ResourceType.DEPARTMENTS: 5,
        ResourceType.CONCURRENT_SESSIONS: 2,
        ResourceType.KPIS: 10,
    },
    SubscriptionTier.BASIC: {
        ResourceType.USERS: 50,
        ResourceType.STORAGE_MB: 5120,
        ResourceType.API_CALLS_PER_DAY: 5000,
        ResourceType.DEPARTMENTS: 20,
        ResourceType.CONCURRENT_SESSIONS: 3,
        ResourceType.KPIS: 50,
    },
    SubscriptionTier.PROFESSIONAL: {
        ResourceType.USERS: 500,
        ResourceType.STORAGE_MB: 51200,
        ResourceType.API_CALLS_PER_DAY: 50000,
        ResourceType.DEPARTMENTS: 100,
        ResourceType.CONCURRENT_SESSIONS: 10,
        ResourceType.KPIS: 200,
    },
    SubscriptionTier.ENTERPRISE: {
        ResourceType.USERS: 10000,
        ResourceType.STORAGE_MB: 512000,
        ResourceType.API_CALLS_PER_DAY: 500000,
        ResourceType.DEPARTMENTS: 500,
        ResourceType.CONCURRENT_SESSIONS: 50,
        ResourceType.KPIS: 1000,
    },
}


ORG_ID_PREFIX = 'org_'
ORG_ID_REGEX = r'^org_[a-f0-9]{12}$'

CACHE_KEY_ORG = 'organization:{}'
CACHE_KEY_ORG_CONFIG = 'organization:config:{}'
CACHE_ORG_TTL = 300