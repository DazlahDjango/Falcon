import { request } from './client';

export const getTenantPolicy = (sync = false) => {
    const params = sync ? { sync: '1' } : {};
    return request.get('/security/policy/', { params });
};

export const getLockoutSummary = () => {
    return request.get('/security/lockout-summary/');
};

export const getLoginAttempts = (params = {}) => {
    return request.get('/security/login-attempts/', { params });
};

export const getSystemPolicy = () => {
    return request.get('/system-settings/');
};

export const updateSystemPolicy = (settings) => {
    return request.patch('/system-settings/', { settings });
};

export const resetSystemPolicy = () => {
    return request.post('/system-settings/reset/');
};

export const syncAllTenantPolicies = () => {
    return request.post('/system-settings/sync-policy/');
};

export const getTenantActiveSessions = () => {
    return request.get('/sessions/tenant-active/');
};
