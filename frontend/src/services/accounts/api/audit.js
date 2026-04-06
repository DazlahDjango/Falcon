import { request } from './client';

// Audit Logs
// ==============
export const getAuditLogs = (params = {}) => {
    return request.get('/audit-logs/', { params });
};
export const getAuditLogById = (logId) => {
    return request.get(`/audit-logs/${logId}/`);
};

// Audit Reports
// ===============
export const getUserActivity = (userId, days = 30) => {
    return request.get(`/audit-logs/user/${userId}/`, { params: { days } });
};
export const getUserActivitySummary = (days = 30) => {
    return request.get('/audit-logs/user-summary/', { params: { days } });
};
export const getTenantActivitySummary = (days = 30) => {
    return request.get('/audit-logs/tenant-summary/', { params: { days } });
};
export const getSecurityEvents = (days = 30) => {
    return request.get('/audit-logs/security-events/', { params: { days } });
};
export const getObjectHistory = (contentType, objectId) => {
    return request.get('/audit-logs/object-history/', { params: { content_type: contentType, object_id: objectId } });
};
export const exportAuditLogs = (data) => {
    return request.post('/audit-logs/export/', data, {
        responseType: 'blob'
    });
};
export const getComplianceReport = (startDate, endDate) => {
    return request.get('/audit-logs/compliance-report/', { params: { start_date: startDate, end_date: endDate } });
};