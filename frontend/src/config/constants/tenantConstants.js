// ============================================
// TENANT Constants - Organization Management
// ============================================

// ============================================
// 1. ORGANIZATION STATUS
// ============================================

export const ORGANIZATION_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    ARCHIVED: 'ARCHIVED',
};

export const ORGANIZATION_STATUS_CONFIG = {
    [ORGANIZATION_STATUS.PENDING]: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        badge: 'warning',
        icon: 'FiClock',
    },
    [ORGANIZATION_STATUS.ACTIVE]: {
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        badge: 'success',
        icon: 'FiCheckCircle',
    },
    [ORGANIZATION_STATUS.SUSPENDED]: {
        label: 'Suspended',
        color: 'bg-red-100 text-red-800',
        badge: 'danger',
        icon: 'FiXCircle',
    },
    [ORGANIZATION_STATUS.ARCHIVED]: {
        label: 'Archived',
        color: 'bg-gray-100 text-gray-800',
        badge: 'secondary',
        icon: 'FiArchive',
    },
};

// ============================================
// 2. SUBSCRIPTION TIERS
// ============================================

export const SUBSCRIPTION_TIERS = {
    FREE: 'free',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise',
};

export const SUBSCRIPTION_CONFIG = {
    [SUBSCRIPTION_TIERS.FREE]: {
        label: 'Free',
        color: 'bg-gray-100 text-gray-800',
        features: [
            'Up to 10 users',
            '5 active KPIs',
            'Basic reports',
            'Email support',
        ],
        limits: {
            users: 10,
            kpis: 5,
            storage_mb: 100,
            api_calls_per_day: 1000,
        },
    },
    [SUBSCRIPTION_TIERS.PREMIUM]: {
        label: 'Premium',
        color: 'bg-blue-100 text-blue-800',
        features: [
            'Up to 50 users',
            '20 active KPIs',
            'Advanced reports',
            'Priority support',
            'Custom dashboards',
        ],
        limits: {
            users: 50,
            kpis: 20,
            storage_mb: 500,
            api_calls_per_day: 5000,
        },
    },
    [SUBSCRIPTION_TIERS.ENTERPRISE]: {
        label: 'Enterprise',
        color: 'bg-purple-100 text-purple-800',
        features: [
            'Unlimited users',
            'Unlimited KPIs',
            'Custom reports',
            '24/7 dedicated support',
            'Custom dashboards',
            'SSO integration',
            'Advanced analytics',
            'Custom development',
        ],
        limits: {
            users: -1, // Unlimited
            kpis: -1, // Unlimited
            storage_mb: -1, // Unlimited
            api_calls_per_day: -1, // Unlimited
        },
    },
};

// ============================================
// 3. DOMAIN STATUS
// ============================================

export const DOMAIN_STATUS = {
    PENDING: 'PENDING',
    VERIFYING: 'VERIFYING',
    ACTIVE: 'ACTIVE',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
    REMOVED: 'REMOVED',
};

export const DOMAIN_STATUS_CONFIG = {
    [DOMAIN_STATUS.PENDING]: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        badge: 'warning',
        icon: 'FiClock',
    },
    [DOMAIN_STATUS.VERIFYING]: {
        label: 'Verifying',
        color: 'bg-blue-100 text-blue-800',
        badge: 'info',
        icon: 'FiRefreshCw',
    },
    [DOMAIN_STATUS.ACTIVE]: {
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        badge: 'success',
        icon: 'FiCheckCircle',
    },
    [DOMAIN_STATUS.FAILED]: {
        label: 'Failed',
        color: 'bg-red-100 text-red-800',
        badge: 'danger',
        icon: 'FiXCircle',
    },
    [DOMAIN_STATUS.EXPIRED]: {
        label: 'Expired',
        color: 'bg-orange-100 text-orange-800',
        badge: 'warning',
        icon: 'FiAlertTriangle',
    },
    [DOMAIN_STATUS.REMOVED]: {
        label: 'Removed',
        color: 'bg-gray-100 text-gray-800',
        badge: 'secondary',
        icon: 'FiTrash2',
    },
};

