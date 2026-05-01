// frontend/src/utils/tenant/helpers.js

import {
    TENANT_STATUS,
    DOMAIN_STATUS,
    BACKUP_STATUS,
    RESOURCE_TYPES,
    QUOTA_WARNING_THRESHOLDS,
} from './constants';

/**
 * Check if tenant is active
 * @param {object} tenant - Tenant object
 * @returns {boolean}
 */
export const isTenantActive = (tenant) => {
    return tenant?.status === TENANT_STATUS.ACTIVE;
};

/**
 * Check if tenant is suspended
 * @param {object} tenant - Tenant object
 * @returns {boolean}
 */
export const isTenantSuspended = (tenant) => {
    return tenant?.status === TENANT_STATUS.SUSPENDED;
};

/**
 * Check if tenant is provisioning
 * @param {object} tenant - Tenant object
 * @returns {boolean}
 */
export const isTenantProvisioning = (tenant) => {
    return tenant?.status === TENANT_STATUS.PROVISIONING;
};

/**
 * Check if tenant is in maintenance mode
 * @param {object} tenant - Tenant object
 * @returns {boolean}
 */
export const isTenantInMaintenance = (tenant) => {
    return tenant?.status === TENANT_STATUS.MAINTENANCE;
};

/**
 * Check if tenant subscription is active
 * @param {object} tenant - Tenant object
 * @returns {boolean}
 */
export const isSubscriptionActive = (tenant) => {
    if (!tenant?.subscription_expires_at) return true;
    return new Date(tenant.subscription_expires_at) > new Date();
};

/**
 * Check if tenant is on trial
 * @param {object} tenant - Tenant object
 * @returns {boolean}
 */
export const isTrialTenant = (tenant) => {
    return tenant?.subscription_plan === 'trial';
};

/**
 * Get days until subscription expires
 * @param {object} tenant - Tenant object
 * @returns {number|null}
 */
export const getDaysUntilExpiry = (tenant) => {
    if (!tenant?.subscription_expires_at) return null;

    const expiry = new Date(tenant.subscription_expires_at);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
};

/**
 * Check if domain is verified
 * @param {object} domain - Domain object
 * @returns {boolean}
 */
export const isDomainVerified = (domain) => {
    return domain?.status === DOMAIN_STATUS.ACTIVE;
};

/**
 * Check if domain verification is pending
 * @param {object} domain - Domain object
 * @returns {boolean}
 */
export const isDomainPending = (domain) => {
    return domain?.status === DOMAIN_STATUS.PENDING;
};

/**
 * Generate DNS TXT record for domain verification
 * @param {string} verificationToken - Verification token from domain
 * @returns {string}
 */
export const getDnsVerificationRecord = (verificationToken) => {
    return `falcon-domain-verification=${verificationToken}`;
};

/**
 * Check if backup is completed
 * @param {object} backup - Backup object
 * @returns {boolean}
 */
export const isBackupCompleted = (backup) => {
    return backup?.status === BACKUP_STATUS.COMPLETED;
};

/**
 * Check if backup is running
 * @param {object} backup - Backup object
 * @returns {boolean}
 */
export const isBackupRunning = (backup) => {
    return backup?.status === BACKUP_STATUS.RUNNING;
};

/**
 * Check if backup failed
 * @param {object} backup - Backup object
 * @returns {boolean}
 */
export const isBackupFailed = (backup) => {
    return backup?.status === BACKUP_STATUS.FAILED;
};

/**
 * Check if backup is expired
 * @param {object} backup - Backup object
 * @returns {boolean}
 */
export const isBackupExpired = (backup) => {
    if (!backup?.expires_at) return false;
    return new Date(backup.expires_at) < new Date();
};

/**
 * Calculate resource usage percentage
 * @param {number} current - Current usage
 * @param {number} limit - Limit value
 * @returns {number}
 */
export const calculateUsagePercentage = (current, limit) => {
    if (!limit || limit === 0) return 0;
    return (current / limit) * 100;
};

/**
 * Get resource warning level
 * @param {number} percentage - Usage percentage
 * @returns {string} 'normal', 'warning', 'critical', 'exceeded'
 */
export const getResourceWarningLevel = (percentage) => {
    if (percentage >= QUOTA_WARNING_THRESHOLDS.EXCEEDED) return 'exceeded';
    if (percentage >= QUOTA_WARNING_THRESHOLDS.CRITICAL) return 'critical';
    if (percentage >= QUOTA_WARNING_THRESHOLDS.WARNING) return 'warning';
    return 'normal';
};

