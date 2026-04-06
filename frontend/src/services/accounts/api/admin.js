import { request } from './client';

// User Management (Admin)
// =========================
export const getAllUsers = (params = {}) => {
    return request.get('/admin/users/', { params });
};
export const createUserAdmin = (data) => {
    return request.post('/admin/users/', data);
};
export const updateUserAdmin = (userId, data) => {
    return request.patch(`/admin/users/${userId}/`, data);
};
export const deleteUserAdmin = (userId) => {
    return request.delete(`/admin/users/${userId}/`);
};
export const impersonateUser = (userId) => {
    return request.post(`/admin/users/${userId}/impersonate/`);
};
export const forcePasswordReset = (userId) => {
    return request.post(`/admin/users/${userId}/force-password-reset/`);
};
export const getUserStats = () => {
    return request.get('/admin/users/stats/');
};

// Role Management (Admin)
// ========================
export const initSystemRoles = () => {
    return request.post('/admin/roles/init-system-roles/');
};

// Permission Management (Admin)
// ==============================
export const initPermissions = () => {
    return request.post('/admin/permissions/init-permissions/');
};

// Tenant Management (Admin)
// ===========================
export const getTenants = (params = {}) => {
    return request.get('/admin/tenants/', { params });
};
export const createTenant = (data) => {
    return request.post('/admin/tenants/', data);
};
export const updateTenant = (tenantId, data) => {
    return request.patch(`/admin/tenants/${tenantId}/`, data);
};
export const deleteTenant = (tenantId) => {
    return request.delete(`/admin/tenants/${tenantId}/`);
};
export const suspendTenant = (tenantId) => {
    return request.post(`/admin/tenants/${tenantId}/suspend/`);
};
export const activateTenant = (tenantId) => {
    return request.post(`/admin/tenants/${tenantId}/activate/`);
};
export const createTenantWithAdmin = (data) => {
    return request.post('/admin/tenants/create-with-admin/', data);
};
export const getTenantStats = () => {
    return request.get('/admin/tenants/stats/');
};

// System Management (Admin)
// ===========================
export const getSystemInfo = () => {
    return request.get('/admin/system/');
};
export const clearSystemCache = () => {
    return request.post('/admin/system/clear-cache/');
};
export const getSystemConfig = () => {
    return request.get('/admin/system/config/');
};
export const updateSystemConfig = (data) => {
    return request.patch('/admin/system/config/', data);
};
export const clearUserCache = (userId) => {
    return request.post('/admin/system/clear-user-cache/', { user_id: userId });
};
export const clearTenantCache = (tenantId) => {
    return request.post('/admin/system/clear-tenant-cache/', { tenant_id: tenantId });
};
export const getSystemHealth = () => {
    return request.get('/admin/system/health/');
};