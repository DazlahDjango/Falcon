// frontend/src/utils/tenant/constants.js

// Tenant Status Types
export const TENANT_STATUS = {
  PROVISIONING: 'provisioning',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  MAINTENANCE: 'maintenance',
  DELETED: 'deleted',
  FAILED: 'failed',
};

export const TENANT_STATUS_LABELS = {
  [TENANT_STATUS.PROVISIONING]: 'Provisioning',
  [TENANT_STATUS.ACTIVE]: 'Active',
  [TENANT_STATUS.SUSPENDED]: 'Suspended',
  [TENANT_STATUS.MAINTENANCE]: 'Maintenance',
  [TENANT_STATUS.DELETED]: 'Deleted',
  [TENANT_STATUS.FAILED]: 'Failed',
};

export const TENANT_STATUS_COLORS = {
  [TENANT_STATUS.PROVISIONING]: 'warning',
  [TENANT_STATUS.ACTIVE]: 'success',
  [TENANT_STATUS.SUSPENDED]: 'error',
  [TENANT_STATUS.MAINTENANCE]: 'info',
  [TENANT_STATUS.DELETED]: 'default',
  [TENANT_STATUS.FAILED]: 'error',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

export const PLAN_LABELS = {
  [SUBSCRIPTION_PLANS.TRIAL]: 'Trial',
  [SUBSCRIPTION_PLANS.BASIC]: 'Basic',
  [SUBSCRIPTION_PLANS.PROFESSIONAL]: 'Professional',
  [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Enterprise',
};

export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.TRIAL]: {
    maxUsers: 10,
    maxStorageMB: 1024,
    maxApiCallsPerDay: 1000,
    maxKpis: 50,
    maxDepartments: 5,
    maxConcurrentSessions: 2,
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    maxUsers: 50,
    maxStorageMB: 5120,
    maxApiCallsPerDay: 5000,
    maxKpis: 200,
    maxDepartments: 20,
    maxConcurrentSessions: 3,
  },
  [SUBSCRIPTION_PLANS.PROFESSIONAL]: {
    maxUsers: 500,
    maxStorageMB: 51200,
    maxApiCallsPerDay: 50000,
    maxKpis: 2000,
    maxDepartments: 100,
    maxConcurrentSessions: 10,
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    maxUsers: 10000,
    maxStorageMB: 512000,
    maxApiCallsPerDay: 500000,
    maxKpis: 10000,
    maxDepartments: 500,
    maxConcurrentSessions: 50,
  },
};

// Resource Types
export const RESOURCE_TYPES = {
  USERS: 'users',
  STORAGE_MB: 'storage_mb',
  API_CALLS_PER_DAY: 'api_calls_per_day',
  KPIS: 'kpis',
  DEPARTMENTS: 'departments',
  CONCURRENT_SESSIONS: 'concurrent_sessions',
};

export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPES.USERS]: 'Users',
  [RESOURCE_TYPES.STORAGE_MB]: 'Storage (MB)',
  [RESOURCE_TYPES.API_CALLS_PER_DAY]: 'API Calls / Day',
  [RESOURCE_TYPES.KPIS]: 'KPIs',
  [RESOURCE_TYPES.DEPARTMENTS]: 'Departments',
  [RESOURCE_TYPES.CONCURRENT_SESSIONS]: 'Concurrent Sessions',
};

export const RESOURCE_TYPE_ICONS = {
  [RESOURCE_TYPES.USERS]: 'Users',
  [RESOURCE_TYPES.STORAGE_MB]: 'HardDrive',
  [RESOURCE_TYPES.API_CALLS_PER_DAY]: 'Activity',
  [RESOURCE_TYPES.KPIS]: 'Target',
  [RESOURCE_TYPES.DEPARTMENTS]: 'Building2',
  [RESOURCE_TYPES.CONCURRENT_SESSIONS]: 'Users',
};

// Domain Status
export const DOMAIN_STATUS = {
  PENDING: 'pending',
  VERIFYING: 'verifying',
  ACTIVE: 'active',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REMOVED: 'removed',
};

export const DOMAIN_STATUS_LABELS = {
  [DOMAIN_STATUS.PENDING]: 'Pending Verification',
  [DOMAIN_STATUS.VERIFYING]: 'Verifying',
  [DOMAIN_STATUS.ACTIVE]: 'Active',
  [DOMAIN_STATUS.FAILED]: 'Failed',
  [DOMAIN_STATUS.EXPIRED]: 'Expired',
  [DOMAIN_STATUS.REMOVED]: 'Removed',
};

export const DOMAIN_STATUS_COLORS = {
  [DOMAIN_STATUS.PENDING]: 'warning',
  [DOMAIN_STATUS.VERIFYING]: 'info',
  [DOMAIN_STATUS.ACTIVE]: 'success',
  [DOMAIN_STATUS.FAILED]: 'error',
  [DOMAIN_STATUS.EXPIRED]: 'default',
  [DOMAIN_STATUS.REMOVED]: 'default',
};

// Backup Types
export const BACKUP_TYPES = {
  FULL: 'full',
  SCHEMA: 'schema',
  DATA: 'data',
  INCREMENTAL: 'incremental',
};

export const BACKUP_TYPE_LABELS = {
  [BACKUP_TYPES.FULL]: 'Full Backup',
  [BACKUP_TYPES.SCHEMA]: 'Schema Only',
  [BACKUP_TYPES.DATA]: 'Data Only',
  [BACKUP_TYPES.INCREMENTAL]: 'Incremental',
};

