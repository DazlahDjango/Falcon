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
    KPI_MY_KPIS: '/kpi/my-kpis',
    KPI_VALIDATION: '/kpi/validation',
    KPI_SETTINGS: '/kpi/settings',
    KPI_ADJUSTMENTS: '/kpi/adjustments',
    KPI_REPORTS: '/kpi/reports',
    KPI_ANALYTICS: '/kpi/analytics',
    KPI_HEATMAP: '/kpi/analytics/heatmap',
    // Targets
    TARGETS: '/kpi/targets',
    TARGET_PHASING: '/kpi/targets/phasing',
    TARGET_CASCADE: '/kpi/targets/cascade',
    // Actuals
    ACTUALS: '/kpi/actuals',
    ACTUAL_SUBMIT: '/kpi/actuals/submit',
    // Scores
    SCORES: '/kpi/scores',
    // Admin KPI modules
    KPI_ADMIN_OVERVIEW: '/kpi/admin/overview',
    KPI_ADMIN_SECTORS: '/kpi/admin/sectors',
    KPI_ADMIN_FRAMEWORKS: '/kpi/admin/frameworks',
    KPI_ADMIN_CATEGORIES: '/kpi/admin/categories',
    KPI_ADMIN_TEMPLATES: '/kpi/admin/templates',
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
    // Error pages
    UNAUTHORIZED: '/403',
    SERVER_ERROR: '/500',
    NOT_FOUND: '/404',
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
    MFA: {
        // Devices
        DEVICES: '/mfa/devices/',
        DEVICE_DETAIL: (id) => `/mfa/devices/${id}/`,
        SETUP_TOTP: '/mfa/devices/setup-totp/',
        VERIFY_TOTP_SETUP: '/mfa/devices/verify-totp-setup/',
        VERIFY_DEVICE: (id) => `/mfa/devices/${id}/verify/`,
        VERIFY_BACKUP: '/mfa/devices/verify-backup/',
        SET_PRIMARY: (id) => `/mfa/devices/${id}/set-primary/`,
        GENERATE_BACKUP_CODES: '/mfa/devices/generate-backup-codes/',
        BACKUP_CODES_STATUS: '/mfa/devices/backup-codes-status/',
        STATUS: '/mfa/devices/status/',
        ACTIVITY: '/mfa/devices/activity/',
        FAILURE_RATE: '/mfa/devices/failure-rate/',
        DISABLE: '/mfa/devices/disable/',

        // Audit Logs
        AUDIT_LOGS: '/mfa/audit-logs/',
        AUDIT_LOG_DETAIL: (id) => `/mfa/audit-logs/${id}/`,
        AUDIT_LOG_SUMMARY: '/mfa/audit-logs/summary/',

        // Admin (user nested)
        USER_DEVICES: (userId) => `/users/${userId}/mfa-devices/`,
        USER_SETUP_TOTP: (userId) => `/users/${userId}/mfa-devices/setup-totp/`,
        USER_VERIFY_TOTP: (userId) => `/users/${userId}/mfa-devices/verify-totp-setup/`,
        USER_DISABLE: (userId) => `/users/${userId}/mfa-devices/disable/`,
    },

    // Users (from accounts)
    USERS: {
        // List & Detail
        LIST: '/users/',
        DETAIL: (id) => `/users/${id}/`,
        CREATE: '/users/',
        UPDATE: (id) => `/users/${id}/`,
        DELETE: (id) => `/users/${id}/`,

        // Current User
        ME: '/users/me/',
        UPDATE_ME: '/users/me/',
        AVATAR: '/users/me/avatar/',
        TEAM: '/users/me/team/',
        REPORTING_CHAIN: '/users/me/reporting-chain/',

        // User Actions (Admin)
        ACTIVATE: (id) => `/users/${id}/activate/`,
        DEACTIVATE: (id) => `/users/${id}/deactivate/`,
        UNLOCK: (id) => `/users/${id}/unlock/`,
        ASSIGN_ROLE: (id) => `/users/${id}/assign-role/`,
        CHANGE_PASSWORD: (id) => `/users/${id}/change-password/`,

        // Team & Hierarchy (by ID)
        TEAM_BY_ID: (id) => `/users/${id}/team/`,
        REPORTING_CHAIN_BY_ID: (id) => `/users/${id}/reporting-chain/`,

        // Invitations
        INVITE: '/users/invite/',
    },

    // Roles & Permissions
    ROLES: {
        LIST: '/roles/',
        DETAIL: (id) => `/roles/${id}/`,
        SYSTEM: '/roles/system/',
        ASSIGNABLE: '/roles/assignable/',
        PERMISSIONS: '/permissions/',
    },

    // ============ KPI MODULE ============

    // KPI CRUD
    KPI: {
        LIST: '/kpis/kpis/',
        DETAIL: (id) => `/kpis/kpis/${id}/`,
        CREATE: '/kpis/kpis/',
        UPDATE: (id) => `/kpis/kpis/${id}/`,
        DELETE: (id) => `/kpis/kpis/${id}/`,
        ACTIVATE: (id) => `/kpis/kpis/${id}/activate/`,
        DEACTIVATE: (id) => `/kpis/kpis/${id}/deactivate/`,
        VALIDATE: (id) => `/kpis/kpis/${id}/validate/`,
        WEIGHTS: (id) => `/kpis/kpis/${id}/weights/`,
        TARGETS: (id) => `/kpis/kpis/${id}/targets/`,
        SCORES: (id) => `/kpis/kpis/${id}/scores/`,
        ACTUALS: (id) => `/kpis/kpis/${id}/actuals/`,
        STRATEGIC_LINKAGES: (id) => `/kpis/kpis/${id}/strategic-linkages/`,
        DEPENDENCIES: (id) => `/kpis/kpis/${id}/dependencies/`,
    },

    // KPI Weights
    KPI_WEIGHT: {
        LIST: '/kpis/kpi-weights/',
        DETAIL: (id) => `/kpis/kpi-weights/${id}/`,
        VALIDATE_SUM: '/kpis/kpi-weights/validate_sum/',
    },

    // Strategic Linkages
    STRATEGIC_LINKAGE: {
        LIST: '/kpis/strategic-linkages/',
        DETAIL: (id) => `/kpis/strategic-linkages/${id}/`,
    },

    // KPI Dependencies
    KPI_DEPENDENCY: {
        LIST: '/kpis/kpi-dependencies/',
        DETAIL: (id) => `/kpis/kpi-dependencies/${id}/`,
        IMPACT_CHAIN: (id) => `/kpis/kpi-dependencies/${id}/impact_chain/`,
    },

    // User Nested Resources (My KPIs)
    USER_NESTED: {
        KPI: (userId) => `/kpis/users/${userId}/kpis/`,
        TARGETS: (userId) => `/kpis/users/${userId}/targets/`,
        SCORES: (userId) => `/kpis/users/${userId}/scores/`,
        ACTUALS: (userId) => `/kpis/users/${userId}/actuals/`,
    },

    // Framework
    FRAMEWORK: {
        SECTORS: '/kpis/sectors/',
        SECTOR_DETAIL: (id) => `/kpis/sectors/${id}/`,
        FRAMEWORKS: '/kpis/frameworks/',
        FRAMEWORK_DETAIL: (id) => `/kpis/frameworks/${id}/`,
        CATEGORIES: '/kpis/categories/',
        CATEGORY_DETAIL: (id) => `/kpis/categories/${id}/`,
        TEMPLATES: '/kpis/templates/',
        TEMPLATE_DETAIL: (id) => `/kpis/templates/${id}/`,
        USE_TEMPLATE: (id) => `/kpis/templates/${id}/use_template/`,
        ADMIN_OVERVIEW: '/kpis/admin/overview/',
    },

    // Target Management
    TARGET: {
        LIST: '/kpis/targets/',
        DETAIL: (id) => `/kpis/targets/${id}/`,
        CREATE: '/kpis/targets/',
        UPDATE: (id) => `/kpis/targets/${id}/`,
        DELETE: (id) => `/kpis/targets/${id}/`,
        PHASE: (id) => `/kpis/targets/${id}/phase/`,
        PHASING: (id) => `/kpis/targets/${id}/phasing/`,
        VALIDATE: (id) => `/kpis/targets/${id}/validate/`,
        MONTHLY_PHASING: '/kpis/monthly-phasing/',
        LOCK_CYCLE: '/kpis/monthly-phasing/lock_cycle/',
    },

    // Target Cascade
    CASCADE: {
        RULES: '/kpis/cascade-rules/',
        RULE_DETAIL: (id) => `/kpis/cascade-rules/${id}/`,
        MAPS: '/kpis/cascade-maps/',
        MAP_DETAIL: (id) => `/kpis/cascade-maps/${id}/`,
        CREATE: '/kpis/cascade-maps/',
        CASCADE_DEPARTMENT: '/kpis/cascade-maps/cascade_department/',
        TREE: '/kpis/cascade-maps/tree/',
        ROLLBACK: (id) => `/kpis/cascade-maps/${id}/rollback/`,
        SET_DEFAULT_RULE: (id) => `/kpis/cascade-rules/${id}/set_default/`,
    },

    // Actual Data
    ACTUAL: {
        LIST: '/kpis/actuals/',
        DETAIL: (id) => `/kpis/actuals/${id}/`,
        CREATE: '/kpis/actuals/',
        UPDATE: (id) => `/kpis/actuals/${id}/`,
        DELETE: (id) => `/kpis/actuals/${id}/`,
        SUBMIT: (id) => `/kpis/actuals/${id}/submit/`,
        APPROVE: (id) => `/kpis/actuals/${id}/approve/`,
        REJECT: (id) => `/kpis/actuals/${id}/reject/`,
        RESUBMIT: (id) => `/kpis/actuals/${id}/resubmit/`,
        EVIDENCE: (id) => `/kpis/actuals/${id}/evidence/`,
        VALIDATIONS: (id) => `/kpis/actuals/${id}/validations/`,
        EVIDENCE_UPLOAD: '/kpis/evidence/',
    },

    // Actual Adjustments
    ACTUAL_ADJUSTMENT: {
        LIST: '/kpis/actual-adjustments/',
        DETAIL: (id) => `/kpis/actual-adjustments/${id}/`,
        CREATE: '/kpis/actual-adjustments/',
        APPROVE: (id) => `/kpis/actual-adjustments/${id}/approve/`,
    },

    // Validation
    VALIDATION: {
        LIST: '/kpis/validations/',
        DETAIL: (id) => `/kpis/validations/${id}/`,
        PENDING: '/kpis/validations/pending/',
        REJECTION_REASONS: '/kpis/rejection-reasons/',
        ESCALATIONS: '/kpis/escalations/',
        ESCALATION_DETAIL: (id) => `/kpis/escalations/${id}/`,
        MY_ESCALATIONS: '/kpis/escalations/my_escalations/',
        RESOLVE: (id) => `/kpis/escalations/${id}/resolve/`,
    },

    // Scores
    SCORE: {
        LIST: '/kpis/Scores/',
        DETAIL: (id) => `/kpis/Scores/${id}/`,
        MY_SCORES: '/kpis/Scores/my_scores/',
        TEAM_SCORES: '/kpis/Scores/team_scores/',
        STATISTICS: '/kpis/Scores/statistics/',
    },

    // Aggregated Scores
    AGGREGATED_SCORE: {
        LIST: '/kpis/aggregated-scores/',
        DETAIL: (id) => `/kpis/aggregated-scores/${id}/`,
        ORGANIZATION: '/kpis/aggregated-scores/organization/',
        DEPARTMENTS: '/kpis/aggregated-scores/departments/',
        RANKING: '/kpis/aggregated-scores/ranking/',
    },

    // Traffic Lights
    TRAFFIC_LIGHT: {
        LIST: '/kpis/traffic-lights/',
        RED_ALERTS: '/kpis/traffic-lights/red_alerts/',
        MY_RED_ALERTS: '/kpis/traffic-lights/my_red_alerts/',
    },

    // Dashboards
    DASHBOARD: {
        INDIVIDUAL: '/kpis/dashboard/individual/',
        MANAGER: '/kpis/dashboard/manager/',
        EXECUTIVE: '/kpis/dashboard/executive/',
        CHAMPION: '/kpis/dashboard/champion/',
    },

    // Analytics & Reports
    ANALYTICS: {
        KPI_SUMMARIES: '/kpis/kpi-summaries/',
        KPI_SUMMARY_DETAIL: (id) => `/kpis/kpi-summaries/${id}/`,
        DEPARTMENT_ROLLUPS: '/kpis/department-rollups/',
        DEPARTMENT_ROLLUP_DETAIL: (id) => `/kpis/department-rollups/${id}/`,
        ORGANIZATION_HEALTH: '/kpis/organization-health/',
        ORGANIZATION_HEALTH_CURRENT: '/kpis/organization-health/current/',
        ORGANIZATION_HEALTH_HISTORY: '/kpis/organization-health/history/',
        INSIGHTS: '/kpis/analytics/insights/',
        PREDICTIONS: '/kpis/analytics/predictions/',
        HEATMAP: '/kpis/analytics/heatmap/',
        EXPORT: '/kpis/analytics/export/',
    },

    // Custom Reports
    CUSTOM_REPORT: {
        CREATE: '/kpis/reports/custom/',
        STATUS: (taskId) => `/kpis/reports/custom/status/${taskId}/`,
        DOWNLOAD: (reportId) => `/kpis/reports/custom/${reportId}/download/`,
    },

    // Notifications
    NOTIFICATION: {
        PREFERENCES: '/kpis/notifications/preferences/',
        PREFERENCES_UPDATE: '/kpis/notifications/preferences/',
    },

    // History/Audit
    HISTORY: {
        KPI: '/kpis/kpi-history/',
        ACTUAL: '/kpis/actual-history/',
        TARGET: '/kpis/target-history/',
        FOR_KPI: (kpiId) => `/kpis/kpi-history/for_kpi/?kpi_id=${kpiId}`,
        FOR_ACTUAL: (actualId) => `/kpis/actual-history/for_actual/?actual_id=${actualId}`,
        FOR_TARGET: (targetId) => `/kpis/target-history/for_target/?target_id=${targetId}`,
    },

    // Bulk Operations
    BULK: {
        KPI_UPLOAD: '/kpis/bulk/kpi-upload/',
        ACTUAL_UPLOAD: '/kpis/bulk/actual-upload/',
        TARGET_UPLOAD: '/kpis/bulk/target-upload/',
        TEMPLATE: (type) => `/kpis/bulk/templates/${type}/`,
        VALIDATE: '/kpis/bulk/validate/',
    },

    // Calculations
    CALCULATION: {
        TRIGGER: '/kpis/calculations/trigger/',
        STATUS: (taskId) => `/kpis/calculations/status/${taskId}/`,
        SCHEDULE: '/kpis/calculations/schedule/',
    },

    // Exports
    EXPORT: {
        KPIS: '/kpis/export/kpis/',
        SCORES: '/kpis/export/scores/',
        REPORTS: '/kpis/export/reports/',
        DEPARTMENT_REPORT: '/kpis/export/department-report/',
        KPI_DETAIL: '/kpis/export/kpi-detail/',
    },

    // System Settings
    SYSTEM_SETTINGS: {
        KPI: '/kpis/system-settings/',
        KPI_RESET: '/kpis/system-settings/reset/',
        REFERENCE_DATA: '/kpis/reference-data/',
    },

    // Organisation (from accounts)
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

    // Admin
    ADMIN: {
        USERS: '/admin/users/',
        TENANTS: '/admin/tenants/',
        SYSTEM: '/admin/system/',
        CLEAR_CACHE: '/admin/system/clear-cache/',
        HEALTH: '/admin/system/health/',
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

// Convenience export for KPI API calls
export const KPI_API = {
    // KPI CRUD
    getKPIs: (params) => `${API_ENDPOINTS.KPI.LIST}?${new URLSearchParams(params)}`,
    getKPI: (id) => API_ENDPOINTS.KPI.DETAIL(id),
    createKPI: () => API_ENDPOINTS.KPI.CREATE,
    updateKPI: (id) => API_ENDPOINTS.KPI.UPDATE(id),
    deleteKPI: (id) => API_ENDPOINTS.KPI.DELETE(id),
    activateKPI: (id) => API_ENDPOINTS.KPI.ACTIVATE(id),
    deactivateKPI: (id) => API_ENDPOINTS.KPI.DEACTIVATE(id),
    validateKPI: (id) => API_ENDPOINTS.KPI.VALIDATE(id),

    // User Nested (My KPIs)
    getMyKPIs: (userId, params) => `${API_ENDPOINTS.USER_NESTED.KPI(userId)}?${new URLSearchParams(params)}`,
    getMyTargets: (userId, params) => `${API_ENDPOINTS.USER_NESTED.TARGETS(userId)}?${new URLSearchParams(params)}`,
    getMyScores: (userId, params) => `${API_ENDPOINTS.USER_NESTED.SCORES(userId)}?${new URLSearchParams(params)}`,
    getMyActuals: (userId, params) => `${API_ENDPOINTS.USER_NESTED.ACTUALS(userId)}?${new URLSearchParams(params)}`,

    // Weights
    getWeights: (kpiId) => API_ENDPOINTS.KPI.WEIGHTS(kpiId),
    updateWeights: (kpiId) => API_ENDPOINTS.KPI.WEIGHTS(kpiId),
    validateWeightSum: () => API_ENDPOINTS.KPI_WEIGHT.VALIDATE_SUM,

    // Targets
    getTargets: () => API_ENDPOINTS.TARGET.LIST,
    getTarget: (id) => API_ENDPOINTS.TARGET.DETAIL(id),
    createTarget: () => API_ENDPOINTS.TARGET.CREATE,
    updateTarget: (id) => API_ENDPOINTS.TARGET.UPDATE(id),
    deleteTarget: (id) => API_ENDPOINTS.TARGET.DELETE(id),
    phaseTarget: (id) => API_ENDPOINTS.TARGET.PHASE(id),
    getPhasing: (id) => API_ENDPOINTS.TARGET.PHASING(id),

    // Actuals
    getActuals: () => API_ENDPOINTS.ACTUAL.LIST,
    getActual: (id) => API_ENDPOINTS.ACTUAL.DETAIL(id),
    createActual: () => API_ENDPOINTS.ACTUAL.CREATE,
    submitActual: (id) => API_ENDPOINTS.ACTUAL.SUBMIT(id),
    approveActual: (id) => API_ENDPOINTS.ACTUAL.APPROVE(id),
    rejectActual: (id) => API_ENDPOINTS.ACTUAL.REJECT(id),

    // Scores
    getScores: () => API_ENDPOINTS.SCORE.LIST,
    getMyScores: () => API_ENDPOINTS.SCORE.MY_SCORES,
    getTeamScores: () => API_ENDPOINTS.SCORE.TEAM_SCORES,

    // Dashboards
    getIndividualDashboard: (params) => `${API_ENDPOINTS.DASHBOARD.INDIVIDUAL}?${new URLSearchParams(params)}`,
    getManagerDashboard: (params) => `${API_ENDPOINTS.DASHBOARD.MANAGER}?${new URLSearchParams(params)}`,
    getExecutiveDashboard: (params) => `${API_ENDPOINTS.DASHBOARD.EXECUTIVE}?${new URLSearchParams(params)}`,
    getChampionDashboard: (params) => `${API_ENDPOINTS.DASHBOARD.CHAMPION}?${new URLSearchParams(params)}`,

    // Analytics
    getKPISummaries: (params) => `${API_ENDPOINTS.ANALYTICS.KPI_SUMMARIES}?${new URLSearchParams(params)}`,
    getDepartmentRollups: (params) => `${API_ENDPOINTS.ANALYTICS.DEPARTMENT_ROLLUPS}?${new URLSearchParams(params)}`,
    getOrganizationHealth: (params) => `${API_ENDPOINTS.ANALYTICS.ORGANIZATION_HEALTH_CURRENT}?${new URLSearchParams(params)}`,
    getHeatmap: (params) => `${API_ENDPOINTS.ANALYTICS.HEATMAP}?${new URLSearchParams(params)}`,
    getInsights: (params) => `${API_ENDPOINTS.ANALYTICS.INSIGHTS}?${new URLSearchParams(params)}`,
    getPredictions: () => API_ENDPOINTS.ANALYTICS.PREDICTIONS,

    // Custom Reports
    createCustomReport: () => API_ENDPOINTS.CUSTOM_REPORT.CREATE,
    getReportStatus: (taskId) => API_ENDPOINTS.CUSTOM_REPORT.STATUS(taskId),
    downloadReport: (reportId) => API_ENDPOINTS.CUSTOM_REPORT.DOWNLOAD(reportId),

    // Notifications
    getNotificationPreferences: () => API_ENDPOINTS.NOTIFICATION.PREFERENCES,
    updateNotificationPreferences: () => API_ENDPOINTS.NOTIFICATION.PREFERENCES_UPDATE,

    // Bulk Operations
    bulkUploadKPIs: () => API_ENDPOINTS.BULK.KPI_UPLOAD,
    bulkUploadActuals: () => API_ENDPOINTS.BULK.ACTUAL_UPLOAD,
    bulkUploadTargets: () => API_ENDPOINTS.BULK.TARGET_UPLOAD,
    downloadTemplate: (type) => API_ENDPOINTS.BULK.TEMPLATE(type),

    // Calculations
    triggerCalculation: () => API_ENDPOINTS.CALCULATION.TRIGGER,
    getCalculationStatus: (taskId) => API_ENDPOINTS.CALCULATION.STATUS(taskId),

    // Exports
    exportKPIs: (params) => `${API_ENDPOINTS.EXPORT.KPIS}?${new URLSearchParams(params)}`,
    exportScores: (params) => `${API_ENDPOINTS.EXPORT.SCORES}?${new URLSearchParams(params)}`,
    exportReport: (params) => `${API_ENDPOINTS.EXPORT.REPORTS}?${new URLSearchParams(params)}`,

    // System Settings
    getSystemSettings: () => API_ENDPOINTS.SYSTEM_SETTINGS.KPI,
    updateSystemSettings: () => API_ENDPOINTS.SYSTEM_SETTINGS.KPI,
    resetSystemSettings: () => API_ENDPOINTS.SYSTEM_SETTINGS.KPI_RESET,
    getReferenceData: () => API_ENDPOINTS.SYSTEM_SETTINGS.REFERENCE_DATA,
};

// Export billing constants (keeping existing imports)
export * from './reviewApiConstants';
export * from './reviewRouteConstants';
export * from './reviewConstants';
export * from './reviewStatusConstants';

// Resolve conflicting exports by exporting them explicitly from the preferred module
export {
  REVIEW_CYCLE_STATUS,
  REVIEW_CYCLE_STATUS_LABELS,
  REVIEW_CYCLE_TYPES,
  REVIEW_CYCLE_TYPE_LABELS,
  REVIEW_PIP_SEVERITY,
  REVIEW_PIP_SEVERITY_LABELS,
  REVIEW_PIP_ACTION_STATUS,
  REVIEW_PIP_ACTION_STATUS_LABELS,
} from './reviewStatusConstants';

