import { request } from './client';

// MFA Devices
// ============
export const getMfaDevices = () => {
    return request.get('/mfa/devices/');
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
export const verifyMfaDevice = (deviceId, otp) => {
    return request.post(`/mfa/devices/${deviceId}/verify/`, { otp });
};

// MFA Audit Logs
// ================
export const getMfaAuditLogs = (params = {}) => {
    return request.get('/mfa/audit-logs/', { params });
};
export const getMfaFailureRate = () => {
    return request.get('/mfa/audit-logs/failure-rate/');
};