// ============================================
// 4. SCHEMA STATUS
// ============================================

export const SCHEMA_STATUS = {
    PENDING: 'PENDING',
    CREATING: 'CREATING',
    ACTIVE: 'ACTIVE',
    MIGRATING: 'MIGRATING',
    FAILED: 'FAILED',
    DELETED: 'DELETED',
};

export const SCHEMA_STATUS_CONFIG = {
    [SCHEMA_STATUS.PENDING]: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        badge: 'warning',
    },
    [SCHEMA_STATUS.CREATING]: {
        label: 'Creating',
        color: 'bg-blue-100 text-blue-800',
        badge: 'info',
    },
    [SCHEMA_STATUS.ACTIVE]: {
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        badge: 'success',
    },
    [SCHEMA_STATUS.MIGRATING]: {
        label: 'Migrating',
        color: 'bg-purple-100 text-purple-800',
        badge: 'info',
    },
    [SCHEMA_STATUS.FAILED]: {
        label: 'Failed',
        color: 'bg-red-100 text-red-800',
        badge: 'danger',
    },
    [SCHEMA_STATUS.DELETED]: {
        label: 'Deleted',
        color: 'bg-gray-100 text-gray-800',
        badge: 'secondary',
    },
};

// ============================================
// 5. RESOURCE TYPES
// ============================================

export const RESOURCE_TYPES = {
    USERS: 'USERS',
    STORAGE_MB: 'STORAGE_MB',
    API_CALLS_PER_DAY: 'API_CALLS_PER_DAY',
    DEPARTMENTS: 'DEPARTMENTS',
    CONCURRENT_SESSIONS: 'CONCURRENT_SESSIONS',
};

export const RESOURCE_TYPE_CONFIG = {
    [RESOURCE_TYPES.USERS]: {
        label: 'Users',
        icon: 'FiUsers',
        unit: 'users',
        color: 'blue',
        description: 'Number of active users',
    },
    [RESOURCE_TYPES.STORAGE_MB]: {
        label: 'Storage',
        icon: 'FiHardDrive',
        unit: 'MB',
        color: 'green',
        description: 'Storage space used',
    },
    [RESOURCE_TYPES.API_CALLS_PER_DAY]: {
        label: 'API Calls',
        icon: 'FiTrendingUp',
        unit: 'calls/day',
        color: 'purple',
        description: 'API calls per day',
    },
    [RESOURCE_TYPES.DEPARTMENTS]: {
        label: 'Departments',
        icon: 'FiBriefcase',
        unit: 'departments',
        color: 'orange',
        description: 'Number of departments',
    },
    [RESOURCE_TYPES.CONCURRENT_SESSIONS]: {
        label: 'Concurrent Sessions',
        icon: 'FiUsers',
        unit: 'sessions',
        color: 'red',
        description: 'Concurrent user sessions',
    },
};

// ============================================
// 6. CONNECTION STATUS
// ============================================

export const CONNECTION_STATUS = {
    ACTIVE: 'ACTIVE',
    IDLE: 'IDLE',
    CLOSED: 'CLOSED',
    ERROR: 'ERROR',
};

export const CONNECTION_STATUS_CONFIG = {
    [CONNECTION_STATUS.ACTIVE]: {
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        badge: 'success',
        icon: 'FiZap',
    },
    [CONNECTION_STATUS.IDLE]: {
        label: 'Idle',
        color: 'bg-yellow-100 text-yellow-800',
        badge: 'warning',
        icon: 'FiClock',
    },
    [CONNECTION_STATUS.CLOSED]: {
        label: 'Closed',
        color: 'bg-gray-100 text-gray-800',
        badge: 'secondary',
        icon: 'FiX',
    },
    [CONNECTION_STATUS.ERROR]: {
        label: 'Error',
        color: 'bg-red-100 text-red-800',
        badge: 'danger',
        icon: 'FiAlertCircle',
    },
};

// ============================================
// 7. MIGRATION STATUS
// ============================================

export const MIGRATION_STATUS = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    ROLLED_BACK: 'ROLLED_BACK',
};

