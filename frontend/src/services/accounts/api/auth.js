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

export const verifyMfa = (mfaToken, otp) => {
    return request.post('/auth/mfa-verify/', { mfa_token: mfaToken, otp });
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
