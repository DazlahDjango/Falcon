// constants/tenantConstants.js
// Tenant Management API Endpoints
// Version: 1.1.0
// Last Updated: 2026-05-09

/**
 * API Base Configuration for Tenant Module
 */
export const TENANT_API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || '/api/v1/tenant',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
};

/**
 * Tenant Core Endpoints
 * Multi-tenant architecture management
 */
export const TENANT_ENDPOINTS = {
    // ==================== Tenant CRUD Operations ====================
    LIST: '/tenants/',
    CREATE: '/tenants/',
    DETAIL: (id) => `/tenants/${id}/`,
    UPDATE: (id) => `/tenants/${id}/`,
    DELETE: (id) => `/tenants/${id}/`,

    // ==================== Tenant Actions ====================
    SUSPEND: (id) => `/tenants/${id}/suspend/`,
    ACTIVATE: (id) => `/tenants/${id}/activate/`,
    USAGE: (id) => `/tenants/${id}/usage/`,  // Detailed usage with date filters
    USAGE_SUMMARY: (id) => `/tenants/${id}/usage-summary/`,  // High-level summary
    RESOURCES: (id) => `/tenants/${id}/resources/`,
    UPDATE_LIMITS: (id) => `/tenants/${id}/update-limits/`,
    PROVISIONING_STATUS: (id) => `/tenants/${id}/provisioning-status/`,
};

/**
 * Domain Management Endpoints
 * Custom domain configuration
 */
