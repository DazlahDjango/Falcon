import { request } from './client';
import {
  AUTH_ENDPOINTS,
  MFA_DEVICE_ENDPOINTS,
  SECURITY_ENDPOINTS,
} from '../../../config/constants/accountsApiConstants';

// ============ Core Auth ============
export const login = (data) => request.post(AUTH_ENDPOINTS.LOGIN, data);

export const logout = (data) => request.post(AUTH_ENDPOINTS.LOGOUT, data);

export const refreshToken = (data) => request.post(AUTH_ENDPOINTS.REFRESH, data);

export const register = (data) => request.post(AUTH_ENDPOINTS.REGISTER, data);

export const registerTenant = (data) => request.post(AUTH_ENDPOINTS.REGISTER_TENANT, data);

// ============ MFA ============
export const verifyMFA = (data) => request.post(AUTH_ENDPOINTS.MFA_VERIFY, data);

export const setupMFA = (data) => request.post(AUTH_ENDPOINTS.MFA_SETUP, data);

export const getMFADevices = () => request.get(AUTH_ENDPOINTS.MFA_DEVICES);

export const deleteMFADevice = (deviceId) =>
  request.delete(`${AUTH_ENDPOINTS.MFA_DEVICES}${deviceId}/`);

export const getBackupCodes = () => request.get(AUTH_ENDPOINTS.MFA_BACKUP_CODES);

export const generateBackupCodes = () => request.post(AUTH_ENDPOINTS.MFA_BACKUP_CODES);

// ============ User Management ============
export const getCurrentUser = () => request.get(AUTH_ENDPOINTS.CURRENT_USER);

export const changePassword = (data) => request.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);

// ============ Invitations ============
export const getInvitations = () => request.get(AUTH_ENDPOINTS.INVITATIONS);

export const sendInvitation = (data) => request.post(AUTH_ENDPOINTS.INVITATIONS, data);

export const acceptInvitation = (data) => request.post(AUTH_ENDPOINTS.ACCEPT_INVITATION, data);

// ============ Password Reset ============
export const forgotPassword = (data) => request.post(AUTH_ENDPOINTS.PASSWORD_RESET, data);

export const resetPassword = (data) => request.post(AUTH_ENDPOINTS.PASSWORD_RESET_CONFIRM, data);

// ============ Email Verification ============
export const verifyEmail = (data) => request.post(AUTH_ENDPOINTS.VERIFY_EMAIL, data);

export const resendVerification = (data) => request.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, data);

// ============ Step-Up Authentication ============
export const verifyStepUp = (data) => request.post(AUTH_ENDPOINTS.STEP_UP_VERIFY, data);