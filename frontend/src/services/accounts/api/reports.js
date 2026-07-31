import { request } from './client';
import { REPORT_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getUserDirectoryReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.USER_DIRECTORY, { params });
};

export const getRoleDistributionReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.ROLE_DISTRIBUTION, { params });
};

export const getDepartmentDistributionReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.DEPARTMENT_DISTRIBUTION, { params });
};

export const getInactiveUsersReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.INACTIVE_USERS, { params });
};

export const getRecentlyAddedReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.RECENTLY_ADDED, { params });
};

export const getActivitySummaryReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.ACTIVITY_SUMMARY, { params });
};

export const getAuditTrailReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.AUDIT_TRAIL, { params });
};

export const getLoginActivityReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.LOGIN_ACTIVITY, { params });
};

export const getPasswordChangesReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.PASSWORD_CHANGES, { params });
};

export const getRoleChangesReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.ROLE_CHANGES, { params });
};

export const getSuspensionLogReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.SUSPENSION_LOG, { params });
};

export const getComplianceSummaryReport = (params = {}) => {
    return request.get(REPORT_ENDPOINTS.COMPLIANCE_SUMMARY, { params });
};

export const exportReportFile = (endpoint, format, params = {}) => {
    return request.get(REPORT_ENDPOINTS.EXPORT(endpoint), {
        params: { ...params, format },
        responseType: 'blob'
    });
};