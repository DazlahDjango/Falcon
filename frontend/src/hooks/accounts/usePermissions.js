import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPermissions,
  fetchPermission,
  fetchPermissionsByCategory,
  fetchPermissionsByLevel,
  setPermissionFilters,
  setPermissionPage,
  clearSelectedPermission,
  clearPermissionError,
} from '../../store/accounts/slice/permissionSlice';
import {
  selectPermissions,
  selectSelectedPermission,
  selectPermissionsLoading,
  selectPermissionsError,
  selectPermissionsPagination,
  selectPermissionsFilters,
  selectPermissionById,
  selectPermissionByCodename,
  selectPermissionsByCategoryMap,
  selectPermissionCategories,
} from '../../store/accounts/selectors/permissionSelectors';

export const usePermissions = () => {
  const dispatch = useDispatch();
  const permissions = useSelector(selectPermissions);
  const selectedPermission = useSelector(selectSelectedPermission);
  const isLoading = useSelector(selectPermissionsLoading);
  const error = useSelector(selectPermissionsError);
  const pagination = useSelector(selectPermissionsPagination);
  const filters = useSelector(selectPermissionsFilters);

  const getPermissions = useCallback(
    async (params) => {
      const result = await dispatch(fetchPermissions(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getPermission = useCallback(
    async (id) => {
      const result = await dispatch(fetchPermission(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getByCategory = useCallback(
    async (category) => {
      const result = await dispatch(fetchPermissionsByCategory(category)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getByLevel = useCallback(
    async (level) => {
      const result = await dispatch(fetchPermissionsByLevel(level)).unwrap();
      return result;
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setPermissionFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setPermissionPage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedPermission());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearPermissionError());
  }, [dispatch]);

  const getPermissionById = useCallback(
    (id) => {
      return selectPermissionById({ permissions: { permissions } }, id);
    },
    [permissions]
  );

  const getPermissionByCodename = useCallback(
    (codename) => {
      return selectPermissionByCodename({ permissions: { permissions } }, codename);
    },
    [permissions]
  );

  const getCategoryMap = useCallback(() => {
    return selectPermissionsByCategoryMap({ permissions: { permissions } });
  }, [permissions]);

  const getCategories = useCallback(() => {
    return selectPermissionCategories({ permissions: { permissions } });
  }, [permissions]);

  return useMemo(
    () => ({
      permissions,
      selectedPermission,
      isLoading,
      error,
      pagination,
      filters,
      getPermissions,
      getPermission,
      getByCategory,
      getByLevel,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getPermissionById,
      getPermissionByCodename,
      getCategoryMap,
      getCategories,
    }),
    [
      permissions,
      selectedPermission,
      isLoading,
      error,
      pagination,
      filters,
      getPermissions,
      getPermission,
      getByCategory,
      getByLevel,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getPermissionById,
      getPermissionByCodename,
      getCategoryMap,
      getCategories,
    ]
  );
};