/**
 * Check if resource is near limit
 * @param {number} current - Current usage
 * @param {number} limit - Limit value
 * @param {number} threshold - Threshold percentage (default 80)
 * @returns {boolean}
 */
export const isResourceNearLimit = (current, limit, threshold = 80) => {
    if (!limit || limit === 0) return false;
    return (current / limit) * 100 >= threshold;
};

/**
 * Check if resource limit is exceeded
 * @param {number} current - Current usage
 * @param {number} limit - Limit value
 * @returns {boolean}
 */
export const isResourceExceeded = (current, limit) => {
    return current >= limit;
};

/**
 * Get remaining quota
 * @param {number} current - Current usage
 * @param {number} limit - Limit value
 * @returns {number}
 */
export const getRemainingQuota = (current, limit) => {
    return Math.max(0, limit - current);
};

/**
 * Build tenant filter query string
 * @param {object} filters - Filter object (status, plan, search)
 * @returns {string}
 */
export const buildTenantFilterQuery = (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.subscription_plan) params.append('subscription_plan', filters.subscription_plan);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.page_size) params.append('page_size', filters.page_size);
    if (filters.ordering) params.append('ordering', filters.ordering);

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
};

/**
 * Sort tenants by specified field
 * @param {array} tenants - Array of tenant objects
 * @param {string} field - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {array} Sorted tenants
 */
export const sortTenants = (tenants, field = 'created_at', direction = 'desc') => {
    const sorted = [...tenants];

    sorted.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === 'created_at') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
};

/**
 * Filter tenants by search term
 * @param {array} tenants - Array of tenant objects
 * @param {string} searchTerm - Search term
 * @returns {array} Filtered tenants
 */
export const searchTenants = (tenants, searchTerm) => {
    if (!searchTerm) return tenants;

    const term = searchTerm.toLowerCase();
    return tenants.filter(tenant =>
        tenant.name?.toLowerCase().includes(term) ||
        tenant.slug?.toLowerCase().includes(term) ||
        tenant.contact_email?.toLowerCase().includes(term)
    );
};

/**
 * Get tenant logo URL
 * @param {object} tenant - Tenant object
 * @returns {string|null}
 */
export const getTenantLogoUrl = (tenant) => {
    if (tenant?.logo) return tenant.logo;
    return null;
};

/**
 * Get tenant favicon URL
 * @param {object} tenant - Tenant object
 * @returns {string|null}
 */
export const getTenantFaviconUrl = (tenant) => {
    if (tenant?.favicon) return tenant.favicon;
    return null;
};

/**
 * Get tenant brand colors
 * @param {object} tenant - Tenant object
 * @returns {object} { primary, secondary }
 */
export const getTenantBrandColors = (tenant) => {
    return {
        primary: tenant?.primary_color || '#1a56db',
        secondary: tenant?.secondary_color || '#7e3af2',
    };
};

/**
 * Extract tenant ID from URL params
 * @param {object} params - URL params object
 * @returns {string|null}
 */
export const getTenantIdFromParams = (params) => {
    return params?.id || params?.tenantId || null;
};

/**
 * Generate tenant dashboard URL
 * @param {string} tenantSlug - Tenant slug
 * @returns {string}
 */
export const getTenantDashboardUrl = (tenantSlug) => {
    return `/tenant/${tenantSlug}/dashboard`;
};

/**
 * Check if user can manage tenant (admin permission)
 * @param {object} user - User object
 * @returns {boolean}
 */
export const canManageTenant = (user) => {
    const role = user?.role;
    return role === 'super_admin' || role === 'admin';
};

/**
 * Check if user can view all tenants (super admin only)
 * @param {object} user - User object
 * @returns {boolean}
 */
export const canViewAllTenants = (user) => {
    return user?.role === 'super_admin';
};

/**
 * Get resource type badge variant
 * @param {string} resourceType - Resource type
 * @returns {string}
 */
export const getResourceBadgeVariant = (resourceType) => {
    const variants = {
        users: 'primary',
        storage_mb: 'info',
        api_calls_per_day: 'warning',
        kpis: 'success',
        departments: 'secondary',
        concurrent_sessions: 'default',
    };
    return variants[resourceType] || 'default';
};