// ============================================
// KPI API Constants - Following Config App Pattern
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const KPI_API_BASE = `${API_BASE}/kpis/`;
export const API_VERSION = 'v1';
export const KPI_API_PREFIX = `/api/${API_VERSION}/kpis`;

// ============================================
// 1. FRAMEWORK & STRUCTURE ENDPOINTS
// ============================================

export const CATEGORY_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/categories/`,
    DETAIL: (id) => `${API_BASE}/kpis/categories/${id}/`,
    CREATE: `${API_BASE}/kpis/categories/`,
    UPDATE: (id) => `${API_BASE}/kpis/categories/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/categories/${id}/`,
    CHILDREN: (id) => `${API_BASE}/kpis/categories/${id}/children/`,
    KPIS: (id) => `${API_BASE}/kpis/categories/${id}/kpis/`,
    MOVE: (id) => `${API_BASE}/kpis/categories/${id}/move/`,
    REORDER: `${API_BASE}/kpis/categories/reorder/`,
    QUERY_PARAMS: { CATEGORY_TYPE: 'category_type', IS_ACTIVE: 'is_active', PARENT: 'parent' },
};

// ============================================
// 2. KPI DEFINITION ENDPOINTS
// ============================================

export const KPI_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/kpis/`,
    DETAIL: (id) => `${API_BASE}/kpis/kpis/${id}/`,
    CREATE: `${API_BASE}/kpis/kpis/`,
    UPDATE: (id) => `${API_BASE}/kpis/kpis/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/kpis/${id}/`,
    ACTIVATE: (id) => `${API_BASE}/kpis/kpis/${id}/activate/`,
    DEACTIVATE: (id) => `${API_BASE}/kpis/kpis/${id}/deactivate/`,
    VALIDATE: (id) => `${API_BASE}/kpis/kpis/${id}/validate/`,
    WEIGHTS: (id) => `${API_BASE}/kpis/kpis/${id}/weights/`,
    TARGETS: (id) => `${API_BASE}/kpis/kpis/${id}/targets/`,
    SCORES: (id) => `${API_BASE}/kpis/kpis/${id}/scores/`,
    STRATEGIC_LINKAGES: (id) => `${API_BASE}/kpis/kpis/${id}/strategic-linkages/`,
    DEPENDENCIES: (id) => `${API_BASE}/kpis/kpis/${id}/dependencies/`,
    QUERY_PARAMS: {
        CATEGORY: 'category',
        KPI_TYPE: 'kpi_type', IS_ACTIVE: 'is_active', OWNER: 'owner',
        CALCULATION_LOGIC: 'calculation_logic', MEASURE_TYPE: 'measure_type'
    },
};

export const KPI_WEIGHT_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/kpi-weights/`,
    DETAIL: (id) => `${API_BASE}/kpis/kpi-weights/${id}/`,
    CREATE: `${API_BASE}/kpis/kpi-weights/`,
    UPDATE: (id) => `${API_BASE}/kpis/kpi-weights/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/kpi-weights/${id}/`,
    VALIDATE_SUM: `${API_BASE}/kpis/kpi-weights/validate_sum/`,
    QUERY_PARAMS: { KPI: 'kpi', USER: 'user', IS_ACTIVE: 'is_active' },
};

export const STRATEGIC_LINKAGE_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/strategic-linkages/`,
    DETAIL: (id) => `${API_BASE}/kpis/strategic-linkages/${id}/`,
    CREATE: `${API_BASE}/kpis/strategic-linkages/`,
    UPDATE: (id) => `${API_BASE}/kpis/strategic-linkages/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/strategic-linkages/${id}/`,
    QUERY_PARAMS: { KPI: 'kpi', LINKAGE_TYPE: 'linkage_type' },
};

