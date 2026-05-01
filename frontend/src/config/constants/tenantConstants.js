// constants/tenantConstants.js
// Tenant Management API Endpoints
// Version: 1.0.0
// Last Updated: 2026-01-15

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
    /**
     * List all tenants (Super Admin only)
     * GET /api/v1/tenant/tenants/
     * Query params: status, subscription_plan, is_active, search, ordering
     */
    LIST: '/tenants/',

    /**
     * Create new tenant (Super Admin only)
     * POST /api/v1/tenant/tenants/
     * Body: name, slug, contact_email, subscription_plan, max_users, etc.
     */
    CREATE: '/tenants/',

    /**
     * Get tenant details
     * GET /api/v1/tenant/tenants/{id}/
     */
    DETAIL: (id) => `/tenants/${id}/`,

    /**
     * Update tenant (Tenant Admin or Super Admin)
     * PUT /api/v1/tenant/tenants/{id}/
     * PATCH /api/v1/tenant/tenants/{id}/
     */
    UPDATE: (id) => `/tenants/${id}/`,

    /**
     * Delete tenant (Super Admin only)
     * DELETE /api/v1/tenant/tenants/{id}/
     */
    DELETE: (id) => `/tenants/${id}/`,

    // ==================== Tenant Actions ====================
    /**
     * Suspend tenant
     * POST /api/v1/tenant/tenants/{id}/suspend/
     */
    SUSPEND: (id) => `/tenants/${id}/suspend/`,

    /**
     * Activate tenant
     * POST /api/v1/tenant/tenants/{id}/activate/
     */
    ACTIVATE: (id) => `/tenants/${id}/activate/`,

    /**
     * Get tenant usage statistics
     * GET /api/v1/tenant/tenants/{id}/usage/
     */
    USAGE: (id) => `/tenants/${id}/usage/`,

    /**
     * Get tenant resources and limits
     * GET /api/v1/tenant/tenants/{id}/resources/
     */
    RESOURCES: (id) => `/tenants/${id}/resources/`,

    /**
     * Update tenant resource limits (Super Admin only)
     * POST /api/v1/tenant/tenants/{id}/update-limits/
     * Body: { limits: { users: 500, storage_mb: 10240, ... } }
     */
    UPDATE_LIMITS: (id) => `/tenants/${id}/update-limits/`,

    /**
     * Get tenant provisioning status
     * GET /api/v1/tenant/tenants/{id}/provisioning-status/
     */
    PROVISIONING_STATUS: (id) => `/tenants/${id}/provisioning-status/`,

    /**
     * Get tenant usage summary (Tenant Admin)
     * GET /api/v1/tenant/tenants/{id}/usage-summary/
     */
    USAGE_SUMMARY: (id) => `/tenants/${id}/usage-summary/`,
};

/**
 * Domain Management Endpoints
 * Custom domain configuration
 */