export const DOMAIN_ENDPOINTS = {
    // ==================== Domain CRUD Operations ====================
    LIST: '/domains/',
    CREATE: '/domains/',
    DETAIL: (id) => `/domains/${id}/`,
    UPDATE: (id) => `/domains/${id}/`,
    DELETE: (id) => `/domains/${id}/`,

    // ==================== Domain Actions ====================
    VERIFY: (id) => `/domains/${id}/verify/`,
    SET_PRIMARY: (id) => `/domains/${id}/set-primary/`,
    VERIFICATION_INFO: (id) => `/domains/${id}/verification-info/`,

    // ==================== Tenant-Specific Domain Endpoints (Nested Router) ====================
    TENANT_DOMAINS: (tenantId) => `/tenants/${tenantId}/domains/`,
    TENANT_DOMAIN_CREATE: (tenantId) => `/tenants/${tenantId}/domains/`,
    TENANT_DOMAIN_DETAIL: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/`,
    TENANT_DOMAIN_UPDATE: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/`,
    TENANT_DOMAIN_DELETE: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/`,
    TENANT_DOMAIN_VERIFY: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/verify/`,
    TENANT_DOMAIN_SET_PRIMARY: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/set-primary/`,
};

/**
 * Backup Management Endpoints
 * Tenant backup operations
 */
export const BACKUP_ENDPOINTS = {
    // ==================== Backup CRUD Operations ====================
    LIST: '/backups/',
    CREATE: '/backups/',
    DETAIL: (id) => `/backups/${id}/`,
    UPDATE: (id) => `/backups/${id}/`,
    DELETE: (id) => `/backups/${id}/`,

    // ==================== Backup Actions ====================
    RESTORE: (id) => `/backups/${id}/restore/`,
    DOWNLOAD: (id) => `/backups/${id}/download/`,

    // ==================== Tenant-Specific Backup Endpoints (Nested Router) ====================
    TENANT_BACKUPS: (tenantId) => `/tenants/${tenantId}/backups/`,
    TENANT_BACKUP_CREATE: (tenantId) => `/tenants/${tenantId}/backups/`,
    TENANT_BACKUP_DETAIL: (tenantId, backupId) => `/tenants/${tenantId}/backups/${backupId}/`,
    TENANT_BACKUP_RESTORE: (tenantId, backupId) => `/tenants/${tenantId}/backups/${backupId}/restore/`,
    TENANT_BACKUP_DOWNLOAD: (tenantId, backupId) => `/tenants/${tenantId}/backups/${backupId}/download/`,
};

/**
 * Migration Tracking Endpoints
 * Database migration history
 */
export const MIGRATION_ENDPOINTS = {
    // ==================== Migration Read-Only Operations ====================
    LIST: '/migrations/',
    DETAIL: (id) => `/migrations/${id}/`,
    
    /**
     * Get migration summary with counts (uses @action)
     * GET /api/v1/tenant/migrations/summary/?tenant_id={tenantId}
     */
    SUMMARY: (tenantId) => `/migrations/summary/?tenant_id=${tenantId}`,

    // ==================== Tenant-Specific Migration Endpoints (Nested Router) ====================
    TENANT_MIGRATIONS: (tenantId) => `/tenants/${tenantId}/migrations/`,
    TENANT_MIGRATION_DETAIL: (tenantId, migrationId) => `/tenants/${tenantId}/migrations/${migrationId}/`,
    TENANT_MIGRATIONS_SUMMARY: (tenantId) => `/tenants/${tenantId}/migrations/summary/`,
};

/**
 * Schema Management Endpoints
 * Database schema management
 */
export const SCHEMA_ENDPOINTS = {
    // ==================== Schema Read-Only Operations ====================
    LIST: '/schemas/',
    DETAIL: (id) => `/schemas/${id}/`,
    
    /**
     * Get current active schema for a tenant (uses @action)
     * GET /api/v1/tenant/schemas/current/?tenant_id={tenantId}
     */
    CURRENT: (tenantId) => `/schemas/current/?tenant_id=${tenantId}`,

    // ==================== Tenant-Specific Schema Endpoints (Nested Router) ====================
    TENANT_SCHEMAS: (tenantId) => `/tenants/${tenantId}/schemas/`,
    TENANT_SCHEMA_DETAIL: (tenantId, schemaId) => `/tenants/${tenantId}/schemas/${schemaId}/`,
    
    /**
     * Get current schema via nested route
     * GET /api/v1/tenant/tenants/{tenantId}/schemas/current/
     */
    TENANT_SCHEMA_CURRENT: (tenantId) => `/tenants/${tenantId}/schemas/current/`,
};

/**
 * Connection Pool Endpoints
 * Database connection management
 */
export const CONNECTION_ENDPOINTS = {
    // ==================== Connection CRUD ====================
    LIST: '/connections/',
    DETAIL: (id) => `/connections/${id}/`,
    
    // ==================== Connection Actions ====================
    CLOSE: (id) => `/connections/${id}/close/`,
    STATUS: (id) => `/connections/${id}/status/`,
    UPDATE_STATUS: (id) => `/connections/${id}/update-status/`,
    
    // ==================== Pool Management ====================
    METRICS: '/connections/metrics/',
    HEALTH_CHECK: '/connections/health-check/',
    MANAGER_ACTION: '/connections/manager-action/',
    CLOSE_IDLE: '/connections/close-idle/',
};

/**
 * Health Check Endpoints
 */
export const HEALTH_ENDPOINTS = {
    BASE: '/health/',
    TENANTS: '/health/tenants/',
};

/**
 * Complete Tenant API Endpoints
 * Grouped by resource type
 */
export const TENANT_API_ENDPOINTS = {
    TENANT: TENANT_ENDPOINTS,
    DOMAIN: DOMAIN_ENDPOINTS,
    BACKUP: BACKUP_ENDPOINTS,
    MIGRATION: MIGRATION_ENDPOINTS,
    SCHEMA: SCHEMA_ENDPOINTS,
    CONNECTION: CONNECTION_ENDPOINTS,
    HEALTH: HEALTH_ENDPOINTS,
};

/**
 * Query Parameter Helpers
 */
export const TENANT_QUERY_PARAMS = {
    TENANT_STATUS: {
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        INACTIVE: 'inactive',
    },
    SUBSCRIPTION_PLAN: {
        TRIAL: 'trial',
        BASIC: 'basic',
        PREMIUM: 'premium',
        ENTERPRISE: 'enterprise',
    },
    DOMAIN_STATUS: {
        PENDING: 'pending',
        VERIFIED: 'verified',
        FAILED: 'failed',
    },
    BACKUP_TYPE: {
        FULL: 'full',
        INCREMENTAL: 'incremental',
        CONFIG_ONLY: 'config_only',
    },
    BACKUP_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
    },
    MIGRATION_STATUS: {
        PENDING: 'pending',
        RUNNING: 'running',
        COMPLETED: 'completed',
        FAILED: 'failed',
    },
    SCHEMA_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        MAINTENANCE: 'maintenance',
    },
};

// Direct exports for commonly used constants
export const SUBSCRIPTION_PLAN = TENANT_QUERY_PARAMS.SUBSCRIPTION_PLAN;
export const TENANT_STATUS = TENANT_QUERY_PARAMS.TENANT_STATUS;
export const DOMAIN_STATUS = TENANT_QUERY_PARAMS.DOMAIN_STATUS;
export const BACKUP_STATUS = TENANT_QUERY_PARAMS.BACKUP_STATUS;
export const MISSION_STATUS = TENANT_QUERY_PARAMS.MIGRATION_STATUS;
export const SCHEMA_STATUS = TENANT_QUERY_PARAMS.SCHEMA_STATUS;

// Pagination constants
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Quota warning thresholds
export const QUOTA_WARNING_THRESHOLDS = {
    WARNING: 75,
    CRITICAL: 90,
    BLOCK: 100,
};

// Resource types
export const RESOURCE_TYPES = {
    USERS: 'users',
    STORAGE_MB: 'storage_mb',
    API_CALLS_PER_DAY: 'api_calls_per_day',
    KPIS: 'kpis',
    DEPARTMENTS: 'departments',
    CONCURRENT_SESSIONS: 'concurrent_sessions',
};

export default TENANT_API_ENDPOINTS;