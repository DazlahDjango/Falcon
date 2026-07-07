// ============================================
// TENANT API Constants - Organization Management
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const TENANT_API_BASE = `${API_BASE}/tenant/`;
export const API_VERSION = 'v1';
export const TENANT_API_PREFIX = `/api/${API_VERSION}/tenant`;

// ============================================
// 1. ORGANIZATION ENDPOINTS
// ============================================

export const ORGANIZATION_ENDPOINTS = {
    // Base CRUD
    LIST: `${API_BASE}/tenant/organizations/`,
    DETAIL: (id) => `${API_BASE}/tenant/organizations/${id}/`,
    CREATE: `${API_BASE}/tenant/organizations/`,
    UPDATE: (id) => `${API_BASE}/tenant/organizations/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/organizations/${id}/`,
    PATCH: (id) => `${API_BASE}/tenant/organizations/${id}/`,
    
    // Actions
    ONBOARD: (id) => `${API_BASE}/tenant/organizations/${id}/onboard/`,
    ACTIVATE: (id) => `${API_BASE}/tenant/organizations/${id}/activate/`,
    SUSPEND: (id) => `${API_BASE}/tenant/organizations/${id}/suspend/`,
    PROVISIONING_STATUS: (id) => `${API_BASE}/tenant/organizations/${id}/provisioning_status/`,
    USAGE_SUMMARY: (id) => `${API_BASE}/tenant/organizations/${id}/usage_summary/`,
    
    // Query Params
    QUERY_PARAMS: {
        STATUS: 'status',
        IS_ACTIVE: 'is_active',
        IS_ONBOARDED: 'is_onboarded',
        SECTOR_ID: 'sector_id',
        SUBSCRIPTION_TIER: 'subscription_tier',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
    
    // Subscription Tiers (must match backend SubscriptionTier)
    SUBSCRIPTION_TIERS: ['free', 'basic', 'professional', 'enterprise'],
    ORG_STATUS: ['PENDING', 'PROVISIONING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'FAILED'],
};

// ============================================
// 2. ADMIN ORGANIZATION ENDPOINTS (Super Admin)
// ============================================

export const ADMIN_ORGANIZATION_ENDPOINTS = {
    LIST: `${API_BASE}/tenant/admin/organizations/`,
    DETAIL: (id) => `${API_BASE}/tenant/admin/organizations/${id}/`,
    FORCE_SUSPEND: (id) => `${API_BASE}/tenant/admin/organizations/${id}/force_suspend/`,
    FORCE_ACTIVATE: (id) => `${API_BASE}/tenant/admin/organizations/${id}/force_activate/`,
    FORCE_DELETE: (id) => `${API_BASE}/tenant/admin/organizations/${id}/force_delete/`,
};

// ============================================
// 3. DOMAIN ENDPOINTS
// ============================================

export const DOMAIN_ENDPOINTS = {
    // Base CRUD
    LIST: `${API_BASE}/tenant/domains/`,
    DETAIL: (id) => `${API_BASE}/tenant/domains/${id}/`,
    CREATE: `${API_BASE}/tenant/domains/`,
    UPDATE: (id) => `${API_BASE}/tenant/domains/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/domains/${id}/`,
    PATCH: (id) => `${API_BASE}/tenant/domains/${id}/`,
    
    // Actions
    VERIFY: (id) => `${API_BASE}/tenant/domains/${id}/verify/`,
    SET_PRIMARY: (id) => `${API_BASE}/tenant/domains/${id}/set_primary/`,
    RENEW_SSL: (id) => `${API_BASE}/tenant/domains/${id}/renew_ssl/`,
    
    // Query Params
    QUERY_PARAMS: {
        ORGANIZATION_ID: 'organization_id',
        STATUS: 'status',
        IS_PRIMARY: 'is_primary',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
    
    // Domain Status
    DOMAIN_STATUS: ['PENDING', 'VERIFYING', 'ACTIVE', 'FAILED', 'EXPIRED', 'REMOVED'],
};

// ============================================
// 4. SCHEMA ENDPOINTS
// ============================================

export const SCHEMA_ENDPOINTS = {
    // Base CRUD
    LIST: `${API_BASE}/tenant/schemas/`,
    DETAIL: (id) => `${API_BASE}/tenant/schemas/${id}/`,
    CREATE: `${API_BASE}/tenant/schemas/`,
    UPDATE: (id) => `${API_BASE}/tenant/schemas/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/schemas/${id}/`,
    
    // Actions
    PROVISION: (id) => `${API_BASE}/tenant/schemas/${id}/provision/`,
    DROP: (id) => `${API_BASE}/tenant/schemas/${id}/drop/`,
    UPDATE_STATS: (id) => `${API_BASE}/tenant/schemas/${id}/update_stats/`,
    
    // Query Params
    QUERY_PARAMS: {
        ORGANIZATION_ID: 'organization_id',
        STATUS: 'status',
        IS_READY: 'is_ready',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
    
    // Schema Status
    SCHEMA_STATUS: ['PENDING', 'CREATING', 'ACTIVE', 'MIGRATING', 'FAILED', 'DELETED'],
};

// ============================================
// 5. RESOURCE ENDPOINTS
// ============================================

export const RESOURCE_ENDPOINTS = {
    // Base CRUD
    LIST: `${API_BASE}/tenant/resources/`,
    DETAIL: (id) => `${API_BASE}/tenant/resources/${id}/`,
    CREATE: `${API_BASE}/tenant/resources/`,
    UPDATE: (id) => `${API_BASE}/tenant/resources/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/resources/${id}/`,
    PATCH: (id) => `${API_BASE}/tenant/resources/${id}/`,
    
    // Actions
    RESET: (id) => `${API_BASE}/tenant/resources/${id}/reset/`,
    RESET_DAILY_LIMITS: `${API_BASE}/tenant/resources/reset_daily_limits/`,
    INCREMENT: (id) => `${API_BASE}/tenant/resources/${id}/increment/`,
    DECREMENT: (id) => `${API_BASE}/tenant/resources/${id}/decrement/`,
    SNAPSHOT: (id) => `${API_BASE}/tenant/resources/${id}/snapshot/`,
    SUMMARY: `${API_BASE}/tenant/resources/summary/`,
    ANALYTICS: `${API_BASE}/tenant/resources/analytics/`,
    SYNC_FROM_BILLING: `${API_BASE}/tenant/resources/sync_from_billing/`,
    BULK_INCREMENT: `${API_BASE}/tenant/resources/bulk_increment/`,
    EXCEEDED: `${API_BASE}/tenant/resources/exceeded/`,
    
    // Query Params
    QUERY_PARAMS: {
        ORGANIZATION_ID: 'organization_id',
        RESOURCE_TYPE: 'resource_type',
        IS_EXCEEDED: 'is_exceeded',
        IS_WARNING: 'is_warning',
    },
    
    // Resource Types
    RESOURCE_TYPES: ['USERS', 'STORAGE_MB', 'API_CALLS_PER_DAY', 'DEPARTMENTS', 'CONCURRENT_SESSIONS', 'KPIS'],
};

// ============================================
// 6. CONNECTION ENDPOINTS
// ============================================

export const CONNECTION_ENDPOINTS = {
    // Base CRUD
    LIST: `${API_BASE}/tenant/connections/`,
    DETAIL: (id) => `${API_BASE}/tenant/connections/${id}/`,
    CREATE: `${API_BASE}/tenant/connections/`,
    UPDATE: (id) => `${API_BASE}/tenant/connections/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/connections/${id}/`,
    
    // Actions
    CLOSE: (id) => `${API_BASE}/tenant/connections/${id}/close/`,
    STATUS: (id) => `${API_BASE}/tenant/connections/${id}/status/`,
    EXECUTE_ACTION: `${API_BASE}/tenant/connections/action/`,
    METRICS: `${API_BASE}/tenant/connections/metrics/`,
    HEALTH_CHECK: `${API_BASE}/tenant/connections/health_check/`,
    DEBUG: `${API_BASE}/tenant/connections/debug/`,
    
    // Query Params
    QUERY_PARAMS: {
        ORGANIZATION_ID: 'organization_id',
        STATUS: 'status',
        ORDERING: 'ordering',
    },
    
    // Connection Status
    CONNECTION_STATUS: ['ACTIVE', 'IDLE', 'CLOSED', 'ERROR'],
    
    // Actions
    ACTIONS: ['close', 'reset', 'recycle', 'close_all_idle', 'pause', 'resume'],
};

// ============================================
// 7. MIGRATION ENDPOINTS
// ============================================

export const MIGRATION_ENDPOINTS = {
    // Base CRUD
    LIST: `${API_BASE}/tenant/migrations/`,
    DETAIL: (id) => `${API_BASE}/tenant/migrations/${id}/`,
    CREATE: `${API_BASE}/tenant/migrations/`,
    UPDATE: (id) => `${API_BASE}/tenant/migrations/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/migrations/${id}/`,
    
    // Actions
    APPLY: (id) => `${API_BASE}/tenant/migrations/${id}/apply/`,
    STATS: `${API_BASE}/tenant/migrations/stats/`,
    SYNC: `${API_BASE}/tenant/migrations/sync/`,
    PREVIEW_SQL: (id) => `${API_BASE}/tenant/migrations/${id}/preview-sql/`,
    ROLLBACK: (id) => `${API_BASE}/tenant/migrations/${id}/rollback/`,
    
    // Query Params
    QUERY_PARAMS: {
        ORGANIZATION_ID: 'organization_id',
        APP_NAME: 'app_name',
        STATUS: 'status',
        ORDERING: 'ordering',
    },
    
    // Migration Status
    MIGRATION_STATUS: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'],
};

// ============================================
// 8. SETTINGS ENDPOINTS
// ============================================

export const SETTINGS_ENDPOINTS = {
    // Base
    LIST: `${API_BASE}/tenant/settings/`,
    SECTION: `${API_BASE}/tenant/settings/section/`,
    UPDATE_SETTINGS: `${API_BASE}/tenant/settings/update_settings/`,
    UPDATE_SECTION: `${API_BASE}/tenant/settings/update_section/`,
    RESET: `${API_BASE}/tenant/settings/reset/`,
    
    // System Settings
    SYSTEM_SETTINGS: `${API_BASE}/tenant/system-settings/`,
    SYSTEM_SETTINGS_RESET: `${API_BASE}/tenant/system-settings/reset/`,
    
    // Query Params
    QUERY_PARAMS: {
        SECTION: 'section',
    },
};

// ============================================
// 9. DASHBOARD ENDPOINTS
// ============================================

export const DASHBOARD_ENDPOINTS = {
    SUPER_ADMIN: `${API_BASE}/tenant/dashboard/super_admin/`,
    CLIENT_ADMIN: `${API_BASE}/tenant/dashboard/client_admin/`,
    ORG_STATS: `${API_BASE}/tenant/dashboard/org_stats/`,
    
    // Query Params
    QUERY_PARAMS: {
        ORGANIZATION_ID: 'organization_id',
    },
};

// ============================================
// 10. HEALTH ENDPOINTS
// ============================================

export const HEALTH_ENDPOINTS = {
    HEALTH: `${API_BASE}/tenant/health/`,
    ORGANIZATIONS_HEALTH: `${API_BASE}/tenant/health/organizations/`,
};

// ============================================
// 11. SECTOR ENDPOINTS
// ============================================

export const SECTOR_ENDPOINTS = {
    LIST: `${API_BASE}/tenant/sectors/`,
    DETAIL: (id) => `${API_BASE}/tenant/sectors/${id}/`,
    CREATE: `${API_BASE}/tenant/sectors/`,
    UPDATE: (id) => `${API_BASE}/tenant/sectors/${id}/`,
    DELETE: (id) => `${API_BASE}/tenant/sectors/${id}/`,
    TOGGLE_ACTIVE: (id) => `${API_BASE}/tenant/sectors/${id}/toggle_active/`,
    QUERY_PARAMS: {
        SECTOR_TYPE: 'sector_type',
        IS_ACTIVE: 'is_active',
        SEARCH: 'search',
        ORDERING: 'ordering',
    },
};

// ============================================
// 12. PROVISIONING ENDPOINTS (Admin-only)
// ============================================

export const PROVISIONING_ENDPOINTS = {
    // List / filters
    LIST: `${API_BASE}/tenant/provisioning/`,
    FAILED: `${API_BASE}/tenant/provisioning/failed/`,
    IN_PROGRESS: `${API_BASE}/tenant/provisioning/in-progress/`,

    // Per-organization actions
    STATUS: (id) => `${API_BASE}/tenant/provisioning/${id}/status/`,
    TRIGGER: (id) => `${API_BASE}/tenant/provisioning/${id}/trigger/`,
    RETRY: (id) => `${API_BASE}/tenant/provisioning/${id}/retry/`,
    ROLLBACK: (id) => `${API_BASE}/tenant/provisioning/${id}/rollback/`,

    // Query Params
    QUERY_PARAMS: {
        STATUS: 'status',
        ORDERING: 'ordering',
    },

    // Provisioning Status Values
    STATUS_VALUES: {
        PENDING: 'PENDING',
        PROVISIONING: 'PROVISIONING',
        ACTIVE: 'ACTIVE',
        FAILED: 'FAILED',
        SUSPENDED: 'SUSPENDED',
        ARCHIVED: 'ARCHIVED',
    },
};

// ============================================
// 13. NESTED ORGANIZATION RESOURCES
// ============================================

export const NESTED_ORGANIZATION_ENDPOINTS = {
    DOMAINS: (orgId) => `${API_BASE}/tenant/organizations/${orgId}/domains/`,
    DOMAIN_DETAIL: (orgId, domainId) => `${API_BASE}/tenant/organizations/${orgId}/domains/${domainId}/`,
    SCHEMAS: (orgId) => `${API_BASE}/tenant/organizations/${orgId}/schemas/`,
    SCHEMA_DETAIL: (orgId, schemaId) => `${API_BASE}/tenant/organizations/${orgId}/schemas/${schemaId}/`,
    RESOURCES: (orgId) => `${API_BASE}/tenant/organizations/${orgId}/resources/`,
    RESOURCE_DETAIL: (orgId, resourceId) => `${API_BASE}/tenant/organizations/${orgId}/resources/${resourceId}/`,
    CONNECTIONS: (orgId) => `${API_BASE}/tenant/organizations/${orgId}/connections/`,
    CONNECTION_DETAIL: (orgId, connId) => `${API_BASE}/tenant/organizations/${orgId}/connections/${connId}/`,
    MIGRATIONS: (orgId) => `${API_BASE}/tenant/organizations/${orgId}/migrations/`,
    MIGRATION_DETAIL: (orgId, migrationId) => `${API_BASE}/tenant/organizations/${orgId}/migrations/${migrationId}/`,
};

// ============================================
// 13. WEBSOCKET ENDPOINTS
// ============================================

export const TENANT_WS = {
    ORGANIZATION: (orgId) => `${WS_BASE}/tenant/organization/${orgId}/`,
    DASHBOARD: (tenantId) => `${WS_BASE}/tenant/dashboard/${tenantId}/`,
    CONNECTION: (orgId) => `${WS_BASE}/tenant/connection/${orgId}/`,
    MIGRATION: (orgId) => `${WS_BASE}/tenant/migration/${orgId}/`,
    ADMIN: `${WS_BASE}/tenant/admin/`,
};

// ============================================
// 14. API STATUS & HTTP CONSTANTS
// ============================================

export const API_STATUS = { SUCCESS: 'success', ERROR: 'error', PENDING: 'pending' };

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// 15. TENANT ERROR CODES
// ============================================

export const TENANT_ERROR_CODES = {
    ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
    DOMAIN_ALREADY_EXISTS: 'DOMAIN_ALREADY_EXISTS',
    DOMAIN_VERIFICATION_FAILED: 'DOMAIN_VERIFICATION_FAILED',
    SCHEMA_ALREADY_EXISTS: 'SCHEMA_ALREADY_EXISTS',
    SCHEMA_PROVISION_FAILED: 'SCHEMA_PROVISION_FAILED',
    RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    ISOLATION_VIOLATION: 'ISOLATION_VIOLATION',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    DUPLICATE_ORGANIZATION: 'DUPLICATE_ORGANIZATION',
    INVALID_SUBSCRIPTION: 'INVALID_SUBSCRIPTION',
};

// ============================================
// 16. DEFAULT EXPORT
// ============================================

export default {
    TENANT_API_BASE,
    API_VERSION,
    TENANT_API_PREFIX,
    ORGANIZATION_ENDPOINTS,
    ADMIN_ORGANIZATION_ENDPOINTS,
    DOMAIN_ENDPOINTS,
    SCHEMA_ENDPOINTS,
    RESOURCE_ENDPOINTS,
    CONNECTION_ENDPOINTS,
    MIGRATION_ENDPOINTS,
    SETTINGS_ENDPOINTS,
    DASHBOARD_ENDPOINTS,
    HEALTH_ENDPOINTS,
    SECTOR_ENDPOINTS,
    PROVISIONING_ENDPOINTS,
    NESTED_ORGANIZATION_ENDPOINTS,
    TENANT_WS,
    API_STATUS,
    HTTP_STATUS,
    TENANT_ERROR_CODES,
};