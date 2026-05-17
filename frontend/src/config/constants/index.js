/**
 * Constants - Central export for implemented features only
 */
// Route Constants (only)
export const ROUTES = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    // Dashboard
    DASHBOARD: '/dashboard',
    KPI_DASHBOARD: '/kpi/dashboard',
    // KPI
    KPI_MANAGEMENT: '/kpi/management',
    KPI_CREATE: '/kpi/create',
    KPI_DETAIL: '/kpi/detail/:id',
    KPI_EDIT: '/kpi/edit/:id',
    KPI_VALIDATION: '/kpi/validation',
    KPI_ADJUSTMENTS: '/kpi/adjustments',
    KPI_REPORTS: '/kpi/reports',
    // Targets
    TARGETS: '/targets',
    TARGET_PHASING: '/targets/phasing',
    // Actuals
    ACTUALS: '/actuals',
    ACTUAL_SUBMIT: '/actuals/submit',
    // Scores
    SCORES: '/scores',
    // User Management
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    USER_CREATE: '/users/create',
    USER_EDIT: '/users/:id/edit',
    USER_PROFILE: '/profile',
    TEAM: '/team',
    // Roles
    ROLES: '/roles',
    ROLE_DETAIL: '/roles/:id',
    ROLE_CREATE: '/roles/create',
    ROLE_EDIT: '/roles/:id/edit',
    // Sessions
    SESSIONS: '/sessions',
    // Settings
    SETTINGS: '/settings',
    SECURITY: '/security',
    NOTIFICATIONS: '/notifications',
    // Audit
    AUDIT: '/audit',
    // Admin
    ADMIN: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_CREATE: '/admin/users/create',
    ADMIN_USER_EDIT: '/admin/users/:id/edit',
    ADMIN_TENANTS: '/admin/tenants',
    ADMIN_SYSTEM: '/admin/system',
    // Organisation
    ORGANISATION_DASHBOARD: '/organisation',
    ORGANISATION_SETTINGS: '/organisation/settings',
    ORGANISATION_ADMIN: '/organisation/admin',
    ORGANISATION_AUDIT: '/organisation/audit',
    ORGANISATION_BRANDING: '/organisation/branding',
    ORGANISATION_USERS: '/organisation/users',
    ORGANISATION_SUBSCRIPTION: '/organisation/subscription',
    ORGANISATION_REPORTS: '/organisation/reports',
    ORGANISATION_DEPARTMENTS: '/organisation/departments',
    ORGANISATION_TEAMS: '/organisation/teams',
    ORGANISATION_POSITIONS: '/organisation/positions',
    ORGANISATION_DOMAINS: '/organisation/domains',
    ORGANISATION_CONTACTS: '/organisation/contacts',
    ORGANISATION_WORKFLOWS: '/organisation/workflows',
    ORGANISATION_IMPORT: '/organisation/import',
    ORGANISATION_EXPORT: '/organisation/export',
    ORGANISATION_API_TOKENS: '/organisation/api-tokens',
    ORGANISATION_TWO_FACTOR: '/organisation/two-factor',
    ORGANISATION_PROFILE: '/organisation/profile',
    ORGANISATION_HIERARCHY: '/organisation/hierarchy',
    ORGANISATION_FEATURE_FLAGS: '/organisation/feature-flags',
    ORGANISATION_PLANS: '/organisation/plans',
    // Error pages
    UNAUTHORIZED: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '/404',
    // Billing
    BILLING: '/app/billing',
    BILLING_DASHBOARD: '/app/billing/dashboard',
    BILLING_SUBSCRIPTION: '/app/billing/subscription',
    BILLING_PLANS: '/app/billing/plans',
    BILLING_INVOICES: '/app/billing/invoices',
    BILLING_PAYMENTS: '/app/billing/payments',
    BILLING_PAYMENT_METHODS: '/app/billing/payment-methods',
    BILLING_QUOTA: '/app/billing/quota',
};

