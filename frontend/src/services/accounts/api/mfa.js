import { request } from './client';

// MFA Devices
// =============
// Device Management
export const getMfaDevices = () => {
    return request.get('/mfa/devices/');
};

export const getMfaDevice = (deviceId) => {
    return request.get(`/mfa/devices/${deviceId}/`);
};

export const createMfaDevice = (data) => {
    return request.post('/mfa/devices/', data);
};

export const updateMfaDevice = (deviceId, data) => {
    return request.patch(`/mfa/devices/${deviceId}/`, data);
};

export const deleteMfaDevice = (deviceId) => {
    return request.delete(`/mfa/devices/${deviceId}/`);
};

export const setPrimaryDevice = (deviceId) => {
    return request.post(`/mfa/devices/${deviceId}/set-primary/`);
};

// TOTP Setup Flow
export const setupTotp = (deviceName = 'Authenticator') => {
    return request.post('/mfa/devices/setup-totp/', { device_name: deviceName });
};

export const verifyTotpSetup = (otp, deviceId) => {
    return request.post('/mfa/devices/verify-totp-setup/', { otp, device_id: deviceId });
};

// Verification (during login)
export const verifyMfaDevice = (deviceId, otp) => {
    return request.post(`/mfa/devices/${deviceId}/verify/`, { otp });
};

export const verifyBackupCode = (code) => {
    return request.post('/mfa/devices/verify-backup/', { code });
};

// Backup Codes
export const generateBackupCodes = (count = 10) => {
    return request.post('/mfa/devices/generate-backup-codes/', { count });
};

export const getBackupCodesStatus = () => {
    return request.get('/mfa/devices/backup-codes-status/');
};

// MFA Status & Info
export const getMfaStatus = () => {
    return request.get('/mfa/devices/status/');
};

export const getMfaActivity = (hours = 24) => {
    return request.get('/mfa/devices/activity/', { params: { hours } });
};

export const getMfaFailureRate = (hours = 24) => {
    return request.get('/mfa/devices/failure-rate/', { params: { hours } });
};

// Disable MFA
export const disableMfa = (deviceId = null) => {
    return request.post('/mfa/devices/disable/', { confirm: true, device_id: deviceId });
};

// ============================================================================
// MFA Audit Logs
// ============================================================================

export const getMfaAuditLogs = (params = {}) => {
    return request.get('/mfa/audit-logs/', { params });
};

export const getMfaAuditLogDetail = (logId) => {
    return request.get(`/mfa/audit-logs/${logId}/`);
};

export const getMfaAuditLogSummary = () => {
    return request.get('/mfa/audit-logs/summary/');
};

// ============================================================================
// Admin Routes (For managing other users' MFA)
// ============================================================================

export const getUserMfaDevices = (userId) => {
    return request.get(`/users/${userId}/mfa-devices/`);
};

export const setupUserTotp = (userId, deviceName = 'Authenticator') => {
    return request.post(`/users/${userId}/mfa-devices/setup-totp/`, { device_name: deviceName });
};

export const verifyUserTotpSetup = (userId, otp, deviceId) => {
    return request.post(`/users/${userId}/mfa-devices/verify-totp-setup/`, { otp, device_id: deviceId });
};

export const disableUserMfa = (userId, deviceId = null) => {
    return request.post(`/users/${userId}/mfa-devices/disable/`, { confirm: true, device_id: deviceId });
};

// ============================================================================
// Convenience API Object (for easy importing)
// ============================================================================

export const mfaApi = {
    // Device Management
    getDevices: getMfaDevices,
    getDevice: getMfaDevice,
    createDevice: createMfaDevice,
    updateDevice: updateMfaDevice,
    deleteDevice: deleteMfaDevice,
    setPrimary: setPrimaryDevice,

    // TOTP Setup
    setupTotp,
    verifyTotpSetup,

    // Verification
    verifyDevice: verifyMfaDevice,
    verifyBackupCode,

    // Backup Codes
    generateBackupCodes,
    getBackupCodesStatus,

    // Status
    getStatus: getMfaStatus,
    getActivity: getMfaActivity,
    getFailureRate: getMfaFailureRate,

    // Disable
    disable: disableMfa,

    // Audit
    getAuditLogs: getMfaAuditLogs,
    getAuditLogDetail: getMfaAuditLogDetail,
    getAuditLogSummary: getMfaAuditLogSummary,

    // Admin
    getUserDevices: getUserMfaDevices,
    setupUserTotp,
    verifyUserTotpSetup,
    disableUserMfa,
};

export default mfaApi;