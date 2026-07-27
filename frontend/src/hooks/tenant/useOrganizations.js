import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  onboardOrganization,
  activateOrganization,
  suspendOrganization,
  fetchProvisioningStatus,
  fetchUsageSummary,
  fetchAdminOrganizations,
  forceSuspendOrganization,
  forceActivateOrganization,
  forceDeleteOrganization,
  clearCurrentOrganization,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  setAdminFilters,
  resetAdminFilters,
  setAdminPagination,
  clearAllOrganizations,
} from '../../store/tenant/slice/organization.slice';

import {
  selectOrganizations,
  selectCurrentOrganization,
  selectAdminOrganizations,
  selectOrganizationLoading,
  selectOrganizationDetailsLoading,
  selectOrganizationSubmitting,
  selectOrganizationError,
  selectOrganizationPagination,
  selectOrganizationPage,
  selectOrganizationPageSize,
  selectOrganizationTotal,
  selectOrganizationTotalPages,
  selectOrganizationFilters,
  selectAdminPagination,
  selectAdminPage,
  selectAdminTotal,
  selectAdminTotalPages,
  selectAdminFilters,
  selectUsageSummary,
  selectProvisioningStatus,
  selectOrganizationById,
  selectOrganizationBySlug,
  selectActiveOrganizations,
  selectOnboardedOrganizations,
  selectOrganizationsByStatus,
  selectOrganizationsBySector,
  selectOrganizationsByTier,
  selectOrganizationCount,
  selectActiveOrganizationCount,
  selectOnboardedOrganizationCount,
  selectHasOrganizations,
  selectIsOrganizationLoading,
  selectHasOrganizationError,
} from '../../store/tenant/selectors/organization.selectors';

export const useOrganizations = (options = {}) => {
  const {
    autoFetch = true,
    autoFetchAdmin = false,
    filters: initialFilters = {},
    page = 1,
    pageSize = 20,
  } = options;

  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const adminFetchCalled = useRef(false);

  const organizations = useSelector(selectOrganizations);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const adminOrganizations = useSelector(selectAdminOrganizations);
  const loading = useSelector(selectOrganizationLoading);
  const loadingDetails = useSelector(selectOrganizationDetailsLoading);
  const submitting = useSelector(selectOrganizationSubmitting);
  const error = useSelector(selectOrganizationError);
  const pagination = useSelector(selectOrganizationPagination);
  const pageNum = useSelector(selectOrganizationPage);
  const pageSizeNum = useSelector(selectOrganizationPageSize);
  const total = useSelector(selectOrganizationTotal);
  const totalPages = useSelector(selectOrganizationTotalPages);
  const filters = useSelector(selectOrganizationFilters);
  const adminPagination = useSelector(selectAdminPagination);
  const adminPage = useSelector(selectAdminPage);
  const adminTotal = useSelector(selectAdminTotal);
  const adminTotalPages = useSelector(selectAdminTotalPages);
  const adminFilters = useSelector(selectAdminFilters);
  const usageSummary = useSelector(selectUsageSummary);
  const provisioningStatus = useSelector(selectProvisioningStatus);
  const count = useSelector(selectOrganizationCount);
  const activeCount = useSelector(selectActiveOrganizationCount);
  const onboardedCount = useSelector(selectOnboardedOrganizationCount);
  const hasOrgs = useSelector(selectHasOrganizations);
  const isLoading = useSelector(selectIsOrganizationLoading);
  const hasError = useSelector(selectHasOrganizationError);

  const fetchList = useCallback((params = {}) => {
    const mergedParams = {
      ...filters,
      page: pageNum,
      pageSize: pageSizeNum,
      ...params,
    };
    return dispatch(fetchOrganizations(mergedParams)).unwrap();
  }, [dispatch, filters, pageNum, pageSizeNum]);

  const fetchAdminList = useCallback((params = {}) => {
    const mergedParams = {
      ...adminFilters,
      page: adminPage,
      pageSize: pageSizeNum,
      ...params,
    };
    return dispatch(fetchAdminOrganizations(mergedParams)).unwrap();
  }, [dispatch, adminFilters, adminPage, pageSizeNum]);

  const fetchOne = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(fetchOrganization(id)).unwrap();
  }, [dispatch]);

  const create = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Organization data is required'));
    return dispatch(createOrganization(data)).unwrap();
  }, [dispatch]);

  const update = useCallback((id, data) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateOrganization({ id, data })).unwrap();
  }, [dispatch]);

  const remove = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(deleteOrganization(id)).unwrap();
  }, [dispatch]);

  const onboard = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(onboardOrganization(id)).unwrap();
  }, [dispatch]);

  const activate = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(activateOrganization(id)).unwrap();
  }, [dispatch]);

  const suspend = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(suspendOrganization(id)).unwrap();
  }, [dispatch]);

  const fetchStatus = useCallback(async (id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    const result = await dispatch(fetchProvisioningStatus(id)).unwrap();
    return result?.data ?? result;
  }, [dispatch]);

  const fetchUsage = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(fetchUsageSummary(id)).unwrap();
  }, [dispatch]);

  const forceSuspend = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(forceSuspendOrganization(id)).unwrap();
  }, [dispatch]);

  const forceActivate = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(forceActivateOrganization(id)).unwrap();
  }, [dispatch]);

  const forceDelete = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(forceDeleteOrganization(id)).unwrap();
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

  const updateAdminFilters = useCallback((newFilters) => {
    dispatch(setAdminFilters(newFilters));
  }, [dispatch]);

  const resetAllAdminFilters = useCallback(() => {
    dispatch(resetAdminFilters());
  }, [dispatch]);

  const updateAdminPagination = useCallback((newPagination) => {
    dispatch(setAdminPagination(newPagination));
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentOrganization());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllOrganizations());
  }, [dispatch]);

  const getById = useCallback((id) => {
    return useSelector((state) => selectOrganizationById(state, id));
  }, []);

  const getBySlug = useCallback((slug) => {
    return useSelector((state) => selectOrganizationBySlug(state, slug));
  }, []);

  const getActive = useCallback(() => {
    return useSelector(selectActiveOrganizations);
  }, []);

  const getOnboarded = useCallback(() => {
    return useSelector(selectOnboardedOrganizations);
  }, []);

  const getByStatus = useCallback((status) => {
    return useSelector((state) => selectOrganizationsByStatus(state, status));
  }, []);

  const getBySector = useCallback((sectorId) => {
    return useSelector((state) => selectOrganizationsBySector(state, sectorId));
  }, []);

  const getByTier = useCallback((tier) => {
    return useSelector((state) => selectOrganizationsByTier(state, tier));
  }, []);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchList(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchList]);

  useEffect(() => {
    if (autoFetchAdmin && !adminFetchCalled.current) {
      adminFetchCalled.current = true;
      fetchAdminList(initialFilters);
    }
  }, [autoFetchAdmin, initialFilters, fetchAdminList]);

  return useMemo(() => ({
    organizations,
    currentOrganization,
    adminOrganizations,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    page: pageNum,
    pageSize: pageSizeNum,
    total,
    totalPages,
    filters,
    adminPagination,
    adminPage,
    adminTotal,
    adminTotalPages,
    adminFilters,
    usageSummary,
    provisioningStatus,
    count,
    activeCount,
    onboardedCount,
    hasOrgs,
    isLoading,
    hasError,
    fetchList,
    fetchAdminList,
    fetchOne,
    create,
    update,
    remove,
    onboard,
    activate,
    suspend,
    fetchStatus,
    fetchUsage,
    forceSuspend,
    forceActivate,
    forceDelete,
    updateFilters,
    resetAllFilters,
    updatePagination,
    updateAdminFilters,
    resetAllAdminFilters,
    updateAdminPagination,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getBySlug,
    getActive,
    getOnboarded,
    getByStatus,
    getBySector,
    getByTier,
  }), [
    organizations,
    currentOrganization,
    adminOrganizations,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    pageNum,
    pageSizeNum,
    total,
    totalPages,
    filters,
    adminPagination,
    adminPage,
    adminTotal,
    adminTotalPages,
    adminFilters,
    usageSummary,
    provisioningStatus,
    count,
    activeCount,
    onboardedCount,
    hasOrgs,
    isLoading,
    hasError,
    fetchList,
    fetchAdminList,
    fetchOne,
    create,
    update,
    remove,
    onboard,
    activate,
    suspend,
    fetchStatus,
    fetchUsage,
    forceSuspend,
    forceActivate,
    forceDelete,
    updateFilters,
    resetAllFilters,
    updatePagination,
    updateAdminFilters,
    resetAllAdminFilters,
    updateAdminPagination,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getBySlug,
    getActive,
    getOnboarded,
    getByStatus,
    getBySector,
    getByTier,
  ]);
};

