import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminUsers,
  fetchAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  impersonateUser,
  forcePasswordReset,
  fetchAdminUserStats,
  fetchAdminRoles,
  fetchAdminRole,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  initSystemRoles,
  fetchAdminPermissions,
  fetchAdminPermission,
  createAdminPermission,
  updateAdminPermission,
  deleteAdminPermission,
  initPermissions,
  fetchAdminTenants,
  fetchAdminTenant,
  createAdminTenant,
  updateAdminTenant,
  deleteAdminTenant,
  createTenantWithAdmin,
  suspendTenant,
  activateTenant,
  fetchAdminTenantStats,
  fetchSystemInfo,
  clearSystemCache,
  fetchSystemHealth,
  fetchSystemConfig,
  updateSystemConfig,
  clearUserCache,
  clearTenantCache,
  clearSelectedAdminUser,
  clearSelectedAdminRole,
  clearSelectedAdminPermission,
  clearSelectedAdminTenant,
  clearAdminError,
  verifyAdminUser,
  setAdminFilters,
  setAdminPage,
  setAdminPageSize,
  mapUserToOrganization,
  mapTenantUser,
} from '../../store/accounts/slice/adminSlice';
import {
  activateUser as activateAdminUser,
  deactivateUser as deactivateAdminUser,
} from '../../store/accounts/slice/userSlice';
import {
  selectAdminUsers,
  selectSelectedAdminUser,
  selectAdminRoles,
  selectSelectedAdminRole,
  selectAdminPermissions,
  selectSelectedAdminPermission,
  selectAdminTenants,
  selectSelectedAdminTenant,
  selectSystemInfo,
  selectSystemHealth,
  selectAdminUserStats,
  selectAdminTenantStats,
  selectAdminLoading,
  selectAdminCreating,
  selectAdminUpdating,
  selectAdminDeleting,
  selectAdminError,
  selectAdminPagination,
  selectAdminFilters,
  selectAdminUserById,
  selectAdminRoleById,
  selectAdminPermissionById,
  selectAdminTenantById,
  selectAdminUserCount,
  selectAdminActiveUserCount,
  selectAdminMfaEnabledCount,
  selectAdminTenantCount,
  selectSystemStatus,
  selectSystemIsHealthy,
} from '../../store/accounts/selectors/adminSelectors';

