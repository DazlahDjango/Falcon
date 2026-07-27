import { request } from './client';
import { SECURITY_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getLoginAttempts = (params) => request.get(SECURITY_ENDPOINTS.LOGIN_ATTEMPTS || '/security/login-attempts/', { params });
export const getLoginAttempt = (id) => request.get(SECURITY_ENDPOINTS.LOGIN_ATTEMPT_DETAIL?.(id) || `/security/login-attempts/${id}/`);
export const getTenantPolicy = (params) => request.get(SECURITY_ENDPOINTS.TENANT_POLICY || '/security/tenant-policy/', { params });
export const getLockoutSummary = () => request.get(SECURITY_ENDPOINTS.LOCKOUT_SUMMARY || '/security/lockout-summary/');
export const getTenantMFAPolicy = () => request.get(SECURITY_ENDPOINTS.TENANT_MFA_POLICY || '/security/mfa-policy/');
export const updateTenantMFAPolicy = (data) => request.patch(SECURITY_ENDPOINTS.TENANT_MFA_POLICY || '/security/mfa-policy/', data);
export const getUserMFAPolicies = () => request.get(SECURITY_ENDPOINTS.USER_MFA_POLICY_LIST || '/security/user-mfa-policies/');
export const getUserMFAPolicy = (userId) => request.get(SECURITY_ENDPOINTS.USER_MFA_POLICY_DETAIL?.(userId) || `/security/user-mfa-policies/${userId}/`);
export const updateUserMFAPolicy = (userId, data) => request.patch(SECURITY_ENDPOINTS.USER_MFA_POLICY_DETAIL?.(userId) || `/security/user-mfa-policies/${userId}/`, data);
export const clearUserMFAOverride = (userId) => request.delete(SECURITY_ENDPOINTS.USER_MFA_POLICY_DETAIL?.(userId) || `/security/user-mfa-policies/${userId}/`);
export const getUserMFAStatus = (userId) => request.get(SECURITY_ENDPOINTS.USER_MFA_STATUS?.(userId) || `/security/mfa-status/${userId}/`);
export const getTenantActiveSessions = () => request.get('/security/tenant-active-sessions/');
export const getSystemPolicy = () => request.get('/security/system-policy/');
export const syncAllTenantPolicies = () => request.post('/security/sync-all-tenant-policies/');
export const verifyStepUp = (data) => request.post('/security/step-up/verify/', data);