import { request } from './client';
import {
  MFA_DEVICE_ENDPOINTS,
  MFA_AUDIT_LOG_ENDPOINTS,
} from '../../../config/constants/accountsApiConstants';

export const getMFADevices = (params) => request.get(MFA_DEVICE_ENDPOINTS.LIST, { params });

export const getMFADevice = (id) => request.get(MFA_DEVICE_ENDPOINTS.DETAIL(id));

export const createMFADevice = (data) => request.post(MFA_DEVICE_ENDPOINTS.CREATE, data);

export const updateMFADevice = (id, data) => request.patch(MFA_DEVICE_ENDPOINTS.UPDATE(id), data);

export const deleteMFADevice = (id) => request.delete(MFA_DEVICE_ENDPOINTS.DELETE(id));

export const setupTOTP = (data) => request.post(MFA_DEVICE_ENDPOINTS.SETUP_TOTP, data);

export const verifyTOTPSetup = (data) =>
  request.post(MFA_DEVICE_ENDPOINTS.VERIFY_TOTP_SETUP, data);

export const verifyDevice = (id, data) =>
  request.post(MFA_DEVICE_ENDPOINTS.VERIFY_DEVICE(id), data);

export const verifyBackupCode = (data) => request.post(MFA_DEVICE_ENDPOINTS.VERIFY_BACKUP, data);

export const generateBackupCodes = (data) =>
  request.post(MFA_DEVICE_ENDPOINTS.GENERATE_BACKUP_CODES, data);

export const getBackupCodesStatus = () => request.get(MFA_DEVICE_ENDPOINTS.BACKUP_CODES_STATUS);

export const setPrimaryDevice = (id, data) =>
  request.post(MFA_DEVICE_ENDPOINTS.SET_PRIMARY(id), data);

export const disableMFA = (data) => request.post(MFA_DEVICE_ENDPOINTS.DISABLE_MFA, data);

export const getMFAStatus = () => request.get(MFA_DEVICE_ENDPOINTS.MFA_STATUS);

export const getMFAActivity = (params) =>
  request.get(MFA_DEVICE_ENDPOINTS.RECENT_ACTIVITY, { params });

export const getMFAFailureRate = (params) =>
  request.get(MFA_DEVICE_ENDPOINTS.FAILURE_RATE, { params });

export const getMFAAuditLogs = (params) => request.get(MFA_AUDIT_LOG_ENDPOINTS.LIST, { params });

export const getMFAAuditLog = (id) => request.get(MFA_AUDIT_LOG_ENDPOINTS.DETAIL(id));

export const getMFAAuditSummary = () => request.get(MFA_AUDIT_LOG_ENDPOINTS.SUMMARY);