// API Endpoints (only implemented - matches your backend)
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login/',
        LOGOUT: '/auth/logout/',
        REFRESH: '/auth/refresh/',
        REGISTER: '/auth/register/',
        VERIFY_EMAIL: '/auth/verify-email/',
        RESEND_VERIFICATION: '/auth/resend-verification/',
        FORGOT_PASSWORD: '/auth/password-reset/',
        RESET_PASSWORD: '/auth/password-reset/confirm/',
        CHANGE_PASSWORD: '/auth/change-password/',
        MFA_SETUP: '/auth/mfa/setup/',
        MFA_VERIFY: '/auth/mfa/verify/',
        MFA_DISABLE: '/auth/mfa/disable/',
        INVITATIONS: '/auth/invitations/',
        ACCEPT_INVITATION: '/auth/invitations/accept/',
    },
    
    // Users (from accounts)
    USERS: {
        LIST: '/users/',
        DETAIL: (id) => `/users/${id}/`,
        ME: '/users/me/',
        AVATAR: '/users/me/avatar/',
        TEAM: '/users/me/team/',
        REPORTING_CHAIN: '/users/me/reporting-chain/',
    },
    
    // Roles & Permissions
    ROLES: {
        LIST: '/roles/',
        DETAIL: (id) => `/roles/${id}/`,
        SYSTEM: '/roles/system/',
        ASSIGNABLE: '/roles/assignable/',
        PERMISSIONS: '/permissions/',
    },
    
    // KPI Module
    KPI: {
        LIST: '/kpis/kpis/',
        DETAIL: (id) => `/kpis/kpis/${id}/`,
        CREATE: '/kpis/kpis/',
        UPDATE: (id) => `/kpis/kpis/${id}/`,
        DELETE: (id) => `/kpis/kpis/${id}/`,
        ACTIVATE: (id) => `/kpis/kpis/${id}/activate/`,
        DEACTIVATE: (id) => `/kpis/kpis/${id}/deactivate/`,
        VALIDATE: (id) => `/kpis/kpis/${id}/validate/`,
        VALIDATE_SUM: '/kpis/kpi-weights/validate_sum/',
        WEIGHTS: (id) => `/kpis/kpis/${id}/weights/`,
        STRATEGIC_LINKAGES: (id) => `/kpis/kpis/${id}/strategic-linkages/`,
        DEPENDENCIES: (id) => `/kpis/kpis/${id}/dependencies/`,
    },
    
    FRAMEWORK: {
        SECTORS: '/kpis/sectors/',
        FRAMEWORKS: '/kpis/frameworks/',
        CATEGORIES: '/kpis/categories/',
        TEMPLATES: '/kpis/templates/',
    },
    
    TARGET: {
        LIST: '/kpis/targets/',
        DETAIL: (id) => `/kpis/targets/${id}/`,
        PHASING: (id) => `/kpis/targets/${id}/phasing/`,
        VALIDATE: (id) => `/kpis/targets/${id}/validate/`,
        CASCADE: '/kpis/targets/cascade/',
        MONTHLY_PHASING: '/kpis/monthly-phasing/',
    },
    
    ACTUAL: {
        LIST: '/kpis/actuals/',
        DETAIL: (id) => `/kpis/actuals/${id}/`,
        SUBMIT: (id) => `/kpis/actuals/${id}/submit/`,
        APPROVE: (id) => `/kpis/actuals/${id}/approve/`,
        REJECT: (id) => `/kpis/actuals/${id}/reject/`,
        EVIDENCE: (id) => `/kpis/actuals/${id}/evidence/`,
    },
    
    SCORE: {
        LIST: '/kpis/Scores/',
        DETAIL: (id) => `/kpis/Scores/${id}/`,
        AGGREGATED: '/kpis/aggregated-scores/',
        TRAFFIC_LIGHTS: '/kpis/traffic-lights/',
        STATISTICS: '/kpis/Scores/statistics/',
    },
    
    DASHBOARD: {
        INDIVIDUAL: '/kpis/dashboard/individual/',
        MANAGER: '/kpis/dashboard/manager/',
        EXECUTIVE: '/kpis/dashboard/executive/',
        CHAMPION: '/kpis/dashboard/champion/',
    },
    
    ANALYTICS: {
        KPI_SUMMARIES: '/kpis/kpi-summaries/',
        DEPARTMENT_ROLLUPS: '/kpis/department-rollups/',
        ORGANIZATION_HEALTH: '/kpis/organization-health/',
        INSIGHTS: '/kpis/analytics/insights/',
        PREDICTIONS: '/kpis/analytics/predictions/',
    },
    
    BULK: {
        KPI_UPLOAD: '/kpis/bulk/kpi-upload/',
        ACTUAL_UPLOAD: '/kpis/bulk/actual-upload/',
        TARGET_UPLOAD: '/kpis/bulk/target-upload/',
    },
    
    CALCULATION: {
        TRIGGER: '/kpis/calculations/trigger/',
        STATUS: (taskId) => `/kpis/calculations/status/${taskId}/`,
    },
    
    EXPORT: {
        KPIS: '/kpis/export/kpis/',
        SCORES: '/kpis/export/scores/',
        REPORTS: '/kpis/export/reports/',
    },
    
    CASCADE: {
        RULES: '/kpis/cascade-rules/',
        RULE_DETAIL: (id) => `/kpis/cascade-rules/${id}/`,
        MAPS: '/kpis/cascade-maps/',
        MAP_DETAIL: (id) => `/kpis/cascade-maps/${id}/`,
        CASCADE_DEPARTMENT: '/kpis/cascade-maps/cascade_department/',
        TREE: '/kpis/cascade-maps/tree/',
    },
    
    HISTORY: {
        KPI: '/kpis/kpi-history/',
        ACTUAL: '/kpis/actual-history/',
        TARGET: '/kpis/target-history/',
        FOR_KPI: (kpiId) => `/kpis/kpi-history/for_kpi/?kpi_id=${kpiId}`,
        FOR_ACTUAL: (actualId) => `/kpis/actual-history/for_actual/?actual_id=${actualId}`,
        FOR_TARGET: (targetId) => `/kpis/target-history/for_target/?target_id=${targetId}`,
    },
    
    WEIGHT: {
        LIST: '/kpis/kpi-weights/',
        DETAIL: (id) => `/kpis/kpi-weights/${id}/`,
        VALIDATE_SUM: '/kpis/kpi-weights/validate_sum/',
    },
    
    LINKAGE: {
        LIST: '/kpis/strategic-linkages/',
        DETAIL: (id) => `/kpis/strategic-linkages/${id}/`,
    },
    
    DEPENDENCY: {
        LIST: '/kpis/kpi-dependencies/',
        DETAIL: (id) => `/kpis/kpi-dependencies/${id}/`,
        IMPACT_CHAIN: (id) => `/kpis/kpi-dependencies/${id}/impact_chain/`,
    },
    
    VALIDATION: {
        LIST: '/kpis/validations/',
        DETAIL: (id) => `/kpis/validations/${id}/`,
        PENDING: '/kpis/validations/pending/',
        REJECTION_REASONS: '/kpis/rejection-reasons/',
        ESCALATIONS: '/kpis/escalations/',
        ESCALATION_DETAIL: (id) => `/kpis/escalations/${id}/`,
    },
    
    ORGANISATION: {
        BASE: '/organisations/',
        CURRENT: '/organisations/current/',
        SETTINGS: '/organisations/settings/',
        BRANDING: '/organisations/branding/',
        USERS: '/organisations/users/',
        TEAMS: '/organisations/teams/',
        DEPARTMENTS: '/organisations/departments/',
        POSITIONS: '/organisations/positions/',
        SUBSCRIPTION: '/organisations/subscription/',
    },
    
    ADMIN: {
        USERS: '/admin/users/',
        TENANTS: '/admin/tenants/',
        SYSTEM: '/admin/system/',
        CLEAR_CACHE: '/admin/system/clear-cache/',
        HEALTH: '/admin/system/health/',
    },
    
    // Billing Module
    BILLING: {
        PLANS: {
            LIST: '/billing/plans/',
            DETAIL: (id) => `/billing/plans/${id}/`,
            FEATURES: (id) => `/billing/plans/${id}/features/`,
            COMPARE: '/billing/plans/compare/',
        },
        SUBSCRIPTIONS: {
            LIST: '/billing/subscriptions/',
            DETAIL: (id) => `/billing/subscriptions/${id}/`,
            CURRENT: '/billing/subscriptions/current/',
            STATUS: '/billing/subscriptions/status/',
            CANCEL: (id) => `/billing/subscriptions/${id}/cancel/`,
            REACTIVATE: (id) => `/billing/subscriptions/${id}/reactivate/`,
            HISTORY: (id) => `/billing/subscriptions/${id}/history/`,
        },
        INVOICES: {
            LIST: '/billing/invoices/',
            DETAIL: (id) => `/billing/invoices/${id}/`,
            DOWNLOAD: (id) => `/billing/invoices/${id}/download/`,
            REMIND: (id) => `/billing/invoices/${id}/remind/`,
            OUTSTANDING: '/billing/invoices/outstanding/',
        },
        PAYMENTS: {
            LIST: '/billing/payments/',
            DETAIL: (id) => `/billing/payments/${id}/`,
            REFUND: (id) => `/billing/payments/${id}/refund/`,
        },
        PAYMENT_METHODS: {
            LIST: '/billing/payment-methods/',
            DETAIL: (id) => `/billing/payment-methods/${id}/`,
            DEFAULT: '/billing/payment-methods/default/',
            EXPIRING: '/billing/payment-methods/expiring-soon/',
        },
        CHECKOUT: {
            CREATE: '/billing/checkout/',
            SESSION: '/billing/checkout/session/',
        },
        PORTAL: {
            CREATE: '/billing/portal/',
        },
        QUOTA: {
            STATUS: '/billing/quota/',
            LIMITS: '/billing/quota/limits/',
            REFRESH: '/billing/quota/refresh/',
        },
        WEBHOOK: {
            STRIPE: '/billing/webhook/stripe/',
        }
    },
};

