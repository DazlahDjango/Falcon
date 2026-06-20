import { request } from './client';
import { ACCOUNTS_ADMIN_API } from '../../../config/constants/adminAccountAPIs';

export const getSystemSettings = () => {
    return request.get(ACCOUNTS_ADMIN_API.SYSTEM_SETTINGS);
};

export const updateSystemSettings = (patch) => {
    return request.patch(ACCOUNTS_ADMIN_API.SYSTEM_SETTINGS, patch);
};

export const resetSystemSettings = () => {
    return request.post(ACCOUNTS_ADMIN_API.SYSTEM_SETTINGS_RESET);
};

export const syncAllTenantsPolicy = () => {
    return request.post(ACCOUNTS_ADMIN_API.SYSTEM_SETTINGS_SYNC);
};

export const getTenantMFAPolicy = () => {
    return request.get(ACCOUNTS_ADMIN_API.TENANT_MFA_POLICY);
};

export const updateTenantMFAPolicy = (mfa_required_roles) => {
    return request.patch(ACCOUNTS_ADMIN_API.TENANT_MFA_POLICY, { mfa_required_roles });
};

export const getAllUsersMFAPolicy = () => {
    return request.get(ACCOUNTS_ADMIN_API.USER_MFA_POLICY_LIST);
};

export const getUserMFAPolicy = (userId) => {
    return request.get(ACCOUNTS_ADMIN_API.USER_MFA_POLICY_DETAIL(userId));
};

export const updateUserMFAOverride = (userId, mfa_required) => {
    return request.patch(ACCOUNTS_ADMIN_API.USER_MFA_POLICY_DETAIL(userId), { mfa_required });
};

export const clearUserMFAOverride = (userId) => {
    return request.delete(ACCOUNTS_ADMIN_API.USER_MFA_POLICY_DETAIL(userId));
};

export const getUserMFAStatus = (userId) => {
    return request.get(ACCOUNTS_ADMIN_API.USER_MFA_STATUS(userId));
};

export const resetUserMFA = (userId, reason = '') => {
    return request.post(ACCOUNTS_ADMIN_API.ADMIN_MFA_RESET(userId), { reason });
};

export const clearUserDevices = (userId) => {
    return request.delete(ACCOUNTS_ADMIN_API.ADMIN_MFA_DEVICES_CLEAR(userId));
};

export const clearUserDevice = (userId, deviceId) => {
    return request.delete(ACCOUNTS_ADMIN_API.ADMIN_MFA_DEVICE_CLEAR(userId, deviceId));
};

export const getAdminMFAStatus = (userId) => {
    return request.get(ACCOUNTS_ADMIN_API.ADMIN_MFA_STATUS(userId));
};
export const verifyStepUp = (action, otp) => {
    return request.post(ACCOUNTS_ADMIN_API.STEP_UP_VERIFY, { action, otp });
};

export const adminSystemApi = {
    // System Settings
    getSystemSettings,
    updateSystemSettings,
    resetSystemSettings,
    syncAllTenantsPolicy,

    // Tenant MFA Policy
    getTenantMFAPolicy,
    updateTenantMFAPolicy,

    // User MFA Policy
    getAllUsersMFAPolicy,
    getUserMFAPolicy,
    updateUserMFAOverride,
    clearUserMFAOverride,
    getUserMFAStatus,

    // Admin MFA Reset
    resetUserMFA,
    clearUserDevices,
    clearUserDevice,
    getAdminMFAStatus,

    // Step-Up
    verifyStepUp,
};

export default adminSystemApi;