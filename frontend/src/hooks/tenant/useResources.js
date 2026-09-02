import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchResources,
  fetchResource,
  createResource,
  updateResource,
  deleteResource,
  resetResource,
  resetDailyLimits,
  fetchTenantResources,
  fetchResourceUsage,
  resetTenantResource,
  clearCurrentResource,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearTenantResources,
  clearAllResources,
  incrementUsage,
  decrementUsage,
  takeSnapshot,
  fetchResourceSummary,
  fetchResourceAnalytics,
  syncResourcesFromBilling,
  bulkIncrementResources,
  fetchExceededResources,
} from '../../store/tenant/slice/resource.slice';

import {
  selectResources,
  selectCurrentResource,
  selectResourceLoading,
  selectResourceDetailsLoading,
  selectResourceSubmitting,
  selectResourceError,
  selectResourcePagination,
  selectResourcePage,
  selectResourceTotal,
  selectResourceTotalPages,
  selectResourceFilters,
  selectResetResult,
  selectResourceUsage,
  selectTenantResources,
  selectResourceById,
  selectResourcesByType,
  selectResourcesByOrganization,
  selectExceededResources,
  selectWarningResources,
  selectHealthyResources,
  selectResourceCount,
  selectExceededResourceCount,
  selectWarningResourceCount,
  selectHasResources,
  selectHasTenantResources,
  selectResourceUsagePercentage,
  selectResourceIsExceeded,
  selectResourceIsWarning,
  selectResourceSummary,
  selectResourceAnalytics,
  selectExceededResourcesList,
  selectSyncResult,
  selectOverallHealthStatus,
} from '../../store/tenant/selectors/resource.selectors';

