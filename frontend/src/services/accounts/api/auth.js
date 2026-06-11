import { request } from "./client";

// ============================================================
// AUTHENTICATION
// ============================================================
export const login = (data) => {
    return request.post('/auth/login/', data);
};

export const refreshToken = (refreshToken) => {
    return request.post('/auth/refresh/', { refresh: refreshToken });
};

export const logout = () => {
    return request.post('/auth/logout/');
};

// ============================================================
// MFA (Using correct MFA endpoints)
// ============================================================
// MFA Status & Info
export const getMfaStatus = () => {
    return request.get('/mfa/devices/status/');
};

export const getMfaDevices = () => {
    return request.get('/mfa/devices/');
};

export const getMfaDevice = (deviceId) => {
    return request.get(`/mfa/devices/${deviceId}/`);
};

// TOTP Setup Flow
export const setupTotp = (deviceName = 'Authenticator') => {
    return request.post('/mfa/devices/setup-totp/', { device_name: deviceName });
};

export const verifyTotpSetup = (otp, deviceId) => {
    return request.post('/mfa/devices/verify-totp-setup/', { otp, device_id: deviceId });
};

// Verification (during login flow)
export const verifyMfa = (mfaToken, otp) => {
    // This is for the MFA challenge during login - uses the auth endpoint
    return request.post('/auth/mfa-verify/', { mfa_token: mfaToken, otp });
};

// Device Management
export const verifyDevice = (deviceId, otp) => {
    return request.post(`/mfa/devices/${deviceId}/verify/`, { otp });
};

export const verifyBackupCode = (code) => {
    return request.post('/mfa/devices/verify-backup/', { code });
};

export const setPrimaryDevice = (deviceId) => {
    return request.post(`/mfa/devices/${deviceId}/set-primary/`);
};

export const deleteMfaDevice = (deviceId) => {
    return request.delete(`/mfa/devices/${deviceId}/`);
};

// Backup Codes
export const getBackupCodesStatus = () => {
    return request.get('/mfa/devices/backup-codes-status/');
};

export const generateBackupCodes = (count = 10) => {
    return request.post('/mfa/devices/generate-backup-codes/', { count });
};

// Disable MFA
export const disableMfa = (deviceId = null) => {
    const data = deviceId ? { confirm: true, device_id: deviceId } : { confirm: true };
    return request.post('/mfa/devices/disable/', data);
};

// MFA Audit Logs
export const getMfaAuditLogs = (params = {}) => {
    return request.get('/mfa/audit-logs/', { params });
};

export const getMfaAuditLogSummary = () => {
    return request.get('/mfa/audit-logs/summary/');
};

// ============================================================
// REGISTRATION & VERIFICATION
// ============================================================
export const register = (data) => {
    return request.post('/auth/register/', data);
};

export const verifyEmail = (token) => {
    return request.post('/auth/verify-email/', { token });
};

export const resendVerification = (email) => {
    return request.post('/auth/resend-verification/', { email });
};

// ============================================================
// PASSWORD MANAGEMENT
// ============================================================
export const forgotPassword = (email) => {
    return request.post('/auth/password-reset/', { email });
};

export const resetPassword = (data) => {
    return request.post('/auth/password-reset/confirm/', data);
};

export const changePassword = (data) => {
    return request.post('/auth/change-password/', data);
};

// ============================================================
// INVITATIONS
// ============================================================
export const inviteUser = (data) => {
    return request.post('/users/invite/', data);
};

export const acceptInvitation = (data) => {
    return request.post('/auth/invitation/accept/', data);
};

export const getPendingInvitations = () => {
    return request.get('/auth/invitations/');
};

export const cancelInvitation = (invitationId) => {
    return request.delete(`/auth/invitations/${invitationId}/`);
};

export const resendInvitation = (invitationId) => {
    return request.post(`/auth/invitations/${invitationId}/resend/`);
};

// ============================================================
// LEGACY COMPATIBILITY (deprecated - use new functions)
// ============================================================
/** @deprecated Use setupTotp instead */
export const setupMfa = setupTotp;

/** @deprecated Use verifyTotpSetup instead */
export const verifyMfaSetup = verifyTotpSetup;

/** @deprecated Use getMfaDevices instead */
export const getMfaDevicesLegacy = getMfaDevices;

/** @deprecated Use deleteMfaDevice instead */
export const removeMfaDevice = deleteMfaDevice;

/** @deprecated Use setPrimaryDevice instead */
export const setPrimaryMfaDevice = setPrimaryDevice;

/** @deprecated Use getBackupCodesStatus instead */
export const getBackupCodes = getBackupCodesStatus;

/** @deprecated Use generateBackupCodes instead */
export const regenerateBackupCodes = generateBackupCodes;