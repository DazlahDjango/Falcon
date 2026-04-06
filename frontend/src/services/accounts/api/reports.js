import { request } from './client';

// Organization Reports
// ========================
export const getOrganizationStats = (range = 'month') => {
    return request.get('/reports/organization/stats/', { params: { range } });
};
export const getDepartmentPerformance = () => {
    return request.get('/reports/department-performance/');
};
export const getExecutiveKPIs = () => {
    return request.get('/reports/executive-kpis/');
};
export const getOrganizationActivities = (params = {}) => {
    return request.get('/reports/activities/', { params });
};

// Performance Reports
// =======================
export const getUserPerformanceReport = (userId, params = {}) => {
    return request.get(`/reports/users/${userId}/performance/`, { params });
};
export const getTeamPerformanceReport = (params = {}) => {
    return request.get('/reports/team-performance/', { params });
};
export const getKPITrendAnalysis = (kpiId, params = {}) => {
    return request.get(`/reports/kpi/${kpiId}/trend/`, { params });
};

// Export Reports
// =================
export const exportToPDF = (reportType, params = {}) => {
    return request.post(`/reports/export/pdf/`, { report_type: reportType, ...params }, {
        responseType: 'blob'
    });
};

/**
 * Export report to Excel
 * @param {string} reportType - Type of report
 * @param {Object} params - Report parameters
 * @returns {Promise}
 */
export const exportToExcel = (reportType, params = {}) => {
    return request.post(`/reports/export/excel/`, { report_type: reportType, ...params }, {
        responseType: 'blob'
    });
};

/**
 * Export report to CSV
 * @param {string} reportType - Type of report
 * @param {Object} params - Report parameters
 * @returns {Promise}
 */
export const exportToCSV = (reportType, params = {}) => {
    return request.post(`/reports/export/csv/`, { report_type: reportType, ...params }, {
        responseType: 'blob'
    });
};

// Dashboard Reports
// ===================
export const getDashboardWidgets = () => {
    return request.get('/reports/dashboard/widgets/');
};
export const getHeatmapData = (params = {}) => {
    return request.get('/reports/heatmap/', { params });
};
export const getTrendAnalysis = (params = {}) => {
    return request.get('/reports/trend-analysis/', { params });
};