// Backup Status
export const BACKUP_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const BACKUP_STATUS_LABELS = {
  [BACKUP_STATUS.PENDING]: 'Pending',
  [BACKUP_STATUS.RUNNING]: 'Running',
  [BACKUP_STATUS.COMPLETED]: 'Completed',
  [BACKUP_STATUS.FAILED]: 'Failed',
  [BACKUP_STATUS.CANCELLED]: 'Cancelled',
};

export const BACKUP_STATUS_COLORS = {
  [BACKUP_STATUS.PENDING]: 'warning',
  [BACKUP_STATUS.RUNNING]: 'info',
  [BACKUP_STATUS.COMPLETED]: 'success',
  [BACKUP_STATUS.FAILED]: 'error',
  [BACKUP_STATUS.CANCELLED]: 'default',
};

// Schema Status
export const SCHEMA_STATUS = {
  PENDING: 'pending',
  CREATING: 'creating',
  ACTIVE: 'active',
  MIGRATING: 'migrating',
  FAILED: 'failed',
  DELETED: 'deleted',
};

// Connection Status
export const CONNECTION_STATUS = {
  ACTIVE: 'active',
  IDLE: 'idle',
  CLOSED: 'closed',
  ERROR: 'error',
};

// Quota Warning Thresholds
export const QUOTA_WARNING_THRESHOLDS = {
  WARNING: 80,   // 80% - show warning
  CRITICAL: 90,  // 90% - show critical warning
  EXCEEDED: 100, // 100% - exceeded
};

// Default Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = 'MMM DD, YYYY';
export const DATE_TIME_FORMAT = 'MMM DD, YYYY HH:mm:ss';
export const API_DATE_FORMAT = 'YYYY-MM-DD';

// API Endpoints (will be used by services)
export const API_ENDPOINTS = {
  TENANTS: '/api/v1/tenants',
  DOMAINS: '/api/v1/domains',
  BACKUPS: '/api/v1/backups',
  RESOURCES: '/api/v1/resources',
  HEALTH: '/api/v1/health',
};

// WebSocket Events
export const WS_EVENTS = {
  TENANT_STATUS: 'tenant_status_changed',
  PROVISIONING_PROGRESS: 'provisioning_progress',
  PROVISIONING_COMPLETE: 'provisioning_complete',
  PROVISIONING_FAILED: 'provisioning_failed',
  BACKUP_PROGRESS: 'backup_progress',
  BACKUP_COMPLETE: 'backup_complete',
  BACKUP_FAILED: 'backup_failed',
  QUOTA_WARNING: 'quota_warning',
};

// Query Keys for React Query
export const QUERY_KEYS = {
  TENANTS: 'tenants',
  TENANT: 'tenant',
  TENANT_USAGE: 'tenant-usage',
  TENANT_RESOURCES: 'tenant-resources',
  TENANT_DOMAINS: 'tenant-domains',
  TENANT_BACKUPS: 'tenant-backups',
  DOMAINS: 'domains',
  BACKUPS: 'backups',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TENANT_ID: 'tenant_id',
  TENANT_SLUG: 'tenant_slug',
  TENANT_THEME: 'tenant_theme',
};

// Route Paths
export const ROUTES = {
  TENANTS: '/tenants',
  TENANT_DETAIL: '/tenants/:id',
  TENANT_CREATE: '/tenants/create',
  TENANT_EDIT: '/tenants/:id/edit',
  TENANT_DASHBOARD: '/tenant/dashboard',
  TENANT_SETTINGS: '/tenant/settings',
  TENANT_DOMAINS: '/tenant/domains',
  TENANT_BACKUPS: '/tenant/backups',
  TENANT_RESOURCES: '/tenant/resources',
  TENANT_USERS: '/tenant/users',
};

// Error Messages
export const ERROR_MESSAGES = {
  FETCH_TENANTS: 'Failed to load tenants. Please try again.',
  FETCH_TENANT: 'Failed to load tenant details.',
  CREATE_TENANT: 'Failed to create tenant. Please check the form.',
  UPDATE_TENANT: 'Failed to update tenant.',
  DELETE_TENANT: 'Failed to delete tenant.',
  SUSPEND_TENANT: 'Failed to suspend tenant.',
  ACTIVATE_TENANT: 'Failed to activate tenant.',
  FETCH_DOMAINS: 'Failed to load domains.',
  VERIFY_DOMAIN: 'Failed to verify domain. Check DNS records.',
  FETCH_BACKUPS: 'Failed to load backups.',
  CREATE_BACKUP: 'Failed to create backup.',
  RESTORE_BACKUP: 'Failed to restore from backup.',
  FETCH_RESOURCES: 'Failed to load resource usage.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TENANT_CREATED: 'Tenant created successfully!',
  TENANT_UPDATED: 'Tenant updated successfully!',
  TENANT_DELETED: 'Tenant deleted successfully!',
  TENANT_SUSPENDED: 'Tenant suspended successfully!',
  TENANT_ACTIVATED: 'Tenant activated successfully!',
  DOMAIN_ADDED: 'Domain added successfully!',
  DOMAIN_VERIFIED: 'Domain verified successfully!',
  DOMAIN_PRIMARY: 'Domain set as primary successfully!',
  BACKUP_CREATED: 'Backup created successfully!',
  BACKUP_RESTORED: 'Backup restored successfully!',
  BACKUP_DELETED: 'Backup deleted successfully!',
};