export const KPI_DEPENDENCY_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/kpi-dependencies/`,
    DETAIL: (id) => `${API_BASE}/kpis/kpi-dependencies/${id}/`,
    CREATE: `${API_BASE}/kpis/kpi-dependencies/`,
    UPDATE: (id) => `${API_BASE}/kpis/kpi-dependencies/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/kpi-dependencies/${id}/`,
    IMPACT_CHAIN: (id) => `${API_BASE}/kpis/kpi-dependencies/${id}/impact_chain/`,
    QUERY_PARAMS: { SOURCE_KPI: 'source_kpi', TARGET_KPI: 'target_kpi', DEPENDENCY_TYPE: 'dependency_type', IS_ACTIVE: 'is_active' },
};

// ============================================
// 3. TARGET MANAGEMENT ENDPOINTS
// ============================================

export const TARGET_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/targets/`,
    DETAIL: (id) => `${API_BASE}/kpis/targets/${id}/`,
    CREATE: `${API_BASE}/kpis/targets/`,
    UPDATE: (id) => `${API_BASE}/kpis/targets/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/targets/${id}/`,
    PHASE: (id) => `${API_BASE}/kpis/targets/${id}/phase/`,
    BULK_PHASE: `${API_BASE}/kpis/targets/bulk_phase/`,
    PHASING: (id) => `${API_BASE}/kpis/targets/${id}/phasing/`,
    VALIDATE: (id) => `${API_BASE}/kpis/targets/${id}/validate/`,
    QUERY_PARAMS: { KPI: 'kpi', USER: 'user', YEAR: 'year' },
};

export const MONTHLY_PHASING_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/monthly-phasing/`,
    DETAIL: (id) => `${API_BASE}/kpis/monthly-phasing/${id}/`,
    UPDATE: (id) => `${API_BASE}/kpis/monthly-phasing/${id}/`,
    LOCK: (id) => `${API_BASE}/kpis/monthly-phasing/${id}/lock/`,
    LOCK_CYCLE: `${API_BASE}/kpis/monthly-phasing/lock_cycle/`,
    UNLOCK_CYCLE: `${API_BASE}/kpis/monthly-phasing/unlock_cycle/`,
    BULK_UPDATE: `${API_BASE}/kpis/monthly-phasing/bulk_update/`,
    QUERY_PARAMS: { ANNUAL_TARGET: 'annual_target', MONTH: 'month', IS_LOCKED: 'is_locked' },
};

export const CASCADE_ENDPOINTS = {
    RULES: `${API_BASE}/kpis/cascade-rules/`,
    RULE_DETAIL: (id) => `${API_BASE}/kpis/cascade-rules/${id}/`,
    RULE_CREATE: `${API_BASE}/kpis/cascade-rules/`,
    RULE_UPDATE: (id) => `${API_BASE}/kpis/cascade-rules/${id}/`,
    RULE_DELETE: (id) => `${API_BASE}/kpis/cascade-rules/${id}/`,
    SET_DEFAULT_RULE: (id) => `${API_BASE}/kpis/cascade-rules/${id}/set_default/`,
    MAPS: `${API_BASE}/kpis/cascade-maps/`,
    MAP_DETAIL: (id) => `${API_BASE}/kpis/cascade-maps/${id}/`,
    MAP_CREATE: `${API_BASE}/kpis/cascade-maps/`,
    CASCADE_DEPARTMENT: `${API_BASE}/kpis/cascade-maps/cascade_department/`,
    TREE: `${API_BASE}/kpis/cascade-maps/tree/`,
    REPAIR: `${API_BASE}/kpis/cascade-maps/repair/`,
    CONTRIBUTORS: `${API_BASE}/kpis/cascade-maps/contributors/`,
    USER_CONTRIBUTIONS: `${API_BASE}/kpis/cascade-maps/user_contributions/`,
    ROLLBACK: (id) => `${API_BASE}/kpis/cascade-maps/${id}/rollback/`,
    ROLLBACK_ORGANIZATION: `${API_BASE}/kpis/cascade-maps/rollback_organization/`,
    VERIFY_INTEGRITY: `${API_BASE}/kpis/cascade-maps/verify_integrity/`,
    QUERY_PARAMS: { RULE_TYPE: 'rule_type', IS_ACTIVE: 'is_active', IS_DEFAULT: 'is_default' },
};


// ============================================
// 4. ACTUAL DATA ENDPOINTS
// ============================================

export const ACTUAL_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/actuals/`,
    DETAIL: (id) => `${API_BASE}/kpis/actuals/${id}/`,
    CREATE: `${API_BASE}/kpis/actuals/`,
    UPDATE: (id) => `${API_BASE}/kpis/actuals/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/actuals/${id}/`,
    SUBMIT: (id) => `${API_BASE}/kpis/actuals/${id}/submit/`,
    APPROVE: (id) => `${API_BASE}/kpis/actuals/${id}/approve/`,
    REJECT: (id) => `${API_BASE}/kpis/actuals/${id}/reject/`,
    RESUBMIT: (id) => `${API_BASE}/kpis/actuals/${id}/resubmit/`,
    EVIDENCE: (id) => `${API_BASE}/kpis/actuals/${id}/evidence/`,
    VALIDATIONS: (id) => `${API_BASE}/kpis/actuals/${id}/validations/`,
    QUERY_PARAMS: { KPI: 'kpi', USER: 'user', YEAR: 'year', MONTH: 'month', STATUS: 'status' },
};

