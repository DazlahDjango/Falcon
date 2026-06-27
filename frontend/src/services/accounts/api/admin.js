import { request } from './client';
import { ADMIN_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

// ============ Admin Users ============
export const getAdminUsers = (params) => request.get(ADMIN_ENDPOINTS.USERS, { params });

export const getAdminUser = (id) => request.get(ADMIN_ENDPOINTS.USER_DETAIL(id));

export const createAdminUser = (data) => request.post(ADMIN_ENDPOINTS.USERS, data);

export const updateAdminUser = (id, data) => request.patch(ADMIN_ENDPOINTS.USER_DETAIL(id), data);

export const deleteAdminUser = (id) => request.delete(ADMIN_ENDPOINTS.USER_DETAIL(id));

export const impersonateUser = (id) => request.post(ADMIN_ENDPOINTS.USER_IMPERSONATE(id));

export const forcePasswordReset = (id) =>
  request.post(ADMIN_ENDPOINTS.USER_FORCE_PASSWORD_RESET(id));

export const getAdminUserStats = () => request.get(ADMIN_ENDPOINTS.USER_STATS);

// ============ Admin Roles ============
export const getAdminRoles = (params) => request.get(ADMIN_ENDPOINTS.ROLES, { params });

export const getAdminRole = (id) => request.get(ADMIN_ENDPOINTS.ROLE_DETAIL(id));

export const createAdminRole = (data) => request.post(ADMIN_ENDPOINTS.ROLES, data);

export const updateAdminRole = (id, data) =>
  request.patch(ADMIN_ENDPOINTS.ROLE_DETAIL(id), data);

export const deleteAdminRole = (id) => request.delete(ADMIN_ENDPOINTS.ROLE_DETAIL(id));

export const initSystemRoles = () => request.post(ADMIN_ENDPOINTS.INIT_SYSTEM_ROLES);

// ============ Admin Permissions ============
export const getAdminPermissions = (params) => request.get(ADMIN_ENDPOINTS.PERMISSIONS, { params });

export const getAdminPermission = (id) => request.get(ADMIN_ENDPOINTS.PERMISSION_DETAIL(id));

export const createAdminPermission = (data) => request.post(ADMIN_ENDPOINTS.PERMISSIONS, data);

export const updateAdminPermission = (id, data) =>
  request.patch(ADMIN_ENDPOINTS.PERMISSION_DETAIL(id), data);

export const deleteAdminPermission = (id) =>
  request.delete(ADMIN_ENDPOINTS.PERMISSION_DETAIL(id));

export const initPermissions = () => request.post(ADMIN_ENDPOINTS.INIT_PERMISSIONS);

// ============ Admin Tenants ============
export const getAdminTenants = (params) => request.get(ADMIN_ENDPOINTS.TENANTS, { params });

export const getAdminTenant = (id) => request.get(ADMIN_ENDPOINTS.TENANT_DETAIL(id));

export const createAdminTenant = (data) => request.post(ADMIN_ENDPOINTS.TENANTS, data);

export const updateAdminTenant = (id, data) =>
  request.patch(ADMIN_ENDPOINTS.TENANT_DETAIL(id), data);

export const deleteAdminTenant = (id) => request.delete(ADMIN_ENDPOINTS.TENANT_DETAIL(id));

export const createTenantWithAdmin = (data) =>
  request.post(ADMIN_ENDPOINTS.TENANT_CREATE_WITH_ADMIN, data);

export const suspendTenant = (id, data) => request.post(ADMIN_ENDPOINTS.TENANT_SUSPEND(id), data);

export const activateTenant = (id) => request.post(ADMIN_ENDPOINTS.TENANT_ACTIVATE(id));

export const getAdminTenantStats = () => request.get(ADMIN_ENDPOINTS.TENANT_STATS);

// ============ Admin System ============
export const getSystemInfo = () => request.get(ADMIN_ENDPOINTS.SYSTEM);

export const clearSystemCache = () => request.post(ADMIN_ENDPOINTS.SYSTEM_CLEAR_CACHE);

export const getSystemHealth = () => request.get(ADMIN_ENDPOINTS.SYSTEM_HEALTH);

export const getSystemConfig = () => request.get(ADMIN_ENDPOINTS.SYSTEM_CONFIG);

export const updateSystemConfig = (data) => request.patch(ADMIN_ENDPOINTS.SYSTEM_CONFIG, data);

export const clearUserCache = (userId) => request.post(ADMIN_ENDPOINTS.CLEAR_USER_CACHE, { user_id: userId });

export const clearTenantCache = (tenantId) => request.post(ADMIN_ENDPOINTS.CLEAR_TENANT_CACHE, { tenant_id: tenantId });