import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  fetchSystemRoles,
  fetchAssignableRoles,
  fetchRolePermissions,
  assignPermissions,
  setRoleFilters,
  setRolePage,
  clearSelectedRole,
  clearRoleError,
} from '../../store/accounts/slice/roleSlice';
import {
  selectRoles,
  selectSelectedRole,
  selectSystemRoles,
  selectAssignableRoles,
  selectRolePermissions,
  selectRolesLoading,
  selectRolesCreating,
  selectRolesUpdating,
  selectRolesDeleting,
  selectRolesError,
  selectRolesPagination,
  selectRolesFilters,
  selectRoleById,
  selectRoleByCode,
} from '../../store/accounts/selectors/roleSelectors';

export const useRoles = () => {
  const dispatch = useDispatch();
  const roles = useSelector(selectRoles);
  const selectedRole = useSelector(selectSelectedRole);
  const systemRoles = useSelector(selectSystemRoles);
  const assignableRoles = useSelector(selectAssignableRoles);
  const rolePermissions = useSelector(selectRolePermissions);
  const isLoading = useSelector(selectRolesLoading);
  const isCreating = useSelector(selectRolesCreating);
  const isUpdating = useSelector(selectRolesUpdating);
  const isDeleting = useSelector(selectRolesDeleting);
  const error = useSelector(selectRolesError);
  const pagination = useSelector(selectRolesPagination);
  const filters = useSelector(selectRolesFilters);

  const getRoles = useCallback(
    async (params) => {
      const result = await dispatch(fetchRoles(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getRole = useCallback(
    async (id) => {
      const result = await dispatch(fetchRole(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const create = useCallback(
    async (data) => {
      const result = await dispatch(createRole(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const update = useCallback(
    async (id, data) => {
      const result = await dispatch(updateRole({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const remove = useCallback(
    async (id) => {
      const result = await dispatch(deleteRole(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getSystemRoles = useCallback(async () => {
    const result = await dispatch(fetchSystemRoles()).unwrap();
    return result;
  }, [dispatch]);

  const getAssignableRoles = useCallback(async () => {
    const result = await dispatch(fetchAssignableRoles()).unwrap();
    return result;
  }, [dispatch]);

  const getRolePermissions = useCallback(
    async (id) => {
      const result = await dispatch(fetchRolePermissions(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const assignRolePermissions = useCallback(
    async (id, permissionIds) => {
      const result = await dispatch(assignPermissions({ id, permissionIds })).unwrap();
      return result;
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setRoleFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setRolePage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedRole());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearRoleError());
  }, [dispatch]);

  const getRoleById = useCallback(
    (id) => {
      return selectRoleById({ roles: { roles } }, id);
    },
    [roles]
  );

  const getRoleByCode = useCallback(
    (code) => {
      return selectRoleByCode({ roles: { roles } }, code);
    },
    [roles]
  );

  return useMemo(
    () => ({
      roles,
      selectedRole,
      systemRoles,
      assignableRoles,
      rolePermissions,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      pagination,
      filters,
      getRoles,
      getRole,
      create,
      update,
      remove,
      createRole: create,
      updateRole: update,
      deleteRole: remove,
      getSystemRoles,
      getAssignableRoles,
      getRolePermissions,
      assignRolePermissions,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getRoleById,
      getRoleByCode,
    }),
    [
      roles,
      selectedRole,
      systemRoles,
      assignableRoles,
      rolePermissions,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      pagination,
      filters,
      getRoles,
      getRole,
      create,
      update,
      remove,
      getSystemRoles,
      getAssignableRoles,
      getRolePermissions,
      assignRolePermissions,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getRoleById,
      getRoleByCode,
    ]
  );
};