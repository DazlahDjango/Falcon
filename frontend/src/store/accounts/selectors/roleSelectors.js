import { createSelector } from '@reduxjs/toolkit';

const initialPagination = { page: 1, pageSize: 20, total: 0 };
const initialFilters = {};
const emptyArray = [];
const emptyObject = {};

export const selectRolesState = (state) => state.roles || emptyObject;

export const selectRoles = createSelector(
  [selectRolesState],
  (rolesState) => rolesState?.roles || emptyArray
);

export const selectSelectedRole = (state) => state.roles?.selectedRole || null;

export const selectSystemRoles = createSelector(
  [selectRolesState],
  (rolesState) => rolesState?.systemRoles || emptyArray
);

export const selectAssignableRoles = createSelector(
  [selectRolesState],
  (rolesState) => rolesState?.assignableRoles || emptyArray
);

export const selectRolePermissions = createSelector(
  [selectRolesState],
  (rolesState) => rolesState?.rolePermissions || emptyArray
);

export const selectRolesLoading = (state) => state.roles?.isLoading || false;

export const selectRolesCreating = (state) => state.roles?.isCreating || false;

export const selectRolesUpdating = (state) => state.roles?.isUpdating || false;

export const selectRolesDeleting = (state) => state.roles?.isDeleting || false;

export const selectRolesError = (state) => state.roles?.error || null;

export const selectRolesPagination = createSelector(
  [selectRolesState],
  (rolesState) => rolesState?.pagination || initialPagination
);

export const selectRolesFilters = createSelector(
  [selectRolesState],
  (rolesState) => rolesState?.filters || initialFilters
);

export const selectRoleById = createSelector(
  [selectRoles, (state, id) => id],
  (roles, id) => roles.find(r => r.id === id) || null
);

export const selectRoleByCode = createSelector(
  [selectRoles, (state, code) => code],
  (roles, code) => roles.find(r => r.code === code) || null
);

export const selectSystemRoleByCode = createSelector(
  [selectSystemRoles, (state, code) => code],
  (roles, code) => roles.find(r => r.code === code) || null
);

export const selectAssignableRoleByCode = createSelector(
  [selectAssignableRoles, (state, code) => code],
  (roles, code) => roles.find(r => r.code === code) || null
);

export const selectRolePermissionCount = createSelector(
  [selectRolePermissions],
  (permissions) => permissions.length
);

export const selectRoleHasPermission = createSelector(
  [selectRolePermissions, (state, codename) => codename],
  (permissions, codename) => permissions.some(p => p.codename === codename)
);