export const DOMAIN_ENDPOINTS = {
    // ==================== Domain CRUD Operations ====================
    /**
     * List all domains
     * GET /api/v1/tenant/domains/
     * Query params: tenant_id, status, is_primary
     */
    LIST: '/domains/',

    /**
     * Create new domain
     * POST /api/v1/tenant/domains/
     * Body: { tenant_id, domain, is_primary }
     */
    CREATE: '/domains/',

    /**
     * Get domain details
     * GET /api/v1/tenant/domains/{id}/
     */
    DETAIL: (id) => `/domains/${id}/`,

    /**
     * Update domain
     * PUT /api/v1/tenant/domains/{id}/
     * PATCH /api/v1/tenant/domains/{id}/
     */
    UPDATE: (id) => `/domains/${id}/`,

    /**
     * Delete domain
     * DELETE /api/v1/tenant/domains/{id}/
     */
    DELETE: (id) => `/domains/${id}/`,

    // ==================== Domain Actions ====================
    /**
     * Verify domain ownership via DNS
     * POST /api/v1/tenant/domains/{id}/verify/
     */
    VERIFY: (id) => `/domains/${id}/verify/`,

    /**
     * Set domain as primary for tenant
     * POST /api/v1/tenant/domains/{id}/set-primary/
     */
    SET_PRIMARY: (id) => `/domains/${id}/set-primary/`,

    /**
     * Get DNS verification information
     * GET /api/v1/tenant/domains/{id}/verification-info/
     */
    VERIFICATION_INFO: (id) => `/domains/${id}/verification-info/`,

    // ==================== Tenant-Specific Domain Endpoints ====================
    /**
     * Get all domains for a tenant (nested route)
     * GET /api/v1/tenant/tenants/{tenantId}/domains/
     */
    TENANT_DOMAINS: (tenantId) => `/tenants/${tenantId}/domains/`,

    /**
     * Create domain for specific tenant
     * POST /api/v1/tenant/tenants/{tenantId}/domains/
     */
    TENANT_DOMAIN_CREATE: (tenantId) => `/tenants/${tenantId}/domains/`,

    /**
     * Get domain details for tenant
     * GET /api/v1/tenant/tenants/{tenantId}/domains/{domainId}/
     */
    TENANT_DOMAIN_DETAIL: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/`,

    /**
     * Update domain for tenant
     * PATCH /api/v1/tenant/tenants/{tenantId}/domains/{domainId}/
     */
    TENANT_DOMAIN_UPDATE: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/`,

    /**
     * Delete domain for tenant
     * DELETE /api/v1/tenant/tenants/{tenantId}/domains/{domainId}/
     */
    TENANT_DOMAIN_DELETE: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/`,

    /**
     * Verify domain for tenant
     * POST /api/v1/tenant/tenants/{tenantId}/domains/{domainId}/verify/
     */
    TENANT_DOMAIN_VERIFY: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/verify/`,

    /**
     * Set primary domain for tenant
     * POST /api/v1/tenant/tenants/{tenantId}/domains/{domainId}/set-primary/
     */
    TENANT_DOMAIN_SET_PRIMARY: (tenantId, domainId) => `/tenants/${tenantId}/domains/${domainId}/set-primary/`,
};

/**
 * Backup Management Endpoints
 * Tenant backup operations
 */
export const BACKUP_ENDPOINTS = {
    // ==================== Backup CRUD Operations ====================
    /**
     * List all backups
     * GET /api/v1/tenant/backups/
     * Query params: tenant_id, status, backup_type
     */
    LIST: '/backups/',

    /**
     * Create new backup
     * POST /api/v1/tenant/backups/
     * Body: { tenant_id, backup_type: 'full'|'incremental'|'config_only' }
     */
    CREATE: '/backups/',

    /**
     * Get backup details
     * GET /api/v1/tenant/backups/{id}/
     */
    DETAIL: (id) => `/backups/${id}/`,

    /**
     * Update backup metadata
     * PATCH /api/v1/tenant/backups/{id}/
     */
    UPDATE: (id) => `/backups/${id}/`,

    /**
     * Delete backup
     * DELETE /api/v1/tenant/backups/{id}/
     */
    DELETE: (id) => `/backups/${id}/`,

    // ==================== Backup Actions ====================
    /**
     * Restore tenant from backup
     * POST /api/v1/tenant/backups/{id}/restore/
     */
    RESTORE: (id) => `/backups/${id}/restore/`,

    /**
     * Download backup file
     * GET /api/v1/tenant/backups/{id}/download/
     * Returns: File download
     */
    DOWNLOAD: (id) => `/backups/${id}/download/`,

    // ==================== Tenant-Specific Backup Endpoints ====================
    /**
     * Get all backups for a tenant (nested route)
     * GET /api/v1/tenant/tenants/{tenantId}/backups/
     * Returns: { tenant_id, backups, total, latest_backup }
     */
    TENANT_BACKUPS: (tenantId) => `/tenants/${tenantId}/backups/`,

    /**
     * Create backup for specific tenant
     * POST /api/v1/tenant/tenants/{tenantId}/backups/
     * Body: { backup_type: 'full'|'incremental'|'config_only' }
     */
    TENANT_BACKUP_CREATE: (tenantId) => `/tenants/${tenantId}/backups/`,

    /**
     * Get backup details for tenant
     * GET /api/v1/tenant/tenants/{tenantId}/backups/{backupId}/
     */
    TENANT_BACKUP_DETAIL: (tenantId, backupId) => `/tenants/${tenantId}/backups/${backupId}/`,

    /**
     * Restore backup for tenant
     * POST /api/v1/tenant/tenants/{tenantId}/backups/{backupId}/restore/
     */
    TENANT_BACKUP_RESTORE: (tenantId, backupId) => `/tenants/${tenantId}/backups/${backupId}/restore/`,

    /**
     * Download backup for tenant
     * GET /api/v1/tenant/tenants/{tenantId}/backups/{backupId}/download/
     */
    TENANT_BACKUP_DOWNLOAD: (tenantId, backupId) => `/tenants/${tenantId}/backups/${backupId}/download/`,
};

