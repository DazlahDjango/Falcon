/**
 * API Endpoints - Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    REGISTER: '/auth/register/',
    VERIFY_EMAIL: '/auth/verify-email/',
    RESEND_VERIFICATION: '/auth/resend-verification/',
    FORGOT_PASSWORD: '/auth/password-reset/',
    RESET_PASSWORD: '/auth/password-reset/confirm/',
    CHANGE_PASSWORD: '/auth/change-password/',
    // MFA
    MFA_SETUP: '/auth/mfa/setup/',
    MFA_VERIFY: '/auth/mfa/verify/',
    MFA_VERIFY_SETUP: '/auth/mfa/verify-setup/',
    MFA_DISABLE: '/auth/mfa/disable/',
    MFA_DEVICES: '/auth/mfa/devices/',
    MFA_BACKUP_CODES: '/auth/mfa/backup-codes/',
    // Invitations
    INVITATIONS: '/auth/invitations/',
    ACCEPT_INVITATION: '/auth/invitations/accept/',
    // Users
    USERS: '/users/',
    USER_DETAIL: '/users/{id}/',
    USER_ME: '/users/me/',
    USER_AVATAR: '/users/me/avatar/',
    USER_TEAM: '/users/me/team/',
    USER_REPORTING_CHAIN: '/users/me/reporting-chain/',
    // Roles
    ROLES: '/roles/',
    ROLE_DETAIL: '/roles/{id}/',
    ROLE_SYSTEM: '/roles/system/',
    ROLE_ASSIGNABLE: '/roles/assignable/',
    ROLE_PERMISSIONS: '/roles/{id}/permissions/',
    // Permissions
    PERMISSIONS: '/permissions/',
    // Sessions
    SESSIONS: '/sessions/',
    SESSIONS_ACTIVE: '/sessions/active/',
    SESSIONS_CURRENT: '/sessions/current/',
    SESSIONS_TERMINATE_ALL: '/sessions/terminate-all/',
    // Dashboard
    INDIVIDUAL_DASHBOARD: '/dashboard/individual/',
    MANAGER_DASHBOARD: '/dashboard/manager/',
    EXECUTIVE_DASHBOARD: '/dashboard/executive/',
    CHAMPION_DASHBOARD: '/dashboard/champion/',
    // KPI
    KPI_LIST: '/kpis/kpis/',
    KPI_DETAIL: '/kpis/kpis/{id}/',
    KPI_CREATE: '/kpis/kpis/',
    KPI_UPDATE: '/kpis/kpis/{id}/',
    KPI_DELETE: '/kpis/kpis/{id}/',
    KPI_ACTIVATE: '/kpis/kpis/{id}/activate/',
    KPI_DEACTIVATE: '/kpis/kpis/{id}/deactivate/',
    KPI_VALIDATE: '/kpis/kpis/{id}/validate/',
    KPI_WEIGHTS: '/kpis/kpis/{id}/weights/',
    KPI_STRATEGIC_LINKAGES: '/kpis/kpis/{id}/strategic-linkages/',
    KPI_DEPENDENCIES: '/kpis/kpis/{id}/dependencies/',
    // Frameworks
    SECTORS: '/kpis/sectors/',
    FRAMEWORKS: '/kpis/frameworks/',
    CATEGORIES: '/kpis/categories/',
    TEMPLATES: '/kpis/templates/',
    // Targets
    TARGETS: '/kpis/targets/',
    TARGET_DETAIL: '/kpis/targets/{id}/',
    TARGET_PHASING: '/kpis/targets/{id}/phasing/',
    TARGET_VALIDATE: '/kpis/targets/{id}/validate/',
    TARGET_CASCADE: '/kpis/targets/cascade/',
    MONTHLY_PHASING: '/kpis/monthly-phasing/',
    // Actuals
    ACTUALS: '/kpis/actuals/',
    ACTUAL_DETAIL: '/kpis/actuals/{id}/',
    ACTUAL_SUBMIT: '/kpis/actuals/{id}/submit/',
    ACTUAL_APPROVE: '/kpis/actuals/{id}/approve/',
    ACTUAL_REJECT: '/kpis/actuals/{id}/reject/',
    ACTUAL_EVIDENCE: '/kpis/actuals/{id}/evidence/',
    // Scores
    SCORES: '/kpis/scores/',
    SCORE_DETAIL: '/kpis/scores/{id}/',
    AGGREGATED_SCORES: '/kpis/aggregated-scores/',
    TRAFFIC_LIGHTS: '/kpis/traffic-lights/',
    // Organisations
    ORGANISATIONS: '/organisations/',
    ORGANISATION_CURRENT: '/organisations/current/',
    ORGANISATION_SETTINGS: '/organisations/settings/',
    ORGANISATION_BRANDING: '/organisations/branding/',
    ORGANISATION_USERS: '/organisations/users/',
    ORGANISATION_TEAMS: '/organisations/teams/',
    ORGANISATION_DEPARTMENTS: '/organisations/departments/',
    ORGANISATION_POSITIONS: '/organisations/positions/',
    ORGANISATION_SUBSCRIPTION: '/organisations/subscription/',
    // Admin
    ADMIN_USERS: '/admin/users/',
    ADMIN_TENANTS: '/admin/tenants/',
    ADMIN_SYSTEM: '/admin/system/',
    ADMIN_CLEAR_CACHE: '/admin/system/clear-cache/',
    ADMIN_SYSTEM_HEALTH: '/admin/system/health/',
    // Audit
    AUDIT_LOGS: '/audit-logs/',
    AUDIT_EXPORT: '/audit-logs/export/',
    AUDIT_COMPLIANCE: '/audit-logs/compliance-report/',
    // Bulk Operations
    BULK_KPI_UPLOAD: '/bulk/kpi-upload/',
    BULK_ACTUAL_UPLOAD: '/bulk/actual-upload/',
    BULK_TARGET_UPLOAD: '/bulk/target-upload/',
    // Calculations
    CALCULATIONS_TRIGGER: '/calculations/trigger/',
    CALCULATIONS_STATUS: '/calculations/status/{taskId}/',
    // Exports
    EXPORT_KPIS: '/export/kpis/',
    EXPORT_SCORES: '/export/scores/',
    EXPORT_REPORTS: '/export/reports/',
};

// // Reviews
//     REVIEWS: '/reviews/',
//     REVIEW_DETAIL: '/reviews/{id}/',
//     REVIEW_APPROVE: '/reviews/{id}/approve/',
//     REVIEW_SELF_ASSESSMENT: '/reviews/self-assessment/',
//     SUPERVISOR_EVALUATION: '/reviews/supervisor/',
//     PIP_LIST: '/reviews/pip/',
//     PIP_DETAIL: '/reviews/pip/{id}/',
    
//     // Missions
//     MISSIONS: '/missions/',
//     MISSION_DETAIL: '/missions/{id}/',
//     MISSION_EXPORT: '/missions/export/',
    
//     // Workflows
//     WORKFLOWS: '/workflows/',
//     VALIDATIONS: '/workflows/validations/',
//     ESCALATIONS: '/workflows/escalations/',
//     WORKFLOW_TASKS: '/workflows/tasks/',
    
//     // Analytics
//     ANALYTICS_INSIGHTS: '/analytics/insights/',
//     PREDICTIONS: '/analytics/predictions/',
//     TRENDS: '/analytics/trends/',
//     ANOMALIES: '/analytics/anomalies/',
    
//     // Reports
//     REPORTS: '/reports/',
//     REPORT_EXPORT: '/reports/export/',
//     SCHEDULED_REPORTS: '/reports/scheduled/',
// // Tenants (Super Admin)
//     TENANTS: '/tenants/',
//     TENANT_DETAIL: '/tenants/{id}/',
//     TENANT_CREATE: '/tenants/',
//     TENANT_UPDATE: '/tenants/{id}/',
//     TENANT_DELETE: '/tenants/{id}/',
    
//     // ML
//     ML_MODELS: '/ml/models/',
//     ML_PREDICTIONS: '/ml/predictions/',
//     ML_TRAINING: '/ml/training/',
//     ML_PERFORMANCE: '/ml/performance/',   