export const useResources = (options = {}) => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    page = 1,
    pageSize = 20,
  } = options;

  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const resources = useSelector(selectResources);
  const currentResource = useSelector(selectCurrentResource);
  const loading = useSelector(selectResourceLoading);
  const loadingDetails = useSelector(selectResourceDetailsLoading);
  const submitting = useSelector(selectResourceSubmitting);
  const error = useSelector(selectResourceError);
  const pagination = useSelector(selectResourcePagination);
  const pageNum = useSelector(selectResourcePage);
  const total = useSelector(selectResourceTotal);
  const totalPages = useSelector(selectResourceTotalPages);
  const filters = useSelector(selectResourceFilters);
  const resetResult = useSelector(selectResetResult);
  const resourceUsage = useSelector(selectResourceUsage);
  const count = useSelector(selectResourceCount);
  const exceededCount = useSelector(selectExceededResourceCount);
  const warningCount = useSelector(selectWarningResourceCount);
  const hasResources = useSelector(selectHasResources);
  const summary = useSelector(selectResourceSummary);
  const analytics = useSelector(selectResourceAnalytics);
  const exceededList = useSelector(selectExceededResourcesList);
  const syncResult = useSelector(selectSyncResult);
  const overallHealth = useSelector(selectOverallHealthStatus);

  const fetchList = useCallback((params = {}) => {
    const mergedParams = {
      ...filters,
      page: pageNum,
      pageSize,
      ...params,
    };
    return dispatch(fetchResources(mergedParams)).unwrap();
  }, [dispatch, filters, pageNum, pageSize]);

  const fetchOne = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(fetchResource(id)).unwrap();
  }, [dispatch]);

  const create = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Resource data is required'));
    if (!data.organization_id) return Promise.reject(new Error('Organization ID is required'));
    if (!data.resource_type) return Promise.reject(new Error('Resource type is required'));
    if (data.limit_value === undefined || data.limit_value === null) {
      return Promise.reject(new Error('Limit value is required'));
    }
    return dispatch(createResource(data)).unwrap();
  }, [dispatch]);

  const update = useCallback((id, data) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateResource({ id, data })).unwrap();
  }, [dispatch]);

  const remove = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(deleteResource(id)).unwrap();
  }, [dispatch]);

  const reset = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(resetResource(id)).unwrap();
  }, [dispatch]);

  const resetAllDaily = useCallback(() => {
    return dispatch(resetDailyLimits()).unwrap();
  }, [dispatch]);

  const fetchTenant = useCallback((tenantId, params = {}) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchTenantResources({ tenantId, params })).unwrap();
  }, [dispatch]);

  const fetchUsage = useCallback((tenantId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchResourceUsage(tenantId)).unwrap();
  }, [dispatch]);

  const resetTenant = useCallback((tenantId, resourceId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    if (!resourceId) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(resetTenantResource({ tenantId, resourceId })).unwrap();
  }, [dispatch]);

  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const updatePagination = useCallback((newPagination) => {
    dispatch(setPagination(newPagination));
  }, [dispatch]);

  const setPage = useCallback((page) => {
    dispatch(setPagination({ page }));
    dispatch(fetchResources({ page }));
  }, [dispatch]);

  const setPageSize = useCallback((pageSize) => {
    dispatch(setPagination({ pageSize, page: 1 }));
    dispatch(fetchResources({ pageSize, page: 1 }));
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentResource());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllResources());
  }, [dispatch]);

  const getById = useCallback((id) => {
    return useSelector((state) => selectResourceById(state, id));
  }, []);

  const getByType = useCallback((type) => {
    return useSelector((state) => selectResourcesByType(state, type));
  }, []);

  const getByOrg = useCallback((orgId) => {
    return useSelector((state) => selectResourcesByOrganization(state, orgId));
  }, []);

  const getExceeded = useCallback(() => {
    return useSelector(selectExceededResources);
  }, []);

  const getWarning = useCallback(() => {
    return useSelector(selectWarningResources);
  }, []);

  const getHealthy = useCallback(() => {
    return useSelector(selectHealthyResources);
  }, []);

  const getTenantResources = useCallback((tenantId) => {
    return useSelector((state) => selectTenantResources(state, tenantId));
  }, []);

  const hasTenantResources = useCallback((tenantId) => {
    return useSelector((state) => selectHasTenantResources(state, tenantId));
  }, []);

  const getUsagePercentage = useCallback((id) => {
    return useSelector((state) => selectResourceUsagePercentage(state, id));
  }, []);

  const getIsExceeded = useCallback((id) => {
    return useSelector((state) => selectResourceIsExceeded(state, id));
  }, []);

  const getIsWarning = useCallback((id) => {
    return useSelector((state) => selectResourceIsWarning(state, id));
  }, []);

  const increment = useCallback((id, amount = 1) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(incrementUsage({ id, amount })).unwrap();
  }, [dispatch]);

  const decrement = useCallback((id, amount = 1) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(decrementUsage({ id, amount })).unwrap();
  }, [dispatch]);

  const snapshot = useCallback((id, snapshotType = 'daily', periodLabel = null) => {
    if (!id) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(takeSnapshot({ id, snapshotType, periodLabel })).unwrap();
  }, [dispatch]);

  const fetchSummary = useCallback((organizationId) => {
    if (!organizationId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(fetchResourceSummary(organizationId)).unwrap();
  }, [dispatch]);

  const fetchAnalytics = useCallback((organizationId, resourceType, days = 7) => {
    if (!organizationId) return Promise.reject(new Error('Organization ID is required'));
    if (!resourceType) return Promise.reject(new Error('Resource type is required'));
    return dispatch(fetchResourceAnalytics({ organizationId, resourceType, days })).unwrap();
  }, [dispatch]);

  const syncFromBilling = useCallback((organizationId = null) => {
    return dispatch(syncResourcesFromBilling(organizationId)).unwrap();
  }, [dispatch]);

  const bulkIncrement = useCallback((organizationId, increments) => {
    if (!organizationId) return Promise.reject(new Error('Organization ID is required'));
    if (!Array.isArray(increments)) return Promise.reject(new Error('Increments must be an array'));
    return dispatch(bulkIncrementResources({ organizationId, increments })).unwrap();
  }, [dispatch]);

  const fetchExceeded = useCallback(() => {
    return dispatch(fetchExceededResources()).unwrap();
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchList(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchList]);

  return useMemo(() => ({
    resources,
    currentResource,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    page: pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    resetResult,
    resourceUsage,
    count,
    exceededCount,
    warningCount,
    hasResources,
    // Enterprise state
    summary,
    analytics,
    exceededList,
    syncResult,
    overallHealth,
    // Actions
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    reset,
    resetAllDaily,
    fetchTenant,
    fetchUsage,
    resetTenant,
    updateFilters,
    resetAllFilters,
    updatePagination,
    setPage,
    setPageSize,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getByType,
    getByOrg,
    getExceeded,
    getWarning,
    getHealthy,
    getTenantResources,
    hasTenantResources,
    getUsagePercentage,
    getIsExceeded,
    getIsWarning,
    // Enterprise actions
    increment,
    decrement,
    snapshot,
    fetchSummary,
    fetchAnalytics,
    syncFromBilling,
    bulkIncrement,
    fetchExceeded,
  }), [
    resources,
    currentResource,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    resetResult,
    resourceUsage,
    count,
    exceededCount,
    warningCount,
    hasResources,
    summary,
    analytics,
    exceededList,
    syncResult,
    overallHealth,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    reset,
    resetAllDaily,
    fetchTenant,
    fetchUsage,
    resetTenant,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getByType,
    getByOrg,
    getExceeded,
    getWarning,
    getHealthy,
    getTenantResources,
    hasTenantResources,
    getUsagePercentage,
    getIsExceeded,
    getIsWarning,
    increment,
    decrement,
    snapshot,
    fetchSummary,
    fetchAnalytics,
    syncFromBilling,
    bulkIncrement,
    fetchExceeded,
  ]);
};

export const useResource = (id, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const resource = useSelector((state) => selectResourceById(state, id));
  const currentResource = useSelector(selectCurrentResource);
  const loading = useSelector(selectResourceDetailsLoading);
  const error = useSelector(selectResourceError);

  const fetchOne = useCallback((resourceId) => {
    if (!resourceId) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(fetchResource(resourceId)).unwrap();
  }, [dispatch]);

  const updateOne = useCallback((resourceId, data) => {
    if (!resourceId) return Promise.reject(new Error('Resource ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateResource({ id: resourceId, data })).unwrap();
  }, [dispatch]);

  const removeOne = useCallback((resourceId) => {
    if (!resourceId) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(deleteResource(resourceId)).unwrap();
  }, [dispatch]);

  const resetOne = useCallback((resourceId) => {
    if (!resourceId) return Promise.reject(new Error('Resource ID is required'));
    return dispatch(resetResource(resourceId)).unwrap();
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentResource());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && id && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchOne(id);
    }
    return () => {
      clearCurrent();
    };
  }, [autoFetch, id, fetchOne, clearCurrent]);

  return useMemo(() => ({
    resource: resource || currentResource,
    loading,
    error,
    fetchOne,
    update: updateOne,
    remove: removeOne,
    reset: resetOne,
    clearCurrent,
  }), [
    resource,
    currentResource,
    loading,
    error,
    fetchOne,
    updateOne,
    removeOne,
    resetOne,
    clearCurrent,
  ]);
};