/**
 * Migration Tracking Endpoints
 * Database migration history
 */
export const MIGRATION_ENDPOINTS = {
    // ==================== Migration Read-Only Operations ====================
    /**
     * List all migrations (Read-only)
     * GET /api/v1/tenant/migrations/
     * Query params: tenant_id, status, app_name
     */
    LIST: '/migrations/',

    /**
     * Get migration details
     * GET /api/v1/tenant/migrations/{id}/
     */
    DETAIL: (id) => `/migrations/${id}/`,

    // ==================== Tenant-Specific Migration Endpoints ====================
    /**
     * Get all migrations for a tenant
     * GET /api/v1/tenant/tenants/{tenantId}/migrations/
     * Returns: { tenant_id, migrations, total, pending_count, failed_count, completed_count }
     */
    TENANT_MIGRATIONS: (tenantId) => `/tenants/${tenantId}/migrations/`,

    /**
     * Get migration details for tenant
     * GET /api/v1/tenant/tenants/{tenantId}/migrations/{migrationId}/
     */
    TENANT_MIGRATION_DETAIL: (tenantId, migrationId) => `/tenants/${tenantId}/migrations/${migrationId}/`,
};

/**
 * Schema Management Endpoints
 * Database schema management
 */
export const SCHEMA_ENDPOINTS = {
    // ==================== Schema Read-Only Operations ====================
    /**
     * List all schemas (Read-only)
     * GET /api/v1/tenant/schemas/
     * Query params: tenant_id, status, is_ready
     */
    LIST: '/schemas/',

    /**
     * Get schema details
     * GET /api/v1/tenant/schemas/{id}/
     * Returns detailed schema info including tables, indices, constraints
     */
    DETAIL: (id) => `/schemas/${id}/`,

    // ==================== Tenant-Specific Schema Endpoints ====================
    /**
     * Get all schemas for a tenant
     * GET /api/v1/tenant/tenants/{tenantId}/schemas/
     */
    TENANT_SCHEMAS: (tenantId) => `/tenants/${tenantId}/schemas/`,

    /**
     * Get schema details for tenant
     * GET /api/v1/tenant/tenants/{tenantId}/schemas/{schemaId}/
     */
    TENANT_SCHEMA_DETAIL: (tenantId, schemaId) => `/tenants/${tenantId}/schemas/${schemaId}/`,

    /**
     * Get single schema for tenant with metadata
     * GET /api/v1/tenant/tenants/{tenantId}/schema/
     * Returns: { tenant_id, schema, is_active, size_display }
     */
    TENANT_SCHEMA: (tenantId) => `/tenants/${tenantId}/schema/`,
};

/**
 * Complete Tenant API Endpoints
 * Grouped by resource type
 */
export const TENANT_API_ENDPOINTS = {
    // Core Tenant Management
    TENANT: TENANT_ENDPOINTS,

    // Domain Management
    DOMAIN: DOMAIN_ENDPOINTS,

    // Backup Management
    BACKUP: BACKUP_ENDPOINTS,

    // Migration Tracking
    MIGRATION: MIGRATION_ENDPOINTS,

    // Schema Management
    SCHEMA: SCHEMA_ENDPOINTS,
};

/**
 * Query Parameter Helpers
 * Common filter parameters for tenant endpoints
 */
export const TENANT_QUERY_PARAMS = {
    // Tenant filters
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

    // Domain filters
    DOMAIN_STATUS: {
        PENDING: 'pending',
        VERIFIED: 'verified',
        FAILED: 'failed',
    },

    // Backup filters
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

    // Migration filters
    MIGRATION_STATUS: {
        PENDING: 'pending',
        RUNNING: 'running',
        COMPLETED: 'completed',
        FAILED: 'failed',
    },

    // Schema filters
    SCHEMA_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        MAINTENANCE: 'maintenance',
    },
};

/**
 * Default export for convenient importing
 */
export default TENANT_API_ENDPOINTS;