export const EVIDENCE_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/evidence/`,
    DETAIL: (id) => `${API_BASE}/kpis/evidence/${id}/`,
    CREATE: `${API_BASE}/kpis/evidence/`,
    DELETE: (id) => `${API_BASE}/kpis/evidence/${id}/`,
    QUERY_PARAMS: { ACTUAL: 'actual', EVIDENCE_TYPE: 'evidence_type' },
};

export const ACTUAL_ADJUSTMENT_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/actual-adjustments/`,
    DETAIL: (id) => `${API_BASE}/kpis/actual-adjustments/${id}/`,
    CREATE: `${API_BASE}/kpis/actual-adjustments/`,
    APPROVE: (id) => `${API_BASE}/kpis/actual-adjustments/${id}/approve/`,
    QUERY_PARAMS: { STATUS: 'status', REQUESTED_BY: 'requested_by' },
};

// ============================================
// 5. VALIDATION & ESCALATION ENDPOINTS
// ============================================

export const VALIDATION_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/validations/`,
    DETAIL: (id) => `${API_BASE}/kpis/validations/${id}/`,
    PENDING: `${API_BASE}/kpis/validations/pending/`,
    PENDING_SUMMARY: `${API_BASE}/kpis/validations/pending-summary/`,
    QUERY_PARAMS: { ACTUAL: 'actual', STATUS: 'status', VALIDATED_BY: 'validated_by' },
};

export const REJECTION_REASON_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/rejection-reasons/`,
    DETAIL: (id) => `${API_BASE}/kpis/rejection-reasons/${id}/`,
    CREATE: `${API_BASE}/kpis/rejection-reasons/`,
    UPDATE: (id) => `${API_BASE}/kpis/rejection-reasons/${id}/`,
    DELETE: (id) => `${API_BASE}/kpis/rejection-reasons/${id}/`,
    QUERY_PARAMS: { CATEGORY: 'category', IS_ACTIVE: 'is_active' },
};

export const ESCALATION_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/escalations/`,
    DETAIL: (id) => `${API_BASE}/kpis/escalations/${id}/`,
    CREATE: `${API_BASE}/kpis/escalations/`,
    RESOLVE: (id) => `${API_BASE}/kpis/escalations/${id}/resolve/`,
    MY_ESCALATIONS: `${API_BASE}/kpis/escalations/my_escalations/`,
    QUERY_PARAMS: { STATUS: 'status', ESCALATED_TO: 'escalated_to' },
};

// ============================================
// 6. SCORES & TRAFFIC LIGHTS ENDPOINTS
// ============================================

export const SCORE_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/scores/`,
    DETAIL: (id) => `${API_BASE}/kpis/scores/${id}/`,
    MY_SCORES: `${API_BASE}/kpis/scores/my_scores/`,
    TEAM_SCORES: `${API_BASE}/kpis/scores/team_scores/`,
    STATISTICS: `${API_BASE}/kpis/scores/statistics/`,
    QUERY_PARAMS: { KPI: 'kpi', USER: 'user', YEAR: 'year', MONTH: 'month' },
};