export const useAdmin = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const selectedUser = useSelector(selectSelectedAdminUser);
  const roles = useSelector(selectAdminRoles);
  const selectedRole = useSelector(selectSelectedAdminRole);
  const permissions = useSelector(selectAdminPermissions);
  const selectedPermission = useSelector(selectSelectedAdminPermission);
  const tenants = useSelector(selectAdminTenants);
  const selectedTenant = useSelector(selectSelectedAdminTenant);
  const systemInfo = useSelector(selectSystemInfo);
  const systemHealth = useSelector(selectSystemHealth);
  const userStats = useSelector(selectAdminUserStats);
  const tenantStats = useSelector(selectAdminTenantStats);
  const isLoading = useSelector(selectAdminLoading);
  const isCreating = useSelector(selectAdminCreating);
  const isUpdating = useSelector(selectAdminUpdating);
  const isDeleting = useSelector(selectAdminDeleting);
  const error = useSelector(selectAdminError);
  const pagination = useSelector(selectAdminPagination);
  const filters = useSelector(selectAdminFilters);

  // ============ User Management ============
  const getUsers = useCallback(
    async (params) => {
      const result = await dispatch(fetchAdminUsers(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUser = useCallback(
    async (id) => {
      const result = await dispatch(fetchAdminUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const createUser = useCallback(
    async (data) => {
      const result = await dispatch(createAdminUser(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateUser = useCallback(
    async (id, data) => {
      const result = await dispatch(updateAdminUser({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const deleteUser = useCallback(
    async (id) => {
      const result = await dispatch(deleteAdminUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const impersonate = useCallback(
    async (id) => {
      const result = await dispatch(impersonateUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const forceReset = useCallback(
    async (id) => {
      const result = await dispatch(forcePasswordReset(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const verifyUser = useCallback(
    async (id) => {
      const result = await dispatch(verifyAdminUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const mapUserToOrg = useCallback(
    async (userId, organizationId) => {
      const result = await dispatch(mapUserToOrganization({ userId, organizationId })).unwrap();
      return result;
    },
    [dispatch]
  );

  const mapTenantUsr = useCallback(
    async (tenantId, userId) => {
      const result = await dispatch(mapTenantUser({ tenantId, userId })).unwrap();
      return result;
    },
    [dispatch]
  );

  const activateUser = useCallback(
    async (id) => {
      const result = await dispatch(activateAdminUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const deactivateUser = useCallback(
    async (id) => {
      const result = await dispatch(deactivateAdminUser(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUserStats = useCallback(async () => {
    const result = await dispatch(fetchAdminUserStats()).unwrap();
    return result;
  }, [dispatch]);

  // ============ Role Management ============
  const getRoles = useCallback(
    async (params) => {
      const result = await dispatch(fetchAdminRoles(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getRole = useCallback(
    async (id) => {
      const result = await dispatch(fetchAdminRole(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const createRole = useCallback(
    async (data) => {
      const result = await dispatch(createAdminRole(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateRole = useCallback(
    async (id, data) => {
      const result = await dispatch(updateAdminRole({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const deleteRole = useCallback(
    async (id) => {
      const result = await dispatch(deleteAdminRole(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const initRoles = useCallback(async () => {
    const result = await dispatch(initSystemRoles()).unwrap();
    return result;
  }, [dispatch]);

  // ============ Permission Management ============
  const getPermissions = useCallback(
    async (params) => {
      const result = await dispatch(fetchAdminPermissions(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getPermission = useCallback(
    async (id) => {
      const result = await dispatch(fetchAdminPermission(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const createPermission = useCallback(
    async (data) => {
      const result = await dispatch(createAdminPermission(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updatePermission = useCallback(
    async (id, data) => {
      const result = await dispatch(updateAdminPermission({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const deletePermission = useCallback(
    async (id) => {
      const result = await dispatch(deleteAdminPermission(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const initPermissions = useCallback(async () => {
    const result = await dispatch(initPermissions()).unwrap();
    return result;
  }, [dispatch]);

  // ============ Tenant Management ============
  const getTenants = useCallback(
    async (params) => {
      const result = await dispatch(fetchAdminTenants(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTenant = useCallback(
    async (id) => {
      const result = await dispatch(fetchAdminTenant(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const createTenant = useCallback(
    async (data) => {
      const result = await dispatch(createAdminTenant(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateTenant = useCallback(
    async (id, data) => {
      const result = await dispatch(updateAdminTenant({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const deleteTenant = useCallback(
    async (id) => {
      const result = await dispatch(deleteAdminTenant(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const createTenantWithAdmin = useCallback(
    async (data) => {
      const result = await dispatch(createTenantWithAdmin(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const suspend = useCallback(
    async (id, reason) => {
      const result = await dispatch(suspendTenant({ id, reason })).unwrap();
      return result;
    },
    [dispatch]
  );

  const activate = useCallback(
    async (id) => {
      const result = await dispatch(activateTenant(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTenantStats = useCallback(async () => {
    const result = await dispatch(fetchAdminTenantStats()).unwrap();
    return result;
  }, [dispatch]);

  // ============ System Management ============
  const getSystemInfo = useCallback(async () => {
    const result = await dispatch(fetchSystemInfo()).unwrap();
    return result;
  }, [dispatch]);

  const clearCache = useCallback(async () => {
    const result = await dispatch(clearSystemCache()).unwrap();
    return result;
  }, [dispatch]);

  const getSystemHealth = useCallback(async () => {
    const result = await dispatch(fetchSystemHealth()).unwrap();
    return result;
  }, [dispatch]);

  // ============ NEW SYSTEM FUNCTIONS ============
  const getSystemConfig = useCallback(async () => {
    const result = await dispatch(fetchSystemConfig()).unwrap();
    return result;
  }, [dispatch]);

  const updateSystemConfig = useCallback(async (data) => {
    const result = await dispatch(updateSystemConfig(data)).unwrap();
    return result;
  }, [dispatch]);

  const clearUserCache = useCallback(async (userId) => {
    const result = await dispatch(clearUserCache(userId)).unwrap();
    return result;
  }, [dispatch]);

  const clearTenantCache = useCallback(async (tenantId) => {
    const result = await dispatch(clearTenantCache(tenantId)).unwrap();
    return result;
  }, [dispatch]);
  // ============ END NEW ============

  // ============ Filters & Pagination ============
  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setAdminFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setAdminPage(page));
    },
    [dispatch]
  );

  const setPageSize = useCallback(
    (pageSize) => {
      dispatch(setAdminPageSize(pageSize));
    },
    [dispatch]
  );

  // ============ Clear States ============
  const clearSelectedUser = useCallback(() => {
    dispatch(clearSelectedAdminUser());
  }, [dispatch]);

  const clearSelectedRole = useCallback(() => {
    dispatch(clearSelectedAdminRole());
  }, [dispatch]);

  const clearSelectedPermission = useCallback(() => {
    dispatch(clearSelectedAdminPermission());
  }, [dispatch]);

  const clearSelectedTenant = useCallback(() => {
    dispatch(clearSelectedAdminTenant());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  // ============ Memoized Return ============
  return useMemo(
    () => ({
      // State
      users,
      selectedUser,
      roles,
      selectedRole,
      permissions,
      selectedPermission,
      tenants,
      selectedTenant,
      systemInfo,
      systemHealth,
      userStats,
      tenantStats,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      pagination,
      filters,

      // User functions
      getUsers,
      getUser,
      createUser,
      updateUser,
      deleteUser,
      activateUser,
      deactivateUser,
      impersonate,
      forceReset,
      getUserStats,

      // Role functions
      getRoles,
      getRole,
      createRole,
      updateRole,
      deleteRole,
      initRoles,

      // Permission functions
      getPermissions,
      getPermission,
      createPermission,
      updatePermission,
      deletePermission,
      initPermissions,

      // Tenant functions
      getTenants,
      getTenant,
      createTenant,
      updateTenant,
      deleteTenant,
      createTenantWithAdmin,
      suspend,
      activate,
      getTenantStats,

      // System functions
      getSystemInfo,
      clearCache,
      getSystemHealth,
      getSystemConfig,
      updateSystemConfig,
      clearUserCache,
      clearTenantCache,

      // Filters & Pagination
      setFilters,
      setPage,
      setPageSize,

      // Clear functions
      clearSelectedUser,
      clearSelectedRole,
      clearSelectedPermission,
      clearSelectedTenant,
      clearError,
      impersonateUser: impersonate,
      forcePasswordReset: forceReset,
      verifyUser,
      mapUserToOrganization: mapUserToOrg,
      mapTenantUser: mapTenantUsr,
    }),
    [
      users,
      selectedUser,
      roles,
      selectedRole,
      permissions,
      selectedPermission,
      tenants,
      selectedTenant,
      systemInfo,
      systemHealth,
      userStats,
      tenantStats,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      pagination,
      filters,
      getUsers,
      getUser,
      createUser,
      updateUser,
      deleteUser,
      activateUser,
      deactivateUser,
      activateUser,
      deactivateUser,
      impersonate,
      forceReset,
      verifyUser,
      mapUserToOrg,
      mapTenantUsr,
      getUserStats,
      getRoles,
      getRole,
      createRole,
      updateRole,
      deleteRole,
      initRoles,
      getPermissions,
      getPermission,
      createPermission,
      updatePermission,
      deletePermission,
      initPermissions,
      getTenants,
      getTenant,
      createTenant,
      updateTenant,
      deleteTenant,
      createTenantWithAdmin,
      suspend,
      activate,
      getTenantStats,
      getSystemInfo,
      clearCache,
      getSystemHealth,
      getSystemConfig,
      updateSystemConfig,
      clearUserCache,
      clearTenantCache,
      setFilters,
      setPage,
      setPageSize,
      clearSelectedUser,
      clearSelectedRole,
      clearSelectedPermission,
      clearSelectedTenant,
      clearError,
    ]
  );
};