export const MIGRATION_STATUS_CONFIG = {
    [MIGRATION_STATUS.PENDING]: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        badge: 'warning',
    },
    [MIGRATION_STATUS.RUNNING]: {
        label: 'Running',
        color: 'bg-blue-100 text-blue-800',
        badge: 'info',
    },
    [MIGRATION_STATUS.COMPLETED]: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        badge: 'success',
    },
    [MIGRATION_STATUS.FAILED]: {
        label: 'Failed',
        color: 'bg-red-100 text-red-800',
        badge: 'danger',
    },
    [MIGRATION_STATUS.ROLLED_BACK]: {
        label: 'Rolled Back',
        color: 'bg-orange-100 text-orange-800',
        badge: 'warning',
    },
};

// ============================================
// 8. SECTOR TYPES
// ============================================

export const SECTOR_TYPES = {
    COMMERCIAL: 'COMMERCIAL',
    NGO: 'NGO',
    PUBLIC: 'PUBLIC',
    CONSULTING: 'CONSULTING',
};

export const SECTOR_TYPE_CONFIG = {
    [SECTOR_TYPES.COMMERCIAL]: {
        label: 'Commercial',
        icon: 'FiBriefcase',
        color: 'blue',
    },
    [SECTOR_TYPES.NGO]: {
        label: 'Non-Profit',
        icon: 'FiHeart',
        color: 'green',
    },
    [SECTOR_TYPES.PUBLIC]: {
        label: 'Public Sector',
        icon: 'FiGlobe',
        color: 'purple',
    },
    [SECTOR_TYPES.CONSULTING]: {
        label: 'Consulting',
        icon: 'FiTrendingUp',
        color: 'orange',
    },
};

// ============================================
// 9. ORGANIZATION SETTINGS DEFAULTS
// ============================================

export const DEFAULT_ORGANIZATION_SETTINGS = {
    isolation: {
        enforce_schema_isolation: true,
        enforce_domain_isolation: true,
    },
    quotas: {
        block_on_exceeded: true,
        send_warning_emails: true,
        warning_threshold_percent: 80,
    },
    branding: {
        primary_color: '#2563EB',
        secondary_color: '#7C3AED',
        logo_url: null,
        favicon_url: null,
    },
    features: {
        custom_domains: true,
        ssl_auto_renew: true,
        multi_factor_auth: false,
        audit_logs: true,
    },
    notifications: {
        daily_summary: true,
        weekly_report: true,
        monthly_report: true,
        alerts: {
            resource_warning: true,
            ssl_expiry: true,
            migration_complete: true,
            domain_verified: true,
        },
    },
};

// ============================================
// 10. ORGANIZATION STATS KEYS
// ============================================

export const ORGANIZATION_STATS_KEYS = {
    TOTAL: 'total',
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    ARCHIVED: 'archived',
};

export const DOMAIN_STATS_KEYS = {
    TOTAL: 'total',
    ACTIVE: 'active',
    PENDING: 'pending',
    FAILED: 'failed',
    EXPIRING_SOON: 'expiring_soon',
};

export const RESOURCE_STATS_KEYS = {
    TOTAL: 'total',
    EXCEEDED: 'exceeded',
    WARNING: 'warning',
};

// ============================================
// 11. DEFAULT EXPORT
// ============================================

export default {
    ORGANIZATION_STATUS,
    ORGANIZATION_STATUS_CONFIG,
    SUBSCRIPTION_TIERS,
    SUBSCRIPTION_CONFIG,
    DOMAIN_STATUS,
    DOMAIN_STATUS_CONFIG,
    SCHEMA_STATUS,
    SCHEMA_STATUS_CONFIG,
    RESOURCE_TYPES,
    RESOURCE_TYPE_CONFIG,
    CONNECTION_STATUS,
    CONNECTION_STATUS_CONFIG,
    MIGRATION_STATUS,
    MIGRATION_STATUS_CONFIG,
    SECTOR_TYPES,
    SECTOR_TYPE_CONFIG,
    DEFAULT_ORGANIZATION_SETTINGS,
    ORGANIZATION_STATS_KEYS,
    DOMAIN_STATS_KEYS,
    RESOURCE_STATS_KEYS,
};