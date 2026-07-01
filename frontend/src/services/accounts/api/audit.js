import { request } from './client';
import { AUDIT_LOG_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getAuditLogs = (params) => request.get(AUDIT_LOG_ENDPOINTS.LIST, { params });

export const getAuditLog = (id) => request.get(AUDIT_LOG_ENDPOINTS.DETAIL(id));

export const getUserActivity = (userId, params) =>
  request.get(AUDIT_LOG_ENDPOINTS.USER_ACTIVITY(userId), { params });

export const getUserActivitySummary = (params) =>
  request.get(AUDIT_LOG_ENDPOINTS.USER_SUMMARY, { params });

export const getTenantActivitySummary = (params) =>
  request.get(AUDIT_LOG_ENDPOINTS.TENANT_SUMMARY, { params });

export const getSecurityEvents = (params) =>
  request.get(AUDIT_LOG_ENDPOINTS.SECURITY_EVENTS, { params });

export const getAnomalyDetection = (params) =>
  request.get(AUDIT_LOG_ENDPOINTS.ANOMALY_DETECTION, { params });

export const getComplianceReport = (params) =>
  request.get(AUDIT_LOG_ENDPOINTS.COMPLIANCE_REPORT, { params });

export const getObjectHistory = (params) =>
  request.get(AUDIT_LOG_ENDPOINTS.OBJECT_HISTORY, { params });

export const exportAuditLogs = (data) => request.post(AUDIT_LOG_ENDPOINTS.EXPORT, data);