export const useOrganization = (id, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const organization = useSelector((state) => selectOrganizationById(state, id));
  const currentOrganization = useSelector(selectCurrentOrganization);
  const loading = useSelector(selectOrganizationDetailsLoading);
  const error = useSelector(selectOrganizationError);

  const fetchOne = useCallback((orgId) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(fetchOrganization(orgId)).unwrap();
  }, [dispatch]);

  const updateOne = useCallback((orgId, data) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateOrganization({ id: orgId, data })).unwrap();
  }, [dispatch]);

  const removeOne = useCallback((orgId) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(deleteOrganization(orgId)).unwrap();
  }, [dispatch]);

  const onboardOne = useCallback((orgId) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(onboardOrganization(orgId)).unwrap();
  }, [dispatch]);

  const activateOne = useCallback((orgId) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(activateOrganization(orgId)).unwrap();
  }, [dispatch]);

  const suspendOne = useCallback((orgId) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(suspendOrganization(orgId)).unwrap();
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentOrganization());
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

  // Prefer freshly-fetched detail (currentOrganization) when it matches
  // this ID, because it has nested sector/domains/contacts that the list
  // serializer omits.  Fall back to the list-cache entry only when
  // currentOrganization is absent or belongs to a different org.
  const resolvedOrganization = useMemo(() => {
    if (currentOrganization && currentOrganization.id === id) return currentOrganization;
    return organization || currentOrganization;
  }, [currentOrganization, organization, id]);

  return useMemo(() => ({
    organization: resolvedOrganization,
    loading,
    error,
    fetchOne,
    update: updateOne,
    remove: removeOne,
    onboard: onboardOne,
    activate: activateOne,
    suspend: suspendOne,
    clearCurrent,
  }), [
    resolvedOrganization,
    loading,
    error,
    fetchOne,
    updateOne,
    removeOne,
    onboardOne,
    activateOne,
    suspendOne,
    clearCurrent,
  ]);
};