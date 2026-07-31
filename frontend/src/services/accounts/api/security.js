import { request } from './client';
import { SECURITY_ENDPOINTS, AUTH_ENDPOINTS, SESSION_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getLoginAttempts = (params) => request.get(SECURITY_ENDPOINTS.LOGIN_ATTEMPTS, { params });
export const getLoginAttempt = (id) => request.get(SECURITY_ENDPOINTS.LOGIN_ATTEMPT_DETAIL(id));
export const getTenantPolicy = (params) => request.get(SECURITY_ENDPOINTS.TENANT_POLICY, { params });
export const getLockoutSummary = () => request.get(SECURITY_ENDPOINTS.LOCKOUT_SUMMARY);
export const getTenantMFAPolicy = () => request.get(SECURITY_ENDPOINTS.TENANT_MFA_POLICY);
export const updateTenantMFAPolicy = (data) => request.patch(SECURITY_ENDPOINTS.TENANT_MFA_POLICY, data);
export const getUserMFAPolicies = () => request.get(SECURITY_ENDPOINTS.USER_MFA_POLICY_LIST);
export const getUserMFAPolicy = (userId) => request.get(SECURITY_ENDPOINTS.USER_MFA_POLICY_DETAIL(userId));
export const updateUserMFAPolicy = (userId, data) => request.patch(SECURITY_ENDPOINTS.USER_MFA_POLICY_DETAIL(userId), data);
export const clearUserMFAOverride = (userId) => request.delete(SECURITY_ENDPOINTS.USER_MFA_POLICY_DETAIL(userId));
export const getUserMFAStatus = (userId) => request.get(SECURITY_ENDPOINTS.USER_MFA_STATUS(userId));
export const getTenantActiveSessions = () => request.get(SESSION_ENDPOINTS.TENANT_ACTIVE);
export const getSystemPolicy = () => request.get(SECURITY_ENDPOINTS.SYSTEM_POLICY);
export const syncAllTenantPolicies = () => request.post(SECURITY_ENDPOINTS.SYNC_ALL_TENANT_POLICIES);
export const verifyStepUp = (data) => request.post(AUTH_ENDPOINTS.STEP_UP_VERIFY, data);