export const AGGREGATED_SCORE_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/aggregated-scores/`,
    DETAIL: (id) => `${API_BASE}/kpis/aggregated-scores/${id}/`,
    ORGANIZATION: `${API_BASE}/kpis/aggregated-scores/organization/`,
    DEPARTMENTS: `${API_BASE}/kpis/aggregated-scores/departments/`,
    RANKING: `${API_BASE}/kpis/aggregated-scores/ranking/`,
    QUERY_PARAMS: { LEVEL: 'level', ENTITY_ID: 'entity_id', YEAR: 'year', MONTH: 'month' },
};

export const TRAFFIC_LIGHT_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/traffic-lights/`,
    DETAIL: (id) => `${API_BASE}/kpis/traffic-lights/${id}/`,
    RED_ALERTS: `${API_BASE}/kpis/traffic-lights/red_alerts/`,
    MY_RED_ALERTS: `${API_BASE}/kpis/traffic-lights/my_red_alerts/`,
    QUERY_PARAMS: { STATUS: 'status' },
};

// ============================================
// 7. DASHBOARD ENDPOINTS
// ============================================

export const DASHBOARD_ENDPOINTS = {
    INDIVIDUAL: `${API_BASE}/kpis/dashboard/individual/`,
    MANAGER: `${API_BASE}/kpis/dashboard/manager/`,
    EXECUTIVE: `${API_BASE}/kpis/dashboard/executive/`,
    CHAMPION: `${API_BASE}/kpis/dashboard/champion/`,
    ADMIN_OVERVIEW: `${API_BASE}/kpis/admin/overview/`,
    QUERY_PARAMS: { YEAR: 'year', MONTH: 'month' },
};

// ============================================
// 8. ANALYTICS & REPORTS ENDPOINTS
// ============================================

export const KPI_SUMMARY_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/kpi-summaries/`,
    DETAIL: (id) => `${API_BASE}/kpis/kpi-summaries/${id}/`,
    BY_SECTOR: `${API_BASE}/kpis/kpi-summaries/by_sector/`,
    QUERY_PARAMS: { YEAR: 'year', MONTH: 'month' },
};

export const DEPARTMENT_ROLLUP_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/department-rollups/`,
    DETAIL: (id) => `${API_BASE}/kpis/department-rollups/${id}/`,
    RANKING: `${API_BASE}/kpis/department-rollups/ranking/`,
    QUERY_PARAMS: { YEAR: 'year', MONTH: 'month' },
};

