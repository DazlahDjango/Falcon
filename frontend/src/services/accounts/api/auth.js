import { request } from "./client";

// Authentications
// ================
export const login = (data) => {
    return request.post('/auth/login/', data);
};
export const verifyMfa = (data) => {
    return request.post('/auth/mfa/verify/', data);
};
export const refreshToken = (refreshToken) => {
    return request.post('/auth/refresh/', { refresh: refreshToken });
};
export const logout = (refreshToken) => {
    return request.post('/auth/logout/', { refresh: refreshToken });
};

// Registration
// =============
export const register = (data) => {
    return request.post('/auth/register/', data);
};
export const verifyEmail = (token) => {
    return request.post('/auth/verify-email/', { token });
};
export const resendVerification = (email) => {
    return request.post('/auth/resend-verification/', { email });
};

// Password Management
// ====================
export const forgotPassword = (email) => {
    return request.post('/auth/password-reset/', {email});
};
export const resetPassword = (data) => {
    return request.post('/auth/password-reset/confirm/', data);
};
export const changePassword = (data) => {
    return request.post('/auth/change-password/', data);
};

// MFA Management
// ==================
export const setupMfa = (data = { device_name: 'Authenticator' }) => {
    return request.post('/auth/mfa/setup/', data);
};
export const verifyMfaSetup = (data) => {
    return request.post('/auth/mfa/verify-setup/', data);
};
export const disableMfa = () => {
    return request.post('/auth/mfa/disable/');
};
export const getMfaDevices = () => {
    return request.get('/auth/mfa/devices/');
};
export const removeMfaDevice = (deviceId) => {
    return request.delete(`/auth/mfa/devices/${deviceId}/`);
};
export const setPrimaryMfaDevice = (deviceId) => {
    return request.post(`/auth/mfa/devices/${deviceId}/set-primary/`);
};
export const getBackupCodes = () => {
    return request.get('/auth/mfa/backup-codes/');
};
export const regenerateBackupCodes = () => {
    return request.post('/auth/mfa/backup-codes/regenerate/');
}

// Invitations
// ============
export const inviteUser = (data) => {
    return request.post('/auth/invitations/', data);
};
export const acceptInvitation = (data) => {
    return request.post('/auth/invitations/accept/', data);
};
export const getPendingInvitations = () => {
    return request.get('/auth/invitations/');
};
export const cancelInvitation = (invitationId) => {
    return request.delete(`/auth/invitations/${invitationId}/`);
};