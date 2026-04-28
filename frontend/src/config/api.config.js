import environment from './environment';

const apiConfig = {
    baseURL: environment.API_URL,
    timeout: environment.API_TIMEOUT,
    // Headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    
    // Auth
    authHeaderName: 'Authorization',
    authTokenPrefix: 'Bearer',
    
    // Endpoints
    endpoints: {
        // Auth
        login: '/auth/login/',
        logout: '/auth/logout/',
        refresh: '/auth/refresh/',
        register: '/auth/register/',
        profile: '/auth/profile/',
        passwordReset: '/auth/password-reset/',
        passwordChange: '/auth/password-change/',
        // KPI
        kpis: '/kpis/kpis/',
        kpiDetail: (id) => `/kpis/kpis/${id}/`,
        kpiWeights: (id) => `/kpis/kpis/${id}/weights/`,
        kpiTargets: (id) => `/kpis/kpis/${id}/targets/`,
        kpiScores: (id) => `/kpis/kpis/${id}/scores/`,
        kpiActuals: (id) => `/kpis/kpis/${id}/actuals/`,
        // Frameworks
        sectors: '/kpis/sectors/',
        frameworks: '/kpis/frameworks/',
        categories: '/kpis/categories/',
        templates: '/kpis/templates/',
        // Targets
        targets: '/kpis/targets/',
        targetDetail: (id) => `/kpis/targets/${id}/`,
        targetPhasing: (id) => `/kpis/targets/${id}/phasing/`,
        targetCascade: (id) => `/kpis/targets/${id}/cascade/`,
        // Actuals
        actuals: '/kpis/actuals/',
        actualDetail: (id) => `/kpis/actuals/${id}/`,
        actualEvidence: (id) => `/kpis/actuals/${id}/evidence/`,
        actualValidations: (id) => `/kpis/actuals/${id}/validations/`,
        // Scores
        scores: '/kpis/scores/',
        aggregatedScores: '/kpis/aggregated-scores/',
        trafficLights: '/kpis/traffic-lights/',
        // Validation
        validations: '/kpis/validations/',
        rejectionReasons: 's/kpi/rejection-reasons/',
        escalations: '/kpis/escalations/',
        // Dashboards
        dashboardIndividual: '/kpis/dashboard/individual/',
        dashboardManager: '/kpis/dashboard/manager/',
        dashboardExecutive: '/kpis/dashboard/executive/',
        dashboardChampion: '/kpis/dashboard/champion/',
        // Analytics
        kpiSummaries: '/kpis/kpi-summaries/',
        departmentRollups: '/kpis/department-rollups/',
        organizationHealth: '/kpis/organization-health/',
        // Bulk Operations
        bulkKPIUpload: '/kpis/bulk/kpi-upload/',
        bulkActualUpload: '/kpis/bulk/actual-upload/',
        bulkTargetUpload: '/kpis/bulk/target-upload/',
        // Exports
        exportKPIs: '/kpis/export/kpis/',
        exportScores: '/kpis/export/scores/',
        exportReports: '/kpis/export/reports/',
        // Calculations
        triggerCalculation: '/kpis/calculations/trigger/',
        calculationStatus: (taskId) => `/kpis/calculations/status/${taskId}/`,
    },
    // Retry configuration
    retry: {
        maxRetries: 3,
        retryDelay: 1000,
        retryOnStatus: [500, 502, 503, 504],
    },
    // Rate limiting
    rateLimit: {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
    },
};

export default apiConfig;