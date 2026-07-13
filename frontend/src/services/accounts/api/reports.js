import { request } from './client';

// 1. User Reports
export const getUserDirectoryReport = (params = {}) => {
    return request.get('/reports/user-directory/', { params });
};

export const getRoleDistributionReport = (params = {}) => {
    return request.get('/reports/role-distribution/', { params });
};

export const getDepartmentDistributionReport = (params = {}) => {
    return request.get('/reports/department-distribution/', { params });
};

export const getInactiveUsersReport = (params = {}) => {
    return request.get('/reports/inactive-users/', { params });
};

export const getRecentlyAddedReport = (params = {}) => {
    return request.get('/reports/recently-added/', { params });
};

export const getActivitySummaryReport = (params = {}) => {
    return request.get('/reports/activity-summary/', { params });
};

// 2. Audit & Compliance Reports
export const getAuditTrailReport = (params = {}) => {
    return request.get('/reports/audit-trail/', { params });
};

export const getLoginActivityReport = (params = {}) => {
    return request.get('/reports/login-activity/', { params });
};

export const getPasswordChangesReport = (params = {}) => {
    return request.get('/reports/password-changes/', { params });
};

export const getRoleChangesReport = (params = {}) => {
    return request.get('/reports/role-changes/', { params });
};

export const getSuspensionLogReport = (params = {}) => {
    return request.get('/reports/suspension-log/', { params });
};

export const getComplianceSummaryReport = (params = {}) => {
    return request.get('/reports/compliance-summary/', { params });
};

// 3. Export Helper
export const exportReportFile = (endpoint, format, params = {}) => {
    return request.get(`/reports/${endpoint}/`, {
        params: { ...params, format },
        responseType: 'blob'
    });
};