export const ORGANIZATION_HEALTH_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/organization-health/`,
    DETAIL: (id) => `${API_BASE}/kpis/organization-health/${id}/`,
    CURRENT: `${API_BASE}/kpis/organization-health/current/`,
    HISTORY: `${API_BASE}/kpis/organization-health/history/`,
    QUERY_PARAMS: { YEAR: 'year', MONTH: 'month', MONTHS: 'months' },
};

export const ANALYTICS_ENDPOINTS = {
    INSIGHTS: `${API_BASE}/kpis/analytics/insights/`,
    PREDICTIONS: `${API_BASE}/kpis/analytics/predictions/`,
    HEATMAP: `${API_BASE}/kpis/analytics/heatmap/`,
    EXPORT: `${API_BASE}/kpis/analytics/export/`,
    QUERY_PARAMS: { YEAR: 'year', MONTH: 'month' },
};

export const CUSTOM_REPORT_ENDPOINTS = {
    CREATE: `${API_BASE}/kpis/reports/custom/`,
    STATUS: (taskId) => `${API_BASE}/kpis/reports/custom/status/${taskId}/`,
    DOWNLOAD: (reportId) => `${API_BASE}/kpis/reports/custom/${reportId}/download/`,
};

// ============================================
// 9. USER NESTED ENDPOINTS
// ============================================

export const USER_NESTED_ENDPOINTS = {
    KPI: (userId) => `${API_BASE}/kpis/users/${userId}/kpis/`,
    TARGETS: (userId) => `${API_BASE}/kpis/users/${userId}/targets/`,
    SCORES: (userId) => `${API_BASE}/kpis/users/${userId}/scores/`,
    ACTUALS: (userId) => `${API_BASE}/kpis/users/${userId}/actuals/`,
};

// ============================================
// 10. BULK OPERATIONS ENDPOINTS
// ============================================

export const BULK_ENDPOINTS = {
    KPI_UPLOAD: `${API_BASE}/kpis/bulk/kpi-upload/`,
    ACTUAL_UPLOAD: `${API_BASE}/kpis/bulk/actual-upload/`,
    TARGET_UPLOAD: `${API_BASE}/kpis/bulk/target-upload/`,
    TEMPLATE: (type) => `${API_BASE}/kpis/bulk/templates/${type}/`,
    VALIDATE: `${API_BASE}/kpis/bulk/validate/`,
};

// ============================================
// 11. CALCULATION & TASKS ENDPOINTS
// ============================================

export const CALCULATION_ENDPOINTS = {
    TRIGGER: `${API_BASE}/kpis/calculations/trigger/`,
    STATUS: (taskId) => `${API_BASE}/kpis/calculations/status/${taskId}/`,
    SCHEDULE: `${API_BASE}/kpis/calculations/schedule/`,
    QUERY_PARAMS: { YEAR: 'year', MONTH: 'month', FORCE: 'force' },
};

// ============================================
// 12. HISTORY & AUDIT ENDPOINTS
// ============================================

export const HISTORY_ENDPOINTS = {
    KPI: `${API_BASE}/kpis/kpi-history/`,
    ACTUAL: `${API_BASE}/kpis/actual-history/`,
    TARGET: `${API_BASE}/kpis/target-history/`,
    FOR_KPI: (kpiId) => `${API_BASE}/kpis/kpi-history/for_kpi/?kpi_id=${kpiId}`,
    FOR_ACTUAL: (actualId) => `${API_BASE}/kpis/actual-history/for_actual/?actual_id=${actualId}`,
    FOR_TARGET: (targetId) => `${API_BASE}/kpis/target-history/for_target/?target_id=${targetId}`,
    QUERY_PARAMS: { ACTION: 'action', PERFORMED_BY: 'performed_by' },
};

// ============================================
// 13. EXPORT ENDPOINTS
// ============================================

export const EXPORT_ENDPOINTS = {
    KPIS: `${API_BASE}/kpis/export/kpis/`,
    SCORES: `${API_BASE}/kpis/export/scores/`,
    REPORTS: `${API_BASE}/kpis/export/reports/`,
    DEPARTMENT_REPORT: `${API_BASE}/kpis/export/department-report/`,
    KPI_DETAIL: `${API_BASE}/kpis/export/kpi-detail/`,
    QUERY_PARAMS: { FORMAT: 'format', YEAR: 'year', MONTH: 'month', FRAMEWORK_ID: 'framework_id' },
};

// ============================================
// 14. SYSTEM & REFERENCE ENDPOINTS
// ============================================

export const SYSTEM_SETTINGS_ENDPOINTS = {
    KPI: `${API_BASE}/kpis/system-settings/`,
    RESET: `${API_BASE}/kpis/system-settings/reset/`,
};

export const REFERENCE_DATA_ENDPOINTS = {
    GET: `${API_BASE}/kpis/reference-data/`,
    QUERY_PARAMS: { INCLUDE: 'include' },
};

export const NOTIFICATION_PREFERENCES_ENDPOINTS = {
    GET: `${API_BASE}/kpis/notifications/preferences/`,
    UPDATE: `${API_BASE}/kpis/notifications/preferences/`,
};

// ============================================
// 15. USER ENDPOINTS (KPI-specific user views)
// ============================================

export const USER_ENDPOINTS = {
    LIST: `${API_BASE}/kpis/users/`,
    DETAIL: (id) => `${API_BASE}/kpis/users/${id}/`,
    QUERY_PARAMS: { IS_ACTIVE: 'is_active', ROLE: 'role' },
};

// ============================================
// WEBSOCKET ENDPOINTS
// ============================================

export const KPI_WS = {
    DASHBOARD: (userId) => `${WS_BASE}/kpi/dashboard/${userId}/`,
    TEAM: (managerId) => `${WS_BASE}/kpi/team/${managerId}/`,
    EXECUTIVE: (tenantId) => `${WS_BASE}/kpi/executive/${tenantId}/`,
    NOTIFICATIONS: (userId) => `${WS_BASE}/kpi/notifications/${userId}/`,
    SCORES: (userId) => `${WS_BASE}/kpi/scores/${userId}/`,
    VALIDATION: (userId) => `${WS_BASE}/kpi/validation/${userId}/`,
    REPORTS: (reportId) => `${WS_BASE}/kpi/reports/${reportId}/`,
    ANALYTICS: (tenantId) => `${WS_BASE}/kpi/analytics/${tenantId}/`,
    ALERTS: (tenantId) => `${WS_BASE}/kpi/alerts/${tenantId}/`,
    ADMIN: `${WS_BASE}/kpi/admin/`,
};

// ============================================
// API STATUS & HTTP CONSTANTS
// ============================================

export const API_STATUS = { SUCCESS: 'success', ERROR: 'error', PENDING: 'pending' };

export const HTTP_STATUS = {
    OK: 200, CREATED: 201, ACCEPTED: 202, NO_CONTENT: 204,
    BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429, INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// KPI ERROR CODES
// ============================================

export const KPI_ERROR_CODES = {
    DUPLICATE_CODE: 'DUPLICATE_KPI_CODE',
    INVALID_FRAMEWORK: 'INVALID_FRAMEWORK',
    PHASING_LOCKED: 'PHASING_LOCKED',
    DUPLICATE_PHASING: 'DUPLICATE_PHASING',
    HISTORICAL_DATA_ERROR: 'HISTORICAL_DATA_ERROR',
    EVIDENCE_UPLOAD_ERROR: 'EVIDENCE_UPLOAD_ERROR',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    WEIGHT_SUM_INVALID: 'WEIGHT_SUM_INVALID',
    CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
    TENANT_ISOLATION_ERROR: 'TENANT_ISOLATION_ERROR',
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    KPI_API_BASE,
    API_VERSION,
    KPI_API_PREFIX,
    CATEGORY_ENDPOINTS,
    KPI_ENDPOINTS,
    KPI_WEIGHT_ENDPOINTS,
    STRATEGIC_LINKAGE_ENDPOINTS,
    KPI_DEPENDENCY_ENDPOINTS,
    TARGET_ENDPOINTS,
    MONTHLY_PHASING_ENDPOINTS,
    CASCADE_ENDPOINTS,
    ACTUAL_ENDPOINTS,
    EVIDENCE_ENDPOINTS,
    ACTUAL_ADJUSTMENT_ENDPOINTS,
    VALIDATION_ENDPOINTS,
    REJECTION_REASON_ENDPOINTS,
    ESCALATION_ENDPOINTS,
    SCORE_ENDPOINTS,
    AGGREGATED_SCORE_ENDPOINTS,
    TRAFFIC_LIGHT_ENDPOINTS,
    DASHBOARD_ENDPOINTS,
    KPI_SUMMARY_ENDPOINTS,
    DEPARTMENT_ROLLUP_ENDPOINTS,
    ORGANIZATION_HEALTH_ENDPOINTS,
    ANALYTICS_ENDPOINTS,
    CUSTOM_REPORT_ENDPOINTS,
    USER_NESTED_ENDPOINTS,
    BULK_ENDPOINTS,
    CALCULATION_ENDPOINTS,
    HISTORY_ENDPOINTS,
    EXPORT_ENDPOINTS,
    SYSTEM_SETTINGS_ENDPOINTS,
    REFERENCE_DATA_ENDPOINTS,
    NOTIFICATION_PREFERENCES_ENDPOINTS,
    USER_ENDPOINTS,
    KPI_WS,
    API_STATUS,
    HTTP_STATUS,
    KPI_ERROR_CODES,
};