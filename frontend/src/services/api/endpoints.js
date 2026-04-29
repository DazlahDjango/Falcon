export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1/kpis'

// KPI Endpoints
export const KPI_ENDPOINTS = {
    // Base CRUD
    LIST: '/kpis/',
    DETAIL: (id) => `/kpis/${id}/`,
    CREATE: '/kpis/',
    UPDATE: (id) => `/kpis/${id}/`,
    DELETE: (id) => `/kpis/${id}/`,
    // Actions
    ACTIVATE: (id) => `/kpis/${id}/activate/`,
    DEACTIVATE: (id) => `/kpis/${id}/deactivate/`,
    VALIDATE: (id) => `/kpis/${id}/validate/`,
    // Related resources
    WEIGHTS: (id) => `/kpis/${id}/weights/`,
    TARGETS: (id) => `/kpis/${id}/targets/`,
    SCORES: (id) => `/kpis/${id}/scores/`,
    ACTUALS: (id) => `/kpis/${id}/actuals/`,
    STRATEGIC_LINKAGES: (id) => `/kpis/${id}/strategic-linkages/`,
    DEPENDENCIES: (id) => `/kpis/${id}/dependencies/`,
};
// Framework Endpoints
export const FRAMEWORK_ENDPOINTS = {
    SECTORS: '/sectors/',
    SECTOR_DETAIL: (id) => `/sectors/${id}/`,
    FRAMEWORKS: '/frameworks/',
    FRAMEWORK_DETAIL: (id) => `/frameworks/${id}/`,
    CATEGORIES: '/categories/',
    CATEGORY_DETAIL: (id) => `/categories/${id}/`,
    TEMPLATES: '/templates/',
    TEMPLATE_DETAIL: (id) => `/templates/${id}/`,
    USE_TEMPLATE: (id) => `/templates/${id}/use_template/`,
};
// Target Endpoints
export const TARGET_ENDPOINTS = {
    LIST: '/targets/',
    DETAIL: (id) => `/targets/${id}/`,
    CREATE: '/targets/',
    UPDATE: (id) => `/targets/${id}/`,
    DELETE: (id) => `/targets/${id}/`,
    PHASE: (id) => `/targets/${id}/phase/`,
    PHASING: (id) => `/targets/${id}/phasing/`,
    VALIDATE: (id) => `/targets/${id}/validate/`,
    MONTHLY_PHASING: '/monthly-phasing/',
    LOCK_CYCLE: '/monthly-phasing/lock_cycle/',
};
// Actual Endpoints
export const ACTUAL_ENDPOINTS = {
    LIST: '/actuals/',
    DETAIL: (id) => `/actuals/${id}/`,
    CREATE: '/actuals/',
    UPDATE: (id) => `/actuals/${id}/`,
    DELETE: (id) => `/actuals/${id}/`,
    SUBMIT: (id) => `/actuals/${id}/submit/`,
    APPROVE: (id) => `/actuals/${id}/approve/`,
    REJECT: (id) => `/actuals/${id}/reject/`,
    RESUBMIT: (id) => `/actuals/${id}/resubmit/`,
    EVIDENCE: (id) => `/actuals/${id}/evidence/`,
    VALIDATIONS: (id) => `/actuals/${id}/validations/`,
    EVIDENCE_UPLOAD: '/evidence/',
    ADJUSTMENTS: '/actual-adjustments/',
    ADJUSTMENT_DETAIL: (id) => `/actual-adjustments/${id}/`,
    APPROVE_ADJUSTMENT: (id) => `/actual-adjustments/${id}/approve/`,
};
// Score Endpoints
export const SCORE_ENDPOINTS = {
    LIST: '/scores/',
    DETAIL: (id) => `/scores/${id}/`,
    MY_SCORES: '/scores/my_scores/',
    TEAM_SCORES: '/scores/team_scores/',
    STATISTICS: '/scores/statistics/',
    AGGREGATED: '/aggregated-scores/',
    AGGREGATED_DETAIL: (id) => `/aggregated-scores/${id}/`,
    ORGANIZATION: '/aggregated-scores/organization/',
    DEPARTMENTS: '/aggregated-scores/departments/',
    RANKING: '/aggregated-scores/ranking/',
    TRAFFIC_LIGHTS: '/traffic-lights/',
    RED_ALERTS: '/traffic-lights/red_alerts/',
    MY_RED_ALERTS: '/traffic-lights/my_red_alerts/',
};
// Validation Endpoints
export const VALIDATION_ENDPOINTS = {
    LIST: '/validations/',
    DETAIL: (id) => `/validations/${id}/`,
    PENDING: '/validations/pending/',
    REJECTION_REASONS: '/rejection-reasons/',
    ESCALATIONS: '/escalations/',
    ESCALATION_DETAIL: (id) => `/escalations/${id}/`,
    MY_ESCALATIONS: '/escalations/my_escalations/',
    RESOLVE_ESCALATION: (id) => `/escalations/${id}/resolve/`,
};
// Dashboard Endpoints
export const DASHBOARD_ENDPOINTS = {
    INDIVIDUAL: '/dashboard/individual/',
    MANAGER: '/dashboard/manager/',
    EXECUTIVE: '/dashboard/executive/',
    CHAMPION: '/dashboard/champion/',
};
// Analytics Endpoints
export const ANALYTICS_ENDPOINTS = {
    KPI_SUMMARIES: '/kpi-summaries/',
    DEPARTMENT_ROLLUPS: '/department-rollups/',
    ORGANIZATION_HEALTH: '/organization-health/',
    TRENDS: (kpiId) => `/kpi-summaries/trends/?kpi=${kpiId}`,
    INSIGHTS: '/analytics/insights/',
    PREDICTIONS: '/analytics/predictions/',
};
// Bulk Operations Endpoints
export const BULK_ENDPOINTS = {
    KPI_UPLOAD: '/bulk/kpi-upload/',
    ACTUAL_UPLOAD: '/bulk/actual-upload/',
    TARGET_UPLOAD: '/bulk/target-upload/',
};
// Calculation Endpoints
export const CALCULATION_ENDPOINTS = {
    TRIGGER: '/calculations/trigger/',
    STATUS: (taskId) => `/calculations/status/${taskId}/`,
};
// Export Endpoints
export const EXPORT_ENDPOINTS = {
    KPIS: '/export/kpis/',
    SCORES: '/export/scores/',
    REPORTS: '/export/reports/',
};
// Cascade Endpoints
export const CASCADE_ENDPOINTS = {
    RULES: '/cascade-rules/',
    RULE_DETAIL: (id) => `/cascade-rules/${id}/`,
    MAPS: '/cascade-maps/',
    MAP_DETAIL: (id) => `/cascade-maps/${id}/`,
    CASCADE_DEPARTMENT: '/cascade-maps/cascade_department/',
    TREE: '/cascade-maps/tree/',
    ROLLBACK: (id) => `/cascade-maps/${id}/rollback/`,
    SET_DEFAULT_RULE: (id) => `/cascade-rules/${id}/set_default/`,
};
// History Endpoints
export const HISTORY_ENDPOINTS = {
    KPI: '/kpi-history/',
    ACTUAL: '/actual-history/',
    TARGET: '/target-history/',
    FOR_KPI: (kpiId) => `/kpi-history/for_kpi/?kpi_id=${kpiId}`,
    FOR_ACTUAL: (actualId) => `/actual-history/for_actual/?actual_id=${actualId}`,
    FOR_TARGET: (targetId) => `/target-history/for_target/?target_id=${targetId}`,
};
// KPI Weight Endpoints
export const WEIGHT_ENDPOINTS = {
    LIST: '/kpi-weights/',
    DETAIL: (id) => `/kpi-weights/${id}/`,
    VALIDATE_SUM: '/kpi-weights/validate_sum/',
};
// Strategic Linkage Endpoints
export const LINKAGE_ENDPOINTS = {
    LIST: '/strategic-linkages/',
    DETAIL: (id) => `/strategic-linkages/${id}/`,
};
// KPI Dependency Endpoints
export const DEPENDENCY_ENDPOINTS = {
    LIST: '/kpi-dependencies/',
    DETAIL: (id) => `/kpi-dependencies/${id}/`,
    IMPACT_CHAIN: (id) => `/kpi-dependencies/${id}/impact_chain/`,
};
// Combined export for convenience
export const API_ENDPOINTS = {
    KPI: KPI_ENDPOINTS,
    FRAMEWORK: FRAMEWORK_ENDPOINTS,
    TARGET: TARGET_ENDPOINTS,
    ACTUAL: ACTUAL_ENDPOINTS,
    SCORE: SCORE_ENDPOINTS,
    VALIDATION: VALIDATION_ENDPOINTS,
    DASHBOARD: DASHBOARD_ENDPOINTS,
    ANALYTICS: ANALYTICS_ENDPOINTS,
    BULK: BULK_ENDPOINTS,
    CALCULATION: CALCULATION_ENDPOINTS,
    EXPORT: EXPORT_ENDPOINTS,
    CASCADE: CASCADE_ENDPOINTS,
    HISTORY: HISTORY_ENDPOINTS,
    WEIGHT: WEIGHT_ENDPOINTS,
    LINKAGE: LINKAGE_ENDPOINTS,
    DEPENDENCY: DEPENDENCY_ENDPOINTS,
};