// Role Constants
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    EXECUTIVE: 'executive',
    SUPERVISOR: 'supervisor',
    DASHBOARD_CHAMPION: 'dashboard_champion',
    STAFF: 'staff',
    READ_ONLY: 'read_only',
};

export const ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 0,
    [ROLES.CLIENT_ADMIN]: 1,
    [ROLES.EXECUTIVE]: 2,
    [ROLES.SUPERVISOR]: 3,
    [ROLES.DASHBOARD_CHAMPION]: 3,
    [ROLES.STAFF]: 4,
    [ROLES.READ_ONLY]: 5,
};

export const ROLE_DISPLAY_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.CLIENT_ADMIN]: 'Organization Admin',
    [ROLES.EXECUTIVE]: 'Executive',
    [ROLES.SUPERVISOR]: 'Supervisor',
    [ROLES.DASHBOARD_CHAMPION]: 'Dashboard Champion',
    [ROLES.STAFF]: 'Staff Member',
    [ROLES.READ_ONLY]: 'Read Only',
};

// App Constants
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'falcon_access_token',
    REFRESH_TOKEN: 'falcon_refresh_token',
    USER: 'falcon_user',
    TENANT: 'falcon_tenant',
    TENANT_ID: 'falcon_tenant_id',
    THEME: 'falcon_theme',
};

export const API_TIMEOUT = 30000;
export const DEFAULT_PAGE_SIZE = 20;

// KPI Status
export const KPI_STATUS = {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    OFF_TRACK: 'off_track',
};

export const KPI_STATUS_COLORS = {
    [KPI_STATUS.ON_TRACK]: '#10b981',
    [KPI_STATUS.AT_RISK]: '#f59e0b',
    [KPI_STATUS.OFF_TRACK]: '#ef4444',
};

// Helper functions
export const buildPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

export const isHigherRole = (role, compareToRole) => {
    return ROLE_HIERARCHY[role] < ROLE_HIERARCHY[compareToRole];
};

// Billing 
export * from './billingApiConstants';
export * from './billingConstants';
export * from './billingValidationConstants';

import billingConstants from './billingConstants';
import billingApiConstants from './billingApiConstants';
import billingValidationConstants from './billingValidationConstants';

export {
    billingConstants,
    billingApiConstants,
    billingValidationConstants,
};

export default {
    ...billingConstants,
    ...billingApiConstants,
    ...billingValidationConstants,
};