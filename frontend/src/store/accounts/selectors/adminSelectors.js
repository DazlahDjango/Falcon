import { createSelector } from '@reduxjs/toolkit';

const initialPagination = { page: 1, pageSize: 20, total: 0 };
const initialFilters = {};
const emptyArray = [];
const emptyObject = {};

export const selectAdminState = (state) => state.admin || emptyObject;

export const selectAdminUsers = createSelector(
  [selectAdminState],
  (adminState) => adminState?.users || emptyArray
);

export const selectSelectedAdminUser = (state) => state.admin?.selectedAdminUser || null;

export const selectAdminRoles = createSelector(
  [selectAdminState],
  (adminState) => adminState?.roles || emptyArray
);

export const selectSelectedAdminRole = (state) => state.admin?.selectedAdminRole || null;

export const selectAdminPermissions = createSelector(
  [selectAdminState],
  (adminState) => adminState?.permissions || emptyArray
);

export const selectSelectedAdminPermission = (state) => state.admin?.selectedAdminPermission || null;

export const selectAdminTenants = createSelector(
  [selectAdminState],
  (adminState) => adminState?.tenants || emptyArray
);

export const selectSelectedAdminTenant = (state) => state.admin?.selectedAdminTenant || null;

export const selectSystemInfo = (state) => state.admin?.systemInfo || null;

export const selectSystemHealth = (state) => state.admin?.systemHealth || null;

export const selectAdminUserStats = (state) => state.admin?.userStats || null;

export const selectAdminTenantStats = (state) => state.admin?.tenantStats || null;

export const selectAdminLoading = (state) => state.admin?.isLoading || false;

export const selectAdminCreating = (state) => state.admin?.isCreating || false;

export const selectAdminUpdating = (state) => state.admin?.isUpdating || false;

export const selectAdminDeleting = (state) => state.admin?.isDeleting || false;

export const selectAdminError = (state) => state.admin?.error || null;

export const selectAdminPagination = createSelector(
  [selectAdminState],
  (adminState) => adminState?.pagination || initialPagination
);

export const selectAdminFilters = createSelector(
  [selectAdminState],
  (adminState) => adminState?.filters || initialFilters
);

export const selectAdminUserById = createSelector(
  [selectAdminUsers, (state, id) => id],
  (users, id) => users.find(u => u.id === id) || null
);

export const selectAdminRoleById = createSelector(
  [selectAdminRoles, (state, id) => id],
  (roles, id) => roles.find(r => r.id === id) || null
);

export const selectAdminPermissionById = createSelector(
  [selectAdminPermissions, (state, id) => id],
  (permissions, id) => permissions.find(p => p.id === id) || null
);

export const selectAdminTenantById = createSelector(
  [selectAdminTenants, (state, id) => id],
  (tenants, id) => tenants.find(t => t.id === id) || null
);

export const selectAdminUserCount = (state) => {
  const stats = state.admin?.userStats;
  return stats?.total_users || 0;
};

export const selectAdminActiveUserCount = (state) => {
  const stats = state.admin?.userStats;
  return stats?.active_users || 0;
};

export const selectAdminMfaEnabledCount = (state) => {
  const stats = state.admin?.userStats;
  return stats?.mfa_enabled_users || 0;
};

export const selectAdminTenantCount = (state) => {
  const stats = state.admin?.tenantStats;
  return stats?.total_tenants || 0;
};

export const selectSystemStatus = (state) => {
  const health = state.admin?.systemHealth;
  return health?.status || 'unknown';
};

export const selectSystemIsHealthy = (state) => {
  const health = state.admin?.systemHealth;
  return health?.status === 'healthy';
};